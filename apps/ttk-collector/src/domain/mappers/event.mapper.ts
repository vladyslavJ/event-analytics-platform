import { TiktokEventInterface } from 'libs/common/interfaces/tiktok-event.interface';
import { SavedEvent } from '../interfaces/repository.interface';

export class EventMapper {
  static mapFromTiktokEvent(event: TiktokEventInterface, userId: string): Omit<SavedEvent, 'id'> {
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
