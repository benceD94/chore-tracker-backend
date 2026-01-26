import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ description: 'User document ID' })
  id: string;

  @ApiProperty({ description: 'Firebase UID' })
  uid: string;

  @ApiProperty({ description: 'User email', required: false })
  email?: string;

  @ApiProperty({ description: 'User display name', required: false })
  displayName?: string;

  @ApiProperty({ description: 'User photo URL', required: false })
  photoURL?: string;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}
