import { Injectable } from '@nestjs/common';
import { EventSchema } from './schemas/event.schema';
import { EventsServiceInterface } from './interfaces/events-service.interface';
import { ProcessedEventsResultInterface } from './interfaces/processed-events-result.interface';
import { ValidEvent } from './schemas/event.schema';

@Injectable()
export class EventsService implements EventsServiceInterface {
  processAndFilterEvents(events: Record<string, unknown>[]): ProcessedEventsResultInterface {
    const validEvents: ValidEvent[] = [];
    let invalidCount = 0;

    for (const event of events) {
      const validationResult = EventSchema.safeParse(event);

      if (validationResult.success) {
        validEvents.push(validationResult.data);
        console.log('VALID', JSON.stringify(validationResult.data));
      } else {
        invalidCount++;
        console.log('INVALID');
        console.log({
          message: 'Invalid event received and skipped.',
          error: validationResult.error.flatten(),
        });
      }
    }

    return { validEvents, invalidCount };
  }
}
