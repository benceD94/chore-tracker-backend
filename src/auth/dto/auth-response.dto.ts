import { ApiProperty } from '@nestjs/swagger';

export class AuthResponseDto {
  @ApiProperty({ description: 'User unique identifier' })
  uid: string;

  @ApiProperty({ description: 'User email address', required: false })
  email?: string;

  @ApiProperty({
    description: 'Whether the email has been verified',
    required: false,
  })
  emailVerified?: boolean;

  @ApiProperty({ description: 'User display name', required: false })
  displayName?: string;

  @ApiProperty({ description: 'User photo URL', required: false })
  photoURL?: string;

  @ApiProperty({ description: 'User phone number', required: false })
  phoneNumber?: string;
}
