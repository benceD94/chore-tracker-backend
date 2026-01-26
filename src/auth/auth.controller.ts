import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { FirebaseAuthGuard } from '../common/guards/firebase-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { FirebaseUser } from '../common/interfaces/firebase-user.interface';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Validate Firebase ID token',
    description:
      'Exchange Firebase ID token from frontend for user information',
  })
  @ApiResponse({
    status: 200,
    description: 'Token validated successfully',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid or expired token',
  })
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.validateToken(loginDto.idToken);
  }

  @Post('logout')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('firebase-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Logout current user',
    description: 'Sign out current user (client should remove token)',
  })
  @ApiResponse({
    status: 200,
    description: 'Logout successful',
  })
  async logout(): Promise<{ message: string }> {
    return this.authService.logout();
  }

  @Get('me')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('firebase-auth')
  @ApiOperation({
    summary: 'Get current authenticated user',
    description: 'Returns information about the currently authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'User information retrieved successfully',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Not authenticated',
  })
  async getCurrentUser(
    @CurrentUser() user: FirebaseUser,
  ): Promise<AuthResponseDto> {
    return this.authService.getCurrentUser(user.uid);
  }
}
