import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class UpdateCategoryDto {
  @ApiProperty({
    description: 'Updated category name',
    example: 'Kitchen & Dining',
  })
  @IsString()
  @IsNotEmpty()
  name: string;
}
