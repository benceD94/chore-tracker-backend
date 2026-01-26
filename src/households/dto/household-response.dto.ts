import { ApiProperty } from '@nestjs/swagger';

export class HouseholdResponseDto {
  @ApiProperty({ description: 'Household document ID' })
  id: string;

  @ApiProperty({ description: 'Household name' })
  name: string;

  @ApiProperty({ description: 'Array of member UIDs' })
  members: string[];

  @ApiProperty({ description: 'UID of the user who created the household' })
  createdBy: string;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}
