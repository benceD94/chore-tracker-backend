import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { FirebaseAuthGuard } from '../common/guards/firebase-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { FirebaseUser } from '../common/interfaces/firebase-user.interface';

@ApiTags('users')
@Controller('users')
@UseGuards(FirebaseAuthGuard)
@ApiBearerAuth('firebase-auth')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':uid')
  @ApiOperation({
    summary: 'Get user profile by UID',
    description: 'Retrieve user profile information by Firebase UID',
  })
  @ApiResponse({
    status: 200,
    description: 'User found',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async findOne(@Param('uid') uid: string): Promise<UserResponseDto> {
    return this.usersService.findByUid(uid);
  }

  @Post()
  @ApiOperation({
    summary: 'Create or update user profile',
    description: 'Create new user profile or update existing one (upsert)',
  })
  @ApiResponse({
    status: 201,
    description: 'User created or updated',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - can only create/update own profile',
  })
  async create(
    @Body() createUserDto: CreateUserDto,
    @CurrentUser() currentUser: FirebaseUser,
  ): Promise<UserResponseDto> {
    // Users can only create/update their own profile
    if (currentUser.uid !== createUserDto.uid) {
      throw new ForbiddenException(
        'You can only create/update your own profile',
      );
    }

    return this.usersService.create(createUserDto);
  }
}
