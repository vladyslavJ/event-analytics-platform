import { Injectable } from '@nestjs/common';
import { Histogram } from 'prom-client';

@Injectable()
export class ReportsMetricsService {
  public readonly reportsLatency: Histogram<string>;

  constructor() {
    this.reportsLatency = new Histogram({
      name: 'reporter_reports_latency_seconds',
      help: 'Latency for report generation by category',
      labelNames: ['report_category'],
    });
  }

  observeReportLatency(
    reportCategory: 'events' | 'revenue' | 'demographics',
    observeFn: () => Promise<any>,
  ): Promise<any> {
    const end = this.reportsLatency.startTimer({ report_category: reportCategory });
    const result = observeFn();
    result.finally(() => end());
    return result;
  }
}
