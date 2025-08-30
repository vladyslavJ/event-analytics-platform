import { TiktokTopEvent, TiktokBottomEvent } from '../enums/tiktok-event.enum';
import {
  TiktokEngagementTopInterface,
  TiktokEngagementBottomInterface,
} from '../interfaces/tiktok-event.interface';

export type TiktokEventType = TiktokTopEvent | TiktokBottomEvent;
export type TiktokEngagementType = TiktokEngagementTopInterface | TiktokEngagementBottomInterface;
