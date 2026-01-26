import { Injectable, NotFoundException } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(private readonly firebaseService: FirebaseService) {}

  async findByUid(uid: string): Promise<UserResponseDto> {
    const users = await this.firebaseService.queryDocuments<User>(
      'users',
      (query) => query.where('uid', '==', uid).limit(1),
    );

    if (users.length === 0) {
      throw new NotFoundException(`User with UID ${uid} not found`);
    }

    return users[0] as UserResponseDto;
  }

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    // Check if user already exists
    try {
      const existingUser = await this.findByUid(createUserDto.uid);
      // If user exists, update their data (upsert)
      const updatedData = {
        ...createUserDto,
        updatedAt: new Date(),
      };

      await this.firebaseService.updateDocument<User>(
        `users/${existingUser.id}`,
        updatedData,
      );

      return {
        ...existingUser,
        ...updatedData,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        // Create new user
        const now = new Date();
        const userData = {
          ...createUserDto,
          createdAt: now,
          updatedAt: now,
        };

        const userId = await this.firebaseService.createDocument<User>(
          'users',
          userData,
        );

        return {
          id: userId,
          ...userData,
        };
      }
      throw error;
    }
  }
}
