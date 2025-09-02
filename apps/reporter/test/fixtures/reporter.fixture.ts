import { EventSource } from 'libs/common/enums/event-source.enum';
import { FunnelStage } from 'libs/common/enums/funnel-stage.enum';
import { FacebookBottomEvent, FacebookTopEvent } from 'libs/common/enums/facebook-event.enum';
import { TiktokBottomEvent, TiktokTopEvent } from 'libs/common/enums/tiktok-event.enum';

export const reporterFixtures = {
  // DTOs
  eventsReportDto: {
    from: new Date('2025-01-01T00:00:00.000Z'),
    to: new Date('2025-01-31T23:59:59.999Z'),
    source: EventSource.Facebook,
    funnelStage: FunnelStage.Top,
    eventType: FacebookTopEvent.VideoView,
  },

  revenueReportDto: {
    from: new Date('2025-01-01T00:00:00.000Z'),
    to: new Date('2025-01-31T23:59:59.999Z'),
    source: EventSource.Facebook,
    campaignId: 'campaign-123',
  },

  demographicsReportDto: {
    from: new Date('2025-01-01T00:00:00.000Z'),
    to: new Date('2025-01-31T23:59:59.999Z'),
    source: EventSource.Facebook,
  },

  // Report Results
  eventsReportResult: [
    {
      source: 'facebook',
      funnelStage: 'top',
      eventType: 'video.view',
      count: 150,
    },
    {
      source: 'facebook',
      funnelStage: 'top',
      eventType: 'like',
      count: 75,
    },
    {
      source: 'tiktok',
      funnelStage: 'bottom',
      eventType: 'purchase',
      count: 25,
    },
  ],

  revenueReportResult: {
    totalRevenue: 2500.5,
    revenueByCampaign: [
      {
        campaignId: 'campaign-123',
        revenue: 1500.25,
      },
      {
        campaignId: 'campaign-456',
        revenue: 1000.25,
      },
    ],
  },

  demographicsReportResult: [
    {
      sourceUserId: 'fb-user-123',
      name: 'John Doe',
      age: 25,
      gender: 'male',
      country: 'US',
      city: 'New York',
    },
    {
      sourceUserId: 'fb-user-456',
      name: 'Jane Smith',
      age: 30,
      gender: 'female',
      country: 'CA',
      city: 'Toronto',
    },
    {
      sourceUserId: 'ttk-user-789',
      name: 'tiktok_user',
      followers: 5000,
    },
  ],

  // Query Builder Results
  eventsReportQuery: {
    by: ['source', 'funnelStage', 'eventType'],
    _count: { id: true },
    where: {
      timestamp: {
        gte: new Date('2025-01-01T00:00:00.000Z'),
        lte: new Date('2025-01-31T23:59:59.999Z'),
      },
      source: EventSource.Facebook,
      funnelStage: FunnelStage.Top,
      eventType: FacebookTopEvent.VideoView,
    },
  },

  revenueReportQuery: {
    where: {
      timestamp: {
        gte: new Date('2025-01-01T00:00:00.000Z'),
        lte: new Date('2025-01-31T23:59:59.999Z'),
      },
      source: EventSource.Facebook,
      OR: [
        { eventType: FacebookBottomEvent.CheckoutComplete },
        { eventType: TiktokBottomEvent.Purchase },
      ],
      engagement: {
        campaignId: 'campaign-123',
        purchaseAmount: { not: null },
      },
    },
    select: {
      source: true,
      engagement: {
        select: {
          campaignId: true,
          purchaseAmount: true,
        },
      },
    },
  },

  demographicsReportQuery: {
    where: {
      source: EventSource.Facebook,
      events: {
        some: {
          timestamp: {
            gte: new Date('2025-01-01T00:00:00.000Z'),
            lte: new Date('2025-01-31T23:59:59.999Z'),
          },
        },
      },
    },
    select: {
      sourceUserId: true,
      name: true,
      age: true,
      gender: true,
      country: true,
      city: true,
    },
  },

  // Prisma Raw Data
  prismaEventsGroupByResult: [
    {
      source: 'facebook',
      funnelStage: 'top',
      eventType: 'video.view',
      _count: { id: 150 },
    },
    {
      source: 'facebook',
      funnelStage: 'top',
      eventType: 'like',
      _count: { id: 75 },
    },
  ],

  prismaRevenueEvents: [
    {
      source: 'facebook',
      engagement: {
        campaignId: 'campaign-123',
        purchaseAmount: '99.99',
      },
    },
    {
      source: 'facebook',
      engagement: {
        campaignId: 'campaign-123',
        purchaseAmount: '149.50',
      },
    },
    {
      source: 'tiktok',
      engagement: {
        campaignId: 'campaign-456',
        purchaseAmount: '75.25',
      },
    },
  ],

  prismaDemographicsUsers: [
    {
      sourceUserId: 'fb-user-123',
      name: 'John Doe',
      age: 25,
      gender: 'male',
      country: 'US',
      city: 'New York',
      followers: null,
    },
    {
      sourceUserId: 'fb-user-456',
      name: 'Jane Smith',
      age: 30,
      gender: 'female',
      country: 'CA',
      city: 'Toronto',
      followers: null,
    },
  ],

  // Error scenarios
  databaseError: new Error('Database connection failed'),
  invalidDateRangeDto: {
    from: new Date('2025-01-31T23:59:59.999Z'), // from after to
    to: new Date('2025-01-01T00:00:00.000Z'),
  },
};
