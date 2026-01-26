import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryResponseDto } from './dto/category-response.dto';
import { FirebaseAuthGuard } from '../common/guards/firebase-auth.guard';
import { HouseholdAccessGuard } from '../households/guards/household-access.guard';

@ApiTags('categories')
@Controller('households/:householdId/categories')
@UseGuards(FirebaseAuthGuard, HouseholdAccessGuard)
@ApiBearerAuth('firebase-auth')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({
    summary: 'List categories',
    description: 'Get all categories for a household, sorted by name',
  })
  @ApiResponse({
    status: 200,
    description: 'Categories retrieved successfully',
    type: [CategoryResponseDto],
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - user is not a member of this household',
  })
  async findAll(
    @Param('householdId') householdId: string,
  ): Promise<CategoryResponseDto[]> {
    return this.categoriesService.findAll(householdId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get single category',
    description: 'Retrieve a specific category by ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Category found',
    type: CategoryResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - user is not a member of this household',
  })
  async findOne(
    @Param('householdId') householdId: string,
    @Param('id') id: string,
  ): Promise<CategoryResponseDto> {
    return this.categoriesService.findOne(householdId, id);
  }

  @Post()
  @ApiOperation({
    summary: 'Create category',
    description: 'Create a new category for the household',
  })
  @ApiResponse({
    status: 201,
    description: 'Category created successfully',
    type: CategoryResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - user is not a member of this household',
  })
  async create(
    @Param('householdId') householdId: string,
    @Body() createCategoryDto: CreateCategoryDto,
  ): Promise<CategoryResponseDto> {
    return this.categoriesService.create(householdId, createCategoryDto);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update category',
    description: 'Update the name of an existing category',
  })
  @ApiResponse({
    status: 200,
    description: 'Category updated successfully',
    type: CategoryResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - user is not a member of this household',
  })
  async update(
    @Param('householdId') householdId: string,
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<CategoryResponseDto> {
    return this.categoriesService.update(householdId, id, updateCategoryDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete category',
    description: 'Delete a category from the household',
  })
  @ApiResponse({
    status: 204,
    description: 'Category deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - user is not a member of this household',
  })
  async remove(
    @Param('householdId') householdId: string,
    @Param('id') id: string,
  ): Promise<void> {
    return this.categoriesService.remove(householdId, id);
  }
}
