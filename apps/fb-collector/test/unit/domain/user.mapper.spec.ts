import { UserMapper } from '../../../src/domain/mappers/user.mapper';
import { mockUserData } from '../../fixtures/facebook-events.fixture';

describe('UserMapper', () => {
  describe('mapFromFacebookEvent', () => {
    it('should correctly map Facebook user data to SavedUser format', () => {
      const source = 'facebook';

      const result = UserMapper.mapFromFacebookEvent(mockUserData, source);

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
      const result = UserMapper.mapFromFacebookEvent(mockUserData);

      expect(result.source).toBe('facebook');
    });

    it('should handle user data with missing optional fields', () => {
      const minimalUserData = {
        userId: 'minimal_user',
        location: {
          country: 'Unknown',
          city: 'Unknown',
        },
      };

      const result = UserMapper.mapFromFacebookEvent(minimalUserData as any);

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
      const customSource = 'facebook_ads';

      const result = UserMapper.mapFromFacebookEvent(mockUserData, customSource);

      expect(result.source).toBe('facebook_ads');
    });

    it('should preserve all location data', () => {
      const userWithLocation = {
        userId: 'location_user',
        name: 'Location User',
        location: {
          country: 'Canada',
          city: 'Vancouver',
        },
      };

      const result = UserMapper.mapFromFacebookEvent(userWithLocation as any);

      expect(result.country).toBe('Canada');
      expect(result.city).toBe('Vancouver');
    });

    it('should handle null/undefined location gracefully', () => {
      const userWithoutLocation = {
        userId: 'no_location_user',
        name: 'No Location User',
        location: null,
      };

      expect(() => {
        UserMapper.mapFromFacebookEvent(userWithoutLocation as any);
      }).toThrow();
    });

    it('should map all user properties correctly', () => {
      const result = UserMapper.mapFromFacebookEvent(mockUserData);

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
