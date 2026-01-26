import { Test, TestingModule } from '@nestjs/testing';
import { HouseholdsService } from './households.service';
import { FirebaseService } from '../firebase/firebase.service';
import { UsersService } from '../users/users.service';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { CreateHouseholdDto } from './dto/create-household.dto';
import { UpdateHouseholdDto } from './dto/update-household.dto';
import { AddMemberDto } from './dto/add-member.dto';

describe('HouseholdsService', () => {
  let service: HouseholdsService;
  let firebaseService: jest.Mocked<FirebaseService>;
  let usersService: jest.Mocked<UsersService>;

  const mockUser1 = {
    id: 'user-doc-id-1',
    uid: 'user-uid-1',
    email: 'user1@example.com',
    displayName: 'User One',
    photoURL: 'https://example.com/photo1.jpg',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const mockUser2 = {
    id: 'user-doc-id-2',
    uid: 'user-uid-2',
    email: 'user2@example.com',
    displayName: 'User Two',
    photoURL: 'https://example.com/photo2.jpg',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const mockUser3 = {
    id: 'user-doc-id-3',
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
    memberIds: ['user-uid-1', 'user-uid-2'],
    createdBy: 'user-uid-1',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15'),
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
    const mockFirebaseService = {
      queryDocuments: jest.fn(),
      getDocument: jest.fn(),
      createDocument: jest.fn(),
      updateDocument: jest.fn(),
    };

    const mockUsersService = {
      findByUid: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HouseholdsService,
        {
          provide: FirebaseService,
          useValue: mockFirebaseService,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    service = module.get<HouseholdsService>(HouseholdsService);
    firebaseService = module.get(FirebaseService);
    usersService = module.get(UsersService);
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
        { ...mockHousehold, id: 'household-id-456', name: 'Another Household' },
      ];
      firebaseService.queryDocuments.mockResolvedValue(households);
      usersService.findByUid.mockImplementation((uid: string) => {
        if (uid === 'user-uid-1') return Promise.resolve(mockUser1);
        if (uid === 'user-uid-2') return Promise.resolve(mockUser2);
        return Promise.reject(new NotFoundException());
      });

      // Act
      const result = await service.findAllByUser(userUid);

      // Assert
      expect(firebaseService.queryDocuments).toHaveBeenCalledWith(
        'households',
        expect.any(Function),
      );
      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('memberDetails');
      expect(result[0].memberDetails).toEqual([mockUser1, mockUser2]);
      expect(result[1]).toHaveProperty('memberDetails');
      expect(result[1].memberDetails).toEqual([mockUser1, mockUser2]);
    });

    it('should return empty array when user has no households', async () => {
      // Arrange
      const userUid = 'user-uid-without-households';
      firebaseService.queryDocuments.mockResolvedValue([]);

      // Act
      const result = await service.findAllByUser(userUid);

      // Assert
      expect(result).toEqual([]);
    });

    it('should handle missing users gracefully by filtering them out', async () => {
      // Arrange
      const userUid = 'user-uid-1';
      const households = [mockHousehold];
      firebaseService.queryDocuments.mockResolvedValue(households);
      usersService.findByUid.mockImplementation((uid: string) => {
        if (uid === 'user-uid-1') return Promise.resolve(mockUser1);
        // user-uid-2 not found
        return Promise.reject(new NotFoundException());
      });

      // Act
      const result = await service.findAllByUser(userUid);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].memberDetails).toEqual([mockUser1]);
    });

    it('should handle Firebase query errors', async () => {
      // Arrange
      const userUid = 'user-uid-1';
      const error = new Error('Firebase query failed');
      firebaseService.queryDocuments.mockRejectedValue(error);

      // Act & Assert
      await expect(service.findAllByUser(userUid)).rejects.toThrow(error);
    });
  });

  describe('findOne', () => {
    it('should return household when found with populated memberDetails', async () => {
      // Arrange
      const householdId = 'household-id-123';
      firebaseService.getDocument.mockResolvedValue(mockHousehold);
      usersService.findByUid.mockImplementation((uid: string) => {
        if (uid === 'user-uid-1') return Promise.resolve(mockUser1);
        if (uid === 'user-uid-2') return Promise.resolve(mockUser2);
        return Promise.reject(new NotFoundException());
      });

      // Act
      const result = await service.findOne(householdId);

      // Assert
      expect(firebaseService.getDocument).toHaveBeenCalledWith(
        `households/${householdId}`,
      );
      expect(result).toHaveProperty('memberDetails');
      expect(result.memberDetails).toEqual([mockUser1, mockUser2]);
    });

    it('should throw NotFoundException when household not found', async () => {
      // Arrange
      const householdId = 'non-existent-id';
      firebaseService.getDocument.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne(householdId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOne(householdId)).rejects.toThrow(
        `Household with ID ${householdId} not found`,
      );
    });

    it('should handle Firebase get errors', async () => {
      // Arrange
      const householdId = 'household-id-123';
      const error = new Error('Firebase get failed');
      firebaseService.getDocument.mockRejectedValue(error);

      // Act & Assert
      await expect(service.findOne(householdId)).rejects.toThrow(error);
    });
  });

  describe('create', () => {
    it('should create household with creator as first member and populated memberDetails', async () => {
      // Arrange
      const creatorUid = 'user-uid-1';
      const newHouseholdId = 'new-household-id';
      firebaseService.createDocument.mockResolvedValue(newHouseholdId);
      usersService.findByUid.mockResolvedValue(mockUser1);

      // Act
      const result = await service.create(mockCreateHouseholdDto, creatorUid);

      // Assert
      expect(firebaseService.createDocument).toHaveBeenCalledWith(
        'households',
        expect.objectContaining({
          name: mockCreateHouseholdDto.name,
          memberIds: [creatorUid],
          createdBy: creatorUid,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        }),
      );
      expect(result).toEqual({
        id: newHouseholdId,
        name: mockCreateHouseholdDto.name,
        memberIds: [creatorUid],
        createdBy: creatorUid,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        memberDetails: [mockUser1],
      });
    });

    it('should set createdAt and updatedAt to same time', async () => {
      // Arrange
      const creatorUid = 'user-uid-1';
      const newHouseholdId = 'new-household-id';
      firebaseService.createDocument.mockResolvedValue(newHouseholdId);
      usersService.findByUid.mockResolvedValue(mockUser1);

      // Act
      const result = await service.create(mockCreateHouseholdDto, creatorUid);

      // Assert
      expect(result.createdAt).toEqual(result.updatedAt);
    });

    it('should handle Firebase create errors', async () => {
      // Arrange
      const creatorUid = 'user-uid-1';
      const error = new Error('Firebase create failed');
      firebaseService.createDocument.mockRejectedValue(error);

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
      firebaseService.getDocument.mockResolvedValue(mockHousehold);
      firebaseService.updateDocument.mockResolvedValue(undefined);
      usersService.findByUid.mockImplementation((uid: string) => {
        if (uid === 'user-uid-1') return Promise.resolve(mockUser1);
        if (uid === 'user-uid-2') return Promise.resolve(mockUser2);
        return Promise.reject(new NotFoundException());
      });

      // Act
      const result = await service.update(householdId, mockUpdateHouseholdDto);

      // Assert
      expect(firebaseService.getDocument).toHaveBeenCalledWith(
        `households/${householdId}`,
      );
      expect(firebaseService.updateDocument).toHaveBeenCalledWith(
        `households/${householdId}`,
        expect.objectContaining({
          name: mockUpdateHouseholdDto.name,
          updatedAt: expect.any(Date),
        }),
      );
      expect(result).toMatchObject({
        ...mockHousehold,
        ...mockUpdateHouseholdDto,
        updatedAt: expect.any(Date),
      });
      expect(result.memberDetails).toEqual([mockUser1, mockUser2]);
    });

    it('should throw NotFoundException when household does not exist', async () => {
      // Arrange
      const householdId = 'non-existent-id';
      firebaseService.getDocument.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.update(householdId, mockUpdateHouseholdDto),
      ).rejects.toThrow(NotFoundException);
      expect(firebaseService.updateDocument).not.toHaveBeenCalled();
    });

    it('should handle Firebase update errors', async () => {
      // Arrange
      const householdId = 'household-id-123';
      const error = new Error('Firebase update failed');
      firebaseService.getDocument.mockResolvedValue(mockHousehold);
      firebaseService.updateDocument.mockRejectedValue(error);
      usersService.findByUid.mockImplementation((uid: string) => {
        if (uid === 'user-uid-1') return Promise.resolve(mockUser1);
        if (uid === 'user-uid-2') return Promise.resolve(mockUser2);
        return Promise.reject(new NotFoundException());
      });

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
      firebaseService.getDocument.mockResolvedValue(mockHousehold);
      firebaseService.updateDocument.mockResolvedValue(undefined);
      usersService.findByUid.mockImplementation((uid: string) => {
        if (uid === 'user-uid-1') return Promise.resolve(mockUser1);
        if (uid === 'user-uid-2') return Promise.resolve(mockUser2);
        if (uid === 'user-uid-3') return Promise.resolve(mockUser3);
        return Promise.reject(new NotFoundException());
      });

      // Act
      const result = await service.addMember(householdId, mockAddMemberDto);

      // Assert
      expect(firebaseService.getDocument).toHaveBeenCalledWith(
        `households/${householdId}`,
      );
      expect(firebaseService.updateDocument).toHaveBeenCalledWith(
        `households/${householdId}`,
        expect.objectContaining({
          memberIds: [...mockHousehold.memberIds, mockAddMemberDto.userId],
          updatedAt: expect.any(Date),
        }),
      );
      expect(result.memberIds).toContain(mockAddMemberDto.userId);
      expect(result.memberIds).toHaveLength(3);
      expect(result.memberDetails).toEqual([mockUser1, mockUser2, mockUser3]);
    });

    it('should throw ConflictException when user is already a member', async () => {
      // Arrange
      const householdId = 'household-id-123';
      const existingMemberDto: AddMemberDto = {
        userId: 'user-uid-1', // Already in mockHousehold.members
      };
      firebaseService.getDocument.mockResolvedValue(mockHousehold);
      usersService.findByUid.mockImplementation((uid: string) => {
        if (uid === 'user-uid-1') return Promise.resolve(mockUser1);
        if (uid === 'user-uid-2') return Promise.resolve(mockUser2);
        return Promise.reject(new NotFoundException());
      });

      // Act & Assert
      await expect(
        service.addMember(householdId, existingMemberDto),
      ).rejects.toThrow(ConflictException);
      await expect(
        service.addMember(householdId, existingMemberDto),
      ).rejects.toThrow('User is already a member of this household');
      expect(firebaseService.updateDocument).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when household does not exist', async () => {
      // Arrange
      const householdId = 'non-existent-id';
      firebaseService.getDocument.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.addMember(householdId, mockAddMemberDto),
      ).rejects.toThrow(NotFoundException);
      expect(firebaseService.updateDocument).not.toHaveBeenCalled();
    });

    it('should preserve existing members when adding new member', async () => {
      // Arrange
      const householdId = 'household-id-123';
      firebaseService.getDocument.mockResolvedValue(mockHousehold);
      firebaseService.updateDocument.mockResolvedValue(undefined);
      usersService.findByUid.mockImplementation((uid: string) => {
        if (uid === 'user-uid-1') return Promise.resolve(mockUser1);
        if (uid === 'user-uid-2') return Promise.resolve(mockUser2);
        if (uid === 'user-uid-3') return Promise.resolve(mockUser3);
        return Promise.reject(new NotFoundException());
      });

      // Act
      const result = await service.addMember(householdId, mockAddMemberDto);

      // Assert
      expect(result.memberIds).toContain('user-uid-1');
      expect(result.memberIds).toContain('user-uid-2');
      expect(result.memberIds).toContain('user-uid-3');
    });

    it('should handle Firebase update errors', async () => {
      // Arrange
      const householdId = 'household-id-123';
      const error = new Error('Firebase update failed');
      firebaseService.getDocument.mockResolvedValue(mockHousehold);
      firebaseService.updateDocument.mockRejectedValue(error);
      usersService.findByUid.mockImplementation((uid: string) => {
        if (uid === 'user-uid-1') return Promise.resolve(mockUser1);
        if (uid === 'user-uid-2') return Promise.resolve(mockUser2);
        return Promise.reject(new NotFoundException());
      });

      // Act & Assert
      await expect(
        service.addMember(householdId, mockAddMemberDto),
      ).rejects.toThrow(error);
    });
  });
});
