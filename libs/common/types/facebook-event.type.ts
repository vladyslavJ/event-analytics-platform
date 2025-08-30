import { FacebookTopEvent, FacebookBottomEvent } from '../enums/facebook-event.enum';
import {
  FacebookEngagementTopInterface,
  FacebookEngagementBottomInterface,
} from '../interfaces/facebook-event.interface';

export type FacebookEventType = FacebookTopEvent | FacebookBottomEvent;
export type FacebookEngagementType = FacebookEngagementTopInterface | FacebookEngagementBottomInterface;
