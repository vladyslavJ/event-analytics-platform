import { UserMapper } from '../../../src/domain/mappers/user.mapper';
import { mockUserData } from '../../fixtures/facebook-events.fixture';

describe('UserMapper', () => {
  describe('mapFromFacebookEvent', () => {
    it('should correctly map Facebook user data to SavedUser format', () => {
      // Arrange
      const source = 'facebook';

      // Act
      const result = UserMapper.mapFromFacebookEvent(mockUserData, source);

      // Assert
      expect(result).toEqual({
        source: 'facebook',
        sourceUserId: 'fb_user_test',
        name: 'Test User',
        age: 25,
        gender: 'female',
        country: 'Germany',
        city: 'Berlin',
      });
    });

    it('should use default source when not provided', () => {
      // Act
      const result = UserMapper.mapFromFacebookEvent(mockUserData);

      // Assert
      expect(result.source).toBe('facebook');
    });

    it('should handle user data with missing optional fields', () => {
      // Arrange
      const minimalUserData = {
        userId: 'minimal_user',
        location: {
          country: 'Unknown',
          city: 'Unknown',
        },
      };

      // Act
      const result = UserMapper.mapFromFacebookEvent(minimalUserData as any);

      // Assert
      expect(result).toEqual({
        source: 'facebook',
        sourceUserId: 'minimal_user',
        name: undefined,
        age: undefined,
        gender: undefined,
        country: 'Unknown',
        city: 'Unknown',
      });
    });

    it('should handle custom source parameter', () => {
      // Arrange
      const customSource = 'facebook_ads';

      // Act
      const result = UserMapper.mapFromFacebookEvent(mockUserData, customSource);

      // Assert
      expect(result.source).toBe('facebook_ads');
    });

    it('should preserve all location data', () => {
      // Arrange
      const userWithLocation = {
        userId: 'location_user',
        name: 'Location User',
        location: {
          country: 'Canada',
          city: 'Vancouver',
        },
      };

      // Act
      const result = UserMapper.mapFromFacebookEvent(userWithLocation as any);

      // Assert
      expect(result.country).toBe('Canada');
      expect(result.city).toBe('Vancouver');
    });

    it('should handle null/undefined location gracefully', () => {
      // Arrange
      const userWithoutLocation = {
        userId: 'no_location_user',
        name: 'No Location User',
        location: null,
      };

      // Act & Assert
      expect(() => {
        UserMapper.mapFromFacebookEvent(userWithoutLocation as any);
      }).toThrow();
    });

    it('should map all user properties correctly', () => {
      // Act
      const result = UserMapper.mapFromFacebookEvent(mockUserData);

      // Assert
      expect(result).toHaveProperty('source');
      expect(result).toHaveProperty('sourceUserId');
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('age');
      expect(result).toHaveProperty('gender');
      expect(result).toHaveProperty('country');
      expect(result).toHaveProperty('city');
      expect(Object.keys(result)).toHaveLength(7);
    });
  });
});
