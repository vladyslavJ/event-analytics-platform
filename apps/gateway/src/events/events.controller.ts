import { Inject, Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import type { EventsServiceInterface } from './interfaces/events-service.interface';
import { EventsControllerInterface } from 'libs/common/interfaces/events-controller.interface';
import { EventsServiceDiTokens } from 'libs/common/di/events-di-tokens';
import { NatsPublisherService } from 'libs/nats/nats-publisher.service';
import { randomUUID } from 'crypto';
import { MetricsDiTokens } from 'libs/metrics/di/metrics-di-tokens';
import type { GatewayMetricsServiceInterface } from 'libs/metrics/interfaces/gateway-metrics-service.interface';

@Controller('events')
export class EventsController implements EventsControllerInterface {
  constructor(
    @Inject(EventsServiceDiTokens.EVENTS_SERVICE)
    private readonly eventsService: EventsServiceInterface,
    private readonly natsPublisher: NatsPublisherService,
    @Inject(MetricsDiTokens.GATEWAY_METRICS_SERVICE)
    private readonly metricsService: GatewayMetricsServiceInterface,
  ) {}

  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  async handleEvents(@Body() events: Record<string, unknown>[]) {
    if (!Array.isArray(events)) {
      return {
        message: 'Rejected. Events must be an array.',
      };
    }
    this.metricsService.incrementAcceptedEvents(events.length);
    const { validEvents, invalidCount } = this.eventsService.processAndFilterEvents(events);

    const publishPromises = validEvents.map(async event => {
      const correlationId = randomUUID();
      try {
        await this.natsPublisher.publishEvent({ ...event, correlationId });
        this.metricsService.incrementProcessedEvents();
      } catch (error) {
        this.metricsService.incrementFailedEvents();
      }
    });

    await Promise.all(publishPromises);

    return {
      message: 'Events are being processed.',
      accepted: validEvents.length,
      rejected: invalidCount,
    };
  }
}
