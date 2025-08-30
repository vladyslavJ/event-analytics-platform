import { Inject, Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import type { EventsServiceInterface } from './interfaces/events-service.interface';
import { EventsControllerInterface } from 'libs/common/interfaces/events-controller.interface';
import { EventsServiceDiTokens } from 'libs/common/di/events-di-tokens';
import type { NatsServiceInterface } from '../nats/interfaces/nats-service.interface';
import { NatsServiceDiTokens } from 'libs/common/di/nats-di-tokens';

@Controller('events')
export class EventsController implements EventsControllerInterface {
  constructor(
    @Inject(EventsServiceDiTokens.EVENTS_SERVICE)
    private readonly eventsService: EventsServiceInterface,
    @Inject(NatsServiceDiTokens.NATS_SERVICE)
    private readonly natsService: NatsServiceInterface,
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
      const { source } = event;
      const subject = `events.${source}`;
      return this.natsService.publish(subject, event);
    });

    await Promise.all(publishPromises);

    return {
      message: 'Events are being processed.',
      accepted: validEvents.length,
      rejected: invalidCount,
    };
  }
}
