import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  Min,
  IsNotEmpty,
} from 'class-validator';

export class CreateRegistryEntryDto {
  @ApiProperty({
    description: 'Chore ID',
    example: 'chore123',
  })
  @IsString()
  @IsNotEmpty()
  choreId: string;

  @ApiProperty({
    description: 'User UID who completed the chore',
    example: 'user123',
  })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: 'Number of times the chore was completed',
    required: false,
    default: 1,
    example: 1,
  })
  @IsNumber()
  @Min(1)
  @IsOptional()
  times?: number;
}
