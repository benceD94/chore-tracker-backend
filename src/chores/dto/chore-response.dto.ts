import { ApiProperty } from '@nestjs/swagger';

export class ChoreResponseDto {
  @ApiProperty({ description: 'Chore document ID' })
  id: string;

  @ApiProperty({ description: 'Household ID' })
  householdId: string;

  @ApiProperty({ description: 'Chore name' })
  name: string;

  @ApiProperty({ description: 'Chore description', required: false })
  description?: string;

  @ApiProperty({ description: 'Category ID', required: false })
  categoryId?: string;

  @ApiProperty({
    description: 'Array of user UIDs assigned to this chore',
    required: false,
  })
  assignedTo?: string[];

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}
