import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateRegistryEntryDto } from './create-registry-entry.dto';

export class BatchRegistryDto {
  @ApiProperty({
    description: 'Array of chores to register',
    type: [CreateRegistryEntryDto],
    example: [
      { choreId: 'chore123', userId: 'user123', times: 1 },
      { choreId: 'chore456', userId: 'user123', times: 2 },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateRegistryEntryDto)
  chores: CreateRegistryEntryDto[];
}
