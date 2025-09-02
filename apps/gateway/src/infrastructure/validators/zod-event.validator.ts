import { Injectable, Inject } from '@nestjs/common';
import type {
  EventValidatorInterface,
  ValidationResult,
} from '../../domain/interfaces/event-validator.interface';
import { EventSchema } from './schemas/event.schema';
import type { LoggerInterface } from 'libs/logger/interfaces/logger.interface';
import { LoggerDiTokens } from 'libs/logger/di/logger-di-tokens';

@Injectable()
export class ZodEventValidator implements EventValidatorInterface {
  constructor(
    @Inject(LoggerDiTokens.LOGGER)
    private readonly logger: LoggerInterface,
  ) {
    this.logger.setContext(ZodEventValidator.name);
  }

  validateEvents(events: Record<string, unknown>[]): ValidationResult {
    const validEvents: any[] = [];
    let invalidCount = 0;
    for (const event of events) {
      const validationResult = EventSchema.safeParse(event);
      if (validationResult.success) {
        validEvents.push(validationResult.data);
        this.logger.debug(`Valid event: ${event.eventId || 'unknown'}`);
      } else {
        invalidCount++;
        this.logger.warn(`Invalid event: ${JSON.stringify(validationResult.error.issues)}`);
      }
    }
    return { validEvents, invalidCount };
  }
}
