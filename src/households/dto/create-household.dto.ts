import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateHouseholdDto {
  @ApiProperty({
    description: 'Household name',
    example: 'Smith Family',
  })
  @IsString()
  @IsNotEmpty()
  name: string;
}
