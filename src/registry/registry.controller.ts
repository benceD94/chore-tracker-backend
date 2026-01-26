import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { RegistryService } from './registry.service';
import { CreateRegistryEntryDto } from './dto/create-registry-entry.dto';
import { BatchRegistryDto } from './dto/batch-registry.dto';
import { RegistryQueryDto, RegistryFilter } from './dto/registry-query.dto';
import { RegistryResponseDto } from './dto/registry-response.dto';
import { FirebaseAuthGuard } from '../common/guards/firebase-auth.guard';
import { HouseholdAccessGuard } from '../households/guards/household-access.guard';

@ApiTags('registry')
@Controller('households/:householdId/registry')
@UseGuards(FirebaseAuthGuard, HouseholdAccessGuard)
@ApiBearerAuth('firebase-auth')
export class RegistryController {
  constructor(private readonly registryService: RegistryService) {}

  @Get()
  @ApiOperation({
    summary: 'List registry entries',
    description:
      'Get chore completion registry entries with optional filtering by time period and user',
  })
  @ApiQuery({
    name: 'filter',
    enum: RegistryFilter,
    required: false,
    description: 'Filter by time period',
  })
  @ApiQuery({
    name: 'userId',
    type: String,
    required: false,
    description: 'Filter by user UID',
  })
  @ApiQuery({
    name: 'limit',
    type: Number,
    required: false,
    description: 'Maximum number of results (default: 50)',
  })
  @ApiResponse({
    status: 200,
    description: 'Registry entries retrieved successfully',
    type: [RegistryResponseDto],
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - user is not a member of this household',
  })
  async findAll(
    @Param('householdId') householdId: string,
    @Query() queryDto: RegistryQueryDto,
  ): Promise<RegistryResponseDto[]> {
    return this.registryService.findAll(householdId, queryDto);
  }

  @Post()
  @ApiOperation({
    summary: 'Register chore completion',
    description: 'Register a single chore completion',
  })
  @ApiResponse({
    status: 201,
    description: 'Registry entry created successfully',
    type: RegistryResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - user is not a member of this household',
  })
  async create(
    @Param('householdId') householdId: string,
    @Body() createRegistryEntryDto: CreateRegistryEntryDto,
  ): Promise<RegistryResponseDto> {
    return this.registryService.create(householdId, createRegistryEntryDto);
  }

  @Post('batch')
  @ApiOperation({
    summary: 'Register multiple chore completions',
    description: 'Register multiple chore completions in a single request',
  })
  @ApiResponse({
    status: 201,
    description: 'Batch registry entries created successfully',
    type: [RegistryResponseDto],
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - user is not a member of this household',
  })
  async createBatch(
    @Param('householdId') householdId: string,
    @Body() batchRegistryDto: BatchRegistryDto,
  ): Promise<RegistryResponseDto[]> {
    return this.registryService.createBatch(householdId, batchRegistryDto);
  }
}
