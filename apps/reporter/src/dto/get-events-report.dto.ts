import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { EventSource } from 'libs/common/enums/event-source.enum';
import { FunnelStage } from 'libs/common/enums/funnel-stage.enum';

const GetEventsReportSchema = z.object({
  from: z.coerce.date(),
  to: z.coerce.date(),
  source: z.nativeEnum(EventSource).optional(),
  funnelStage: z.nativeEnum(FunnelStage).optional(),
  eventType: z.string().optional(),
});

export class GetEventsReportDto extends createZodDto(GetEventsReportSchema) {}
