import { Injectable, NotFoundException } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryResponseDto } from './dto/category-response.dto';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoriesService {
  constructor(private readonly firebaseService: FirebaseService) {}

  async findAll(householdId: string): Promise<CategoryResponseDto[]> {
    const categories = await this.firebaseService.queryDocuments<Category>(
      `households/${householdId}/categories`,
      (query) => query.orderBy('name', 'asc'),
    );

    return categories as CategoryResponseDto[];
  }

  async findOne(
    householdId: string,
    categoryId: string,
  ): Promise<CategoryResponseDto> {
    const category = await this.firebaseService.getDocument<Category>(
      `households/${householdId}/categories/${categoryId}`,
    );

    if (!category) {
      throw new NotFoundException(`Category with ID ${categoryId} not found`);
    }

    return category as CategoryResponseDto;
  }

  async create(
    householdId: string,
    createCategoryDto: CreateCategoryDto,
  ): Promise<CategoryResponseDto> {
    const now = new Date();
    const categoryData = {
      ...createCategoryDto,
      householdId,
      createdAt: now,
      updatedAt: now,
    };

    const categoryId = await this.firebaseService.createDocument<Category>(
      `households/${householdId}/categories`,
      categoryData,
    );

    return {
      id: categoryId,
      ...categoryData,
    };
  }

  async update(
    householdId: string,
    categoryId: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<CategoryResponseDto> {
    const category = await this.findOne(householdId, categoryId);

    const updatedData = {
      ...updateCategoryDto,
      updatedAt: new Date(),
    };

    await this.firebaseService.updateDocument<Category>(
      `households/${householdId}/categories/${categoryId}`,
      updatedData,
    );

    return {
      ...category,
      ...updatedData,
    };
  }

  async remove(householdId: string, categoryId: string): Promise<void> {
    // Verify category exists first
    await this.findOne(householdId, categoryId);

    await this.firebaseService.deleteDocument(
      `households/${householdId}/categories/${categoryId}`,
    );
  }
}
