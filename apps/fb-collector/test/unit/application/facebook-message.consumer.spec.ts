import { Test, TestingModule } from '@nestjs/testing';
import { FacebookMessageConsumer } from '../../../src/application/consumers/facebook-message.consumer';
import { EventProcessorInterface } from '../../../src/domain/interfaces/event-processor.interface';
import { LoggerInterface } from 'libs/logger/interfaces/logger.interface';
import { CollectorsMetricsServiceInterface } from 'libs/metrics/interfaces/collector-metrics-service.interface';
import { LoggerDiTokens } from 'libs/logger/di/logger-di-tokens';
import { MetricsDiTokens } from 'libs/metrics/di/metrics-di-tokens';
import { NatsDiTokens } from 'libs/nats/di/nats-di-tokens';
import { FbCollectorDiTokens } from '../../../src/infrastructure/di/fb-events-di-tokens';
import { CollectorSource } from 'libs/metrics/types/collector-sources.type';
import { mockFacebookTopEvent, mockCorrelationId } from '../../fixtures/facebook-events.fixture';

const mockJetStream = {
  jetstreamManager: jest.fn(),
  consumers: {
    get: jest.fn(),
  },
};

const mockNatsConnection = {
  close: jest.fn(),
};

const mockConsumer = {
  fetch: jest.fn(),
};

const mockJetStreamManager = {
  consumers: {
    info: jest.fn(),
    add: jest.fn(),
  },
};

const mockMessage = {
  data: new TextEncoder().encode(
    JSON.stringify({
      ...mockFacebookTopEvent,
      correlationId: mockCorrelationId,
    }),
  ),
  ack: jest.fn(),
};

describe('FacebookMessageConsumer', () => {
  let consumer: FacebookMessageConsumer;
  let mockEventProcessor: jest.Mocked<EventProcessorInterface>;
  let mockMetricsService: jest.Mocked<CollectorsMetricsServiceInterface>;
  let mockLogger: jest.Mocked<LoggerInterface>;

  beforeEach(async () => {
    jest.clearAllMocks();

    mockEventProcessor = {
      processEvent: jest.fn(),
    };

    mockMetricsService = {
      incrementConsumed: jest.fn(),
      incrementProcessed: jest.fn(),
      incrementFailed: jest.fn(),
    } as any;

    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      setContext: jest.fn(),
    };

    mockJetStream.jetstreamManager.mockResolvedValue(mockJetStreamManager);
    mockJetStream.consumers.get.mockResolvedValue(mockConsumer);
    mockJetStreamManager.consumers.info.mockResolvedValue({});

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FacebookMessageConsumer,
        {
          provide: NatsDiTokens.JETSTREAM_CLIENT,
          useValue: mockJetStream,
        },
        {
          provide: NatsDiTokens.NATS_CONNECTION,
          useValue: mockNatsConnection,
        },
        {
          provide: FbCollectorDiTokens.FACEBOOK_EVENT_PROCESSOR,
          useValue: mockEventProcessor,
        },
        {
          provide: MetricsDiTokens.COLLECTORS_METRICS_SERVICE,
          useValue: mockMetricsService,
        },
        {
          provide: LoggerDiTokens.LOGGER,
          useValue: mockLogger,
        },
      ],
    }).compile();

    consumer = module.get<FacebookMessageConsumer>(FacebookMessageConsumer);
  });

  describe('initialization', () => {
    it('should set logger context during construction', () => {
      expect(mockLogger.setContext).toHaveBeenCalledWith('FacebookMessageConsumer');
    });
  });

  describe('processMessages', () => {
    it('should process messages successfully', async () => {
      const messages = [mockMessage];
      mockConsumer.fetch.mockResolvedValue(messages as any);
      mockEventProcessor.processEvent.mockResolvedValue();

      await (consumer as any).processMessages(mockConsumer);

      expect(mockMetricsService.incrementConsumed).toHaveBeenCalledWith(CollectorSource.Facebook);
      expect(mockEventProcessor.processEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventId: mockFacebookTopEvent.eventId,
          correlationId: mockCorrelationId,
        }),
        mockCorrelationId,
      );
      expect(mockMessage.ack).toHaveBeenCalled();
      expect(mockMetricsService.incrementProcessed).toHaveBeenCalledWith(CollectorSource.Facebook);
    });

    it('should handle processing errors gracefully', async () => {
      const error = new Error('Processing failed');
      const messages = [mockMessage];
      mockConsumer.fetch.mockResolvedValue(messages as any);
      mockEventProcessor.processEvent.mockRejectedValue(error);

      await (consumer as any).processMessages(mockConsumer);

      expect(mockMetricsService.incrementConsumed).toHaveBeenCalledWith(CollectorSource.Facebook);
      expect(mockMetricsService.incrementFailed).toHaveBeenCalledWith(CollectorSource.Facebook);
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to process message', error);
      expect(mockMessage.ack).not.toHaveBeenCalled();
    });

    it('should handle malformed message data', async () => {
      const malformedMessage = {
        data: new TextEncoder().encode('invalid json'),
        ack: jest.fn(),
      };
      const messages = [malformedMessage];
      mockConsumer.fetch.mockResolvedValue(messages as any);

      await (consumer as any).processMessages(mockConsumer);

      expect(mockMetricsService.incrementConsumed).toHaveBeenCalledWith(CollectorSource.Facebook);
      expect(mockMetricsService.incrementFailed).toHaveBeenCalledWith(CollectorSource.Facebook);
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to process message', expect.any(Error));
    });

    it('should process multiple messages in batch', async () => {
      const messages = [mockMessage, mockMessage, mockMessage];
      mockConsumer.fetch.mockResolvedValue(messages as any);
      mockEventProcessor.processEvent.mockResolvedValue();

      await (consumer as any).processMessages(mockConsumer);

      expect(mockMetricsService.incrementConsumed).toHaveBeenCalledTimes(3);
      expect(mockEventProcessor.processEvent).toHaveBeenCalledTimes(3);
      expect(mockMetricsService.incrementProcessed).toHaveBeenCalledTimes(3);
    });

    it('should continue processing other messages when one fails', async () => {
      const successMessage = { ...mockMessage, ack: jest.fn() };
      const failMessage = { ...mockMessage, ack: jest.fn() };
      const messages = [successMessage, failMessage];

      mockConsumer.fetch.mockResolvedValue(messages as any);
      mockEventProcessor.processEvent
        .mockResolvedValueOnce()
        .mockRejectedValueOnce(new Error('Second message fails'));

      await (consumer as any).processMessages(mockConsumer);

      expect(mockEventProcessor.processEvent).toHaveBeenCalledTimes(2);
      expect(successMessage.ack).toHaveBeenCalled();
      expect(failMessage.ack).not.toHaveBeenCalled();
      expect(mockMetricsService.incrementProcessed).toHaveBeenCalledTimes(1);
      expect(mockMetricsService.incrementFailed).toHaveBeenCalledTimes(1);
    });
  });

  describe('ensureConsumer', () => {
    it('should create consumer when it does not exist', async () => {
      const notFoundError = { code: '404' };
      mockJetStreamManager.consumers.info.mockRejectedValue(notFoundError);

      await (consumer as any).ensureConsumer('test-stream', 'facebook-consumer');

      expect(mockJetStreamManager.consumers.add).toHaveBeenCalledWith('test-stream', {
        durable_name: 'facebook-consumer',
        ack_policy: expect.any(String),
        filter_subject: expect.any(String),
      });
      expect(mockLogger.info).toHaveBeenCalledWith('Creating consumer facebook-consumer');
    });

    it('should not create consumer when it already exists', async () => {
      mockJetStreamManager.consumers.info.mockResolvedValue({});

      await (consumer as any).ensureConsumer('test-stream', 'facebook-consumer');

      expect(mockJetStreamManager.consumers.add).not.toHaveBeenCalled();
    });

    it('should propagate non-404 errors', async () => {
      const serverError = { code: '500', message: 'Internal server error' };
      mockJetStreamManager.consumers.info.mockRejectedValue(serverError);

      await expect(
        (consumer as any).ensureConsumer('test-stream', 'facebook-consumer'),
      ).rejects.toEqual(serverError);
    });
  });

  describe('module lifecycle', () => {
    it('should handle module destruction gracefully', async () => {
      await consumer.onModuleDestroy();

      expect(mockLogger.info).toHaveBeenCalledWith('Gracefully shutting down message consumer...');
      expect(mockNatsConnection.close).toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalledWith('Message consumer shut down.');
    });

    it('should set shutdown flag during destruction', async () => {
      await consumer.onModuleDestroy();

      expect((consumer as any).isShuttingDown).toBe(true);
    });
  });

  describe('connection retry logic', () => {
    it('should retry connection on failure', async () => {
      const connectSpy = jest.spyOn(consumer as any, 'startConsumer');
      connectSpy
        .mockRejectedValueOnce(new Error('Connection failed'))
        .mockResolvedValueOnce(undefined);

      await (consumer as any).connectWithRetry(2, 100);

      expect(connectSpy).toHaveBeenCalledTimes(2);
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Connection attempt 1 failed: Connection failed',
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Successfully connected and started consuming messages',
      );
    });

    it('should throw error after exhausting retries', async () => {
      const error = new Error('Persistent connection failure');
      const connectSpy = jest.spyOn(consumer as any, 'startConsumer');
      connectSpy.mockRejectedValue(error);

      await expect((consumer as any).connectWithRetry(2, 100)).rejects.toThrow(
        'Persistent connection failure',
      );

      expect(connectSpy).toHaveBeenCalledTimes(2);
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to connect after all retries');
    });
  });
});
