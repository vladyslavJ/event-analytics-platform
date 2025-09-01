import { TiktokEventInterface } from 'libs/common/interfaces/tiktok-event.interface';

export interface SavedEvent {
  id: string;
  eventId: string;
  timestamp: Date;
  source: string;
  funnelStage: string;
  eventType: string;
  userId: string;
}

export interface SavedUser {
  id: string;
  source: string;
  sourceUserId: string;
  name?: string;
  followers?: number;
}

export interface EventRepositoryInterface {
  saveEvent(event: TiktokEventInterface, userId: string): Promise<SavedEvent>;
  findEventById(eventId: string): Promise<SavedEvent | null>;
}

export interface UserRepositoryInterface {
  upsertUser(userData: TiktokEventInterface['data']['user'], source: string): Promise<SavedUser>;
  findUserBySourceId(sourceUserId: string, source: string): Promise<SavedUser | null>;
}
