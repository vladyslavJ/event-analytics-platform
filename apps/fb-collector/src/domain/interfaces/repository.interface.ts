import { FacebookEventInterface } from 'libs/common/interfaces/facebook-event.interface';

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
  age?: number;
  gender?: string;
  country?: string;
  city?: string;
}

export interface EventRepositoryInterface {
  saveEvent(event: FacebookEventInterface, userId: string): Promise<SavedEvent>;
  findEventById(eventId: string): Promise<SavedEvent | null>;
}

export interface UserRepositoryInterface {
  upsertUser(userData: FacebookEventInterface['data']['user'], source: string): Promise<SavedUser>;
  findUserBySourceId(sourceUserId: string, source: string): Promise<SavedUser | null>;
}
