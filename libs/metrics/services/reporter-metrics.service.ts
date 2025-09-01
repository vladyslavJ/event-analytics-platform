import { Inject, Injectable } from '@nestjs/common';
import { Histogram } from 'prom-client';
import { MetricsDiTokens } from 'libs/metrics/di/metrics-di-tokens';
import type { MetricServiceInterface } from 'libs/metrics/interfaces/metric-service.interface';
import { ReportsMetricsServiceInterface } from '../interfaces/reporter-metrics-service.interface';

type ReportCategory = 'events' | 'revenue' | 'demographics';

@Injectable()
export class ReportsMetricsService implements ReportsMetricsServiceInterface{
  private readonly requestDuration: Histogram;

  constructor(
    @Inject(MetricsDiTokens.METRIC_SERVICE)
    private readonly metricService: MetricServiceInterface,
  ) {
    this.requestDuration = this.metricService.createHistogram({
      name: 'reporter_request_duration_seconds',
      help: 'Duration of report generation requests.',
      labelNames: ['category'],
      buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
    });
  }

  observeReportLatency<T>(category: ReportCategory, fn: () => Promise<T>): Promise<T> {
    const end = this.requestDuration.startTimer({ category });
    return fn().finally(end);
  }
}
