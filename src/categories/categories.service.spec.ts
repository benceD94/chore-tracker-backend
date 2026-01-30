import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService } from './categories.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let prisma: jest.Mocked<PrismaService>;

  const householdId = 'household-id-123';

  const mockCategory = {
    id: 'category-id-123',
    name: 'Cleaning',
    householdId,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15'),
  };

  const mockCreateCategoryDto: CreateCategoryDto = {
    name: 'Cooking',
  };

  const mockUpdateCategoryDto: UpdateCategoryDto = {
    name: 'Updated Cleaning',
  };

  beforeEach(async () => {
    const mockPrismaService = {
      category: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
    prisma = module.get(PrismaService);
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
      (prisma.category.findMany as jest.Mock).mockResolvedValue(categories);

      // Act
      const result = await service.findAll(householdId);

      // Assert
      expect(prisma.category.findMany).toHaveBeenCalledWith({
        where: { householdId },
        orderBy: { name: 'asc' },
      });
      expect(result).toHaveLength(3);
      expect(result[0]).toMatchObject({
        id: categories[0].id,
        name: categories[0].name,
      });
    });

    it('should return empty array when household has no categories', async () => {
      // Arrange
      (prisma.category.findMany as jest.Mock).mockResolvedValue([]);

      // Act
      const result = await service.findAll(householdId);

      // Assert
      expect(result).toEqual([]);
    });

    it('should handle database query errors', async () => {
      // Arrange
      const error = new Error('Database query failed');
      (prisma.category.findMany as jest.Mock).mockRejectedValue(error);

      // Act & Assert
      await expect(service.findAll(householdId)).rejects.toThrow(error);
    });
  });

  describe('findOne', () => {
    it('should return category when found', async () => {
      // Arrange
      const categoryId = 'category-id-123';
      (prisma.category.findFirst as jest.Mock).mockResolvedValue(mockCategory);

      // Act
      const result = await service.findOne(householdId, categoryId);

      // Assert
      expect(prisma.category.findFirst).toHaveBeenCalledWith({
        where: {
          id: categoryId,
          householdId,
        },
      });
      expect(result).toMatchObject(mockCategory);
    });

    it('should throw NotFoundException when category not found', async () => {
      // Arrange
      const categoryId = 'non-existent-id';
      (prisma.category.findFirst as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne(householdId, categoryId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOne(householdId, categoryId)).rejects.toThrow(
        `Category with ID ${categoryId} not found`,
      );
    });

    it('should handle database errors', async () => {
      // Arrange
      const categoryId = 'category-id-123';
      const error = new Error('Database error');
      (prisma.category.findFirst as jest.Mock).mockRejectedValue(error);

      // Act & Assert
      await expect(service.findOne(householdId, categoryId)).rejects.toThrow(
        error,
      );
    });
  });

  describe('create', () => {
    it('should create category with household ID', async () => {
      // Arrange
      const newCategory = {
        id: 'new-category-id',
        ...mockCreateCategoryDto,
        householdId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      (prisma.category.create as jest.Mock).mockResolvedValue(newCategory);

      // Act
      const result = await service.create(householdId, mockCreateCategoryDto);

      // Assert
      expect(prisma.category.create).toHaveBeenCalledWith({
        data: {
          householdId,
          name: mockCreateCategoryDto.name,
        },
      });
      expect(result).toMatchObject({
        id: newCategory.id,
        name: mockCreateCategoryDto.name,
        householdId,
      });
    });

    it('should set createdAt and updatedAt to same time', async () => {
      // Arrange
      const now = new Date();
      const newCategory = {
        id: 'new-category-id',
        ...mockCreateCategoryDto,
        householdId,
        createdAt: now,
        updatedAt: now,
      };
      (prisma.category.create as jest.Mock).mockResolvedValue(newCategory);

      // Act
      const result = await service.create(householdId, mockCreateCategoryDto);

      // Assert
      expect(result.createdAt).toEqual(result.updatedAt);
    });

    it('should handle database create errors', async () => {
      // Arrange
      const error = new Error('Database create failed');
      (prisma.category.create as jest.Mock).mockRejectedValue(error);

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
      const updatedCategory = {
        ...mockCategory,
        ...mockUpdateCategoryDto,
        updatedAt: new Date(),
      };
      (prisma.category.findFirst as jest.Mock).mockResolvedValue(mockCategory);
      (prisma.category.update as jest.Mock).mockResolvedValue(updatedCategory);

      // Act
      const result = await service.update(
        householdId,
        categoryId,
        mockUpdateCategoryDto,
      );

      // Assert
      expect(prisma.category.findFirst).toHaveBeenCalledWith({
        where: {
          id: categoryId,
          householdId,
        },
      });
      expect(prisma.category.update).toHaveBeenCalledWith({
        where: { id: categoryId },
        data: {
          name: mockUpdateCategoryDto.name,
        },
      });
      expect(result.name).toBe(mockUpdateCategoryDto.name);
    });

    it('should preserve fields not in update DTO', async () => {
      // Arrange
      const categoryId = 'category-id-123';
      const partialUpdateDto: UpdateCategoryDto = {
        name: 'New Name Only',
      };
      const updatedCategory = {
        ...mockCategory,
        name: 'New Name Only',
        updatedAt: new Date(),
      };
      (prisma.category.findFirst as jest.Mock).mockResolvedValue(mockCategory);
      (prisma.category.update as jest.Mock).mockResolvedValue(updatedCategory);

      // Act
      const result = await service.update(
        householdId,
        categoryId,
        partialUpdateDto,
      );

      // Assert
      expect(result.id).toBe(mockCategory.id);
      expect(result.householdId).toBe(mockCategory.householdId);
      expect(result.name).toBe('New Name Only');
    });

    it('should throw NotFoundException when category does not exist', async () => {
      // Arrange
      const categoryId = 'non-existent-id';
      (prisma.category.findFirst as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.update(householdId, categoryId, mockUpdateCategoryDto),
      ).rejects.toThrow(NotFoundException);
      expect(prisma.category.update).not.toHaveBeenCalled();
    });

    it('should handle database update errors', async () => {
      // Arrange
      const categoryId = 'category-id-123';
      const error = new Error('Database update failed');
      (prisma.category.findFirst as jest.Mock).mockResolvedValue(mockCategory);
      (prisma.category.update as jest.Mock).mockRejectedValue(error);

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
      (prisma.category.findFirst as jest.Mock).mockResolvedValue(mockCategory);
      (prisma.category.delete as jest.Mock).mockResolvedValue(mockCategory);

      // Act
      await service.remove(householdId, categoryId);

      // Assert
      expect(prisma.category.findFirst).toHaveBeenCalledWith({
        where: {
          id: categoryId,
          householdId,
        },
      });
      expect(prisma.category.delete).toHaveBeenCalledWith({
        where: { id: categoryId },
      });
    });

    it('should throw NotFoundException when category does not exist', async () => {
      // Arrange
      const categoryId = 'non-existent-id';
      (prisma.category.findFirst as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(service.remove(householdId, categoryId)).rejects.toThrow(
        NotFoundException,
      );
      expect(prisma.category.delete).not.toHaveBeenCalled();
    });

    it('should handle database delete errors', async () => {
      // Arrange
      const categoryId = 'category-id-123';
      const error = new Error('Database delete failed');
      (prisma.category.findFirst as jest.Mock).mockResolvedValue(mockCategory);
      (prisma.category.delete as jest.Mock).mockRejectedValue(error);

      // Act & Assert
      await expect(service.remove(householdId, categoryId)).rejects.toThrow(
        error,
      );
    });

    it('should verify category exists before attempting delete', async () => {
      // Arrange
      const categoryId = 'category-id-123';
      (prisma.category.findFirst as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(service.remove(householdId, categoryId)).rejects.toThrow(
        NotFoundException,
      );
      expect(prisma.category.findFirst).toHaveBeenCalled();
      expect(prisma.category.delete).not.toHaveBeenCalled();
    });
  });
});
