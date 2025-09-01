import { TiktokEventInterface } from 'libs/common/interfaces/tiktok-event.interface';
import { SavedUser } from '../interfaces/repository.interface';

export class UserMapper {
  static mapFromTiktokEvent(
    userData: TiktokEventInterface['data']['user'],
    source: string = 'tiktok',
  ): Omit<SavedUser, 'id'> {
    return {
      source,
      sourceUserId: userData.userId,
      name: userData.username,
      followers: userData.followers,
    };
  }
}
