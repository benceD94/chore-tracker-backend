import { Test, TestingModule } from '@nestjs/testing';
import { ChoresService } from './chores.service';
import { FirebaseService } from '../firebase/firebase.service';
import { NotFoundException } from '@nestjs/common';
import { CreateChoreDto } from './dto/create-chore.dto';
import { UpdateChoreDto } from './dto/update-chore.dto';

describe('ChoresService', () => {
  let service: ChoresService;
  let firebaseService: jest.Mocked<FirebaseService>;

  const householdId = 'household-id-123';

  const mockChore = {
    id: 'chore-id-123',
    name: 'Wash Dishes',
    description: 'Wash and dry all dishes',
    categoryId: 'category-id-123',
    assignedTo: ['user-uid-1'],
    frequency: 'daily',
    points: 10,
    householdId,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15'),
  };

  const mockCreateChoreDto: CreateChoreDto = {
    name: 'Vacuum Living Room',
    description: 'Vacuum the entire living room',
    categoryId: 'category-id-456',
    assignedTo: ['user-uid-2'],
    frequency: 'weekly',
    points: 15,
  };

  const mockUpdateChoreDto: UpdateChoreDto = {
    name: 'Wash All Dishes',
    points: 12,
  };

  beforeEach(async () => {
    const mockFirebaseService = {
      queryDocuments: jest.fn(),
      getDocument: jest.fn(),
      createDocument: jest.fn(),
      updateDocument: jest.fn(),
      deleteDocument: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChoresService,
        {
          provide: FirebaseService,
          useValue: mockFirebaseService,
        },
      ],
    }).compile();

    service = module.get<ChoresService>(ChoresService);
    firebaseService = module.get(FirebaseService);
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
      firebaseService.queryDocuments.mockResolvedValue(chores);

      // Act
      const result = await service.findAll(householdId);

      // Assert
      expect(firebaseService.queryDocuments).toHaveBeenCalledWith(
        `households/${householdId}/chores`,
        expect.any(Function),
      );
      expect(result).toEqual(chores);
      expect(result).toHaveLength(3);
    });

    it('should return empty array when household has no chores', async () => {
      // Arrange
      firebaseService.queryDocuments.mockResolvedValue([]);

      // Act
      const result = await service.findAll(householdId);

      // Assert
      expect(result).toEqual([]);
    });

    it('should handle Firebase query errors', async () => {
      // Arrange
      const error = new Error('Firebase query failed');
      firebaseService.queryDocuments.mockRejectedValue(error);

      // Act & Assert
      await expect(service.findAll(householdId)).rejects.toThrow(error);
    });
  });

  describe('findOne', () => {
    it('should return chore when found', async () => {
      // Arrange
      const choreId = 'chore-id-123';
      firebaseService.getDocument.mockResolvedValue(mockChore);

      // Act
      const result = await service.findOne(householdId, choreId);

      // Assert
      expect(firebaseService.getDocument).toHaveBeenCalledWith(
        `households/${householdId}/chores/${choreId}`,
      );
      expect(result).toEqual(mockChore);
    });

    it('should throw NotFoundException when chore not found', async () => {
      // Arrange
      const choreId = 'non-existent-id';
      firebaseService.getDocument.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne(householdId, choreId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOne(householdId, choreId)).rejects.toThrow(
        `Chore with ID ${choreId} not found`,
      );
    });

    it('should handle Firebase get errors', async () => {
      // Arrange
      const choreId = 'chore-id-123';
      const error = new Error('Firebase get failed');
      firebaseService.getDocument.mockRejectedValue(error);

      // Act & Assert
      await expect(service.findOne(householdId, choreId)).rejects.toThrow(
        error,
      );
    });
  });

  describe('create', () => {
    it('should create chore with household ID', async () => {
      // Arrange
      const newChoreId = 'new-chore-id';
      firebaseService.createDocument.mockResolvedValue(newChoreId);

      // Act
      const result = await service.create(householdId, mockCreateChoreDto);

      // Assert
      expect(firebaseService.createDocument).toHaveBeenCalledWith(
        `households/${householdId}/chores`,
        expect.objectContaining({
          name: mockCreateChoreDto.name,
          description: mockCreateChoreDto.description,
          categoryId: mockCreateChoreDto.categoryId,
          assignedTo: mockCreateChoreDto.assignedTo,
          frequency: mockCreateChoreDto.frequency,
          points: mockCreateChoreDto.points,
          householdId,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        }),
      );
      expect(result).toEqual({
        id: newChoreId,
        ...mockCreateChoreDto,
        householdId,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });

    it('should set createdAt and updatedAt to same time', async () => {
      // Arrange
      const newChoreId = 'new-chore-id';
      firebaseService.createDocument.mockResolvedValue(newChoreId);

      // Act
      const result = await service.create(householdId, mockCreateChoreDto);

      // Assert
      expect(result.createdAt).toEqual(result.updatedAt);
    });

    it('should handle Firebase create errors', async () => {
      // Arrange
      const error = new Error('Firebase create failed');
      firebaseService.createDocument.mockRejectedValue(error);

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
      firebaseService.getDocument.mockResolvedValue(mockChore);
      firebaseService.updateDocument.mockResolvedValue(undefined);

      // Act
      const result = await service.update(
        householdId,
        choreId,
        mockUpdateChoreDto,
      );

      // Assert
      expect(firebaseService.getDocument).toHaveBeenCalledWith(
        `households/${householdId}/chores/${choreId}`,
      );
      expect(firebaseService.updateDocument).toHaveBeenCalledWith(
        `households/${householdId}/chores/${choreId}`,
        expect.objectContaining({
          name: mockUpdateChoreDto.name,
          points: mockUpdateChoreDto.points,
          updatedAt: expect.any(Date),
        }),
      );
      expect(result).toEqual({
        ...mockChore,
        ...mockUpdateChoreDto,
        updatedAt: expect.any(Date),
      });
    });

    it('should preserve fields not in update DTO', async () => {
      // Arrange
      const choreId = 'chore-id-123';
      const partialUpdateDto: UpdateChoreDto = {
        points: 20,
      };
      firebaseService.getDocument.mockResolvedValue(mockChore);
      firebaseService.updateDocument.mockResolvedValue(undefined);

      // Act
      const result = await service.update(
        householdId,
        choreId,
        partialUpdateDto,
      );

      // Assert
      expect(result.name).toBe(mockChore.name);
      expect(result.description).toBe(mockChore.description);
      expect(result.categoryId).toBe(mockChore.categoryId);
      expect(result.points).toBe(20);
    });

    it('should throw NotFoundException when chore does not exist', async () => {
      // Arrange
      const choreId = 'non-existent-id';
      firebaseService.getDocument.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.update(householdId, choreId, mockUpdateChoreDto),
      ).rejects.toThrow(NotFoundException);
      expect(firebaseService.updateDocument).not.toHaveBeenCalled();
    });

    it('should handle Firebase update errors', async () => {
      // Arrange
      const choreId = 'chore-id-123';
      const error = new Error('Firebase update failed');
      firebaseService.getDocument.mockResolvedValue(mockChore);
      firebaseService.updateDocument.mockRejectedValue(error);

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
      firebaseService.getDocument.mockResolvedValue(mockChore);
      firebaseService.deleteDocument.mockResolvedValue(undefined);

      // Act
      await service.remove(householdId, choreId);

      // Assert
      expect(firebaseService.getDocument).toHaveBeenCalledWith(
        `households/${householdId}/chores/${choreId}`,
      );
      expect(firebaseService.deleteDocument).toHaveBeenCalledWith(
        `households/${householdId}/chores/${choreId}`,
      );
    });

    it('should throw NotFoundException when chore does not exist', async () => {
      // Arrange
      const choreId = 'non-existent-id';
      firebaseService.getDocument.mockResolvedValue(null);

      // Act & Assert
      await expect(service.remove(householdId, choreId)).rejects.toThrow(
        NotFoundException,
      );
      expect(firebaseService.deleteDocument).not.toHaveBeenCalled();
    });

    it('should handle Firebase delete errors', async () => {
      // Arrange
      const choreId = 'chore-id-123';
      const error = new Error('Firebase delete failed');
      firebaseService.getDocument.mockResolvedValue(mockChore);
      firebaseService.deleteDocument.mockRejectedValue(error);

      // Act & Assert
      await expect(service.remove(householdId, choreId)).rejects.toThrow(
        error,
      );
    });

    it('should verify chore exists before attempting delete', async () => {
      // Arrange
      const choreId = 'chore-id-123';
      firebaseService.getDocument.mockResolvedValue(null);

      // Act & Assert
      await expect(service.remove(householdId, choreId)).rejects.toThrow(
        NotFoundException,
      );
      expect(firebaseService.getDocument).toHaveBeenCalled();
      expect(firebaseService.deleteDocument).not.toHaveBeenCalled();
    });
  });
});
