import { Module, Global } from '@nestjs/common';
import { MetricsDiTokens } from './di/metrics-di-tokens';
import { MetricService } from './metric.service';
import { GatewayMetricsService } from './services/gateway-metrics.service';
import { CollectorsMetricsService } from './services/collectors-metrics.service';
import { ReportsMetricsService } from './services/reporter-metrics.service';

@Global()
@Module({
  providers: [
    {
      provide: MetricsDiTokens.METRIC_SERVICE,
      useClass: MetricService,
    },
    {
      provide: MetricsDiTokens.GATEWAY_METRICS_SERVICE,
      useClass: GatewayMetricsService,
    },
    {
      provide: MetricsDiTokens.COLLECTORS_METRICS_SERVICE,
      useClass: CollectorsMetricsService,
    },
    {
      provide: MetricsDiTokens.REPORTER_METRICS_SERVICE,
      useClass: ReportsMetricsService,
    },
  ],
  exports: [
    MetricsDiTokens.METRIC_SERVICE,
    MetricsDiTokens.GATEWAY_METRICS_SERVICE,
    MetricsDiTokens.COLLECTORS_METRICS_SERVICE,
    MetricsDiTokens.REPORTER_METRICS_SERVICE,
  ],
})
export class MetricsModule {}
