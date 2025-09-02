import { TiktokEventInterface } from 'libs/common/interfaces/tiktok-event.interface';
import { EventSource } from 'libs/common/enums/event-source.enum';
import { FunnelStage } from 'libs/common/enums/funnel-stage.enum';
import { TiktokTopEvent, TiktokBottomEvent, Device } from 'libs/common/enums/tiktok-event.enum';

export const tiktokEventFixtures = {
  completeViewEvent: {
    eventId: 'ttk-event-001',
    timestamp: '2025-01-01T10:00:00.000Z',
    source: EventSource.Tiktok,
    funnelStage: FunnelStage.Top,
    eventType: TiktokTopEvent.VideoView,
    data: {
      user: {
        userId: 'ttk-user-123',
        username: 'test_tiktok_user',
        followers: 1500,
      },
      engagement: {
        watchTime: 30,
        percentageWatched: 85,
        device: Device.iOS,
        country: 'US',
        videoId: 'video-abc-123',
      },
    },
  } as TiktokEventInterface,

  likeEvent: {
    eventId: 'ttk-event-002',
    timestamp: '2025-01-01T11:00:00.000Z',
    source: EventSource.Tiktok,
    funnelStage: FunnelStage.Top,
    eventType: TiktokTopEvent.Like,
    data: {
      user: {
        userId: 'ttk-user-456',
        username: 'another_user',
        followers: 2500,
      },
      engagement: {
        watchTime: 15,
        percentageWatched: 100,
        device: Device.Android,
        country: 'CA',
        videoId: 'video-def-456',
      },
    },
  } as TiktokEventInterface,

  shareEvent: {
    eventId: 'ttk-event-003',
    timestamp: '2025-01-01T12:00:00.000Z',
    source: EventSource.Tiktok,
    funnelStage: FunnelStage.Top,
    eventType: TiktokTopEvent.Share,
    data: {
      user: {
        userId: 'ttk-user-789',
        username: 'sharing_user',
        followers: 500,
      },
      engagement: {
        watchTime: 45,
        percentageWatched: 90,
        device: Device.Desktop,
        country: 'UK',
        videoId: 'video-ghi-789',
      },
    },
  } as TiktokEventInterface,

  purchaseEvent: {
    eventId: 'ttk-event-004',
    timestamp: '2025-01-01T13:00:00.000Z',
    source: EventSource.Tiktok,
    funnelStage: FunnelStage.Bottom,
    eventType: TiktokBottomEvent.Purchase,
    data: {
      user: {
        userId: 'ttk-user-999',
        username: 'buyer_user',
        followers: 100,
      },
      engagement: {
        actionTime: '2025-01-01T13:00:00.000Z',
        profileId: 'profile-123',
        purchasedItem: 'Product XYZ',
        purchaseAmount: '99.99',
      },
    },
  } as TiktokEventInterface,

  minimalUserData: {
    userId: 'ttk-minimal-user',
    username: 'minimal_user',
    followers: 0,
  },

  completeUserData: {
    userId: 'ttk-complete-user',
    username: 'complete_user',
    followers: 10000,
  },

  mockPrismaEvent: {
    id: 'prisma-event-id-123',
    eventId: 'ttk-event-001',
    timestamp: new Date('2025-01-01T10:00:00.000Z'),
    source: 'tiktok',
    funnelStage: 'top',
    eventType: 'video.view',
    userId: 'prisma-user-id-123',
    createdAt: new Date('2025-01-01T10:00:00.000Z'),
    updatedAt: new Date('2025-01-01T10:00:00.000Z'),
  },

  mockPrismaUser: {
    id: 'prisma-user-id-123',
    source: 'tiktok',
    sourceUserId: 'ttk-user-123',
    name: 'test_tiktok_user',
    followers: 1500,
    extra: {},
    createdAt: new Date('2025-01-01T09:00:00.000Z'),
    updatedAt: new Date('2025-01-01T10:00:00.000Z'),
  },
};
