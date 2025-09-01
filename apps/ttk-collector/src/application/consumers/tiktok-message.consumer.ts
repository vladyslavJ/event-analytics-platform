import { Inject, Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { JSONCodec, AckPolicy, NatsError } from 'nats';
import type { JetStreamClient, NatsConnection, Consumer } from 'nats';
import { NatsDiTokens } from 'libs/nats/di/nats-di-tokens';
import { LoggerDiTokens } from 'libs/logger/di/logger-di-tokens';
import type { LoggerInterface } from 'libs/logger/interfaces/logger.interface';
import type { EventProcessorInterface } from '../../domain/interfaces/event-processor.interface';
import { TiktokEventInterface } from 'libs/common/interfaces/tiktok-event.interface';
import { NATS_CONSTANTS } from 'libs/common/constants/nats.const';
import { EVENT_CONSUMERS } from 'libs/common/constants/event-consumers.const';
import { MetricsDiTokens } from 'libs/metrics/di/metrics-di-tokens';
import type { CollectorsMetricsServiceInterface } from 'libs/metrics/interfaces/collector-metrics-service.interface';

export const TIKTOK_EVENT_PROCESSOR_TOKEN = Symbol('TIKTOK_EVENT_PROCESSOR');

@Injectable()
export class TiktokMessageConsumer implements OnModuleInit, OnModuleDestroy {
  private readonly jsonCodec = JSONCodec();
  private isShuttingDown = false;

  constructor(
    @Inject(NatsDiTokens.JETSTREAM_CLIENT)
    private readonly jetstream: JetStreamClient,
    @Inject(NatsDiTokens.NATS_CONNECTION)
    private readonly natsConnection: NatsConnection,
    @Inject(TIKTOK_EVENT_PROCESSOR_TOKEN)
    private readonly eventProcessor: EventProcessorInterface,
    @Inject(MetricsDiTokens.COLLECTORS_METRICS_SERVICE)
    private readonly metricsService: CollectorsMetricsServiceInterface,
    @Inject(LoggerDiTokens.LOGGER)
    private readonly logger: LoggerInterface,
  ) {
    this.logger.setContext(TiktokMessageConsumer.name);
  }

  async onModuleInit() {
    this.isShuttingDown = false;
    await this.connectWithRetry();
  }

  async onModuleDestroy() {
    this.logger.info('Gracefully shutting down message consumer...');
    this.isShuttingDown = true;
    await this.natsConnection.close();
    this.logger.info('Message consumer shut down.');
  }

  private async connectWithRetry(retries = 5, delay = 5000): Promise<void> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        this.logger.info(`Connecting to NATS stream (attempt ${attempt}/${retries})`);
        await this.startConsumer();
        this.logger.info('Successfully connected and started consuming messages');
        return;
      } catch (error) {
        this.logger.warn(`Connection attempt ${attempt} failed: ${error.message}`);

        if (attempt === retries) {
          this.logger.error('Failed to connect after all retries');
          throw error;
        }

        await this.delay(delay);
      }
    }
  }

  private async startConsumer(): Promise<void> {
    const streamName = NATS_CONSTANTS.STREAM_NAME;
    const consumerName = EVENT_CONSUMERS.TIKTOK;

    const consumer = await this.ensureConsumer(streamName, consumerName);

    while (!this.isShuttingDown) {
      try {
        await this.processMessages(consumer);
      } catch (error) {
        if (error.code !== '408') {
          // Ignore timeout errors
          this.logger.error('Error processing messages', error);
        }
      }
    }
  }

  private async ensureConsumer(streamName: string, consumerName: string): Promise<Consumer> {
    const jsm = await this.jetstream.jetstreamManager();

    try {
      await jsm.consumers.info(streamName, consumerName);
    } catch (err) {
      if (err.code === '404') {
        this.logger.info(`Creating consumer ${consumerName}`);
        await jsm.consumers.add(streamName, {
          durable_name: consumerName,
          ack_policy: AckPolicy.Explicit,
          filter_subject: NATS_CONSTANTS.SUBJECTS.TIKTOK,
        });
      } else {
        throw err;
      }
    }

    return this.jetstream.consumers.get(streamName, consumerName);
  }

  private async processMessages(consumer: Consumer): Promise<void> {
    const messages = await consumer.fetch({ max_messages: 10, expires: 5000 });

    for await (const msg of messages) {
      this.metricsService.incrementConsumed('ttk');

      try {
        const eventData = this.jsonCodec.decode(msg.data) as TiktokEventInterface & {
          correlationId: string;
        };

        this.logger.debug(`Processing event ${eventData.eventId}`);

        await this.eventProcessor.processEvent(eventData, eventData.correlationId);
        await msg.ack();

        this.metricsService.incrementProcessed('ttk');
      } catch (error) {
        this.metricsService.incrementFailed('ttk');
        this.logger.error('Failed to process message', error);
      }
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
