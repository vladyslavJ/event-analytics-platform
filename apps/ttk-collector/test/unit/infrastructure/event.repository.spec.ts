import { Test, TestingModule } from '@nestjs/testing';
import { EventRepository } from '../../../src/infrastructure/repositories/event.repository';
import { PrismaClientService } from 'libs/prisma-client/src/prisma-client.service';
import { PrismaServiceDiTokens } from 'libs/prisma-client/di/prisma-service-di-tokens';
import { tiktokEventFixtures } from '../../fixtures/tiktok-events.fixture';

describe('EventRepository', () => {
  let repository: EventRepository;
  let mockPrisma: jest.Mocked<PrismaClientService>;

  const mockPrismaEvent = {
    id: 'prisma-event-id',
    eventId: 'ttk-event-001',
    timestamp: new Date('2025-01-01T10:00:00.000Z'),
    source: 'tiktok',
    funnelStage: 'top',
    eventType: 'video.view',
    userId: 'user-123',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockPrismaService = {
      event: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventRepository,
        {
          provide: PrismaServiceDiTokens.PRISMA_CLIENT,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    repository = module.get<EventRepository>(EventRepository);
    mockPrisma = module.get(PrismaServiceDiTokens.PRISMA_CLIENT);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('saveEvent', () => {
    it('should save a new TikTok event successfully', async () => {
      // Arrange
      const event = tiktokEventFixtures.completeViewEvent;
      const userId = 'user-123';

      mockPrisma.event.findUnique.mockResolvedValue(null);
      mockPrisma.event.create.mockResolvedValue(mockPrismaEvent);

      // Act
      const result = await repository.saveEvent(event, userId);

      // Assert
      expect(mockPrisma.event.findUnique).toHaveBeenCalledWith({
        where: { eventId: 'ttk-event-001' },
      });
      expect(mockPrisma.event.create).toHaveBeenCalledWith({
        data: {
          eventId: 'ttk-event-001',
          timestamp: new Date('2025-01-01T10:00:00.000Z'),
          source: 'tiktok',
          funnelStage: 'top',
          eventType: 'video.view',
          userId: 'user-123',
          engagement: {
            create: {
              engagementType: 'top',
              videoId: 'video-abc-123',
              purchaseAmount: null,
              details: {
                watchTime: 30,
                percentageWatched: 85,
                device: 'iOS',
                country: 'US',
                videoId: 'video-abc-123',
              },
            },
          },
        },
      });
      expect(result).toEqual({
        id: 'prisma-event-id',
        eventId: 'ttk-event-001',
        timestamp: new Date('2025-01-01T10:00:00.000Z'),
        source: 'tiktok',
        funnelStage: 'top',
        eventType: 'video.view',
        userId: 'user-123',
      });
    });

    it('should handle purchase events with purchase amount', async () => {
      // Arrange
      const event = tiktokEventFixtures.purchaseEvent;
      const userId = 'buyer-user-123';
      const mockPurchaseEvent = {
        ...mockPrismaEvent,
        eventType: 'purchase',
        funnelStage: 'bottom',
      };

      mockPrisma.event.findUnique.mockResolvedValue(null);
      mockPrisma.event.create.mockResolvedValue(mockPurchaseEvent);

      // Act
      const result = await repository.saveEvent(event, userId);

      // Assert
      expect(mockPrisma.event.create).toHaveBeenCalledWith({
        data: {
          eventId: 'ttk-event-004',
          timestamp: new Date('2025-01-01T13:00:00.000Z'),
          source: 'tiktok',
          funnelStage: 'bottom',
          eventType: 'purchase',
          userId: 'buyer-user-123',
          engagement: {
            create: {
              engagementType: 'bottom',
              videoId: null,
              purchaseAmount: 99.99,
              details: {
                actionTime: '2025-01-01T13:00:00.000Z',
                profileId: 'profile-123',
                purchasedItem: 'Product XYZ',
                purchaseAmount: '99.99',
              },
            },
          },
        },
      });
      expect(result.eventType).toBe('purchase');
    });

    it('should return existing event if eventId already exists', async () => {
      // Arrange
      const event = tiktokEventFixtures.completeViewEvent;
      const userId = 'user-123';
      const existingEvent = mockPrismaEvent;

      mockPrisma.event.findUnique.mockResolvedValue(existingEvent);

      // Act
      const result = await repository.saveEvent(event, userId);

      // Assert
      expect(mockPrisma.event.findUnique).toHaveBeenCalledWith({
        where: { eventId: 'ttk-event-001' },
      });
      expect(mockPrisma.event.create).not.toHaveBeenCalled();
      expect(result).toEqual({
        id: 'prisma-event-id',
        eventId: 'ttk-event-001',
        timestamp: new Date('2025-01-01T10:00:00.000Z'),
        source: 'tiktok',
        funnelStage: 'top',
        eventType: 'video.view',
        userId: 'user-123',
      });
    });

    it('should handle top funnel events without purchase data', async () => {
      // Arrange
      const event = tiktokEventFixtures.likeEvent;
      const userId = 'liker-user-123';

      mockPrisma.event.findUnique.mockResolvedValue(null);
      mockPrisma.event.create.mockResolvedValue({
        ...mockPrismaEvent,
        eventType: 'like',
      });

      // Act
      await repository.saveEvent(event, userId);

      // Assert
      expect(mockPrisma.event.create).toHaveBeenCalledWith({
        data: {
          eventId: 'ttk-event-002',
          timestamp: new Date('2025-01-01T11:00:00.000Z'),
          source: 'tiktok',
          funnelStage: 'top',
          eventType: 'like',
          userId: 'liker-user-123',
          engagement: {
            create: {
              engagementType: 'top',
              videoId: 'video-def-456',
              purchaseAmount: null,
              details: {
                watchTime: 15,
                percentageWatched: 100,
                device: 'Android',
                country: 'CA',
                videoId: 'video-def-456',
              },
            },
          },
        },
      });
    });

    it('should handle database errors gracefully', async () => {
      // Arrange
      const event = tiktokEventFixtures.completeViewEvent;
      const userId = 'user-123';
      const error = new Error('Database connection failed');

      mockPrisma.event.findUnique.mockRejectedValue(error);

      // Act & Assert
      await expect(repository.saveEvent(event, userId)).rejects.toThrow(
        'Database connection failed',
      );
    });
  });

  describe('findEventById', () => {
    it('should return event when found', async () => {
      // Arrange
      const eventId = 'ttk-event-001';
      const mockFoundEvent = mockPrismaEvent;

      mockPrisma.event.findUnique.mockResolvedValue(mockFoundEvent);

      // Act
      const result = await repository.findEventById(eventId);

      // Assert
      expect(mockPrisma.event.findUnique).toHaveBeenCalledWith({
        where: { eventId: 'ttk-event-001' },
      });
      expect(result).toEqual({
        id: 'prisma-event-id',
        eventId: 'ttk-event-001',
        timestamp: new Date('2025-01-01T10:00:00.000Z'),
        source: 'tiktok',
        funnelStage: 'top',
        eventType: 'video.view',
        userId: 'user-123',
      });
    });

    it('should return null when event not found', async () => {
      // Arrange
      const eventId = 'non-existent-event';

      mockPrisma.event.findUnique.mockResolvedValue(null);

      // Act
      const result = await repository.findEventById(eventId);

      // Assert
      expect(mockPrisma.event.findUnique).toHaveBeenCalledWith({
        where: { eventId: 'non-existent-event' },
      });
      expect(result).toBeNull();
    });

    it('should handle database errors', async () => {
      // Arrange
      const eventId = 'ttk-event-001';
      const error = new Error('Database query failed');

      mockPrisma.event.findUnique.mockRejectedValue(error);

      // Act & Assert
      await expect(repository.findEventById(eventId)).rejects.toThrow('Database query failed');
    });
  });
});
