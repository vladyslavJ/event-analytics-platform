import { Injectable } from '@nestjs/common';
import client, {
  Counter,
  Gauge,
  Histogram,
  Summary,
  CounterConfiguration,
  GaugeConfiguration,
  HistogramConfiguration,
  SummaryConfiguration,
} from 'prom-client';
import { MetricServiceInterface } from './interfaces/metric-service.interface';

@Injectable()
export class MetricService implements MetricServiceInterface {
  private counters = new Map<string, Counter>();
  private gauges = new Map<string, Gauge>();
  private histograms = new Map<string, Histogram>();
  private summaries = new Map<string, Summary>();

  createCounter(config: CounterConfiguration<string>): Counter {
    if (!this.counters.has(config.name)) {
      const counter = new client.Counter(config);
      this.counters.set(config.name, counter);
    }
    return this.counters.get(config.name)!;
  }

  createGauge(config: GaugeConfiguration<string>): Gauge {
    if (!this.gauges.has(config.name)) {
      const gauge = new client.Gauge(config);
      this.gauges.set(config.name, gauge);
    }
    return this.gauges.get(config.name)!;
  }

  createHistogram(config: HistogramConfiguration<string>): Histogram {
    if (!this.histograms.has(config.name)) {
      const histogram = new client.Histogram(config);
      this.histograms.set(config.name, histogram);
    }
    return this.histograms.get(config.name)!;
  }

  createSummary(config: SummaryConfiguration<string>): Summary {
    if (!this.summaries.has(config.name)) {
      const summary = new client.Summary(config);
      this.summaries.set(config.name, summary);
    }
    return this.summaries.get(config.name)!;
  }

  async getMetrics(): Promise<string> {
    return client.register.metrics();
  }
}
