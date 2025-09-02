import { Controller, Post, Body, HttpCode, HttpStatus, Inject } from '@nestjs/common';
import { EventProcessingService } from '../../application/services/event-processing.service';
import type { LoggerInterface } from 'libs/logger/interfaces/logger.interface';
import { LoggerDiTokens } from 'libs/logger/di/logger-di-tokens';

@Controller('events')
export class EventsController {
  constructor(
    private readonly eventProcessingService: EventProcessingService,
    @Inject(LoggerDiTokens.LOGGER)
    private readonly logger: LoggerInterface,
  ) {
    this.logger.setContext(EventsController.name);
  }

  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  async handleEvents(@Body() events: Record<string, unknown>[]) {
    if (!Array.isArray(events)) {
      this.logger.warn('Rejected request: events must be an array');
      return {
        message: 'Rejected. Events must be an array.',
      };
    }
    this.logger.info(`Received ${events.length} events for processing`);
    return this.eventProcessingService.handleEvents(events);
  }
}
