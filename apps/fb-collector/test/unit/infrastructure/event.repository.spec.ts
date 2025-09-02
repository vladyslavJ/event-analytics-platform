import { Test, TestingModule } from '@nestjs/testing';
import { EventRepository } from '../../../src/infrastructure/repositories/event.repository';
import { PrismaClientService } from 'libs/prisma-client/src/prisma-client.service';
import { PrismaServiceDiTokens } from 'libs/prisma-client/di/prisma-service-di-tokens';
import {
  mockFacebookTopEvent,
  mockFacebookBottomEvent,
  mockSavedEvent,
} from '../../fixtures/facebook-events.fixture';

describe('EventRepository', () => {
  let repository: EventRepository;
  let mockPrisma: jest.Mocked<PrismaClientService>;

  const mockPrismaEvent = {
    id: 'saved_event_123',
    eventId: 'fb_top_123',
    timestamp: new Date('2025-09-01T12:00:00Z'),
    source: 'facebook',
    funnelStage: 'top',
    eventType: 'ad.view',
    userId: 'user_123',
    createdAt: new Date(),
  };

  beforeEach(async () => {
    mockPrisma = {
      event: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventRepository,
        {
          provide: PrismaServiceDiTokens.PRISMA_CLIENT,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    repository = module.get<EventRepository>(EventRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('saveEvent', () => {
    it('should save a new Facebook top event successfully', async () => {
      const userId = 'user_123';
      mockPrisma.event.findUnique.mockResolvedValue(null);
      mockPrisma.event.create.mockResolvedValue(mockPrismaEvent as any);

      const result = await repository.saveEvent(mockFacebookTopEvent, userId);

      expect(mockPrisma.event.findUnique).toHaveBeenCalledWith({
        where: { eventId: 'fb_top_123' },
      });
      expect(mockPrisma.event.create).toHaveBeenCalledWith({
        data: {
          eventId: 'fb_top_123',
          timestamp: new Date('2025-09-01T12:00:00Z'),
          source: 'facebook',
          funnelStage: 'top',
          eventType: 'ad.view',
          userId: 'user_123',
          engagement: {
            create: {
              engagementType: 'top',
              adId: 'ad_123',
              campaignId: 'campaign_456',
              videoId: null,
              purchaseAmount: null,
              details: mockFacebookTopEvent.data.engagement,
            },
          },
        },
      });
      expect(result).toEqual(mockSavedEvent);
    });

    it('should save a Facebook bottom event with purchase amount', async () => {
      const userId = 'user_456';
      const bottomEventPrismaResult = {
        ...mockPrismaEvent,
        id: 'saved_event_789',
        eventId: 'fb_bottom_789',
        eventType: 'checkout.complete',
        funnelStage: 'bottom',
      };

      mockPrisma.event.findUnique.mockResolvedValue(null);
      mockPrisma.event.create.mockResolvedValue(bottomEventPrismaResult as any);

      const result = await repository.saveEvent(mockFacebookBottomEvent, userId);

      expect(mockPrisma.event.create).toHaveBeenCalledWith({
        data: {
          eventId: 'fb_bottom_789',
          timestamp: new Date('2025-09-01T12:30:00Z'),
          source: 'facebook',
          funnelStage: 'bottom',
          eventType: 'checkout.complete',
          userId: 'user_456',
          engagement: {
            create: {
              engagementType: 'bottom',
              adId: 'ad_999',
              campaignId: 'campaign_999',
              videoId: null,
              purchaseAmount: 99.99,
              details: mockFacebookBottomEvent.data.engagement,
            },
          },
        },
      });
      expect(result.eventType).toBe('checkout.complete');
    });

    it('should return existing event if it already exists', async () => {
      const userId = 'user_123';
      mockPrisma.event.findUnique.mockResolvedValue(mockPrismaEvent as any);

      const result = await repository.saveEvent(mockFacebookTopEvent, userId);

      expect(mockPrisma.event.findUnique).toHaveBeenCalled();
      expect(mockPrisma.event.create).not.toHaveBeenCalled();
      expect(result).toEqual(mockSavedEvent);
    });

    it('should handle purchase amount extraction correctly', async () => {
      const userId = 'user_456';
      mockPrisma.event.findUnique.mockResolvedValue(null);
      mockPrisma.event.create.mockResolvedValue(mockPrismaEvent as any);

      await repository.saveEvent(mockFacebookBottomEvent, userId);

      const createCall = mockPrisma.event.create.mock.calls[0][0];
      expect(createCall.data.engagement.create.purchaseAmount).toBe(99.99);
    });

    it('should handle engagement data without purchase amount', async () => {
      const userId = 'user_123';
      mockPrisma.event.findUnique.mockResolvedValue(null);
      mockPrisma.event.create.mockResolvedValue(mockPrismaEvent as any);

      await repository.saveEvent(mockFacebookTopEvent, userId);

      const createCall = mockPrisma.event.create.mock.calls[0][0];
      expect(createCall.data.engagement.create.purchaseAmount).toBeNull();
    });
  });

  describe('findEventById', () => {
    it('should find event by ID successfully', async () => {
      const eventId = 'fb_top_123';
      mockPrisma.event.findUnique.mockResolvedValue(mockPrismaEvent as any);

      const result = await repository.findEventById(eventId);

      expect(mockPrisma.event.findUnique).toHaveBeenCalledWith({
        where: { eventId: 'fb_top_123' },
      });
      expect(result).toEqual(mockSavedEvent);
    });

    it('should return null when event not found', async () => {
      const eventId = 'non_existent_event';
      mockPrisma.event.findUnique.mockResolvedValue(null);

      const result = await repository.findEventById(eventId);

      expect(result).toBeNull();
    });

    it('should handle database errors gracefully', async () => {
      const eventId = 'fb_top_123';
      const dbError = new Error('Database connection failed');
      mockPrisma.event.findUnique.mockRejectedValue(dbError);

      await expect(repository.findEventById(eventId)).rejects.toThrow('Database connection failed');
    });
  });

  describe('error handling', () => {
    it('should propagate database errors during save', async () => {
      const userId = 'user_123';
      const dbError = new Error('Database write failed');
      mockPrisma.event.findUnique.mockResolvedValue(null);
      mockPrisma.event.create.mockRejectedValue(dbError);

      await expect(repository.saveEvent(mockFacebookTopEvent, userId)).rejects.toThrow(
        'Database write failed',
      );
    });

    it('should handle findUnique errors during save', async () => {
      const userId = 'user_123';
      const dbError = new Error('Database read failed');
      mockPrisma.event.findUnique.mockRejectedValue(dbError);

      await expect(repository.saveEvent(mockFacebookTopEvent, userId)).rejects.toThrow(
        'Database read failed',
      );
    });
  });
});
