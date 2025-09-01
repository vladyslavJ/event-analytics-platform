import { FacebookEventInterface } from 'libs/common/interfaces/facebook-event.interface';
import { SavedUser } from '../interfaces/repository.interface';

export class UserMapper {
  static mapFromFacebookEvent(
    userData: FacebookEventInterface['data']['user'],
    source: string = 'facebook',
  ): Omit<SavedUser, 'id'> {
    return {
      source,
      sourceUserId: userData.userId,
      name: userData.name,
      age: userData.age,
      gender: userData.gender,
      country: userData.location.country,
      city: userData.location.city,
    };
  }
}
