import { FacebookEventInterface } from 'libs/common/interfaces/facebook-event.interface';
import { SavedEvent } from '../interfaces/repository.interface';

export class EventMapper {
  static mapFromFacebookEvent(
    event: FacebookEventInterface,
    userId: string,
  ): Omit<SavedEvent, 'id'> {
    return {
      eventId: event.eventId,
      timestamp: new Date(event.timestamp),
      source: event.source,
      funnelStage: event.funnelStage,
      eventType: event.eventType,
      userId,
    };
  }
}
