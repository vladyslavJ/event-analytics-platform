import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { EventSource } from 'libs/common/enums/event-source.enum';

const GetDemographicsReportSchema = z.object({
  from: z.coerce.date(),
  to: z.coerce.date(),
  source: z.nativeEnum(EventSource).optional(),
});

export class GetDemographicsReportDto extends createZodDto(GetDemographicsReportSchema) {}
