import { Test, TestingModule } from '@nestjs/testing';
import { HouseholdsService } from './households.service';
import { FirebaseService } from '../firebase/firebase.service';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { CreateHouseholdDto } from './dto/create-household.dto';
import { UpdateHouseholdDto } from './dto/update-household.dto';
import { AddMemberDto } from './dto/add-member.dto';

describe('HouseholdsService', () => {
  let service: HouseholdsService;
  let firebaseService: jest.Mocked<FirebaseService>;

  const mockHousehold = {
    id: 'household-id-123',
    name: 'Test Household',
    members: ['user-uid-1', 'user-uid-2'],
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

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HouseholdsService,
        {
          provide: FirebaseService,
          useValue: mockFirebaseService,
        },
      ],
    }).compile();

    service = module.get<HouseholdsService>(HouseholdsService);
    firebaseService = module.get(FirebaseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAllByUser', () => {
    it('should return all households where user is a member', async () => {
      // Arrange
      const userUid = 'user-uid-1';
      const households = [
        mockHousehold,
        { ...mockHousehold, id: 'household-id-456', name: 'Another Household' },
      ];
      firebaseService.queryDocuments.mockResolvedValue(households);

      // Act
      const result = await service.findAllByUser(userUid);

      // Assert
      expect(firebaseService.queryDocuments).toHaveBeenCalledWith(
        'households',
        expect.any(Function),
      );
      expect(result).toEqual(households);
      expect(result).toHaveLength(2);
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
    it('should return household when found', async () => {
      // Arrange
      const householdId = 'household-id-123';
      firebaseService.getDocument.mockResolvedValue(mockHousehold);

      // Act
      const result = await service.findOne(householdId);

      // Assert
      expect(firebaseService.getDocument).toHaveBeenCalledWith(
        `households/${householdId}`,
      );
      expect(result).toEqual(mockHousehold);
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
    it('should create household with creator as first member', async () => {
      // Arrange
      const creatorUid = 'user-uid-1';
      const newHouseholdId = 'new-household-id';
      firebaseService.createDocument.mockResolvedValue(newHouseholdId);

      // Act
      const result = await service.create(mockCreateHouseholdDto, creatorUid);

      // Assert
      expect(firebaseService.createDocument).toHaveBeenCalledWith(
        'households',
        expect.objectContaining({
          name: mockCreateHouseholdDto.name,
          members: [creatorUid],
          createdBy: creatorUid,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        }),
      );
      expect(result).toEqual({
        id: newHouseholdId,
        name: mockCreateHouseholdDto.name,
        members: [creatorUid],
        createdBy: creatorUid,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });

    it('should set createdAt and updatedAt to same time', async () => {
      // Arrange
      const creatorUid = 'user-uid-1';
      const newHouseholdId = 'new-household-id';
      firebaseService.createDocument.mockResolvedValue(newHouseholdId);

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
    it('should update household and return updated data', async () => {
      // Arrange
      const householdId = 'household-id-123';
      firebaseService.getDocument.mockResolvedValue(mockHousehold);
      firebaseService.updateDocument.mockResolvedValue(undefined);

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
      expect(result).toEqual({
        ...mockHousehold,
        ...mockUpdateHouseholdDto,
        updatedAt: expect.any(Date),
      });
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

      // Act & Assert
      await expect(
        service.update(householdId, mockUpdateHouseholdDto),
      ).rejects.toThrow(error);
    });
  });

  describe('addMember', () => {
    it('should add new member to household', async () => {
      // Arrange
      const householdId = 'household-id-123';
      firebaseService.getDocument.mockResolvedValue(mockHousehold);
      firebaseService.updateDocument.mockResolvedValue(undefined);

      // Act
      const result = await service.addMember(householdId, mockAddMemberDto);

      // Assert
      expect(firebaseService.getDocument).toHaveBeenCalledWith(
        `households/${householdId}`,
      );
      expect(firebaseService.updateDocument).toHaveBeenCalledWith(
        `households/${householdId}`,
        expect.objectContaining({
          members: [...mockHousehold.members, mockAddMemberDto.userId],
          updatedAt: expect.any(Date),
        }),
      );
      expect(result.members).toContain(mockAddMemberDto.userId);
      expect(result.members).toHaveLength(3);
    });

    it('should throw ConflictException when user is already a member', async () => {
      // Arrange
      const householdId = 'household-id-123';
      const existingMemberDto: AddMemberDto = {
        userId: 'user-uid-1', // Already in mockHousehold.members
      };
      firebaseService.getDocument.mockResolvedValue(mockHousehold);

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

      // Act
      const result = await service.addMember(householdId, mockAddMemberDto);

      // Assert
      expect(result.members).toContain('user-uid-1');
      expect(result.members).toContain('user-uid-2');
      expect(result.members).toContain('user-uid-3');
    });

    it('should handle Firebase update errors', async () => {
      // Arrange
      const householdId = 'household-id-123';
      const error = new Error('Firebase update failed');
      firebaseService.getDocument.mockResolvedValue(mockHousehold);
      firebaseService.updateDocument.mockRejectedValue(error);

      // Act & Assert
      await expect(
        service.addMember(householdId, mockAddMemberDto),
      ).rejects.toThrow(error);
    });
  });
});
