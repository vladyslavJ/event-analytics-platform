import { Test, TestingModule } from '@nestjs/testing';
import { UserRepository } from '../../../src/infrastructure/repositories/user.repository';
import { PrismaClientService } from 'libs/prisma-client/src/prisma-client.service';
import { PrismaServiceDiTokens } from 'libs/prisma-client/di/prisma-service-di-tokens';
import { mockUserData, mockSavedUser } from '../../fixtures/facebook-events.fixture';

describe('UserRepository', () => {
  let repository: UserRepository;
  let mockPrisma: jest.Mocked<PrismaClientService>;

  const mockPrismaUser = {
    id: 'saved_user_123',
    source: 'facebook',
    sourceUserId: 'fb_user_test',
    name: 'Test User',
    age: 25,
    gender: 'female',
    country: 'Germany',
    city: 'Berlin',
    followers: null,
    extra: {},
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    mockPrisma = {
      user: {
        upsert: jest.fn(),
        findUnique: jest.fn(),
      },
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRepository,
        {
          provide: PrismaServiceDiTokens.PRISMA_CLIENT,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    repository = module.get<UserRepository>(UserRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('upsertUser', () => {
    it('should create a new user successfully', async () => {
      const source = 'facebook';
      mockPrisma.user.upsert.mockResolvedValue(mockPrismaUser as any);

      const result = await repository.upsertUser(mockUserData, source);

      expect(mockPrisma.user.upsert).toHaveBeenCalledWith({
        where: {
          source_sourceUserId: {
            source: 'facebook',
            sourceUserId: 'fb_user_test',
          },
        },
        update: {
          name: 'Test User',
          age: 25,
          gender: 'female',
          country: 'Germany',
          city: 'Berlin',
        },
        create: {
          source: 'facebook',
          sourceUserId: 'fb_user_test',
          name: 'Test User',
          age: 25,
          gender: 'female',
          country: 'Germany',
          city: 'Berlin',
          extra: {},
        },
      });

      expect(result).toEqual({
        id: 'saved_user_123',
        source: 'facebook',
        sourceUserId: 'fb_user_test',
        name: 'Test User',
        age: 25,
        gender: 'female',
        country: 'Germany',
        city: 'Berlin',
      });
    });

    it('should update an existing user', async () => {
      const source = 'facebook';
      const updatedUserData = {
        ...mockUserData,
        name: 'Updated Name',
        age: 30,
      };
      const updatedPrismaUser = {
        ...mockPrismaUser,
        name: 'Updated Name',
        age: 30,
      };

      mockPrisma.user.upsert.mockResolvedValue(updatedPrismaUser as any);

      const result = await repository.upsertUser(updatedUserData, source);

      expect(mockPrisma.user.upsert).toHaveBeenCalledWith({
        where: {
          source_sourceUserId: {
            source: 'facebook',
            sourceUserId: 'fb_user_test',
          },
        },
        update: {
          name: 'Updated Name',
          age: 30,
          gender: 'female',
          country: 'Germany',
          city: 'Berlin',
        },
        create: expect.any(Object),
      });

      expect(result.name).toBe('Updated Name');
      expect(result.age).toBe(30);
    });

    it('should handle user data with missing optional fields', async () => {
      const minimalUserData = {
        userId: 'minimal_user',
        location: {
          country: 'Unknown',
          city: 'Unknown',
        },
      };
      const minimalPrismaUser = {
        ...mockPrismaUser,
        sourceUserId: 'minimal_user',
        name: null,
        age: null,
        gender: null,
        country: 'Unknown',
        city: 'Unknown',
      };

      mockPrisma.user.upsert.mockResolvedValue(minimalPrismaUser as any);

      const result = await repository.upsertUser(minimalUserData as any, 'facebook');

      expect(result).toEqual({
        id: 'saved_user_123',
        source: 'facebook',
        sourceUserId: 'minimal_user',
        name: undefined,
        age: undefined,
        gender: undefined,
        country: 'Unknown',
        city: 'Unknown',
      });
    });

    it('should handle null values properly in result mapping', async () => {
      const prismaUserWithNulls = {
        ...mockPrismaUser,
        name: null,
        age: null,
        gender: null,
      };

      mockPrisma.user.upsert.mockResolvedValue(prismaUserWithNulls as any);

      const result = await repository.upsertUser(mockUserData, 'facebook');

      expect(result.name).toBeUndefined();
      expect(result.age).toBeUndefined();
      expect(result.gender).toBeUndefined();
    });
  });

  describe('findUserBySourceId', () => {
    it('should find user by source ID successfully', async () => {
      const sourceUserId = 'fb_user_test';
      const source = 'facebook';
      mockPrisma.user.findUnique.mockResolvedValue(mockPrismaUser as any);

      const result = await repository.findUserBySourceId(sourceUserId, source);

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: {
          source_sourceUserId: {
            source: 'facebook',
            sourceUserId: 'fb_user_test',
          },
        },
      });

      expect(result).toEqual({
        id: 'saved_user_123',
        source: 'facebook',
        sourceUserId: 'fb_user_test',
        name: 'Test User',
        age: 25,
        gender: 'female',
        country: 'Germany',
        city: 'Berlin',
      });
    });

    it('should return null when user not found', async () => {
      const sourceUserId = 'non_existent_user';
      const source = 'facebook';
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const result = await repository.findUserBySourceId(sourceUserId, source);

      expect(result).toBeNull();
    });

    it('should handle database errors gracefully', async () => {
      const sourceUserId = 'fb_user_test';
      const source = 'facebook';
      const dbError = new Error('Database connection failed');
      mockPrisma.user.findUnique.mockRejectedValue(dbError);

      await expect(repository.findUserBySourceId(sourceUserId, source)).rejects.toThrow(
        'Database connection failed',
      );
    });
  });

  describe('error handling', () => {
    it('should propagate database errors during upsert', async () => {
      const dbError = new Error('Database write failed');
      mockPrisma.user.upsert.mockRejectedValue(dbError);

      await expect(repository.upsertUser(mockUserData, 'facebook')).rejects.toThrow(
        'Database write failed',
      );
    });

    it('should handle unique constraint violations', async () => {
      const constraintError = new Error('Unique constraint failed');
      (constraintError as any).code = 'P2002';
      mockPrisma.user.upsert.mockRejectedValue(constraintError);

      await expect(repository.upsertUser(mockUserData, 'facebook')).rejects.toThrow(
        'Unique constraint failed',
      );
    });
  });

  describe('data mapping', () => {
    it('should correctly map all user fields from Prisma result', async () => {
      const completeUser = {
        ...mockPrismaUser,
        followers: 1000,
      };
      mockPrisma.user.upsert.mockResolvedValue(completeUser as any);

      const result = await repository.upsertUser(mockUserData, 'facebook');

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('source');
      expect(result).toHaveProperty('sourceUserId');
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('age');
      expect(result).toHaveProperty('gender');
      expect(result).toHaveProperty('country');
      expect(result).toHaveProperty('city');
      expect(Object.keys(result)).toHaveLength(8);
    });
  });
});
