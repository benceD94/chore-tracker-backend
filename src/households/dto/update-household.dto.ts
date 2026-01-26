import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class UpdateHouseholdDto {
  @ApiProperty({
    description: 'Updated household name',
    example: 'Updated Family Name',
  })
  @IsString()
  @IsNotEmpty()
  name: string;
}
