import {
  Gender,
  FacebookReferrer,
  ClickPosition,
  Device,
  Browser,
} from '../enums/facebook-event.enum';
import { EventSource } from '../enums/event-source.enum';
import { FacebookEventType, FacebookEngagementType } from '../types/facebook-event.type';
import { FunnelStage } from '../enums/funnel-stage.enum';

export interface FacebookUserLocationInterface {
  country: string;
  city: string;
}

export interface FacebookUserInterface {
  userId: string;
  name: string;
  age: number;
  gender: Gender;
  location: FacebookUserLocationInterface;
}

export interface FacebookEngagementTopInterface {
  actionTime: string;
  referrer: FacebookReferrer;
  videoId: string | null;
}

export interface FacebookEngagementBottomInterface {
  adId: string;
  campaignId: string;
  clickPosition: ClickPosition;
  device: Device;
  browser: Browser;
  purchaseAmount: string | null;
}

export interface FacebookEventInterface {
  eventId: string;
  timestamp: string;
  source: EventSource.Facebook;
  funnelStage: FunnelStage;
  eventType: FacebookEventType;
  data: {
    user: FacebookUserInterface;
    engagement: FacebookEngagementType;
  };
}
