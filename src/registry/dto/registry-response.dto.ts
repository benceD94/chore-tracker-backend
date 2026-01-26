import { ApiProperty } from '@nestjs/swagger';

export class RegistryResponseDto {
  @ApiProperty({ description: 'Registry entry document ID' })
  id: string;

  @ApiProperty({ description: 'Household ID' })
  householdId: string;

  @ApiProperty({ description: 'Chore ID' })
  choreId: string;

  @ApiProperty({ description: 'User UID who completed the chore' })
  userId: string;

  @ApiProperty({ description: 'Number of times the chore was completed' })
  times: number;

  @ApiProperty({ description: 'Completion timestamp' })
  completedAt: Date;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;
}
