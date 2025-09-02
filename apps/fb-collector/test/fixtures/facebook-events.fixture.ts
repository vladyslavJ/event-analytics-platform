import { FacebookEventInterface } from 'libs/common/interfaces/facebook-event.interface';
import { EventSource } from 'libs/common/enums/event-source.enum';
import { FunnelStage } from 'libs/common/enums/funnel-stage.enum';
import { 
  FacebookTopEvent, 
  FacebookBottomEvent, 
  Gender,
  ClickPosition,
  Device,
  Browser
} from 'libs/common/enums/facebook-event.enum';

export const mockFacebookTopEvent: FacebookEventInterface = {
  eventId: 'fb_top_123',
  timestamp: '2025-09-01T12:00:00Z',
  source: EventSource.Facebook,
  funnelStage: FunnelStage.Top,
  eventType: FacebookTopEvent.AdView,
  data: {
    user: {
      userId: 'fb_user_123',
      name: 'John Doe',
      age: 28,
      gender: Gender.Male,
      location: {
        country: 'USA',
        city: 'New York'
      }
    },
    engagement: {
      adId: 'ad_123',
      campaignId: 'campaign_456',
      clickPosition: ClickPosition.Center,
      device: Device.Desktop,
      browser: Browser.Chrome,
      purchaseAmount: null
    }
  }
};

export const mockFacebookBottomEvent: FacebookEventInterface = {
  eventId: 'fb_bottom_789',
  timestamp: '2025-09-01T12:30:00Z',
  source: EventSource.Facebook,
  funnelStage: FunnelStage.Bottom,
  eventType: FacebookBottomEvent.CheckoutComplete,
  data: {
    user: {
      userId: 'fb_user_789',
      name: 'Bob Johnson',
      age: 35,
      gender: Gender.Male,
      location: {
        country: 'UK',
        city: 'London'
      }
    },
    engagement: {
      adId: 'ad_999',
      campaignId: 'campaign_999',
      clickPosition: ClickPosition.TopLeft,
      device: Device.Mobile,
      browser: Browser.Safari,
      purchaseAmount: '99.99'
    }
  }
};

export const mockUserData = {
  userId: 'fb_user_test',
  name: 'Test User',
  age: 25,
  gender: Gender.Female,
  location: {
    country: 'Germany',
    city: 'Berlin'
  }
};

export const mockSavedEvent = {
  id: 'saved_event_123',
  eventId: 'fb_top_123',
  timestamp: new Date('2025-09-01T12:00:00Z'),
  source: 'facebook',
  funnelStage: 'top',
  eventType: 'ad.view',
  userId: 'user_123'
};

export const mockSavedUser = {
  id: 'saved_user_123',
  source: 'facebook',
  sourceUserId: 'fb_user_123',
  name: 'John Doe',
  age: 28,
  gender: 'male',
  country: 'USA',
  city: 'New York'
};

export const mockCorrelationId = 'correlation_123_456';

export const mockNatsMessage = {
  data: new TextEncoder().encode(JSON.stringify(mockFacebookTopEvent)),
  ack: jest.fn(),
  nak: jest.fn()
};
