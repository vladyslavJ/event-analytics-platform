import { Injectable, Inject } from '@nestjs/common';
import { PrismaClientService } from 'libs/prisma-client/src/prisma-client.service';
import { PrismaServiceDiTokens } from 'libs/prisma-client/di/prisma-service-di-tokens';
import type {
  UserRepositoryInterface,
  SavedUser,
} from '../../domain/interfaces/repository.interface';
import { UserMapper } from '../../domain/mappers/user.mapper';
import { FacebookEventInterface } from 'libs/common/interfaces/facebook-event.interface';

@Injectable()
export class UserRepository implements UserRepositoryInterface {
  constructor(
    @Inject(PrismaServiceDiTokens.PRISMA_CLIENT)
    private readonly prisma: PrismaClientService,
  ) {}

  async upsertUser(
    userData: FacebookEventInterface['data']['user'],
    source: string,
  ): Promise<SavedUser> {
    const mappedUser = UserMapper.mapFromFacebookEvent(userData, source);
    const result = await this.prisma.user.upsert({
      where: {
        source_sourceUserId: {
          source: mappedUser.source as any,
          sourceUserId: mappedUser.sourceUserId,
        },
      },
      update: {
        name: mappedUser.name,
        age: mappedUser.age,
        gender: mappedUser.gender,
        country: mappedUser.country,
        city: mappedUser.city,
      },
      create: {
        source: mappedUser.source as any,
        sourceUserId: mappedUser.sourceUserId,
        name: mappedUser.name,
        age: mappedUser.age,
        gender: mappedUser.gender,
        country: mappedUser.country,
        city: mappedUser.city,
        extra: {},
      },
    });
    return {
      id: result.id,
      source: result.source,
      sourceUserId: result.sourceUserId,
      name: result.name || undefined,
      age: result.age || undefined,
      gender: result.gender || undefined,
      country: result.country || undefined,
      city: result.city || undefined,
    };
  }

  async findUserBySourceId(sourceUserId: string, source: string): Promise<SavedUser | null> {
    const result = await this.prisma.user.findUnique({
      where: {
        source_sourceUserId: {
          source: source as any,
          sourceUserId,
        },
      },
    });
    if (!result) return null;
    return {
      id: result.id,
      source: result.source,
      sourceUserId: result.sourceUserId,
      name: result.name || undefined,
      age: result.age || undefined,
      gender: result.gender || undefined,
      country: result.country || undefined,
      city: result.city || undefined,
    };
  }
}
