import { z } from 'zod';
import { FunnelStage } from 'libs/common/enums/funnel-stage.enum';
import { Device } from 'libs/common/enums/tiktok-event.enum';
import { EventSource } from 'libs/common/enums/event-source.enum';

const TiktokUserSchema = z
  .object({
    userId: z.string().min(1),
    username: z.string().min(1),
    followers: z.number(),
  })
  .strict();

const TiktokEngagementTopSchema = z
  .object({
    watchTime: z.number(),
    percentageWatched: z.number(),
    device: z.nativeEnum(Device),
    country: z.string().min(1),
    videoId: z.string().min(1),
  })
  .strict();

const TiktokEngagementBottomSchema = z
  .object({
    actionTime: z.string(),
    profileId: z.string().nullable(),
    purchasedItem: z.string().nullable(),
    purchaseAmount: z.string().nullable(),
  })
  .strict();

const TiktokTopEventType = z.enum(['video.view', 'like', 'share', 'comment']);
const TiktokBottomEventType = z.enum(['profile.visit', 'purchase', 'follow']);

const TiktokEventBaseSchema = z.object({
  eventId: z.string().min(1),
  timestamp: z.string().datetime(),
  source: z.literal(EventSource.Tiktok),
});

const TopFunnelTiktokEventSchema = TiktokEventBaseSchema.extend({
  funnelStage: z.literal(FunnelStage.Top),
  eventType: TiktokTopEventType,
  data: z
    .object({
      user: TiktokUserSchema,
      engagement: TiktokEngagementTopSchema,
    })
    .strict(),
});

const BottomFunnelTiktokEventSchema = TiktokEventBaseSchema.extend({
  funnelStage: z.literal(FunnelStage.Bottom),
  eventType: TiktokBottomEventType,
  data: z
    .object({
      user: TiktokUserSchema,
      engagement: TiktokEngagementBottomSchema,
    })
    .strict(),
});

export const TiktokEventSchema = z.discriminatedUnion('funnelStage', [
  TopFunnelTiktokEventSchema,
  BottomFunnelTiktokEventSchema,
]);
