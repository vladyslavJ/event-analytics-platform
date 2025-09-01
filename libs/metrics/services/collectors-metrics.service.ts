import { Inject, Injectable } from '@nestjs/common';
import { Counter } from 'prom-client';
import { MetricsDiTokens } from 'libs/metrics/di/metrics-di-tokens';
import type { MetricServiceInterface } from 'libs/metrics/interfaces/metric-service.interface';
import { CollectorsMetricsServiceInterface } from '../interfaces/collector-metrics-service.interface';

type CollectorSource = 'fb' | 'ttk';

@Injectable()
export class CollectorsMetricsService implements CollectorsMetricsServiceInterface {
  private readonly consumedEvents: Counter;
  private readonly processedEvents: Counter;
  private readonly failedEvents: Counter;

  constructor(
    @Inject(MetricsDiTokens.METRIC_SERVICE)
    private readonly metricService: MetricServiceInterface,
  ) {
    const labelNames = ['source'];

    this.consumedEvents = this.metricService.createCounter({
      name: 'collector_events_consumed_total',
      help: 'Total number of events consumed from NATS by a collector.',
      labelNames,
    });

    this.processedEvents = this.metricService.createCounter({
      name: 'collector_events_processed_total',
      help: 'Total number of events successfully processed and saved to DB.',
      labelNames,
    });

    this.failedEvents = this.metricService.createCounter({
      name: 'collector_events_failed_total',
      help: 'Total number of events that failed during processing.',
      labelNames,
    });
  }

  incrementConsumed(source: CollectorSource): void {
    this.consumedEvents.inc({ source });
  }

  incrementProcessed(source: CollectorSource): void {
    this.processedEvents.inc({ source });
  }

  incrementFailed(source: CollectorSource): void {
    this.failedEvents.inc({ source });
  }
}
