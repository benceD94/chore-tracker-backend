import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEmail, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ description: 'Firebase UID' })
  @IsString()
  @IsNotEmpty()
  uid: string;

  @ApiProperty({ description: 'User email', required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ description: 'User display name', required: false })
  @IsString()
  @IsOptional()
  displayName?: string;

  @ApiProperty({ description: 'User photo URL', required: false })
  @IsString()
  @IsOptional()
  photoURL?: string;
}
