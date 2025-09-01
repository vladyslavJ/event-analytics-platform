import { Test, TestingModule } from '@nestjs/testing';
import { TiktokEventProcessor } from '../../../src/domain/services/tiktok-event-processor.service';
import {
  EventRepositoryInterface,
  UserRepositoryInterface,
} from '../../../src/domain/interfaces/repository.interface';
import { LoggerInterface } from 'libs/logger/interfaces/logger.interface';
import { TiktokEventInterface } from 'libs/common/interfaces/tiktok-event.interface';

describe('TiktokEventProcessor', () => {
  let processor: TiktokEventProcessor;
  let mockEventRepository: jest.Mocked<EventRepositoryInterface>;
  let mockUserRepository: jest.Mocked<UserRepositoryInterface>;
  let mockLogger: jest.Mocked<LoggerInterface>;

  const mockTiktokEvent: TiktokEventInterface = {
    eventId: 'test-ttk-event-id',
    timestamp: '2023-01-01T00:00:00Z',
    source: 'tiktok' as any,
    funnelStage: 'top' as any,
    eventType: 'video.view' as any,
    data: {
      user: {
        userId: 'ttk-user-123',
        username: '@testuser',
        followers: 1000,
      },
      engagement: {
        watchTime: 30,
        percentageWatched: 75,
        device: 'Android' as any,
        country: 'US',
        videoId: 'video-123',
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
        TiktokEventProcessor,
        {
          provide: 'TTK_EVENT_REPOSITORY',
          useValue: mockEventRepository,
        },
        {
          provide: 'TTK_USER_REPOSITORY',
          useValue: mockUserRepository,
        },
        {
          provide: 'LOGGER',
          useValue: mockLogger,
        },
      ],
    }).compile();

    processor = module.get<TiktokEventProcessor>(TiktokEventProcessor);
  });

  it('should be defined', () => {
    expect(processor).toBeDefined();
  });

  it('should successfully process a TikTok event', async () => {
    const mockUser = {
      id: 'ttk-user-db-id',
      source: 'tiktok',
      sourceUserId: 'ttk-user-123',
      name: '@testuser',
      followers: 1000,
    };

    const mockSavedEvent = {
      id: 'ttk-event-db-id',
      eventId: 'test-ttk-event-id',
      timestamp: new Date('2023-01-01T00:00:00Z'),
      source: 'tiktok',
      funnelStage: 'top',
      eventType: 'video.view',
      userId: 'ttk-user-db-id',
    };

    mockUserRepository.upsertUser.mockResolvedValue(mockUser);
    mockEventRepository.saveEvent.mockResolvedValue(mockSavedEvent);

    await processor.processEvent(mockTiktokEvent, 'correlation-456');

    expect(mockUserRepository.upsertUser).toHaveBeenCalledWith(mockTiktokEvent.data.user, 'tiktok');
    expect(mockEventRepository.saveEvent).toHaveBeenCalledWith(mockTiktokEvent, 'ttk-user-db-id');
    expect(mockLogger.info).toHaveBeenCalledWith(
      '[correlation-456] Processing event test-ttk-event-id from TikTok',
    );
    expect(mockLogger.info).toHaveBeenCalledWith(
      '[correlation-456] Successfully processed event test-ttk-event-id',
    );
  });

  it('should handle errors and rethrow them', async () => {
    const error = new Error('TikTok API error');
    mockUserRepository.upsertUser.mockRejectedValue(error);

    await expect(processor.processEvent(mockTiktokEvent, 'correlation-456')).rejects.toThrow(
      'TikTok API error',
    );

    expect(mockLogger.error).toHaveBeenCalledWith(
      '[correlation-456] Failed to process event test-ttk-event-id: TikTok API error',
      error,
    );
  });
});
