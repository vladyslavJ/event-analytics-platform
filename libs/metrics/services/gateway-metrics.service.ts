import { Inject, Injectable } from '@nestjs/common';
import { Counter } from 'prom-client';
import { MetricsDiTokens } from 'libs/metrics/di/metrics-di-tokens';
import type { MetricServiceInterface } from 'libs/metrics/interfaces/metric-service.interface';
import { GatewayMetricsServiceInterface } from '../interfaces/gateway-metrics-service.interface';

@Injectable()
export class GatewayMetricsService implements GatewayMetricsServiceInterface {
  private readonly acceptedEvents: Counter;
  private readonly processedEvents: Counter;
  private readonly failedEvents: Counter;

  constructor(
    @Inject(MetricsDiTokens.METRIC_SERVICE)
    private readonly metricService: MetricServiceInterface,
  ) {
    this.acceptedEvents = this.metricService.createCounter({
      name: 'gateway_events_accepted_total',
      help: 'Total number of events accepted by the gateway webhook.',
    });

    this.processedEvents = this.metricService.createCounter({
      name: 'gateway_events_processed_total',
      help: 'Total number of events successfully published to NATS.',
    });

    this.failedEvents = this.metricService.createCounter({
      name: 'gateway_events_failed_total',
      help: 'Total number of events that failed to be published to NATS.',
    });
  }

  incrementAcceptedEvents(count = 1): void {
    this.acceptedEvents.inc(count);
  }

  incrementProcessedEvents(count = 1): void {
    this.processedEvents.inc(count);
  }

  incrementFailedEvents(count = 1): void {
    this.failedEvents.inc(count);
  }
}
