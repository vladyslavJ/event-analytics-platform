import { Injectable, Inject } from '@nestjs/common';
import { EventSchema } from './schemas/event.schema';
import { EventsServiceInterface } from './interfaces/events-service.interface';
import { ProcessedEventsResultInterface } from './interfaces/processed-events-result.interface';
import { ValidEvent } from './schemas/event.schema';
import { LoggerDiTokens } from 'libs/logger/di/logger-di-tokens';
import type { LoggerInterface } from 'libs/logger/interfaces/logger.interface';

@Injectable()
export class EventsService implements EventsServiceInterface {
  constructor(
    @Inject(LoggerDiTokens.LOGGER)
    private readonly logger: LoggerInterface,
  ) {
    this.logger.setContext(EventsService.name);
  }
  processAndFilterEvents(events: Record<string, unknown>[]): ProcessedEventsResultInterface {
    const validEvents: ValidEvent[] = [];
    let invalidCount = 0;

    for (const event of events) {
      const validationResult = EventSchema.safeParse(event);

      if (validationResult.success) {
        validEvents.push(validationResult.data);
        this.logger.info('VALID');
      } else {
        invalidCount++;
        this.logger.warn('INVALID');
      }
    }

    return { validEvents, invalidCount };
  }
}
