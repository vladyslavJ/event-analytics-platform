import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { JSONCodec } from 'nats';
import type { JetStreamClient } from 'nats';
import { NatsDiTokens } from 'libs/common/di/nats-di-tokens';
import { ValidEvent } from 'apps/gateway/src/events/schemas/event.schema';

@Injectable()
export class NatsPublisherService implements OnModuleInit {
  private readonly jsonCodec = JSONCodec();

  constructor(@Inject(NatsDiTokens.JETSTREAM_CLIENT) private readonly jetstream: JetStreamClient) {}

  async onModuleInit() {
    const streamName = 'EVENTS';
    const subjects = ['events.facebook', 'events.tiktok'];

    const streamManager = await this.jetstream.jetstreamManager();
    try {
      await streamManager.streams.info(streamName);
    } catch (err) {
      if (err.code === '404') {
        console.log(`Stream ${streamName} not found, creating it...`);
        await streamManager.streams.add({ name: streamName, subjects: subjects });
      }
    }
  }

  async publishEvent(event: ValidEvent & { correlationId: string }): Promise<void> {
    const subject = `events.${event.source}`;
    const payload = this.jsonCodec.encode(event);

    console.log(
      `Publishing event ${event.eventId} with correlationId ${event.correlationId} to JetStream subject: ${subject}`,
    );

    await this.jetstream.publish(subject, payload);
  }
}
