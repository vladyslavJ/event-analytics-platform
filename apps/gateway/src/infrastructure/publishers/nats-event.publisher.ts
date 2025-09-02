import { Injectable, Inject } from '@nestjs/common';
import type {
  EventPublisherInterface,
  PublishResult,
} from '../../domain/interfaces/event-publisher.interface';
import { NatsPublisherService } from 'libs/nats/nats-publisher.service';
import type { GatewayMetricsServiceInterface } from 'libs/metrics/interfaces/gateway-metrics-service.interface';
import { MetricsDiTokens } from 'libs/metrics/di/metrics-di-tokens';
import type { LoggerInterface } from 'libs/logger/interfaces/logger.interface';
import { LoggerDiTokens } from 'libs/logger/di/logger-di-tokens';
import { randomUUID } from 'crypto';

@Injectable()
export class NatsEventPublisher implements EventPublisherInterface {
  constructor(
    private readonly natsPublisher: NatsPublisherService,
    @Inject(MetricsDiTokens.GATEWAY_METRICS_SERVICE)
    private readonly metricsService: GatewayMetricsServiceInterface,
    @Inject(LoggerDiTokens.LOGGER)
    private readonly logger: LoggerInterface,
  ) {
    this.logger.setContext(NatsEventPublisher.name);
  }

  async publishEvents(events: any[]): Promise<PublishResult> {
    let publishedCount = 0;
    let failedCount = 0;

    // Batch processing - обробляємо по 10 подій одночасно
    const BATCH_SIZE = 10;
    const batches = this.chunkArray(events, BATCH_SIZE);

    for (const batch of batches) {
      const batchPromises = batch.map(async event => {
        const correlationId = randomUUID();

        try {
          // Додаємо timeout для кожної публікації
          await Promise.race([
            this.natsPublisher.publishEvent({ ...event, correlationId }),
            this.timeoutPromise(5000), // 5 секунд timeout
          ]);

          publishedCount++;
          this.logger.debug(`Published event ${event.eventId}`);
        } catch (error) {
          failedCount++;
          this.logger.error(`Failed to publish event ${event.eventId}: ${error.message}`);
        }
      });

      // Обробляємо пакет
      await Promise.allSettled(batchPromises);

      // Невелика затримка між пакетами для зменшення навантаження
      if (batches.indexOf(batch) < batches.length - 1) {
        await this.delay(50); // 50ms пауза
      }
    }

    // Оновлюємо метрики одним разом
    this.metricsService.incrementProcessedEvents(publishedCount);
    this.metricsService.incrementFailedEvents(failedCount);

    return { publishedCount, failedCount };
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  private timeoutPromise(ms: number): Promise<never> {
    return new Promise((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), ms));
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
