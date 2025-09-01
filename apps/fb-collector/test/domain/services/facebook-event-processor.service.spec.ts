import { Test, TestingModule } from '@nestjs/testing';
import { FacebookEventProcessor } from '../../../src/domain/services/facebook-event-processor.service';
import {
  EventRepositoryInterface,
  UserRepositoryInterface,
} from '../../../src/domain/interfaces/repository.interface';
import { LoggerInterface } from 'libs/logger/interfaces/logger.interface';
import { FacebookEventInterface } from 'libs/common/interfaces/facebook-event.interface';

describe('FacebookEventProcessor', () => {
  let processor: FacebookEventProcessor;
  let mockEventRepository: jest.Mocked<EventRepositoryInterface>;
  let mockUserRepository: jest.Mocked<UserRepositoryInterface>;
  let mockLogger: jest.Mocked<LoggerInterface>;

  const mockFacebookEvent: FacebookEventInterface = {
    eventId: 'test-event-id',
    timestamp: '2023-01-01T00:00:00Z',
    source: 'facebook' as any,
    funnelStage: 'top' as any,
    eventType: 'ad.view' as any,
    data: {
      user: {
        userId: 'user-123',
        name: 'Test User',
        age: 25,
        gender: 'male' as any,
        location: {
          country: 'US',
          city: 'New York',
        },
      },
      engagement: {
        actionTime: '2023-01-01T00:00:00Z',
        referrer: 'newsfeed' as any,
        videoId: null,
      } as any,
    },
  };

  beforeEach(async () => {
    mockEventRepository = {
      saveEvent: jest.fn(),
      findEventById: jest.fn(),
    };

    mockUserRepository = {
      upsertUser: jest.fn(),
      findUserBySourceId: jest.fn(),
    };

    mockLogger = {
      setContext: jest.fn(),
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FacebookEventProcessor,
        {
          provide: 'FB_EVENT_REPOSITORY',
          useValue: mockEventRepository,
        },
        {
          provide: 'FB_USER_REPOSITORY',
          useValue: mockUserRepository,
        },
        {
          provide: 'LOGGER',
          useValue: mockLogger,
        },
      ],
    }).compile();

    processor = module.get<FacebookEventProcessor>(FacebookEventProcessor);
  });

  it('should be defined', () => {
    expect(processor).toBeDefined();
  });

  it('should successfully process a Facebook event', async () => {
    const mockUser = {
      id: 'user-db-id',
      source: 'facebook',
      sourceUserId: 'user-123',
      name: 'Test User',
      age: 25,
      gender: 'male',
      country: 'US',
      city: 'New York',
    };

    const mockSavedEvent = {
      id: 'event-db-id',
      eventId: 'test-event-id',
      timestamp: new Date('2023-01-01T00:00:00Z'),
      source: 'facebook',
      funnelStage: 'top',
      eventType: 'ad.view',
      userId: 'user-db-id',
    };

    mockUserRepository.upsertUser.mockResolvedValue(mockUser);
    mockEventRepository.saveEvent.mockResolvedValue(mockSavedEvent);

    await processor.processEvent(mockFacebookEvent, 'correlation-123');

    expect(mockUserRepository.upsertUser).toHaveBeenCalledWith(
      mockFacebookEvent.data.user,
      'facebook',
    );
    expect(mockEventRepository.saveEvent).toHaveBeenCalledWith(mockFacebookEvent, 'user-db-id');
    expect(mockLogger.info).toHaveBeenCalledWith(
      '[correlation-123] Processing event test-event-id from Facebook',
    );
    expect(mockLogger.info).toHaveBeenCalledWith(
      '[correlation-123] Successfully processed event test-event-id',
    );
  });

  it('should handle errors and rethrow them', async () => {
    const error = new Error('Database error');
    mockUserRepository.upsertUser.mockRejectedValue(error);

    await expect(processor.processEvent(mockFacebookEvent, 'correlation-123')).rejects.toThrow(
      'Database error',
    );

    expect(mockLogger.error).toHaveBeenCalledWith(
      '[correlation-123] Failed to process event test-event-id: Database error',
      error,
    );
  });
});
