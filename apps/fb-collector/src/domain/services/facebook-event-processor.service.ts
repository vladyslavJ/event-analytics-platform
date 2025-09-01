import { Injectable, Inject } from '@nestjs/common';
import { FacebookEventInterface } from 'libs/common/interfaces/facebook-event.interface';
import type { EventProcessorInterface } from '../interfaces/event-processor.interface';
import type {
  EventRepositoryInterface,
  UserRepositoryInterface,
} from '../interfaces/repository.interface';
import type { LoggerInterface } from 'libs/logger/interfaces/logger.interface';
import { LoggerDiTokens } from 'libs/logger/di/logger-di-tokens';

export const FB_EVENT_REPOSITORY_TOKEN = Symbol('FB_EVENT_REPOSITORY');
export const FB_USER_REPOSITORY_TOKEN = Symbol('FB_USER_REPOSITORY');

@Injectable()
export class FacebookEventProcessor implements EventProcessorInterface {
  constructor(
    @Inject(FB_EVENT_REPOSITORY_TOKEN)
    private readonly eventRepository: EventRepositoryInterface,
    @Inject(FB_USER_REPOSITORY_TOKEN)
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
