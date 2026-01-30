import { Test, TestingModule } from '@nestjs/testing';
import { RegistryService } from './registry.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRegistryEntryDto } from './dto/create-registry-entry.dto';
import { BatchRegistryDto } from './dto/batch-registry.dto';
import { RegistryQueryDto, RegistryFilter } from './dto/registry-query.dto';

describe('RegistryService', () => {
  let service: RegistryService;
  let prisma: jest.Mocked<PrismaService>;

  const householdId = 'household-id-123';

  const mockChore = {
    id: 'chore-id-123',
    name: 'Test Chore',
    points: 10,
    description: 'Test description',
    categoryId: 'category-id-123',
    householdId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUser = {
    uid: 'user-uid-1',
    email: 'user@example.com',
    displayName: 'Test User',
    photoURL: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRegistryEntry = {
    id: 'registry-id-123',
    choreId: 'chore-id-123',
    userId: 'user-uid-1',
    householdId,
    times: 1,
    completedAt: new Date('2024-01-15T10:00:00Z'),
    createdAt: new Date('2024-01-15T10:00:00Z'),
    chore: mockChore,
    user: mockUser,
  };

  const mockCreateRegistryEntryDto: CreateRegistryEntryDto = {
    choreId: 'chore-id-456',
    userId: 'user-uid-2',
    times: 2,
  };

  beforeEach(async () => {
    const mockPrismaService = {
      registryEntry: {
        findMany: jest.fn(),
        create: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegistryService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<RegistryService>(RegistryService);
    prisma = module.get(PrismaService) as jest.Mocked<PrismaService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all registry entries without filters', async () => {
      // Arrange
      const queryDto: RegistryQueryDto = {
        filter: RegistryFilter.ALL,
      };
      const entries = [
        mockRegistryEntry,
        { ...mockRegistryEntry, id: 'registry-id-456' },
      ];
      (prisma.registryEntry.findMany as jest.Mock).mockResolvedValue(entries);

      // Act
      const result = await service.findAll(householdId, queryDto);

      // Assert
      expect(prisma.registryEntry.findMany).toHaveBeenCalledWith({
        where: { householdId },
        include: {
          chore: true,
          user: true,
        },
        orderBy: { completedAt: 'desc' },
        take: 50,
      });
      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        id: mockRegistryEntry.id,
        choreId: mockRegistryEntry.choreId,
        userId: mockRegistryEntry.userId,
        points: mockChore.points,
        choreName: mockChore.name,
        userName: mockUser.displayName,
      });
    });

    it('should filter entries by userId when specified', async () => {
      // Arrange
      const queryDto: RegistryQueryDto = {
        filter: RegistryFilter.ALL,
        userId: 'user-uid-1',
      };
      const entries = [mockRegistryEntry];
      (prisma.registryEntry.findMany as jest.Mock).mockResolvedValue(entries);

      // Act
      const result = await service.findAll(householdId, queryDto);

      // Assert
      expect(prisma.registryEntry.findMany).toHaveBeenCalledWith({
        where: {
          householdId,
          userId: 'user-uid-1',
        },
        include: {
          chore: true,
          user: true,
        },
        orderBy: { completedAt: 'desc' },
        take: 50,
      });
      expect(result[0]).toMatchObject({
        choreName: mockChore.name,
        userName: mockUser.displayName,
      });
    });

    it('should use custom limit when specified', async () => {
      // Arrange
      const queryDto: RegistryQueryDto = {
        filter: RegistryFilter.ALL,
        limit: 10,
      };
      (prisma.registryEntry.findMany as jest.Mock).mockResolvedValue([mockRegistryEntry]);

      // Act
      await service.findAll(householdId, queryDto);

      // Assert
      expect(prisma.registryEntry.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 10,
        }),
      );
    });

    it('should use default limit of 50 when not specified', async () => {
      // Arrange
      const queryDto: RegistryQueryDto = {
        filter: RegistryFilter.ALL,
      };
      (prisma.registryEntry.findMany as jest.Mock).mockResolvedValue([mockRegistryEntry]);

      // Act
      await service.findAll(householdId, queryDto);

      // Assert
      expect(prisma.registryEntry.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 50,
        }),
      );
    });

    it('should filter by TODAY', async () => {
      // Arrange
      const queryDto: RegistryQueryDto = {
        filter: RegistryFilter.TODAY,
      };
      (prisma.registryEntry.findMany as jest.Mock).mockResolvedValue([mockRegistryEntry]);

      // Act
      const result = await service.findAll(householdId, queryDto);

      // Assert
      expect(prisma.registryEntry.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            householdId,
            completedAt: expect.objectContaining({
              gte: expect.any(Date),
              lte: expect.any(Date),
            }),
          }),
        }),
      );
      expect(result[0]).toMatchObject({
        choreId: mockRegistryEntry.choreId,
        userId: mockRegistryEntry.userId,
        choreName: expect.any(String),
        userName: expect.any(String),
      });
    });

    it('should filter by YESTERDAY', async () => {
      // Arrange
      const queryDto: RegistryQueryDto = {
        filter: RegistryFilter.YESTERDAY,
      };
      (prisma.registryEntry.findMany as jest.Mock).mockResolvedValue([mockRegistryEntry]);

      // Act
      const result = await service.findAll(householdId, queryDto);

      // Assert
      expect(prisma.registryEntry.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            householdId,
            completedAt: expect.objectContaining({
              gte: expect.any(Date),
              lte: expect.any(Date),
            }),
          }),
        }),
      );
      expect(result[0]).toMatchObject({
        choreId: mockRegistryEntry.choreId,
        userId: mockRegistryEntry.userId,
        choreName: expect.any(String),
        userName: expect.any(String),
      });
    });

    it('should filter by THIS_WEEK', async () => {
      // Arrange
      const queryDto: RegistryQueryDto = {
        filter: RegistryFilter.THIS_WEEK,
      };
      (prisma.registryEntry.findMany as jest.Mock).mockResolvedValue([mockRegistryEntry]);

      // Act
      const result = await service.findAll(householdId, queryDto);

      // Assert
      expect(prisma.registryEntry.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            householdId,
            completedAt: expect.objectContaining({
              gte: expect.any(Date),
              lte: expect.any(Date),
            }),
          }),
        }),
      );
      expect(result[0]).toMatchObject({
        choreId: mockRegistryEntry.choreId,
        choreName: expect.any(String),
        userName: expect.any(String),
      });
    });

    it('should filter by LAST_WEEK', async () => {
      // Arrange
      const queryDto: RegistryQueryDto = {
        filter: RegistryFilter.LAST_WEEK,
      };
      (prisma.registryEntry.findMany as jest.Mock).mockResolvedValue([mockRegistryEntry]);

      // Act
      const result = await service.findAll(householdId, queryDto);

      // Assert
      expect(prisma.registryEntry.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            householdId,
            completedAt: expect.objectContaining({
              gte: expect.any(Date),
              lte: expect.any(Date),
            }),
          }),
        }),
      );
      expect(result[0]).toMatchObject({
        choreId: mockRegistryEntry.choreId,
        choreName: expect.any(String),
        userName: expect.any(String),
      });
    });

    it('should filter by THIS_MONTH', async () => {
      // Arrange
      const queryDto: RegistryQueryDto = {
        filter: RegistryFilter.THIS_MONTH,
      };
      (prisma.registryEntry.findMany as jest.Mock).mockResolvedValue([mockRegistryEntry]);

      // Act
      const result = await service.findAll(householdId, queryDto);

      // Assert
      expect(prisma.registryEntry.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            householdId,
            completedAt: expect.objectContaining({
              gte: expect.any(Date),
              lte: expect.any(Date),
            }),
          }),
        }),
      );
      expect(result[0]).toMatchObject({
        choreId: mockRegistryEntry.choreId,
        choreName: expect.any(String),
        userName: expect.any(String),
      });
    });

    it('should combine date filter and user filter', async () => {
      // Arrange
      const queryDto: RegistryQueryDto = {
        filter: RegistryFilter.TODAY,
        userId: 'user-uid-1',
      };
      (prisma.registryEntry.findMany as jest.Mock).mockResolvedValue([mockRegistryEntry]);

      // Act
      const result = await service.findAll(householdId, queryDto);

      // Assert
      expect(prisma.registryEntry.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            householdId,
            userId: 'user-uid-1',
            completedAt: expect.objectContaining({
              gte: expect.any(Date),
              lte: expect.any(Date),
            }),
          }),
        }),
      );
      expect(result[0]).toMatchObject({
        choreId: mockRegistryEntry.choreId,
        userId: mockRegistryEntry.userId,
        choreName: expect.any(String),
        userName: expect.any(String),
      });
    });

    it('should return empty array when no entries found', async () => {
      // Arrange
      const queryDto: RegistryQueryDto = {
        filter: RegistryFilter.ALL,
      };
      (prisma.registryEntry.findMany as jest.Mock).mockResolvedValue([]);

      // Act
      const result = await service.findAll(householdId, queryDto);

      // Assert
      expect(result).toEqual([]);
    });

    it('should handle database query errors', async () => {
      // Arrange
      const queryDto: RegistryQueryDto = {
        filter: RegistryFilter.ALL,
      };
      const error = new Error('Database query failed');
      (prisma.registryEntry.findMany as jest.Mock).mockRejectedValue(error);

      // Act & Assert
      await expect(service.findAll(householdId, queryDto)).rejects.toThrow(
        error,
      );
    });
  });

  describe('create', () => {
    it('should create registry entry with default times', async () => {
      // Arrange
      const dtoWithoutTimes: CreateRegistryEntryDto = {
        choreId: 'chore-id-456',
        userId: 'user-uid-2',
      };
      const newEntry = {
        id: 'new-registry-id',
        choreId: dtoWithoutTimes.choreId,
        userId: dtoWithoutTimes.userId,
        householdId,
        times: 1,
        completedAt: new Date(),
        createdAt: new Date(),
        chore: mockChore,
        user: mockUser,
      };
      (prisma.registryEntry.create as jest.Mock).mockResolvedValue(newEntry);

      // Act
      const result = await service.create(householdId, dtoWithoutTimes);

      // Assert
      expect(prisma.registryEntry.create).toHaveBeenCalledWith({
        data: {
          choreId: dtoWithoutTimes.choreId,
          userId: dtoWithoutTimes.userId,
          householdId,
          times: 1,
        },
        include: {
          chore: true,
          user: true,
        },
      });
      expect(result).toMatchObject({
        id: newEntry.id,
        choreId: dtoWithoutTimes.choreId,
        userId: dtoWithoutTimes.userId,
        householdId,
        times: 1,
        choreName: mockChore.name,
        userName: mockUser.displayName,
        completedAt: expect.any(Date),
        createdAt: expect.any(Date),
      });
    });

    it('should create registry entry with specified times', async () => {
      // Arrange
      const newEntry = {
        id: 'new-registry-id',
        choreId: mockCreateRegistryEntryDto.choreId,
        userId: mockCreateRegistryEntryDto.userId,
        householdId,
        times: 2,
        completedAt: new Date(),
        createdAt: new Date(),
        chore: mockChore,
        user: mockUser,
      };
      (prisma.registryEntry.create as jest.Mock).mockResolvedValue(newEntry);

      // Act
      const result = await service.create(
        householdId,
        mockCreateRegistryEntryDto,
      );

      // Assert
      expect(prisma.registryEntry.create).toHaveBeenCalledWith({
        data: {
          choreId: mockCreateRegistryEntryDto.choreId,
          userId: mockCreateRegistryEntryDto.userId,
          householdId,
          times: 2,
        },
        include: {
          chore: true,
          user: true,
        },
      });
      expect(result.times).toBe(2);
    });

    it('should set completedAt and createdAt to same time', async () => {
      // Arrange
      const now = new Date();
      const newEntry = {
        id: 'new-registry-id',
        choreId: mockCreateRegistryEntryDto.choreId,
        userId: mockCreateRegistryEntryDto.userId,
        householdId,
        times: 2,
        completedAt: now,
        createdAt: now,
        chore: mockChore,
        user: mockUser,
      };
      (prisma.registryEntry.create as jest.Mock).mockResolvedValue(newEntry);

      // Act
      const result = await service.create(
        householdId,
        mockCreateRegistryEntryDto,
      );

      // Assert
      expect(result.completedAt).toEqual(result.createdAt);
    });

    it('should handle database create errors', async () => {
      // Arrange
      const error = new Error('Database create failed');
      (prisma.registryEntry.create as jest.Mock).mockRejectedValue(error);

      // Act & Assert
      await expect(
        service.create(householdId, mockCreateRegistryEntryDto),
      ).rejects.toThrow(error);
    });
  });

  describe('createBatch', () => {
    it('should create multiple registry entries', async () => {
      // Arrange
      const batchDto: BatchRegistryDto = {
        chores: [
          { choreId: 'chore-1', userId: 'user-1', times: 1 },
          { choreId: 'chore-2', userId: 'user-2', times: 2 },
          { choreId: 'chore-3', userId: 'user-3', times: 3 },
        ],
      };
      (prisma.registryEntry.create as jest.Mock)
        .mockResolvedValueOnce({
          id: 'entry-id-1',
          choreId: 'chore-1',
          userId: 'user-1',
          householdId,
          times: 1,
          completedAt: new Date(),
          createdAt: new Date(),
          chore: mockChore,
          user: mockUser,
        })
        .mockResolvedValueOnce({
          id: 'entry-id-2',
          choreId: 'chore-2',
          userId: 'user-2',
          householdId,
          times: 2,
          completedAt: new Date(),
          createdAt: new Date(),
          chore: mockChore,
          user: mockUser,
        })
        .mockResolvedValueOnce({
          id: 'entry-id-3',
          choreId: 'chore-3',
          userId: 'user-3',
          householdId,
          times: 3,
          completedAt: new Date(),
          createdAt: new Date(),
          chore: mockChore,
          user: mockUser,
        });

      // Act
      const result = await service.createBatch(householdId, batchDto);

      // Assert
      expect(prisma.registryEntry.create).toHaveBeenCalledTimes(3);
      expect(result).toHaveLength(3);
      expect(result[0].choreId).toBe('chore-1');
      expect(result[1].choreId).toBe('chore-2');
      expect(result[2].choreId).toBe('chore-3');
      expect(result[0].times).toBe(1);
      expect(result[1].times).toBe(2);
      expect(result[2].times).toBe(3);
    });

    it('should return empty array when batch is empty', async () => {
      // Arrange
      const batchDto: BatchRegistryDto = {
        chores: [],
      };

      // Act
      const result = await service.createBatch(householdId, batchDto);

      // Assert
      expect(prisma.registryEntry.create).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('should handle database create errors during batch', async () => {
      // Arrange
      const batchDto: BatchRegistryDto = {
        chores: [
          { choreId: 'chore-1', userId: 'user-1' },
          { choreId: 'chore-2', userId: 'user-2' },
        ],
      };
      const error = new Error('Database create failed');
      (prisma.registryEntry.create as jest.Mock)
        .mockResolvedValueOnce({
          id: 'entry-id-1',
          choreId: 'chore-1',
          userId: 'user-1',
          householdId,
          times: 1,
          completedAt: new Date(),
          createdAt: new Date(),
          chore: mockChore,
          user: mockUser,
        })
        .mockRejectedValueOnce(error);

      // Act & Assert
      await expect(service.createBatch(householdId, batchDto)).rejects.toThrow(
        error,
      );
      expect(prisma.registryEntry.create).toHaveBeenCalledTimes(2);
    });

    it('should process entries sequentially in batch', async () => {
      // Arrange
      const batchDto: BatchRegistryDto = {
        chores: [
          { choreId: 'chore-1', userId: 'user-1' },
          { choreId: 'chore-2', userId: 'user-2' },
        ],
      };
      (prisma.registryEntry.create as jest.Mock)
        .mockResolvedValueOnce({
          id: 'entry-id-1',
          choreId: 'chore-1',
          userId: 'user-1',
          householdId,
          times: 1,
          completedAt: new Date(),
          createdAt: new Date(),
          chore: mockChore,
          user: mockUser,
        })
        .mockResolvedValueOnce({
          id: 'entry-id-2',
          choreId: 'chore-2',
          userId: 'user-2',
          householdId,
          times: 1,
          completedAt: new Date(),
          createdAt: new Date(),
          chore: mockChore,
          user: mockUser,
        });

      // Act
      const result = await service.createBatch(householdId, batchDto);

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('entry-id-1');
      expect(result[1].id).toBe('entry-id-2');
    });
  });
});
