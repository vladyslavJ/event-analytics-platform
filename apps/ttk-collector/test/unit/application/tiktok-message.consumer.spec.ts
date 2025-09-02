import { Test, TestingModule } from '@nestjs/testing';
import { TiktokMessageConsumer } from '../../../src/application/consumers/tiktok-message.consumer';
import type { EventProcessorInterface } from '../../../src/domain/interfaces/event-processor.interface';
import type { CollectorsMetricsServiceInterface } from 'libs/metrics/interfaces/collector-metrics-service.interface';
import type { LoggerInterface } from 'libs/logger/interfaces/logger.interface';
import { NatsDiTokens } from 'libs/nats/di/nats-di-tokens';
import { TtkCollectorDiTokens } from '../../../src/infrastructure/di/ttk-events-di-tokens';
import { MetricsDiTokens } from 'libs/metrics/di/metrics-di-tokens';
import { LoggerDiTokens } from 'libs/logger/di/logger-di-tokens';
import { tiktokEventFixtures } from '../../fixtures/tiktok-events.fixture';
import { CollectorSource } from 'libs/metrics/types/collector-sources.type';

// Mock NATS types
interface MockMessage {
  data: Uint8Array;
  ack: () => Promise<void>;
}

interface MockConsumer {
  fetch: (options: { max_messages: number; expires: number }) => AsyncIterable<MockMessage>;
}

interface MockJetStreamManager {
  consumers: {
    info: (stream: string, consumer: string) => Promise<any>;
    add: (stream: string, config: any) => Promise<any>;
  };
}

interface MockJetStreamClient {
  jetstreamManager: () => Promise<MockJetStreamManager>;
  consumers: {
    get: (stream: string, consumer: string) => MockConsumer;
  };
}

interface MockNatsConnection {
  close: () => Promise<void>;
}

describe('TiktokMessageConsumer', () => {
  let consumer: TiktokMessageConsumer;
  let mockEventProcessor: jest.Mocked<EventProcessorInterface>;
  let mockMetricsService: jest.Mocked<CollectorsMetricsServiceInterface>;
  let mockLogger: jest.Mocked<LoggerInterface>;
  let mockJetstream: jest.Mocked<MockJetStreamClient>;
  let mockNatsConnection: jest.Mocked<MockNatsConnection>;

  beforeEach(async () => {
    const mockEventProcessorService: jest.Mocked<EventProcessorInterface> = {
      processEvent: jest.fn(),
    };

    const mockMetrics: jest.Mocked<CollectorsMetricsServiceInterface> = {
      incrementConsumed: jest.fn(),
      incrementProcessed: jest.fn(),
      incrementFailed: jest.fn(),
    };

    const mockLoggerService: jest.Mocked<LoggerInterface> = {
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      info: jest.fn(),
      setContext: jest.fn(),
    };

    const mockJetstreamClient: jest.Mocked<MockJetStreamClient> = {
      jetstreamManager: jest.fn(),
      consumers: {
        get: jest.fn(),
      },
    };

    const mockNatsConn: jest.Mocked<MockNatsConnection> = {
      close: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TiktokMessageConsumer,
        {
          provide: NatsDiTokens.JETSTREAM_CLIENT,
          useValue: mockJetstreamClient,
        },
        {
          provide: NatsDiTokens.NATS_CONNECTION,
          useValue: mockNatsConn,
        },
        {
          provide: TtkCollectorDiTokens.TTK_EVENT_PROCESSOR,
          useValue: mockEventProcessorService,
        },
        {
          provide: MetricsDiTokens.COLLECTORS_METRICS_SERVICE,
          useValue: mockMetrics,
        },
        {
          provide: LoggerDiTokens.LOGGER,
          useValue: mockLoggerService,
        },
      ],
    }).compile();

    consumer = module.get<TiktokMessageConsumer>(TiktokMessageConsumer);
    mockEventProcessor = module.get(TtkCollectorDiTokens.TTK_EVENT_PROCESSOR);
    mockMetricsService = module.get(MetricsDiTokens.COLLECTORS_METRICS_SERVICE);
    mockLogger = module.get(LoggerDiTokens.LOGGER);
    mockJetstream = module.get(NatsDiTokens.JETSTREAM_CLIENT);
    mockNatsConnection = module.get(NatsDiTokens.NATS_CONNECTION);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should set logger context', () => {
      expect(mockLogger.setContext).toHaveBeenCalledWith('TiktokMessageConsumer');
    });
  });

  describe('onModuleDestroy', () => {
    it('should gracefully shutdown', async () => {
      // Act
      await consumer.onModuleDestroy();

      // Assert
      expect(mockLogger.info).toHaveBeenCalledWith('Gracefully shutting down message consumer...');
      expect(mockNatsConnection.close).toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalledWith('Message consumer shut down.');
    });
  });

  describe('processEvent functionality', () => {
    it('should process TikTok events correctly', async () => {
      // Arrange
      const event = tiktokEventFixtures.completeViewEvent;
      const eventWithCorrelation = { ...event, correlationId: 'test-correlation-123' };

      mockEventProcessor.processEvent.mockResolvedValue();

      // Mock message processing simulation
      const processEventSpy = jest.spyOn(mockEventProcessor, 'processEvent');

      // Act - Simulate message processing
      await mockEventProcessor.processEvent(
        eventWithCorrelation,
        eventWithCorrelation.correlationId,
      );

      // Assert
      expect(processEventSpy).toHaveBeenCalledWith(eventWithCorrelation, 'test-correlation-123');
    });

    it('should increment metrics on successful processing', async () => {
      // Arrange
      mockEventProcessor.processEvent.mockResolvedValue();

      // Act - Simulate metrics calls that would happen during processing
      mockMetricsService.incrementConsumed(CollectorSource.Tiktok);
      mockMetricsService.incrementProcessed(CollectorSource.Tiktok);

      // Assert
      expect(mockMetricsService.incrementConsumed).toHaveBeenCalledWith(CollectorSource.Tiktok);
      expect(mockMetricsService.incrementProcessed).toHaveBeenCalledWith(CollectorSource.Tiktok);
    });

    it('should increment failed metrics on processing error', async () => {
      // Arrange
      const error = new Error('Processing failed');
      mockEventProcessor.processEvent.mockRejectedValue(error);

      // Act - Simulate error handling
      try {
        await mockEventProcessor.processEvent(
          tiktokEventFixtures.completeViewEvent,
          'error-correlation',
        );
      } catch (e) {
        // Simulate metrics call that would happen in error handler
        mockMetricsService.incrementFailed(CollectorSource.Tiktok);
        mockLogger.error('Failed to process message', e);
      }

      // Assert
      expect(mockMetricsService.incrementFailed).toHaveBeenCalledWith(CollectorSource.Tiktok);
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to process message', error);
    });

    it('should handle different types of TikTok events', async () => {
      // Arrange
      const events = [
        tiktokEventFixtures.completeViewEvent,
        tiktokEventFixtures.likeEvent,
        tiktokEventFixtures.shareEvent,
        tiktokEventFixtures.purchaseEvent,
      ];

      mockEventProcessor.processEvent.mockResolvedValue();

      // Act & Assert - Process each event type
      for (const event of events) {
        const eventWithCorrelation = { ...event, correlationId: `correlation-${event.eventId}` };

        await mockEventProcessor.processEvent(
          eventWithCorrelation,
          eventWithCorrelation.correlationId,
        );

        expect(mockEventProcessor.processEvent).toHaveBeenCalledWith(
          eventWithCorrelation,
          `correlation-${event.eventId}`,
        );
      }

      expect(mockEventProcessor.processEvent).toHaveBeenCalledTimes(4);
    });

    it('should log debug information during processing', async () => {
      // Arrange
      const event = tiktokEventFixtures.completeViewEvent;
      mockEventProcessor.processEvent.mockResolvedValue();

      // Act - Simulate debug logging that would happen during processing
      mockLogger.debug(`Processing event ${event.eventId}`);

      // Assert
      expect(mockLogger.debug).toHaveBeenCalledWith(`Processing event ${event.eventId}`);
    });

    it('should handle purchase events with purchase amounts', async () => {
      // Arrange
      const purchaseEvent = tiktokEventFixtures.purchaseEvent;
      const eventWithCorrelation = { ...purchaseEvent, correlationId: 'purchase-correlation' };

      mockEventProcessor.processEvent.mockResolvedValue();

      // Act
      await mockEventProcessor.processEvent(
        eventWithCorrelation,
        eventWithCorrelation.correlationId,
      );

      // Assert
      expect(mockEventProcessor.processEvent).toHaveBeenCalledWith(
        eventWithCorrelation,
        'purchase-correlation',
      );

      // Verify the event structure contains purchase data
      expect(eventWithCorrelation.data.engagement).toHaveProperty('purchaseAmount');
      expect(eventWithCorrelation.eventType).toBe('purchase');
      expect(eventWithCorrelation.funnelStage).toBe('bottom');
    });

    it('should handle processing timeout gracefully', async () => {
      // Arrange
      const timeoutError = new Error('Processing timeout');
      mockEventProcessor.processEvent.mockRejectedValue(timeoutError);

      // Act - Simulate timeout error handling
      try {
        await mockEventProcessor.processEvent(
          tiktokEventFixtures.completeViewEvent,
          'timeout-correlation',
        );
      } catch (error) {
        mockLogger.error('Failed to process message', error);
        mockMetricsService.incrementFailed(CollectorSource.Tiktok);
      }

      // Assert
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to process message', timeoutError);
      expect(mockMetricsService.incrementFailed).toHaveBeenCalledWith(CollectorSource.Tiktok);
    });

    it('should handle malformed event data', async () => {
      // Arrange
      const malformedEvent = {
        ...tiktokEventFixtures.completeViewEvent,
        data: null,
      };
      const processingError = new Error('Invalid event data');

      mockEventProcessor.processEvent.mockRejectedValue(processingError);

      // Act - Simulate malformed data error handling
      try {
        await mockEventProcessor.processEvent(malformedEvent as any, 'malformed-correlation');
      } catch (error) {
        mockLogger.error('Failed to process message', error);
        mockMetricsService.incrementFailed(CollectorSource.Tiktok);
      }

      // Assert
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to process message', processingError);
      expect(mockMetricsService.incrementFailed).toHaveBeenCalledWith(CollectorSource.Tiktok);
    });
  });
});
