import { Test, TestingModule } from '@nestjs/testing';
import { HouseholdsService } from './households.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { CreateHouseholdDto } from './dto/create-household.dto';
import { UpdateHouseholdDto } from './dto/update-household.dto';
import { AddMemberDto } from './dto/add-member.dto';

describe('HouseholdsService', () => {
  let service: HouseholdsService;
  let prisma: jest.Mocked<PrismaService>;

  const mockUser1 = {
    uid: 'user-uid-1',
    email: 'user1@example.com',
    displayName: 'User One',
    photoURL: 'https://example.com/photo1.jpg',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const mockUser2 = {
    uid: 'user-uid-2',
    email: 'user2@example.com',
    displayName: 'User Two',
    photoURL: 'https://example.com/photo2.jpg',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const mockUser3 = {
    uid: 'user-uid-3',
    email: 'user3@example.com',
    displayName: 'User Three',
    photoURL: 'https://example.com/photo3.jpg',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const mockHousehold = {
    id: 'household-id-123',
    name: 'Test Household',
    createdBy: 'user-uid-1',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15'),
    members: [
      {
        userId: 'user-uid-1',
        householdId: 'household-id-123',
        joinedAt: new Date('2024-01-01'),
        user: mockUser1,
      },
      {
        userId: 'user-uid-2',
        householdId: 'household-id-123',
        joinedAt: new Date('2024-01-02'),
        user: mockUser2,
      },
    ],
  };

  const mockCreateHouseholdDto: CreateHouseholdDto = {
    name: 'New Household',
  };

  const mockUpdateHouseholdDto: UpdateHouseholdDto = {
    name: 'Updated Household Name',
  };

  const mockAddMemberDto: AddMemberDto = {
    userId: 'user-uid-3',
  };

  beforeEach(async () => {
    const mockPrismaService = {
      household: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      householdMember: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
      category: {
        create: jest.fn(),
      },
      chore: {
        create: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HouseholdsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<HouseholdsService>(HouseholdsService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAllByUser', () => {
    it('should return all households where user is a member with populated memberDetails', async () => {
      // Arrange
      const userUid = 'user-uid-1';
      const households = [
        mockHousehold,
        {
          ...mockHousehold,
          id: 'household-id-456',
          name: 'Another Household',
        },
      ];
      (prisma.household.findMany as jest.Mock).mockResolvedValue(households);

      // Act
      const result = await service.findAllByUser(userUid);

      // Assert
      expect(prisma.household.findMany).toHaveBeenCalledWith({
        where: {
          members: {
            some: { userId: userUid },
          },
        },
        include: {
          members: {
            include: {
              user: true,
            },
          },
        },
      });
      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('memberDetails');
      expect(result[0].memberDetails).toHaveLength(2);
      expect(result[0].memberDetails[0]).toMatchObject({
        uid: 'user-uid-1',
        displayName: 'User One',
      });
    });

    it('should return empty array when user has no households', async () => {
      // Arrange
      const userUid = 'user-uid-without-households';
      (prisma.household.findMany as jest.Mock).mockResolvedValue([]);

      // Act
      const result = await service.findAllByUser(userUid);

      // Assert
      expect(result).toEqual([]);
    });

    it('should handle database query errors', async () => {
      // Arrange
      const userUid = 'user-uid-1';
      const error = new Error('Database query failed');
      (prisma.household.findMany as jest.Mock).mockRejectedValue(error);

      // Act & Assert
      await expect(service.findAllByUser(userUid)).rejects.toThrow(error);
    });
  });

  describe('findOne', () => {
    it('should return household when found with populated memberDetails', async () => {
      // Arrange
      const householdId = 'household-id-123';
      (prisma.household.findUnique as jest.Mock).mockResolvedValue(
        mockHousehold,
      );

      // Act
      const result = await service.findOne(householdId);

      // Assert
      expect(prisma.household.findUnique).toHaveBeenCalledWith({
        where: { id: householdId },
        include: {
          members: {
            include: {
              user: true,
            },
          },
        },
      });
      expect(result).toHaveProperty('memberDetails');
      expect(result.memberDetails).toHaveLength(2);
    });

    it('should throw NotFoundException when household not found', async () => {
      // Arrange
      const householdId = 'non-existent-id';
      (prisma.household.findUnique as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne(householdId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOne(householdId)).rejects.toThrow(
        `Household with ID ${householdId} not found`,
      );
    });

    it('should handle database errors', async () => {
      // Arrange
      const householdId = 'household-id-123';
      const error = new Error('Database error');
      (prisma.household.findUnique as jest.Mock).mockRejectedValue(error);

      // Act & Assert
      await expect(service.findOne(householdId)).rejects.toThrow(error);
    });
  });

  describe('create', () => {
    it('should create household with creator as first member and populated memberDetails', async () => {
      // Arrange
      const creatorUid = 'user-uid-1';
      const newHousehold = {
        id: 'new-household-id',
        name: mockCreateHouseholdDto.name,
        createdBy: creatorUid,
        createdAt: new Date(),
        updatedAt: new Date(),
        members: [
          {
            userId: creatorUid,
            householdId: 'new-household-id',
            joinedAt: new Date(),
            user: mockUser1,
          },
        ],
      };
      (prisma.household.create as jest.Mock).mockResolvedValue(newHousehold);
      (prisma.category.create as jest.Mock).mockResolvedValue({
        id: 'category-id',
        name: 'Test Category',
        householdId: 'new-household-id',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      (prisma.chore.create as jest.Mock).mockResolvedValue({
        id: 'chore-id',
        name: 'Test Chore',
        householdId: 'new-household-id',
        categoryId: 'category-id',
        points: 1,
        description: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Act
      const result = await service.create(mockCreateHouseholdDto, creatorUid);

      // Assert
      expect(prisma.household.create).toHaveBeenCalledWith({
        data: {
          name: mockCreateHouseholdDto.name,
          createdBy: creatorUid,
          members: {
            create: {
              userId: creatorUid,
            },
          },
        },
        include: {
          members: {
            include: {
              user: true,
            },
          },
        },
      });
      // Verify default categories were created (10 categories)
      expect(prisma.category.create).toHaveBeenCalledTimes(10);
      // Verify default chores were created
      expect(
        (prisma.chore.create as jest.Mock).mock.calls.length,
      ).toBeGreaterThan(0);
      expect(result).toMatchObject({
        id: newHousehold.id,
        name: mockCreateHouseholdDto.name,
        createdBy: creatorUid,
      });
      expect(result.memberDetails).toHaveLength(1);
      expect(result.memberDetails[0].uid).toBe(creatorUid);
    });

    it('should set createdAt and updatedAt to same time', async () => {
      // Arrange
      const creatorUid = 'user-uid-1';
      const now = new Date();
      const newHousehold = {
        id: 'new-household-id',
        name: mockCreateHouseholdDto.name,
        createdBy: creatorUid,
        createdAt: now,
        updatedAt: now,
        members: [
          {
            userId: creatorUid,
            householdId: 'new-household-id',
            joinedAt: now,
            user: mockUser1,
          },
        ],
      };
      (prisma.household.create as jest.Mock).mockResolvedValue(newHousehold);
      (prisma.category.create as jest.Mock).mockResolvedValue({
        id: 'category-id',
        name: 'Test Category',
        householdId: 'new-household-id',
        createdAt: now,
        updatedAt: now,
      });
      (prisma.chore.create as jest.Mock).mockResolvedValue({
        id: 'chore-id',
        name: 'Test Chore',
        householdId: 'new-household-id',
        categoryId: 'category-id',
        points: 1,
        description: null,
        createdAt: now,
        updatedAt: now,
      });

      // Act
      const result = await service.create(mockCreateHouseholdDto, creatorUid);

      // Assert
      expect(result.createdAt).toEqual(result.updatedAt);
    });

    it('should handle database create errors', async () => {
      // Arrange
      const creatorUid = 'user-uid-1';
      const error = new Error('Database create failed');
      (prisma.household.create as jest.Mock).mockRejectedValue(error);

      // Act & Assert
      await expect(
        service.create(mockCreateHouseholdDto, creatorUid),
      ).rejects.toThrow(error);
    });
  });

  describe('update', () => {
    it('should update household and return updated data with populated memberDetails', async () => {
      // Arrange
      const householdId = 'household-id-123';
      const updatedHousehold = {
        ...mockHousehold,
        ...mockUpdateHouseholdDto,
        updatedAt: new Date(),
      };
      (prisma.household.update as jest.Mock).mockResolvedValue(
        updatedHousehold,
      );

      // Act
      const result = await service.update(householdId, mockUpdateHouseholdDto);

      // Assert
      expect(prisma.household.update).toHaveBeenCalledWith({
        where: { id: householdId },
        data: {
          name: mockUpdateHouseholdDto.name,
        },
        include: {
          members: {
            include: {
              user: true,
            },
          },
        },
      });
      expect(result.name).toBe(mockUpdateHouseholdDto.name);
      expect(result.memberDetails).toHaveLength(2);
    });

    it('should handle database update errors', async () => {
      // Arrange
      const householdId = 'household-id-123';
      const error = new Error('Database update failed');
      (prisma.household.update as jest.Mock).mockRejectedValue(error);

      // Act & Assert
      await expect(
        service.update(householdId, mockUpdateHouseholdDto),
      ).rejects.toThrow(error);
    });
  });

  describe('addMember', () => {
    it('should add new member to household with populated memberDetails', async () => {
      // Arrange
      const householdId = 'household-id-123';
      const updatedHousehold = {
        ...mockHousehold,
        members: [
          ...mockHousehold.members,
          {
            userId: 'user-uid-3',
            householdId,
            joinedAt: new Date(),
            user: mockUser3,
          },
        ],
      };
      (prisma.householdMember.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.householdMember.create as jest.Mock).mockResolvedValue({
        userId: mockAddMemberDto.userId,
        householdId,
        joinedAt: new Date(),
      });
      (prisma.household.findUnique as jest.Mock).mockResolvedValue(
        updatedHousehold,
      );

      // Act
      const result = await service.addMember(householdId, mockAddMemberDto);

      // Assert
      expect(prisma.householdMember.findUnique).toHaveBeenCalledWith({
        where: {
          userId_householdId: {
            userId: mockAddMemberDto.userId,
            householdId,
          },
        },
      });
      expect(prisma.householdMember.create).toHaveBeenCalledWith({
        data: {
          userId: mockAddMemberDto.userId,
          householdId,
        },
      });
      expect(result.memberDetails).toHaveLength(3);
    });

    it('should throw ConflictException when user is already a member', async () => {
      // Arrange
      const householdId = 'household-id-123';
      const existingMemberDto: AddMemberDto = {
        userId: 'user-uid-1',
      };
      (prisma.household.findUnique as jest.Mock).mockResolvedValue(
        mockHousehold,
      );
      (prisma.householdMember.findUnique as jest.Mock).mockResolvedValue({
        userId: 'user-uid-1',
        householdId,
        joinedAt: new Date(),
      });

      // Act & Assert
      await expect(
        service.addMember(householdId, existingMemberDto),
      ).rejects.toThrow(ConflictException);
      await expect(
        service.addMember(householdId, existingMemberDto),
      ).rejects.toThrow('User is already a member of this household');
      expect(prisma.householdMember.create).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when household does not exist', async () => {
      // Arrange
      const householdId = 'non-existent-id';
      (prisma.householdMember.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.householdMember.create as jest.Mock).mockResolvedValue({
        userId: mockAddMemberDto.userId,
        householdId,
        joinedAt: new Date(),
      });
      (prisma.household.findUnique as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.addMember(householdId, mockAddMemberDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should preserve existing members when adding new member', async () => {
      // Arrange
      const householdId = 'household-id-123';
      const updatedHousehold = {
        ...mockHousehold,
        members: [
          ...mockHousehold.members,
          {
            userId: 'user-uid-3',
            householdId,
            joinedAt: new Date(),
            user: mockUser3,
          },
        ],
      };
      (prisma.householdMember.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.householdMember.create as jest.Mock).mockResolvedValue({
        userId: mockAddMemberDto.userId,
        householdId,
        joinedAt: new Date(),
      });
      (prisma.household.findUnique as jest.Mock).mockResolvedValue(
        updatedHousehold,
      );

      // Act
      const result = await service.addMember(householdId, mockAddMemberDto);

      // Assert
      expect(result.memberDetails).toHaveLength(3);
      const userIds = result.memberDetails.map((m) => m.uid);
      expect(userIds).toContain('user-uid-1');
      expect(userIds).toContain('user-uid-2');
      expect(userIds).toContain('user-uid-3');
    });

    it('should handle database create errors', async () => {
      // Arrange
      const householdId = 'household-id-123';
      const error = new Error('Database create failed');
      (prisma.household.findUnique as jest.Mock).mockResolvedValue(
        mockHousehold,
      );
      (prisma.householdMember.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.householdMember.create as jest.Mock).mockRejectedValue(error);

      // Act & Assert
      await expect(
        service.addMember(householdId, mockAddMemberDto),
      ).rejects.toThrow(error);
    });
  });
});
