import { Test, TestingModule } from '@nestjs/testing';
import { TiktokEventProcessor } from '../../../src/domain/services/tiktok-event-processor.service';
import type {
  EventRepositoryInterface,
  UserRepositoryInterface,
} from '../../../src/domain/interfaces/repository.interface';
import type { LoggerInterface } from 'libs/logger/interfaces/logger.interface';
import { LoggerDiTokens } from 'libs/logger/di/logger-di-tokens';
import { TtkCollectorDiTokens } from '../../../src/infrastructure/di/ttk-events-di-tokens';
import { tiktokEventFixtures } from '../../fixtures/tiktok-events.fixture';

describe('TiktokEventProcessor', () => {
  let processor: TiktokEventProcessor;
  let mockEventRepository: jest.Mocked<EventRepositoryInterface>;
  let mockUserRepository: jest.Mocked<UserRepositoryInterface>;
  let mockLogger: jest.Mocked<LoggerInterface>;

  beforeEach(async () => {
    const mockEventRepo: jest.Mocked<EventRepositoryInterface> = {
      saveEvent: jest.fn(),
      findEventById: jest.fn(),
    };

    const mockUserRepo: jest.Mocked<UserRepositoryInterface> = {
      upsertUser: jest.fn(),
      findUserBySourceId: jest.fn(),
    };

    const mockLoggerService: jest.Mocked<LoggerInterface> = {
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      info: jest.fn(),
      setContext: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TiktokEventProcessor,
        {
          provide: TtkCollectorDiTokens.TTK_EVENT_REPOSITORY,
          useValue: mockEventRepo,
        },
        {
          provide: TtkCollectorDiTokens.TTK_USER_REPOSITORY,
          useValue: mockUserRepo,
        },
        {
          provide: LoggerDiTokens.LOGGER,
          useValue: mockLoggerService,
        },
      ],
    }).compile();

    processor = module.get<TiktokEventProcessor>(TiktokEventProcessor);
    mockEventRepository = module.get(TtkCollectorDiTokens.TTK_EVENT_REPOSITORY);
    mockUserRepository = module.get(TtkCollectorDiTokens.TTK_USER_REPOSITORY);
    mockLogger = module.get(LoggerDiTokens.LOGGER);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('processEvent', () => {
    it('should successfully process a complete TikTok event', async () => {
      // Arrange
      const event = tiktokEventFixtures.completeViewEvent;
      const correlationId = 'test-correlation-123';
      const mockUser = tiktokEventFixtures.mockPrismaUser;
      const mockEvent = tiktokEventFixtures.mockPrismaEvent;

      mockUserRepository.upsertUser.mockResolvedValue(mockUser);
      mockEventRepository.saveEvent.mockResolvedValue(mockEvent);

      // Act
      await processor.processEvent(event, correlationId);

      // Assert
      expect(mockUserRepository.upsertUser).toHaveBeenCalledWith(event.data.user, 'tiktok');
      expect(mockEventRepository.saveEvent).toHaveBeenCalledWith(event, mockUser.id);
      expect(mockLogger.info).toHaveBeenCalledWith(
        `[${correlationId}] Processing event ${event.eventId} from TikTok`,
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        `[${correlationId}] Successfully processed event ${event.eventId}`,
      );
    });

    it('should process purchase event correctly', async () => {
      // Arrange
      const event = tiktokEventFixtures.purchaseEvent;
      const correlationId = 'purchase-correlation-456';
      const mockUser = { ...tiktokEventFixtures.mockPrismaUser, id: 'buyer-user-id' };
      const mockEvent = { ...tiktokEventFixtures.mockPrismaEvent, eventType: 'purchase' };

      mockUserRepository.upsertUser.mockResolvedValue(mockUser);
      mockEventRepository.saveEvent.mockResolvedValue(mockEvent);

      // Act
      await processor.processEvent(event, correlationId);

      // Assert
      expect(mockUserRepository.upsertUser).toHaveBeenCalledWith(
        {
          userId: 'ttk-user-999',
          username: 'buyer_user',
          followers: 100,
        },
        'tiktok',
      );
      expect(mockEventRepository.saveEvent).toHaveBeenCalledWith(event, 'buyer-user-id');
    });

    it('should handle user repository errors', async () => {
      // Arrange
      const event = tiktokEventFixtures.completeViewEvent;
      const correlationId = 'error-correlation-789';
      const error = new Error('User repository error');

      mockUserRepository.upsertUser.mockRejectedValue(error);

      // Act & Assert
      await expect(processor.processEvent(event, correlationId)).rejects.toThrow(
        'User repository error',
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
        `[${correlationId}] Failed to process event ${event.eventId}: User repository error`,
        error,
      );
      expect(mockEventRepository.saveEvent).not.toHaveBeenCalled();
    });

    it('should handle event repository errors', async () => {
      // Arrange
      const event = tiktokEventFixtures.shareEvent;
      const correlationId = 'event-error-correlation-123';
      const mockUser = tiktokEventFixtures.mockPrismaUser;
      const error = new Error('Event repository error');

      mockUserRepository.upsertUser.mockResolvedValue(mockUser);
      mockEventRepository.saveEvent.mockRejectedValue(error);

      // Act & Assert
      await expect(processor.processEvent(event, correlationId)).rejects.toThrow(
        'Event repository error',
      );

      expect(mockUserRepository.upsertUser).toHaveBeenCalled();
      expect(mockEventRepository.saveEvent).toHaveBeenCalledWith(event, mockUser.id);
      expect(mockLogger.error).toHaveBeenCalledWith(
        `[${correlationId}] Failed to process event ${event.eventId}: Event repository error`,
        error,
      );
    });

    it('should set logger context on instantiation', async () => {
      // Assert
      expect(mockLogger.setContext).toHaveBeenCalledWith('TiktokEventProcessor');
    });

    it('should process different event types with correct user data', async () => {
      // Arrange
      const likeEvent = tiktokEventFixtures.likeEvent;
      const correlationId = 'like-correlation-456';
      const mockUser = { ...tiktokEventFixtures.mockPrismaUser, sourceUserId: 'ttk-user-456' };
      const mockEvent = { ...tiktokEventFixtures.mockPrismaEvent, eventType: 'like' };

      mockUserRepository.upsertUser.mockResolvedValue(mockUser);
      mockEventRepository.saveEvent.mockResolvedValue(mockEvent);

      // Act
      await processor.processEvent(likeEvent, correlationId);

      // Assert
      expect(mockUserRepository.upsertUser).toHaveBeenCalledWith(
        {
          userId: 'ttk-user-456',
          username: 'another_user',
          followers: 2500,
        },
        'tiktok',
      );
    });

    it('should handle sequential processing correctly', async () => {
      // Arrange
      const event1 = tiktokEventFixtures.completeViewEvent;
      const event2 = tiktokEventFixtures.likeEvent;
      const correlationId1 = 'seq-1';
      const correlationId2 = 'seq-2';
      const mockUser1 = tiktokEventFixtures.mockPrismaUser;
      const mockUser2 = { ...tiktokEventFixtures.mockPrismaUser, id: 'user-2' };

      mockUserRepository.upsertUser
        .mockResolvedValueOnce(mockUser1)
        .mockResolvedValueOnce(mockUser2);
      mockEventRepository.saveEvent
        .mockResolvedValueOnce(tiktokEventFixtures.mockPrismaEvent)
        .mockResolvedValueOnce({ ...tiktokEventFixtures.mockPrismaEvent, eventType: 'like' });

      // Act
      await processor.processEvent(event1, correlationId1);
      await processor.processEvent(event2, correlationId2);

      // Assert
      expect(mockUserRepository.upsertUser).toHaveBeenCalledTimes(2);
      expect(mockEventRepository.saveEvent).toHaveBeenCalledTimes(2);
    });
  });
});
