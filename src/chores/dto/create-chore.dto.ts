import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsArray,
  IsNotEmpty,
  IsNumber,
} from 'class-validator';

export class CreateChoreDto {
  @ApiProperty({
    description: 'Chore name',
    example: 'Wash dishes',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Chore points',
    example: '5',
  })
  @IsNumber()
  @IsNotEmpty()
  points: number;

  @ApiProperty({
    description: 'Chore description',
    required: false,
    example: 'Clean all dishes and put them away',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Category ID',
    required: false,
    example: 'cat123',
  })
  @IsString()
  @IsOptional()
  categoryId?: string;

  @ApiProperty({
    description: 'Array of user UIDs assigned to this chore',
    required: false,
    example: ['user123', 'user456'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  assignedTo?: string[];
}
