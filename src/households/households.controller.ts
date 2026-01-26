import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { HouseholdsService } from './households.service';
import { CreateHouseholdDto } from './dto/create-household.dto';
import { UpdateHouseholdDto } from './dto/update-household.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { HouseholdResponseDto } from './dto/household-response.dto';
import { FirebaseAuthGuard } from '../common/guards/firebase-auth.guard';
import { HouseholdAccessGuard } from './guards/household-access.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { FirebaseUser } from '../common/interfaces/firebase-user.interface';

@ApiTags('households')
@Controller('households')
@UseGuards(FirebaseAuthGuard)
@ApiBearerAuth('firebase-auth')
export class HouseholdsController {
  constructor(private readonly householdsService: HouseholdsService) {}

  @Get()
  @ApiOperation({
    summary: 'List all households for current user',
    description: 'Get all households where the current user is a member',
  })
  @ApiResponse({
    status: 200,
    description: 'Households retrieved successfully',
    type: [HouseholdResponseDto],
  })
  async findAll(
    @CurrentUser() user: FirebaseUser,
  ): Promise<HouseholdResponseDto[]> {
    return this.householdsService.findAllByUser(user.uid);
  }

  @Get(':householdId')
  @UseGuards(HouseholdAccessGuard)
  @ApiOperation({
    summary: 'Get specific household',
    description: 'Get household details with members list',
  })
  @ApiResponse({
    status: 200,
    description: 'Household found',
    type: HouseholdResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Household not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - user is not a member of this household',
  })
  async findOne(
    @Param('householdId') householdId: string,
  ): Promise<HouseholdResponseDto> {
    return this.householdsService.findOne(householdId);
  }

  @Post()
  @ApiOperation({
    summary: 'Create new household',
    description:
      'Create a new household with the current user as the creator and first member',
  })
  @ApiResponse({
    status: 201,
    description: 'Household created successfully',
    type: HouseholdResponseDto,
  })
  async create(
    @Body() createHouseholdDto: CreateHouseholdDto,
    @CurrentUser() user: FirebaseUser,
  ): Promise<HouseholdResponseDto> {
    return this.householdsService.create(createHouseholdDto, user.uid);
  }

  @Patch(':householdId')
  @UseGuards(HouseholdAccessGuard)
  @ApiOperation({
    summary: 'Update household name',
    description: 'Update the name of an existing household',
  })
  @ApiResponse({
    status: 200,
    description: 'Household updated successfully',
    type: HouseholdResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Household not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - user is not a member of this household',
  })
  async update(
    @Param('householdId') householdId: string,
    @Body() updateHouseholdDto: UpdateHouseholdDto,
  ): Promise<HouseholdResponseDto> {
    return this.householdsService.update(householdId, updateHouseholdDto);
  }

  @Post(':householdId/members')
  @UseGuards(HouseholdAccessGuard)
  @ApiOperation({
    summary: 'Add member to household',
    description: 'Add a new member to an existing household',
  })
  @ApiResponse({
    status: 201,
    description: 'Member added successfully',
    type: HouseholdResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - user is already a member',
  })
  @ApiResponse({
    status: 404,
    description: 'Household not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - user is not a member of this household',
  })
  async addMember(
    @Param('householdId') householdId: string,
    @Body() addMemberDto: AddMemberDto,
  ): Promise<HouseholdResponseDto> {
    return this.householdsService.addMember(householdId, addMemberDto);
  }
}
