import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/user-response.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findByUid(uid: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { uid },
    });

    if (!user) {
      throw new NotFoundException(`User with UID ${uid} not found`);
    }

    return {
      id: user.uid,
      uid: user.uid,
      email: user.email ?? undefined,
      displayName: user.displayName ?? undefined,
      photoURL: user.photoURL ?? undefined,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const user = await this.prisma.user.upsert({
      where: { uid: createUserDto.uid },
      update: {
        email: createUserDto.email,
        displayName: createUserDto.displayName,
        photoURL: createUserDto.photoURL,
      },
      create: {
        uid: createUserDto.uid,
        email: createUserDto.email,
        displayName: createUserDto.displayName,
        photoURL: createUserDto.photoURL,
      },
    });

    return {
      id: user.uid,
      uid: user.uid,
      email: user.email ?? undefined,
      displayName: user.displayName ?? undefined,
      photoURL: user.photoURL ?? undefined,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
