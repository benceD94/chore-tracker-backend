import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsString, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export enum RegistryFilter {
  TODAY = 'today',
  YESTERDAY = 'yesterday',
  THIS_WEEK = 'thisWeek',
  LAST_WEEK = 'lastWeek',
  THIS_MONTH = 'thisMonth',
  ALL = 'all',
}

export class RegistryQueryDto {
  @ApiProperty({
    description: 'Filter registry entries by time period',
    enum: RegistryFilter,
    required: false,
    default: RegistryFilter.ALL,
  })
  @IsEnum(RegistryFilter)
  @IsOptional()
  filter?: RegistryFilter = RegistryFilter.ALL;

  @ApiProperty({
    description: 'Filter by user UID',
    required: false,
  })
  @IsString()
  @IsOptional()
  userId?: string;

  @ApiProperty({
    description: 'Maximum number of results to return',
    required: false,
    default: 50,
    minimum: 1,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  limit?: number = 50;
}
