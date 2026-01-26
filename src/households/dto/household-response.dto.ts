import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from '../../users/dto/user-response.dto';

export class HouseholdResponseDto {
  @ApiProperty({ description: 'Household document ID' })
  id: string;

  @ApiProperty({ description: 'Household name' })
  name: string;

  @ApiProperty({ description: 'Array of member UIDs' })
  memberIds: string[];

  @ApiProperty({
    description: 'Array of member details populated from memberIds',
    type: [UserResponseDto]
  })
  memberDetails: UserResponseDto[];

  @ApiProperty({ description: 'UID of the user who created the household' })
  createdBy: string;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}
