import { Inject, Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { JSONCodec, Subscription, AckPolicy } from 'nats';
import type { JetStreamClient, NatsConnection, Consumer } from 'nats';
import { NatsDiTokens } from 'libs/common/di/nats-di-tokens';
import { FbCollectorService } from './fb-collector.service';
import { FacebookEventInterface } from 'libs/common/interfaces/facebook-event.interface';

@Injectable()
export class FbEventsWorker implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(FbEventsWorker.name);
  private readonly jsonCodec = JSONCodec();
  private subscription: Subscription;
  private isShuttingDown = false;

  constructor(
    @Inject(NatsDiTokens.JETSTREAM_CLIENT) private readonly jetstream: JetStreamClient,
    @Inject(NatsDiTokens.NATS_CONNECTION) private readonly natsConnection: NatsConnection,
    private readonly collectorService: FbCollectorService,
  ) {}

  async onModuleInit() {
    this.isShuttingDown = false;
    await this.startProcessing();
  }

  async onModuleDestroy() {
    this.logger.log('Gracefully shutting down worker...');
    this.isShuttingDown = true;
    if (this.subscription) {
      await this.subscription.drain();
    }
    await this.natsConnection.close();
    this.logger.log('Worker has been shut down.');
  }

  private async startProcessing() {
    const streamName = 'EVENTS';
    const consumerName = 'fb_collector_consumer';

    const jsm = await this.jetstream.jetstreamManager();

    try {
      await jsm.consumers.info(streamName, consumerName);
    } catch (err) {
      if (err.code === '404') {
        this.logger.log(`Consumer ${consumerName} not found, creating it...`);
        await jsm.consumers.add(streamName, {
          durable_name: consumerName, 
          ack_policy: AckPolicy.Explicit, 
          filter_subject: 'events.facebook', 
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
          const eventData = this.jsonCodec.decode(msg.data) as FacebookEventInterface & {
            correlationId: string;
          };
          this.logger.log(`Received event ${eventData.eventId}`);

          try {
            await this.collectorService.processFacebookEvent(eventData, eventData.correlationId);
            await msg.ack(); 
          } catch (processingError) {
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
