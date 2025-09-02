import { Injectable, Inject } from '@nestjs/common';
import { TiktokEventInterface } from 'libs/common/interfaces/tiktok-event.interface';
import type { EventProcessorInterface } from '../interfaces/event-processor.interface';
import type {
  EventRepositoryInterface,
  UserRepositoryInterface,
} from '../interfaces/repository.interface';
import type { LoggerInterface } from 'libs/logger/interfaces/logger.interface';
import { LoggerDiTokens } from 'libs/logger/di/logger-di-tokens';
import { TtkCollectorDiTokens } from '../../infrastructure/di/ttk-events-di-tokens';

@Injectable()
export class TiktokEventProcessor implements EventProcessorInterface {
  constructor(
    @Inject(TtkCollectorDiTokens.TTK_EVENT_REPOSITORY)
    private readonly eventRepository: EventRepositoryInterface,
    @Inject(TtkCollectorDiTokens.TTK_USER_REPOSITORY)
    private readonly userRepository: UserRepositoryInterface,
    @Inject(LoggerDiTokens.LOGGER)
    private readonly logger: LoggerInterface,
  ) {
    this.logger.setContext(TiktokEventProcessor.name);
  }

  async processEvent(event: TiktokEventInterface, correlationId: string): Promise<void> {
    this.logger.info(`[${correlationId}] Processing event ${event.eventId} from TikTok`);
    try {
      const user = await this.userRepository.upsertUser(event.data.user, 'tiktok');
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
