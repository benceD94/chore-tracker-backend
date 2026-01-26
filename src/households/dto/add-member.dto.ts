import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class AddMemberDto {
  @ApiProperty({
    description: 'Firebase UID of the user to add to household',
    example: 'abc123xyz',
  })
  @IsString()
  @IsNotEmpty()
  userId: string;
}
