import { Injectable, Inject } from '@nestjs/common';
import { FacebookEventInterface } from 'libs/common/interfaces/facebook-event.interface';
import type { EventProcessorInterface } from '../interfaces/event-processor.interface';
import type {
  EventRepositoryInterface,
  UserRepositoryInterface,
} from '../interfaces/repository.interface';
import type { LoggerInterface } from 'libs/logger/interfaces/logger.interface';
import { LoggerDiTokens } from 'libs/logger/di/logger-di-tokens';
import { FbCollectorDiTokens } from '../../infrastructure/di/fb-events-di-tokens';

@Injectable()
export class FacebookEventProcessor implements EventProcessorInterface {
  constructor(
    @Inject(FbCollectorDiTokens.FB_EVENT_REPOSITORY)
    private readonly eventRepository: EventRepositoryInterface,
    @Inject(FbCollectorDiTokens.FB_USER_REPOSITORY)
    private readonly userRepository: UserRepositoryInterface,
    @Inject(LoggerDiTokens.LOGGER)
    private readonly logger: LoggerInterface,
  ) {
    this.logger.setContext(FacebookEventProcessor.name);
  }

  async processEvent(event: FacebookEventInterface, correlationId: string): Promise<void> {
    this.logger.info(`[${correlationId}] Processing event ${event.eventId} from Facebook`);
    try {
      const user = await this.userRepository.upsertUser(event.data.user, 'facebook');
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
