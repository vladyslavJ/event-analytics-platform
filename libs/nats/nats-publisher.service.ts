import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { JSONCodec } from 'nats';
import type { JetStreamClient } from 'nats';
import { NatsDiTokens } from 'libs/nats/di/nats-di-tokens';
import { LoggerDiTokens } from 'libs/logger/di/logger-di-tokens';
import type { LoggerInterface } from 'libs/logger/interfaces/logger.interface';
import { ValidEvent } from 'apps/gateway/src/infrastructure/validators/schemas/event.schema';
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

    // Retry логіка з експоненціальним backoff
    const maxRetries = 3;
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        this.logger.debug(
          `Publishing event ${event.eventId} (attempt ${attempt + 1}/${maxRetries}) to subject: ${subject}`,
        );

        // Публікація з таймаутом та підтвердженням доставки
        await this.jetstream.publish(subject, payload, {
          timeout: 10000, // 10 секунд таймаут
          expect: {
            lastSequence: undefined, // Не перевіряємо послідовність
          },
        });

        // Успішна публікація
        this.logger.debug(`Successfully published event ${event.eventId}`);
        return;
      } catch (error) {
        attempt++;
        this.logger.warn(
          `Failed to publish event ${event.eventId} (attempt ${attempt}/${maxRetries}): ${error.message}`,
        );

        if (attempt >= maxRetries) {
          this.logger.error(`Max retries exceeded for event ${event.eventId}: ${error.message}`);
          throw error;
        }

        // Експоненціальний backoff: 100ms, 200ms, 400ms
        const delay = 100 * Math.pow(2, attempt - 1);
        await this.sleep(delay);
      }
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
