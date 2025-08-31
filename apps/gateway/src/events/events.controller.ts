import { Inject, Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import type { EventsServiceInterface } from './interfaces/events-service.interface';
import { EventsControllerInterface } from 'libs/common/interfaces/events-controller.interface';
import { EventsServiceDiTokens } from 'libs/common/di/events-di-tokens';
import { NatsPublisherService } from 'libs/nats/nats-publisher.service';
import { randomUUID } from 'crypto';

@Controller('events')
export class EventsController implements EventsControllerInterface {
  constructor(
    @Inject(EventsServiceDiTokens.EVENTS_SERVICE)
    private readonly eventsService: EventsServiceInterface,
    private readonly natsPublisher: NatsPublisherService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  async handleEvents(@Body() events: Record<string, unknown>[]) {
    if (!Array.isArray(events)) {
      return {
        message: 'Rejected. Events must be an array.',
      };
    }

    const { validEvents, invalidCount } = this.eventsService.processAndFilterEvents(events);

    const publishPromises = validEvents.map(event => {
      const correlationId = randomUUID();
      return this.natsPublisher.publishEvent({ ...event, correlationId });
    });

    await Promise.all(publishPromises);

    return {
      message: 'Events are being processed.',
      accepted: validEvents.length,
      rejected: invalidCount,
    };
  }
}
