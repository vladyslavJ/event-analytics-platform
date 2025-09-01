import { Injectable, Inject } from '@nestjs/common';
import { TiktokEventInterface } from 'libs/common/interfaces/tiktok-event.interface';
import type { EventProcessorInterface } from '../interfaces/event-processor.interface';
import type {
  EventRepositoryInterface,
  UserRepositoryInterface,
} from '../interfaces/repository.interface';
import type { LoggerInterface } from 'libs/logger/interfaces/logger.interface';
import { LoggerDiTokens } from 'libs/logger/di/logger-di-tokens';

export const TTK_EVENT_REPOSITORY_TOKEN = Symbol('TTK_EVENT_REPOSITORY');
export const TTK_USER_REPOSITORY_TOKEN = Symbol('TTK_USER_REPOSITORY');

@Injectable()
export class TiktokEventProcessor implements EventProcessorInterface {
  constructor(
    @Inject(TTK_EVENT_REPOSITORY_TOKEN)
    private readonly eventRepository: EventRepositoryInterface,
    @Inject(TTK_USER_REPOSITORY_TOKEN)
    private readonly userRepository: UserRepositoryInterface,
    @Inject(LoggerDiTokens.LOGGER)
    private readonly logger: LoggerInterface,
  ) {
    this.logger.setContext(TiktokEventProcessor.name);
  }

  async processEvent(event: TiktokEventInterface, correlationId: string): Promise<void> {
    this.logger.info(`[${correlationId}] Processing event ${event.eventId} from TikTok`);

    try {
      // 1. Upsert user
      const user = await this.userRepository.upsertUser(event.data.user, 'tiktok');

      // 2. Save event
      await this.eventRepository.saveEvent(event, user.id);

      this.logger.info(`[${correlationId}] Successfully processed event ${event.eventId}`);
    } catch (error) {
      this.logger.error(
        `[${correlationId}] Failed to process event ${event.eventId}: ${error.message}`,
        error,
      );
      throw error;
    }
  }
}
