import { Test, TestingModule } from '@nestjs/testing';
import { UserRepository } from '../../../src/infrastructure/repositories/user.repository';
import { PrismaClientService } from 'libs/prisma-client/src/prisma-client.service';
import { PrismaServiceDiTokens } from 'libs/prisma-client/di/prisma-service-di-tokens';
import { tiktokEventFixtures } from '../../fixtures/tiktok-events.fixture';

describe('UserRepository', () => {
  let repository: UserRepository;
  let mockPrisma: jest.Mocked<PrismaClientService>;

  const mockPrismaUser = {
    id: 'prisma-user-id',
    source: 'tiktok',
    sourceUserId: 'ttk-user-123',
    name: 'test_tiktok_user',
    followers: 1500,
    extra: {},
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockPrismaService = {
      user: {
        upsert: jest.fn(),
        findUnique: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRepository,
        {
          provide: PrismaServiceDiTokens.PRISMA_CLIENT,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    repository = module.get<UserRepository>(UserRepository);
    mockPrisma = module.get(PrismaServiceDiTokens.PRISMA_CLIENT);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('upsertUser', () => {
    it('should upsert user with complete data', async () => {
      // Arrange
      const userData = tiktokEventFixtures.completeUserData;
      const source = 'tiktok';

      mockPrisma.user.upsert.mockResolvedValue(mockPrismaUser);

      // Act
      const result = await repository.upsertUser(userData, source);

      // Assert
      expect(mockPrisma.user.upsert).toHaveBeenCalledWith({
        where: {
          source_sourceUserId: {
            source: 'tiktok',
            sourceUserId: 'ttk-complete-user',
          },
        },
        update: {
          name: 'complete_user',
          followers: 10000,
        },
        create: {
          source: 'tiktok',
          sourceUserId: 'ttk-complete-user',
          name: 'complete_user',
          followers: 10000,
          extra: {},
        },
      });
      expect(result).toEqual({
        id: 'prisma-user-id',
        source: 'tiktok',
        sourceUserId: 'ttk-user-123',
        name: 'test_tiktok_user',
        followers: 1500,
      });
    });

    it('should upsert user with minimal data', async () => {
      // Arrange
      const userData = tiktokEventFixtures.minimalUserData;
      const source = 'tiktok';
      const minimalMockUser = {
        ...mockPrismaUser,
        followers: 0,
        sourceUserId: 'ttk-minimal-user',
        name: 'minimal_user',
      };

      mockPrisma.user.upsert.mockResolvedValue(minimalMockUser);

      // Act
      const result = await repository.upsertUser(userData, source);

      // Assert
      expect(mockPrisma.user.upsert).toHaveBeenCalledWith({
        where: {
          source_sourceUserId: {
            source: 'tiktok',
            sourceUserId: 'ttk-minimal-user',
          },
        },
        update: {
          name: 'minimal_user',
          followers: 0,
        },
        create: {
          source: 'tiktok',
          sourceUserId: 'ttk-minimal-user',
          name: 'minimal_user',
          followers: 0,
          extra: {},
        },
      });
      expect(result).toEqual({
        id: 'prisma-user-id',
        source: 'tiktok',
        sourceUserId: 'ttk-minimal-user',
        name: 'minimal_user',
        followers: undefined,
      });
    });

    it('should handle user data from event', async () => {
      // Arrange
      const userData = tiktokEventFixtures.purchaseEvent.data.user;
      const source = 'tiktok';
      const buyerMockUser = {
        ...mockPrismaUser,
        sourceUserId: 'ttk-user-999',
        name: 'buyer_user',
        followers: 100,
      };

      mockPrisma.user.upsert.mockResolvedValue(buyerMockUser);

      // Act
      const result = await repository.upsertUser(userData, source);

      // Assert
      expect(mockPrisma.user.upsert).toHaveBeenCalledWith({
        where: {
          source_sourceUserId: {
            source: 'tiktok',
            sourceUserId: 'ttk-user-999',
          },
        },
        update: {
          name: 'buyer_user',
          followers: 100,
        },
        create: {
          source: 'tiktok',
          sourceUserId: 'ttk-user-999',
          name: 'buyer_user',
          followers: 100,
          extra: {},
        },
      });
      expect(result.followers).toBe(100);
    });

    it('should handle null values in response', async () => {
      // Arrange
      const userData = tiktokEventFixtures.completeUserData;
      const source = 'tiktok';
      const userWithNulls = {
        ...mockPrismaUser,
        name: null,
        followers: null,
      };

      mockPrisma.user.upsert.mockResolvedValue(userWithNulls);

      // Act
      const result = await repository.upsertUser(userData, source);

      // Assert
      expect(result).toEqual({
        id: 'prisma-user-id',
        source: 'tiktok',
        sourceUserId: 'ttk-user-123',
        name: undefined,
        followers: undefined,
      });
    });

    it('should handle database errors', async () => {
      // Arrange
      const userData = tiktokEventFixtures.completeUserData;
      const source = 'tiktok';
      const error = new Error('Database upsert failed');

      mockPrisma.user.upsert.mockRejectedValue(error);

      // Act & Assert
      await expect(repository.upsertUser(userData, source)).rejects.toThrow(
        'Database upsert failed',
      );
    });
  });

  describe('findUserBySourceId', () => {
    it('should return user when found', async () => {
      // Arrange
      const sourceUserId = 'ttk-user-123';
      const source = 'tiktok';

      mockPrisma.user.findUnique.mockResolvedValue(mockPrismaUser);

      // Act
      const result = await repository.findUserBySourceId(sourceUserId, source);

      // Assert
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: {
          source_sourceUserId: {
            source: 'tiktok',
            sourceUserId: 'ttk-user-123',
          },
        },
      });
      expect(result).toEqual({
        id: 'prisma-user-id',
        source: 'tiktok',
        sourceUserId: 'ttk-user-123',
        name: 'test_tiktok_user',
        followers: 1500,
      });
    });

    it('should return null when user not found', async () => {
      // Arrange
      const sourceUserId = 'non-existent-user';
      const source = 'tiktok';

      mockPrisma.user.findUnique.mockResolvedValue(null);

      // Act
      const result = await repository.findUserBySourceId(sourceUserId, source);

      // Assert
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: {
          source_sourceUserId: {
            source: 'tiktok',
            sourceUserId: 'non-existent-user',
          },
        },
      });
      expect(result).toBeNull();
    });

    it('should handle users with null optional fields', async () => {
      // Arrange
      const sourceUserId = 'ttk-user-minimal';
      const source = 'tiktok';
      const userWithNulls = {
        ...mockPrismaUser,
        sourceUserId: 'ttk-user-minimal',
        name: null,
        followers: null,
      };

      mockPrisma.user.findUnique.mockResolvedValue(userWithNulls);

      // Act
      const result = await repository.findUserBySourceId(sourceUserId, source);

      // Assert
      expect(result).toEqual({
        id: 'prisma-user-id',
        source: 'tiktok',
        sourceUserId: 'ttk-user-minimal',
        name: undefined,
        followers: undefined,
      });
    });

    it('should handle database errors', async () => {
      // Arrange
      const sourceUserId = 'ttk-user-123';
      const source = 'tiktok';
      const error = new Error('Database query failed');

      mockPrisma.user.findUnique.mockRejectedValue(error);

      // Act & Assert
      await expect(repository.findUserBySourceId(sourceUserId, source)).rejects.toThrow(
        'Database query failed',
      );
    });

    it('should work with different source types', async () => {
      // Arrange
      const sourceUserId = 'custom-user-123';
      const source = 'custom-tiktok';
      const customUser = {
        ...mockPrismaUser,
        source: 'custom-tiktok',
        sourceUserId: 'custom-user-123',
      };

      mockPrisma.user.findUnique.mockResolvedValue(customUser);

      // Act
      const result = await repository.findUserBySourceId(sourceUserId, source);

      // Assert
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: {
          source_sourceUserId: {
            source: 'custom-tiktok',
            sourceUserId: 'custom-user-123',
          },
        },
      });
      expect(result?.source).toBe('custom-tiktok');
    });
  });
});
