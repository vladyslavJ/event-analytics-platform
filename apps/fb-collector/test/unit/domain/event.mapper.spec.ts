import { EventMapper } from '../../../src/domain/mappers/event.mapper';
import {
  mockFacebookTopEvent,
  mockFacebookBottomEvent,
} from '../../fixtures/facebook-events.fixture';

describe('EventMapper', () => {
  describe('mapFromFacebookEvent', () => {
    it('should correctly map Facebook top event to SavedEvent format', () => {
      // Arrange
      const userId = 'user_123';

      // Act
      const result = EventMapper.mapFromFacebookEvent(mockFacebookTopEvent, userId);

      // Assert
      expect(result).toEqual({
        eventId: 'fb_top_123',
        timestamp: new Date('2025-09-01T12:00:00Z'),
        source: 'facebook',
        funnelStage: 'top',
        eventType: 'ad.view',
        userId: 'user_123',
      });
    });

    it('should correctly map Facebook bottom event to SavedEvent format', () => {
      // Arrange
      const userId = 'user_456';

      // Act
      const result = EventMapper.mapFromFacebookEvent(mockFacebookBottomEvent, userId);

      // Assert
      expect(result).toEqual({
        eventId: 'fb_bottom_789',
        timestamp: new Date('2025-09-01T12:30:00Z'),
        source: 'facebook',
        funnelStage: 'bottom',
        eventType: 'checkout.complete',
        userId: 'user_456',
      });
    });

    it('should handle invalid timestamp gracefully', () => {
      // Arrange
      const invalidEvent = {
        ...mockFacebookTopEvent,
        timestamp: 'invalid-date',
      };
      const userId = 'user_123';

      // Act
      const result = EventMapper.mapFromFacebookEvent(invalidEvent, userId);

      // Assert
      expect(result.timestamp).toBeInstanceOf(Date);
      expect(isNaN(result.timestamp.getTime())).toBe(true);
    });

    it('should preserve all event properties', () => {
      // Arrange
      const userId = 'test_user';

      // Act
      const result = EventMapper.mapFromFacebookEvent(mockFacebookTopEvent, userId);

      // Assert
      expect(result).toHaveProperty('eventId');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('source');
      expect(result).toHaveProperty('funnelStage');
      expect(result).toHaveProperty('eventType');
      expect(result).toHaveProperty('userId');
      expect(Object.keys(result)).toHaveLength(6);
    });

    it('should convert timestamp string to Date object', () => {
      // Arrange
      const userId = 'user_123';

      // Act
      const result = EventMapper.mapFromFacebookEvent(mockFacebookTopEvent, userId);

      // Assert
      expect(result.timestamp).toBeInstanceOf(Date);
      expect(result.timestamp.toISOString()).toBe('2025-09-01T12:00:00.000Z');
    });
  });
});
