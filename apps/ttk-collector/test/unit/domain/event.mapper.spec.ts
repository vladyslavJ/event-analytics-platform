import { EventMapper } from '../../../src/domain/mappers/event.mapper';
import { tiktokEventFixtures } from '../../fixtures/tiktok-events.fixture';

describe('EventMapper', () => {
  describe('mapFromTiktokEvent', () => {
    it('should correctly map a complete TikTok event', () => {
      // Arrange
      const event = tiktokEventFixtures.completeViewEvent;
      const userId = 'user-123';

      // Act
      const result = EventMapper.mapFromTiktokEvent(event, userId);

      // Assert
      expect(result).toEqual({
        eventId: 'ttk-event-001',
        timestamp: new Date('2025-01-01T10:00:00.000Z'),
        source: 'tiktok',
        funnelStage: 'top',
        eventType: 'video.view',
        userId: 'user-123',
      });
    });

    it('should correctly map a purchase event', () => {
      // Arrange
      const event = tiktokEventFixtures.purchaseEvent;
      const userId = 'buyer-user-123';

      // Act
      const result = EventMapper.mapFromTiktokEvent(event, userId);

      // Assert
      expect(result).toEqual({
        eventId: 'ttk-event-004',
        timestamp: new Date('2025-01-01T13:00:00.000Z'),
        source: 'tiktok',
        funnelStage: 'bottom',
        eventType: 'purchase',
        userId: 'buyer-user-123',
      });
    });

    it('should handle different event types correctly', () => {
      // Arrange
      const likeEvent = tiktokEventFixtures.likeEvent;
      const shareEvent = tiktokEventFixtures.shareEvent;
      const userId = 'test-user-123';

      // Act
      const likeResult = EventMapper.mapFromTiktokEvent(likeEvent, userId);
      const shareResult = EventMapper.mapFromTiktokEvent(shareEvent, userId);

      // Assert
      expect(likeResult.eventType).toBe('like');
      expect(likeResult.funnelStage).toBe('top');
      expect(shareResult.eventType).toBe('share');
      expect(shareResult.funnelStage).toBe('top');
    });

    it('should preserve timestamp as Date object', () => {
      // Arrange
      const event = tiktokEventFixtures.completeViewEvent;
      const userId = 'user-123';

      // Act
      const result = EventMapper.mapFromTiktokEvent(event, userId);

      // Assert
      expect(result.timestamp).toBeInstanceOf(Date);
      expect(result.timestamp.toISOString()).toBe('2025-01-01T10:00:00.000Z');
    });

    it('should use provided userId', () => {
      // Arrange
      const event = tiktokEventFixtures.completeViewEvent;
      const customUserId = 'custom-mapped-user-id';

      // Act
      const result = EventMapper.mapFromTiktokEvent(event, customUserId);

      // Assert
      expect(result.userId).toBe(customUserId);
    });
  });
});
