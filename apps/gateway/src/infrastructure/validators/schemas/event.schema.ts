import { z } from 'zod';
import { FacebookEventSchema } from './facebook-event.schema';
import { TiktokEventSchema } from './tiktok-event.schema';

const OBJECT_OF_COMPARISON = 'source';

export const EventSchema = z.discriminatedUnion(OBJECT_OF_COMPARISON, [
  FacebookEventSchema,
  TiktokEventSchema,
]);

export type ValidEvent = z.infer<typeof EventSchema>;
