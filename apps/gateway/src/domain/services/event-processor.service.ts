import { Injectable, Inject } from '@nestjs/common';
import type {
  EventProcessorInterface,
  ProcessingResult,
} from '../interfaces/event-processor.interface';
import type { EventValidatorInterface } from '../interfaces/event-validator.interface';
import type { EventPublisherInterface } from '../interfaces/event-publisher.interface';
import type { LoggerInterface } from 'libs/logger/interfaces/logger.interface';
import { LoggerDiTokens } from 'libs/logger/di/logger-di-tokens';
import { GatewayDiTokens } from '../../infrastructure/di/gateway-di-tokens';

@Injectable()
export class EventProcessor implements EventProcessorInterface {
  constructor(
    @Inject(GatewayDiTokens.EVENT_VALIDATOR)
    private readonly validator: EventValidatorInterface,
    @Inject(GatewayDiTokens.EVENT_PUBLISHER)
    private readonly publisher: EventPublisherInterface,
    @Inject(LoggerDiTokens.LOGGER)
    private readonly logger: LoggerInterface,
  ) {
    this.logger.setContext(EventProcessor.name);
  }

  async processEvents(events: Record<string, unknown>[]): Promise<ProcessingResult> {
    this.logger.info(`Processing ${events.length} events`);
    const validationResult = this.validator.validateEvents(events);
    this.logger.info(
      `Validated: ${validationResult.validEvents.length} valid, ${validationResult.invalidCount} invalid`,
    );
    const publishResult = await this.publisher.publishEvents(validationResult.validEvents);
    this.logger.info(
      `Published: ${publishResult.publishedCount} successful, ${publishResult.failedCount} failed`,
    );
    return {
      message: 'Events are being processed.',
      accepted: validationResult.validEvents.length,
      rejected: validationResult.invalidCount,
    };
  }
}
