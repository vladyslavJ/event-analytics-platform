import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { JSONCodec } from 'nats';
import type { JetStreamClient } from 'nats';
import { NatsDiTokens } from 'libs/nats/di/nats-di-tokens';
import { LoggerDiTokens } from 'libs/logger/di/logger-di-tokens';
import type { LoggerInterface } from 'libs/logger/interfaces/logger.interface';
import { ValidEvent } from 'apps/gateway/src/events/schemas/event.schema';
import { NATS_CONSTANTS } from 'libs/common/constants/nats.const';

@Injectable()
export class NatsPublisherService implements OnModuleInit {
  private readonly jsonCodec = JSONCodec();
  constructor(
    @Inject(NatsDiTokens.JETSTREAM_CLIENT) 
    private readonly jetstream: JetStreamClient,
    @Inject(LoggerDiTokens.LOGGER)
    private readonly logger: LoggerInterface,
  ) {
    this.logger.setContext(NatsPublisherService.name);
  }

  async onModuleInit() {
    const streamName = NATS_CONSTANTS.STREAM_NAME;
    const subjects = NATS_CONSTANTS.SUBJECTS.ALL;

    const streamManager = await this.jetstream.jetstreamManager();
    try {
      await streamManager.streams.info(streamName);
    } catch (err) {
      if (err.code === '404') {
        this.logger.info(`Stream ${streamName} not found, creating it...`);
        await streamManager.streams.add({ name: streamName, subjects: subjects });
      }
    }
  }

  async publishEvent(event: ValidEvent & { correlationId: string }): Promise<void> {
    const subject = `events.${event.source}`;
    const payload = this.jsonCodec.encode(event);

    this.logger.info(
      `Publishing event ${event.eventId} with correlationId ${event.correlationId} to JetStream subject: ${subject}`,
    );

    await this.jetstream.publish(subject, payload);
  }
}
