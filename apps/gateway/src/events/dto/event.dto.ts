import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { EventSchema } from '../schemas/event.schema';

export class EventsDto extends createZodDto(z.array(EventSchema)) {}
