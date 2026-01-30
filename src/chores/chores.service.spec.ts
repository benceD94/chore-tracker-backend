import { Test, TestingModule } from '@nestjs/testing';
import { ChoresService } from './chores.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { CreateChoreDto } from './dto/create-chore.dto';
import { UpdateChoreDto } from './dto/update-chore.dto';

describe('ChoresService', () => {
  let service: ChoresService;
  let prisma: jest.Mocked<PrismaService>;

  const householdId = 'household-id-123';

  const mockChore = {
    id: 'chore-id-123',
    name: 'Wash Dishes',
    description: 'Wash and dry all dishes',
    categoryId: 'category-id-123',
    points: 10,
    householdId,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15'),
    category: {
      id: 'category-id-123',
      name: 'Cleaning',
      householdId,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    assignments: [
      {
        choreId: 'chore-id-123',
        userId: 'user-uid-1',
        assignedAt: new Date(),
        user: {
          uid: 'user-uid-1',
          email: 'user1@example.com',
          displayName: 'User One',
          photoURL: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
    ],
  };

  const mockCreateChoreDto: CreateChoreDto = {
    name: 'Vacuum Living Room',
    description: 'Vacuum the entire living room',
    categoryId: 'category-id-456',
    assignedTo: ['user-uid-2'],
    points: 15,
  };

  const mockUpdateChoreDto: UpdateChoreDto = {
    name: 'Wash All Dishes',
    description: 'Updated description',
  };

  beforeEach(async () => {
    const mockPrismaService = {
      chore: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      choreAssignment: {
        deleteMany: jest.fn(),
        createMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChoresService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ChoresService>(ChoresService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all chores for a household ordered by name', async () => {
      // Arrange
      const chores = [
        mockChore,
        { ...mockChore, id: 'chore-id-456', name: 'Clean Bathroom' },
        { ...mockChore, id: 'chore-id-789', name: 'Mop Floor' },
      ];
      (prisma.chore.findMany as jest.Mock).mockResolvedValue(chores);

      // Act
      const result = await service.findAll(householdId);

      // Assert
      expect(prisma.chore.findMany).toHaveBeenCalledWith({
        where: { householdId },
        include: {
          category: true,
          assignments: {
            include: {
              user: true,
            },
          },
        },
        orderBy: { name: 'asc' },
      });
      expect(result).toHaveLength(3);
      expect(result[0]).toMatchObject({
        id: chores[0].id,
        name: chores[0].name,
        categoryName: 'Cleaning',
      });
    });

    it('should return empty array when household has no chores', async () => {
      // Arrange
      (prisma.chore.findMany as jest.Mock).mockResolvedValue([]);

      // Act
      const result = await service.findAll(householdId);

      // Assert
      expect(result).toEqual([]);
    });

    it('should handle database query errors', async () => {
      // Arrange
      const error = new Error('Database query failed');
      (prisma.chore.findMany as jest.Mock).mockRejectedValue(error);

      // Act & Assert
      await expect(service.findAll(householdId)).rejects.toThrow(error);
    });
  });

  describe('findOne', () => {
    it('should return chore when found', async () => {
      // Arrange
      const choreId = 'chore-id-123';
      (prisma.chore.findFirst as jest.Mock).mockResolvedValue(mockChore);

      // Act
      const result = await service.findOne(householdId, choreId);

      // Assert
      expect(prisma.chore.findFirst).toHaveBeenCalledWith({
        where: {
          id: choreId,
          householdId,
        },
        include: {
          category: true,
          assignments: {
            include: {
              user: true,
            },
          },
        },
      });
      expect(result).toMatchObject({
        id: mockChore.id,
        name: mockChore.name,
        categoryName: 'Cleaning',
      });
    });

    it('should throw NotFoundException when chore not found', async () => {
      // Arrange
      const choreId = 'non-existent-id';
      (prisma.chore.findFirst as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne(householdId, choreId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOne(householdId, choreId)).rejects.toThrow(
        `Chore with ID ${choreId} not found`,
      );
    });

    it('should handle database errors', async () => {
      // Arrange
      const choreId = 'chore-id-123';
      const error = new Error('Database error');
      (prisma.chore.findFirst as jest.Mock).mockRejectedValue(error);

      // Act & Assert
      await expect(service.findOne(householdId, choreId)).rejects.toThrow(
        error,
      );
    });
  });

  describe('create', () => {
    it('should create chore with household ID and assignments', async () => {
      // Arrange
      const newChore = {
        ...mockChore,
        id: 'new-chore-id',
        name: mockCreateChoreDto.name,
        categoryId: mockCreateChoreDto.categoryId,
      };
      (prisma.chore.create as jest.Mock).mockResolvedValue(newChore);

      // Act
      const result = await service.create(householdId, mockCreateChoreDto);

      // Assert
      expect(prisma.chore.create).toHaveBeenCalledWith({
        data: {
          householdId,
          name: mockCreateChoreDto.name,
          description: mockCreateChoreDto.description,
          points: mockCreateChoreDto.points,
          categoryId: mockCreateChoreDto.categoryId,
          assignments: {
            create: mockCreateChoreDto.assignedTo?.map((userId) => ({
              userId,
            })),
          },
        },
        include: {
          category: true,
          assignments: {
            include: {
              user: true,
            },
          },
        },
      });
      expect(result).toMatchObject({
        id: newChore.id,
        name: mockCreateChoreDto.name,
        householdId,
      });
    });

    it('should create chore without assignments if not provided', async () => {
      // Arrange
      const dtoWithoutAssignedTo = {
        ...mockCreateChoreDto,
        assignedTo: undefined,
      };
      const newChore = { ...mockChore, id: 'new-chore-id', assignments: [] };
      (prisma.chore.create as jest.Mock).mockResolvedValue(newChore);

      // Act
      await service.create(householdId, dtoWithoutAssignedTo);

      // Assert
      expect(prisma.chore.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          assignments: undefined,
        }),
        include: expect.any(Object),
      });
    });

    it('should handle database create errors', async () => {
      // Arrange
      const error = new Error('Database create failed');
      (prisma.chore.create as jest.Mock).mockRejectedValue(error);

      // Act & Assert
      await expect(
        service.create(householdId, mockCreateChoreDto),
      ).rejects.toThrow(error);
    });
  });

  describe('update', () => {
    it('should update chore and return updated data', async () => {
      // Arrange
      const choreId = 'chore-id-123';
      const updatedChore = {
        ...mockChore,
        ...mockUpdateChoreDto,
        updatedAt: new Date(),
      };
      (prisma.chore.findFirst as jest.Mock).mockResolvedValue(mockChore);
      (prisma.chore.update as jest.Mock).mockResolvedValue(updatedChore);

      // Act
      const result = await service.update(
        householdId,
        choreId,
        mockUpdateChoreDto,
      );

      // Assert
      expect(prisma.chore.findFirst).toHaveBeenCalled();
      expect(prisma.chore.update).toHaveBeenCalledWith({
        where: { id: choreId },
        data: {
          name: mockUpdateChoreDto.name,
          description: mockUpdateChoreDto.description,
          categoryId: mockUpdateChoreDto.categoryId,
        },
        include: {
          category: true,
          assignments: {
            include: {
              user: true,
            },
          },
        },
      });
      expect(result.name).toBe(mockUpdateChoreDto.name);
    });

    it('should update assignments when provided', async () => {
      // Arrange
      const choreId = 'chore-id-123';
      const updateWithAssignments = {
        ...mockUpdateChoreDto,
        assignedTo: ['user-uid-2', 'user-uid-3'],
      };
      const updatedChore = { ...mockChore };
      (prisma.chore.findFirst as jest.Mock).mockResolvedValue(mockChore);
      (prisma.choreAssignment.deleteMany as jest.Mock).mockResolvedValue({
        count: 1,
      });
      (prisma.choreAssignment.createMany as jest.Mock).mockResolvedValue({
        count: 2,
      });
      (prisma.chore.update as jest.Mock).mockResolvedValue(updatedChore);

      // Act
      await service.update(householdId, choreId, updateWithAssignments);

      // Assert
      expect(prisma.choreAssignment.deleteMany).toHaveBeenCalledWith({
        where: { choreId },
      });
      expect(prisma.choreAssignment.createMany).toHaveBeenCalledWith({
        data: [
          { choreId, userId: 'user-uid-2' },
          { choreId, userId: 'user-uid-3' },
        ],
      });
    });

    it('should throw NotFoundException when chore does not exist', async () => {
      // Arrange
      const choreId = 'non-existent-id';
      (prisma.chore.findFirst as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.update(householdId, choreId, mockUpdateChoreDto),
      ).rejects.toThrow(NotFoundException);
      expect(prisma.chore.update).not.toHaveBeenCalled();
    });

    it('should handle database update errors', async () => {
      // Arrange
      const choreId = 'chore-id-123';
      const error = new Error('Database update failed');
      (prisma.chore.findFirst as jest.Mock).mockResolvedValue(mockChore);
      (prisma.chore.update as jest.Mock).mockRejectedValue(error);

      // Act & Assert
      await expect(
        service.update(householdId, choreId, mockUpdateChoreDto),
      ).rejects.toThrow(error);
    });
  });

  describe('remove', () => {
    it('should delete chore after verifying it exists', async () => {
      // Arrange
      const choreId = 'chore-id-123';
      (prisma.chore.findFirst as jest.Mock).mockResolvedValue(mockChore);
      (prisma.chore.delete as jest.Mock).mockResolvedValue(mockChore);

      // Act
      await service.remove(householdId, choreId);

      // Assert
      expect(prisma.chore.findFirst).toHaveBeenCalled();
      expect(prisma.chore.delete).toHaveBeenCalledWith({
        where: { id: choreId },
      });
    });

    it('should throw NotFoundException when chore does not exist', async () => {
      // Arrange
      const choreId = 'non-existent-id';
      (prisma.chore.findFirst as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(service.remove(householdId, choreId)).rejects.toThrow(
        NotFoundException,
      );
      expect(prisma.chore.delete).not.toHaveBeenCalled();
    });

    it('should handle database delete errors', async () => {
      // Arrange
      const choreId = 'chore-id-123';
      const error = new Error('Database delete failed');
      (prisma.chore.findFirst as jest.Mock).mockResolvedValue(mockChore);
      (prisma.chore.delete as jest.Mock).mockRejectedValue(error);

      // Act & Assert
      await expect(service.remove(householdId, choreId)).rejects.toThrow(error);
    });

    it('should verify chore exists before attempting delete', async () => {
      // Arrange
      const choreId = 'chore-id-123';
      (prisma.chore.findFirst as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(service.remove(householdId, choreId)).rejects.toThrow(
        NotFoundException,
      );
      expect(prisma.chore.findFirst).toHaveBeenCalled();
      expect(prisma.chore.delete).not.toHaveBeenCalled();
    });
  });
});
