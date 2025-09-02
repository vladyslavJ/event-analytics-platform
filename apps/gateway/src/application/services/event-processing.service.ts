import { Injectable, Inject } from '@nestjs/common';
import type {
  EventProcessorInterface,
  ProcessingResult,
} from '../../domain/interfaces/event-processor.interface';
import type { GatewayMetricsServiceInterface } from 'libs/metrics/interfaces/gateway-metrics-service.interface';
import { MetricsDiTokens } from 'libs/metrics/di/metrics-di-tokens';
import { GatewayDiTokens } from '../../infrastructure/di/gateway-di-tokens';

@Injectable()
export class EventProcessingService {
  constructor(
    @Inject(GatewayDiTokens.EVENT_PROCESSOR)
    private readonly eventProcessor: EventProcessorInterface,
    @Inject(MetricsDiTokens.GATEWAY_METRICS_SERVICE)
    private readonly metricsService: GatewayMetricsServiceInterface,
  ) {}

  async handleEvents(events: Record<string, unknown>[]): Promise<ProcessingResult> {
    this.metricsService.incrementAcceptedEvents(events.length);
    return this.eventProcessor.processEvents(events);
  }
}
