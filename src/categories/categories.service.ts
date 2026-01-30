import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryResponseDto } from './dto/category-response.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(householdId: string): Promise<CategoryResponseDto[]> {
    const categories = await this.prisma.category.findMany({
      where: { householdId },
      orderBy: { name: 'asc' },
    });

    return categories.map((category) => ({
      id: category.id,
      householdId: category.householdId,
      name: category.name,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    }));
  }

  async findOne(
    householdId: string,
    categoryId: string,
  ): Promise<CategoryResponseDto> {
    const category = await this.prisma.category.findFirst({
      where: {
        id: categoryId,
        householdId,
      },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${categoryId} not found`);
    }

    return {
      id: category.id,
      householdId: category.householdId,
      name: category.name,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  }

  async create(
    householdId: string,
    createCategoryDto: CreateCategoryDto,
  ): Promise<CategoryResponseDto> {
    const category = await this.prisma.category.create({
      data: {
        householdId,
        name: createCategoryDto.name,
      },
    });

    return {
      id: category.id,
      householdId: category.householdId,
      name: category.name,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  }

  async update(
    householdId: string,
    categoryId: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<CategoryResponseDto> {
    // Verify category exists and belongs to household
    await this.findOne(householdId, categoryId);

    const category = await this.prisma.category.update({
      where: { id: categoryId },
      data: {
        name: updateCategoryDto.name,
      },
    });

    return {
      id: category.id,
      householdId: category.householdId,
      name: category.name,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  }

  async remove(householdId: string, categoryId: string): Promise<void> {
    // Verify category exists and belongs to household
    await this.findOne(householdId, categoryId);

    // Delete the category (will set categoryId to null in chores due to onDelete: SetNull)
    await this.prisma.category.delete({
      where: { id: categoryId },
    });
  }
}
