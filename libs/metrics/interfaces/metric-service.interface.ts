import {
  Counter,
  Gauge,
  Histogram,
  Summary,
  CounterConfiguration,
  GaugeConfiguration,
  HistogramConfiguration,
  SummaryConfiguration,
} from 'prom-client';

export interface MetricServiceInterface {
  createCounter(config: CounterConfiguration<string>): Counter;
  createGauge(config: GaugeConfiguration<string>): Gauge;
  createHistogram(config: HistogramConfiguration<string>): Histogram;
  createSummary(config: SummaryConfiguration<string>): Summary;
  getMetrics(): Promise<string>;
}
