import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { EventSource } from 'libs/common/enums/event-source.enum';

const GetRevenueReportSchema = z.object({
  from: z.coerce.date(),
  to: z.coerce.date(),
  source: z.nativeEnum(EventSource).optional(),
  campaignId: z.string().optional(),
});

export class GetRevenueReportDto extends createZodDto(GetRevenueReportSchema) {}
