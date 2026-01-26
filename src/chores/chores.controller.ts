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
import { ChoresService } from './chores.service';
import { CreateChoreDto } from './dto/create-chore.dto';
import { UpdateChoreDto } from './dto/update-chore.dto';
import { ChoreResponseDto } from './dto/chore-response.dto';
import { FirebaseAuthGuard } from '../common/guards/firebase-auth.guard';
import { HouseholdAccessGuard } from '../households/guards/household-access.guard';

@ApiTags('chores')
@Controller('households/:householdId/chores')
@UseGuards(FirebaseAuthGuard, HouseholdAccessGuard)
@ApiBearerAuth('firebase-auth')
export class ChoresController {
  constructor(private readonly choresService: ChoresService) {}

  @Get()
  @ApiOperation({
    summary: 'List chores',
    description: 'Get all chores for a household, sorted by name',
  })
  @ApiResponse({
    status: 200,
    description: 'Chores retrieved successfully',
    type: [ChoreResponseDto],
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - user is not a member of this household',
  })
  async findAll(
    @Param('householdId') householdId: string,
  ): Promise<ChoreResponseDto[]> {
    return this.choresService.findAll(householdId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get single chore',
    description: 'Retrieve a specific chore by ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Chore found',
    type: ChoreResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Chore not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - user is not a member of this household',
  })
  async findOne(
    @Param('householdId') householdId: string,
    @Param('id') id: string,
  ): Promise<ChoreResponseDto> {
    return this.choresService.findOne(householdId, id);
  }

  @Post()
  @ApiOperation({
    summary: 'Create chore',
    description: 'Create a new chore for the household',
  })
  @ApiResponse({
    status: 201,
    description: 'Chore created successfully',
    type: ChoreResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - user is not a member of this household',
  })
  async create(
    @Param('householdId') householdId: string,
    @Body() createChoreDto: CreateChoreDto,
  ): Promise<ChoreResponseDto> {
    return this.choresService.create(householdId, createChoreDto);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update chore',
    description: 'Update an existing chore',
  })
  @ApiResponse({
    status: 200,
    description: 'Chore updated successfully',
    type: ChoreResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Chore not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - user is not a member of this household',
  })
  async update(
    @Param('householdId') householdId: string,
    @Param('id') id: string,
    @Body() updateChoreDto: UpdateChoreDto,
  ): Promise<ChoreResponseDto> {
    return this.choresService.update(householdId, id, updateChoreDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete chore',
    description: 'Delete a chore from the household',
  })
  @ApiResponse({
    status: 204,
    description: 'Chore deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Chore not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - user is not a member of this household',
  })
  async remove(
    @Param('householdId') householdId: string,
    @Param('id') id: string,
  ): Promise<void> {
    return this.choresService.remove(householdId, id);
  }
}
