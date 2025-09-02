import { Test, TestingModule } from '@nestjs/testing';
import { FacebookEventProcessor } from '../../../src/domain/services/facebook-event-processor.service';
import {
  EventRepositoryInterface,
  UserRepositoryInterface,
} from '../../../src/domain/interfaces/repository.interface';
import { LoggerInterface } from 'libs/logger/interfaces/logger.interface';
import { LoggerDiTokens } from 'libs/logger/di/logger-di-tokens';
import { FbCollectorDiTokens } from '../../../src/infrastructure/di/fb-events-di-tokens';
import {
  mockFacebookTopEvent,
  mockFacebookBottomEvent,
  mockSavedEvent,
  mockSavedUser,
  mockCorrelationId,
} from '../../fixtures/facebook-events.fixture';

describe('FacebookEventProcessor', () => {
  let processor: FacebookEventProcessor;
  let mockEventRepository: jest.Mocked<EventRepositoryInterface>;
  let mockUserRepository: jest.Mocked<UserRepositoryInterface>;
  let mockLogger: jest.Mocked<LoggerInterface>;

  beforeEach(async () => {
    // Create mocked dependencies
    mockEventRepository = {
      saveEvent: jest.fn(),
      findEventById: jest.fn(),
    };

    mockUserRepository = {
      upsertUser: jest.fn(),
      findUserBySourceId: jest.fn(),
    };

    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      setContext: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FacebookEventProcessor,
        {
          provide: FbCollectorDiTokens.FB_EVENT_REPOSITORY,
          useValue: mockEventRepository,
        },
        {
          provide: FbCollectorDiTokens.FB_USER_REPOSITORY,
          useValue: mockUserRepository,
        },
        {
          provide: LoggerDiTokens.LOGGER,
          useValue: mockLogger,
        },
      ],
    }).compile();

    processor = module.get<FacebookEventProcessor>(FacebookEventProcessor);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('processEvent', () => {
    it('should successfully process a Facebook top event', async () => {
      // Arrange
      mockUserRepository.upsertUser.mockResolvedValue(mockSavedUser);
      mockEventRepository.saveEvent.mockResolvedValue(mockSavedEvent);

      // Act
      await processor.processEvent(mockFacebookTopEvent, mockCorrelationId);

      // Assert
      expect(mockLogger.info).toHaveBeenCalledWith(
        `[${mockCorrelationId}] Processing event ${mockFacebookTopEvent.eventId} from Facebook`,
      );
      expect(mockUserRepository.upsertUser).toHaveBeenCalledWith(
        mockFacebookTopEvent.data.user,
        'facebook',
      );
      expect(mockEventRepository.saveEvent).toHaveBeenCalledWith(
        mockFacebookTopEvent,
        mockSavedUser.id,
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        `[${mockCorrelationId}] Successfully processed event ${mockFacebookTopEvent.eventId}`,
      );
    });

    it('should successfully process a Facebook bottom event with purchase', async () => {
      // Arrange
      mockUserRepository.upsertUser.mockResolvedValue(mockSavedUser);
      mockEventRepository.saveEvent.mockResolvedValue(mockSavedEvent);

      // Act
      await processor.processEvent(mockFacebookBottomEvent, mockCorrelationId);

      // Assert
      expect(mockUserRepository.upsertUser).toHaveBeenCalledWith(
        mockFacebookBottomEvent.data.user,
        'facebook',
      );
      expect(mockEventRepository.saveEvent).toHaveBeenCalledWith(
        mockFacebookBottomEvent,
        mockSavedUser.id,
      );
      expect(mockLogger.info).toHaveBeenCalledTimes(2);
    });

    it('should handle user repository errors gracefully', async () => {
      // Arrange
      const error = new Error('User repository failed');
      mockUserRepository.upsertUser.mockRejectedValue(error);

      // Act & Assert
      await expect(processor.processEvent(mockFacebookTopEvent, mockCorrelationId)).rejects.toThrow(
        'User repository failed',
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
        `[${mockCorrelationId}] Failed to process event ${mockFacebookTopEvent.eventId}: User repository failed`,
        error,
      );
      expect(mockEventRepository.saveEvent).not.toHaveBeenCalled();
    });

    it('should handle event repository errors gracefully', async () => {
      // Arrange
      const error = new Error('Event repository failed');
      mockUserRepository.upsertUser.mockResolvedValue(mockSavedUser);
      mockEventRepository.saveEvent.mockRejectedValue(error);

      // Act & Assert
      await expect(processor.processEvent(mockFacebookTopEvent, mockCorrelationId)).rejects.toThrow(
        'Event repository failed',
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
        `[${mockCorrelationId}] Failed to process event ${mockFacebookTopEvent.eventId}: Event repository failed`,
        error,
      );
    });

    it('should log context during initialization', () => {
      expect(mockLogger.setContext).toHaveBeenCalledWith('FacebookEventProcessor');
    });
  });

  describe('error scenarios', () => {
    it('should propagate user upsert failures', async () => {
      // Arrange
      const dbError = new Error('Database connection lost');
      mockUserRepository.upsertUser.mockRejectedValue(dbError);

      // Act & Assert
      await expect(processor.processEvent(mockFacebookTopEvent, mockCorrelationId)).rejects.toThrow(
        'Database connection lost',
      );
    });

    it('should propagate event save failures', async () => {
      // Arrange
      mockUserRepository.upsertUser.mockResolvedValue(mockSavedUser);
      const saveError = new Error('Failed to save event');
      mockEventRepository.saveEvent.mockRejectedValue(saveError);

      // Act & Assert
      await expect(processor.processEvent(mockFacebookTopEvent, mockCorrelationId)).rejects.toThrow(
        'Failed to save event',
      );
    });
  });
});
