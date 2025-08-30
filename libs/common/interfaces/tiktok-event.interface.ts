import { Device } from "../enums/tiktok-event.enum";
import { EventSource } from "../enums/event-source.enum";
import { FunnelStage } from "../enums/funnel-stage.enum";
import { TiktokEventType, TiktokEngagementType } from "../types/tiktok-event.type";

export interface TiktokUserInterface {
  userId: string;
  username: string;
  followers: number;
}

export interface TiktokEngagementTopInterface {
  watchTime: number;
  percentageWatched: number;
  device: Device;
  country: string;
  videoId: string;
}

export interface TiktokEngagementBottomInterface {
  actionTime: string;
  profileId: string | null;
  purchasedItem: string | null;
  purchaseAmount: string | null;
}


export interface TiktokEventInterface {
  eventId: string;
  timestamp: string;
  source: EventSource.Tiktok;
  funnelStage: FunnelStage;
  eventType: TiktokEventType;
  data: {
    user: TiktokUserInterface;
    engagement: TiktokEngagementType;
  };
}
