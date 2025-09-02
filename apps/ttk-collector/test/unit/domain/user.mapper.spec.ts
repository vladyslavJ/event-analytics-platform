import { UserMapper } from '../../../src/domain/mappers/user.mapper';
import { tiktokEventFixtures } from '../../fixtures/tiktok-events.fixture';

describe('UserMapper', () => {
  describe('mapFromTiktokEvent', () => {
    it('should correctly map complete user data', () => {
      // Arrange
      const userData = tiktokEventFixtures.completeUserData;
      const source = 'tiktok';

      // Act
      const result = UserMapper.mapFromTiktokEvent(userData, source);

      // Assert
      expect(result).toEqual({
        source: 'tiktok',
        sourceUserId: 'ttk-complete-user',
        name: 'complete_user',
        followers: 10000,
      });
    });

    it('should handle minimal user data', () => {
      // Arrange
      const userData = tiktokEventFixtures.minimalUserData;

      // Act
      const result = UserMapper.mapFromTiktokEvent(userData);

      // Assert
      expect(result).toEqual({
        source: 'tiktok',
        sourceUserId: 'ttk-minimal-user',
        name: 'minimal_user',
        followers: 0,
      });
    });

    it('should use default source when not provided', () => {
      // Arrange
      const userData = tiktokEventFixtures.completeUserData;

      // Act
      const result = UserMapper.mapFromTiktokEvent(userData);

      // Assert
      expect(result.source).toBe('tiktok');
    });

    it('should use custom source when provided', () => {
      // Arrange
      const userData = tiktokEventFixtures.completeUserData;
      const customSource = 'custom-tiktok';

      // Act
      const result = UserMapper.mapFromTiktokEvent(userData, customSource);

      // Assert
      expect(result.source).toBe('custom-tiktok');
    });

    it('should map user data from event', () => {
      // Arrange
      const eventUserData = tiktokEventFixtures.completeViewEvent.data.user;

      // Act
      const result = UserMapper.mapFromTiktokEvent(eventUserData);

      // Assert
      expect(result).toEqual({
        source: 'tiktok',
        sourceUserId: 'ttk-user-123',
        name: 'test_tiktok_user',
        followers: 1500,
      });
    });

    it('should handle zero followers correctly', () => {
      // Arrange
      const userData = {
        userId: 'user-no-followers',
        username: 'new_user',
        followers: 0,
      };

      // Act
      const result = UserMapper.mapFromTiktokEvent(userData);

      // Assert
      expect(result.followers).toBe(0);
      expect(result.name).toBe('new_user');
    });

    it('should preserve all required fields', () => {
      // Arrange
      const userData = tiktokEventFixtures.purchaseEvent.data.user;

      // Act
      const result = UserMapper.mapFromTiktokEvent(userData, 'test-source');

      // Assert
      expect(result).toHaveProperty('source');
      expect(result).toHaveProperty('sourceUserId');
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('followers');
      expect(typeof result.source).toBe('string');
      expect(typeof result.sourceUserId).toBe('string');
      expect(typeof result.name).toBe('string');
      expect(typeof result.followers).toBe('number');
    });
  });
});
