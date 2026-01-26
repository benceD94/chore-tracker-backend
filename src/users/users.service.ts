import { Injectable, NotFoundException } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(private readonly firebaseService: FirebaseService) {}

  async findByUid(uid: string): Promise<UserResponseDto> {
    const user = await this.firebaseService.getDocument<User>(`users/${uid}`);

    if (!user) {
      throw new NotFoundException(`User with UID ${uid} not found`);
    }

    return user as UserResponseDto;
  }

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const now = new Date();

    // Check if user already exists
    try {
      const existingUser = await this.findByUid(createUserDto.uid);
      // If user exists, update their data (upsert)
      const updatedData = {
        ...createUserDto,
        updatedAt: now,
      };

      await this.firebaseService.updateDocument<User>(
        `users/${createUserDto.uid}`,
        updatedData,
      );

      return {
        ...existingUser,
        ...updatedData,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        // Create new user with UID as document ID
        const userData = {
          ...createUserDto,
          createdAt: now,
          updatedAt: now,
        };

        await this.firebaseService.updateDocument<User>(
          `users/${createUserDto.uid}`,
          userData,
        );

        return {
          id: createUserDto.uid,
          ...userData,
        };
      }
      throw error;
    }
  }
}
