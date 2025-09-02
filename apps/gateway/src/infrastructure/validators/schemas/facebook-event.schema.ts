import { z } from 'zod';
import { FunnelStage } from 'libs/common/enums/funnel-stage.enum';
import {
  Gender,
  FacebookReferrer,
  ClickPosition,
  Device,
  Browser,
} from 'libs/common/enums/facebook-event.enum';
import { EventSource } from 'libs/common/enums/event-source.enum';

const FacebookUserLocationSchema = z
  .object({
    country: z.string().min(1),
    city: z.string().min(1),
  })
  .strict();

const FacebookUserSchema = z
  .object({
    userId: z.string().min(1),
    name: z.string().min(1),
    age: z.number(),
    gender: z.nativeEnum(Gender),
    location: FacebookUserLocationSchema,
  })
  .strict();

const FacebookEngagementTopSchema = z
  .object({
    actionTime: z.string(),
    referrer: z.nativeEnum(FacebookReferrer),
    videoId: z.string().nullable(),
  })
  .strict();

const FacebookEngagementBottomSchema = z
  .object({
    adId: z.string().min(1),
    campaignId: z.string().min(1),
    clickPosition: z.nativeEnum(ClickPosition),
    device: z.nativeEnum(Device),
    browser: z.nativeEnum(Browser),
    purchaseAmount: z.string().nullable(),
  })
  .strict();

const FacebookTopEventType = z.enum(['ad.view', 'page.like', 'comment', 'video.view']);
const FacebookBottomEventType = z.enum(['ad.click', 'form.submission', 'checkout.complete']);

const FacebookEventBaseSchema = z.object({
  eventId: z.string().min(1),
  timestamp: z.string().datetime(),
  source: z.literal(EventSource.Facebook),
});

const TopFunnelFacebookEventSchema = FacebookEventBaseSchema.extend({
  funnelStage: z.literal(FunnelStage.Top),
  eventType: FacebookTopEventType,
  data: z
    .object({
      user: FacebookUserSchema,
      engagement: FacebookEngagementTopSchema,
    })
    .strict(),
});

const BottomFunnelFacebookEventSchema = FacebookEventBaseSchema.extend({
  funnelStage: z.literal(FunnelStage.Bottom),
  eventType: FacebookBottomEventType,
  data: z
    .object({
      user: FacebookUserSchema,
      engagement: FacebookEngagementBottomSchema,
    })
    .strict(),
});

export const FacebookEventSchema = z.discriminatedUnion('funnelStage', [
  TopFunnelFacebookEventSchema,
  BottomFunnelFacebookEventSchema,
]);
