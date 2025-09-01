import { Inject, Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { JSONCodec, AckPolicy, NatsError } from 'nats';
import type { JetStreamClient, NatsConnection, Consumer } from 'nats';
import { NatsDiTokens } from 'libs/nats/di/nats-di-tokens';
import { TtkCollectorService } from '../ttk-collector.service';
import { LoggerDiTokens } from 'libs/logger/di/logger-di-tokens';
import type { LoggerInterface } from 'libs/logger/interfaces/logger.interface';
import { TiktokEventInterface } from 'libs/common/interfaces/tiktok-event.interface';
import { NATS_CONSTANTS } from 'libs/common/constants/nats.const';
import { MetricsDiTokens } from 'libs/metrics/di/metrics-di-tokens';
import { EVENT_CONSUMERS } from 'libs/common/constants/event-consumers.const';
import type { CollectorsMetricsServiceInterface } from 'libs/metrics/interfaces/collector-metrics-service.interface';

@Injectable()
export class TtkEventsWorker implements OnModuleInit, OnModuleDestroy {
  private readonly jsonCodec = JSONCodec();
  private isShuttingDown = false;

  constructor(
    @Inject(NatsDiTokens.JETSTREAM_CLIENT) private readonly jetstream: JetStreamClient,
    @Inject(NatsDiTokens.NATS_CONNECTION) private readonly natsConnection: NatsConnection,
    private readonly collectorService: TtkCollectorService,
    @Inject(MetricsDiTokens.COLLECTORS_METRICS_SERVICE)
    private readonly metricsService: CollectorsMetricsServiceInterface,
    @Inject(LoggerDiTokens.LOGGER)
    private readonly logger: LoggerInterface,
  ) {
    this.logger.setContext(TtkEventsWorker.name);
  }

  async onModuleInit() {
    this.isShuttingDown = false;
    await this.connectWithRetry();
  }

  async onModuleDestroy() {
    this.logger.info('Gracefully shutting down worker...');
    this.isShuttingDown = true;
    await this.natsConnection.close();
    this.logger.info('Worker has been shut down.');
  }

  private async connectWithRetry(retries = 5, delay = 5000) {
    for (let i = 1; i <= retries; i++) {
      try {
        this.logger.info(`Attempt ${i} to connect to NATS stream...`);
        await this.startProcessing();
        this.logger.info('Successfully connected to NATS stream and started processing.');
        return;
      } catch (err) {
        if (err instanceof NatsError && err.api_error?.err_code === 10059) {
          this.logger.warn(
            `Stream not found (attempt ${i}/${retries}). Retrying in ${delay / 1000} seconds...`,
          );
          if (i === retries) {
            this.logger.error('Could not connect to NATS stream after all retries. Shutting down.');
            throw err;
          }
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          this.logger.error('An unexpected error occurred during NATS connection.', err);
          throw err;
        }
      }
    }
  }

  private async startProcessing() {
    const streamName = NATS_CONSTANTS.STREAM_NAME;
    const consumerName = EVENT_CONSUMERS.TIKTOK;

    const jsm = await this.jetstream.jetstreamManager();

    try {
      await jsm.consumers.info(streamName, consumerName);
    } catch (err) {
      if (err.code === '404') {
        this.logger.info(`Consumer ${consumerName} not found, creating it...`);
        await jsm.consumers.add(streamName, {
          durable_name: consumerName,
          ack_policy: AckPolicy.Explicit,
          filter_subject: NATS_CONSTANTS.SUBJECTS.TIKTOK,
        });
      } else {
        throw err;
      }
    }

    const consumer: Consumer = await this.jetstream.consumers.get(streamName, consumerName);

    while (!this.isShuttingDown) {
      try {
        const messages = await consumer.fetch({ max_messages: 10, expires: 5000 });
        for await (const msg of messages) {
          this.metricsService.incrementConsumed('ttk');
          const eventData = this.jsonCodec.decode(msg.data) as TiktokEventInterface & {
            correlationId: string;
          };
          this.logger.info(`Received event ${eventData.eventId}`);

          try {
            await this.collectorService.processTiktokEvent(eventData, eventData.correlationId);
            await msg.ack();
            this.metricsService.incrementProcessed('ttk');
          } catch (processingError) {
            this.metricsService.incrementFailed('ttk');
            this.logger.error(
              `Failed to process event ${eventData.eventId}. It will be redelivered.`,
              processingError,
            );
          }
        }
      } catch (err) {
        if (err.code !== '408') {
          this.logger.error('Error fetching messages from JetStream:', err);
        }
      }
    }
  }
}
