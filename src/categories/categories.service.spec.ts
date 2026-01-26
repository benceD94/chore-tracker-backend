import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService } from './categories.service';
import { FirebaseService } from '../firebase/firebase.service';
import { NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let firebaseService: jest.Mocked<FirebaseService>;

  const householdId = 'household-id-123';

  const mockCategory = {
    id: 'category-id-123',
    name: 'Cleaning',
    icon: '🧹',
    color: '#FF5733',
    householdId,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15'),
  };

  const mockCreateCategoryDto: CreateCategoryDto = {
    name: 'Cooking',
    icon: '🍳',
    color: '#33FF57',
  };

  const mockUpdateCategoryDto: UpdateCategoryDto = {
    name: 'Updated Cleaning',
    color: '#5733FF',
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
        CategoriesService,
        {
          provide: FirebaseService,
          useValue: mockFirebaseService,
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
    firebaseService = module.get(FirebaseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all categories for a household ordered by name', async () => {
      // Arrange
      const categories = [
        mockCategory,
        { ...mockCategory, id: 'category-id-456', name: 'Cooking' },
        { ...mockCategory, id: 'category-id-789', name: 'Laundry' },
      ];
      firebaseService.queryDocuments.mockResolvedValue(categories);

      // Act
      const result = await service.findAll(householdId);

      // Assert
      expect(firebaseService.queryDocuments).toHaveBeenCalledWith(
        `households/${householdId}/categories`,
        expect.any(Function),
      );
      expect(result).toEqual(categories);
      expect(result).toHaveLength(3);
    });

    it('should return empty array when household has no categories', async () => {
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
    it('should return category when found', async () => {
      // Arrange
      const categoryId = 'category-id-123';
      firebaseService.getDocument.mockResolvedValue(mockCategory);

      // Act
      const result = await service.findOne(householdId, categoryId);

      // Assert
      expect(firebaseService.getDocument).toHaveBeenCalledWith(
        `households/${householdId}/categories/${categoryId}`,
      );
      expect(result).toEqual(mockCategory);
    });

    it('should throw NotFoundException when category not found', async () => {
      // Arrange
      const categoryId = 'non-existent-id';
      firebaseService.getDocument.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne(householdId, categoryId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOne(householdId, categoryId)).rejects.toThrow(
        `Category with ID ${categoryId} not found`,
      );
    });

    it('should handle Firebase get errors', async () => {
      // Arrange
      const categoryId = 'category-id-123';
      const error = new Error('Firebase get failed');
      firebaseService.getDocument.mockRejectedValue(error);

      // Act & Assert
      await expect(service.findOne(householdId, categoryId)).rejects.toThrow(
        error,
      );
    });
  });

  describe('create', () => {
    it('should create category with household ID', async () => {
      // Arrange
      const newCategoryId = 'new-category-id';
      firebaseService.createDocument.mockResolvedValue(newCategoryId);

      // Act
      const result = await service.create(householdId, mockCreateCategoryDto);

      // Assert
      expect(firebaseService.createDocument).toHaveBeenCalledWith(
        `households/${householdId}/categories`,
        expect.objectContaining({
          name: mockCreateCategoryDto.name,
          icon: mockCreateCategoryDto.icon,
          color: mockCreateCategoryDto.color,
          householdId,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        }),
      );
      expect(result).toEqual({
        id: newCategoryId,
        ...mockCreateCategoryDto,
        householdId,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });

    it('should set createdAt and updatedAt to same time', async () => {
      // Arrange
      const newCategoryId = 'new-category-id';
      firebaseService.createDocument.mockResolvedValue(newCategoryId);

      // Act
      const result = await service.create(householdId, mockCreateCategoryDto);

      // Assert
      expect(result.createdAt).toEqual(result.updatedAt);
    });

    it('should handle Firebase create errors', async () => {
      // Arrange
      const error = new Error('Firebase create failed');
      firebaseService.createDocument.mockRejectedValue(error);

      // Act & Assert
      await expect(
        service.create(householdId, mockCreateCategoryDto),
      ).rejects.toThrow(error);
    });
  });

  describe('update', () => {
    it('should update category and return updated data', async () => {
      // Arrange
      const categoryId = 'category-id-123';
      firebaseService.getDocument.mockResolvedValue(mockCategory);
      firebaseService.updateDocument.mockResolvedValue(undefined);

      // Act
      const result = await service.update(
        householdId,
        categoryId,
        mockUpdateCategoryDto,
      );

      // Assert
      expect(firebaseService.getDocument).toHaveBeenCalledWith(
        `households/${householdId}/categories/${categoryId}`,
      );
      expect(firebaseService.updateDocument).toHaveBeenCalledWith(
        `households/${householdId}/categories/${categoryId}`,
        expect.objectContaining({
          name: mockUpdateCategoryDto.name,
          color: mockUpdateCategoryDto.color,
          updatedAt: expect.any(Date),
        }),
      );
      expect(result).toEqual({
        ...mockCategory,
        ...mockUpdateCategoryDto,
        updatedAt: expect.any(Date),
      });
    });

    it('should preserve fields not in update DTO', async () => {
      // Arrange
      const categoryId = 'category-id-123';
      const partialUpdateDto: UpdateCategoryDto = {
        name: 'New Name Only',
      };
      firebaseService.getDocument.mockResolvedValue(mockCategory);
      firebaseService.updateDocument.mockResolvedValue(undefined);

      // Act
      const result = await service.update(
        householdId,
        categoryId,
        partialUpdateDto,
      );

      // Assert
      expect(result.icon).toBe(mockCategory.icon);
      expect(result.color).toBe(mockCategory.color);
      expect(result.name).toBe('New Name Only');
    });

    it('should throw NotFoundException when category does not exist', async () => {
      // Arrange
      const categoryId = 'non-existent-id';
      firebaseService.getDocument.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.update(householdId, categoryId, mockUpdateCategoryDto),
      ).rejects.toThrow(NotFoundException);
      expect(firebaseService.updateDocument).not.toHaveBeenCalled();
    });

    it('should handle Firebase update errors', async () => {
      // Arrange
      const categoryId = 'category-id-123';
      const error = new Error('Firebase update failed');
      firebaseService.getDocument.mockResolvedValue(mockCategory);
      firebaseService.updateDocument.mockRejectedValue(error);

      // Act & Assert
      await expect(
        service.update(householdId, categoryId, mockUpdateCategoryDto),
      ).rejects.toThrow(error);
    });
  });

  describe('remove', () => {
    it('should delete category after verifying it exists', async () => {
      // Arrange
      const categoryId = 'category-id-123';
      firebaseService.getDocument.mockResolvedValue(mockCategory);
      firebaseService.deleteDocument.mockResolvedValue(undefined);

      // Act
      await service.remove(householdId, categoryId);

      // Assert
      expect(firebaseService.getDocument).toHaveBeenCalledWith(
        `households/${householdId}/categories/${categoryId}`,
      );
      expect(firebaseService.deleteDocument).toHaveBeenCalledWith(
        `households/${householdId}/categories/${categoryId}`,
      );
    });

    it('should throw NotFoundException when category does not exist', async () => {
      // Arrange
      const categoryId = 'non-existent-id';
      firebaseService.getDocument.mockResolvedValue(null);

      // Act & Assert
      await expect(service.remove(householdId, categoryId)).rejects.toThrow(
        NotFoundException,
      );
      expect(firebaseService.deleteDocument).not.toHaveBeenCalled();
    });

    it('should handle Firebase delete errors', async () => {
      // Arrange
      const categoryId = 'category-id-123';
      const error = new Error('Firebase delete failed');
      firebaseService.getDocument.mockResolvedValue(mockCategory);
      firebaseService.deleteDocument.mockRejectedValue(error);

      // Act & Assert
      await expect(service.remove(householdId, categoryId)).rejects.toThrow(
        error,
      );
    });

    it('should verify category exists before attempting delete', async () => {
      // Arrange
      const categoryId = 'category-id-123';
      firebaseService.getDocument.mockResolvedValue(null);

      // Act & Assert
      await expect(service.remove(householdId, categoryId)).rejects.toThrow(
        NotFoundException,
      );
      expect(firebaseService.getDocument).toHaveBeenCalled();
      expect(firebaseService.deleteDocument).not.toHaveBeenCalled();
    });
  });
});
