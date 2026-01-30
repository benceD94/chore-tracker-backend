import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: jest.Mocked<PrismaService>;

  const mockUser = {
    uid: 'firebase-uid-123',
    email: 'test@example.com',
    displayName: 'Test User',
    photoURL: 'https://example.com/photo.jpg',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15'),
  };

  const mockCreateUserDto: CreateUserDto = {
    uid: 'firebase-uid-456',
    email: 'newuser@example.com',
    displayName: 'New User',
    photoURL: 'https://example.com/new-photo.jpg',
  };

  beforeEach(async () => {
    const mockPrismaService = {
      user: {
        findUnique: jest.fn(),
        upsert: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findByUid', () => {
    it('should return user when found', async () => {
      // Arrange
      const uid = 'firebase-uid-123';
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      // Act
      const result = await service.findByUid(uid);

      // Assert
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { uid },
      });
      expect(result).toEqual({
        id: mockUser.uid,
        uid: mockUser.uid,
        email: mockUser.email,
        displayName: mockUser.displayName,
        photoURL: mockUser.photoURL,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      });
    });

    it('should throw NotFoundException when user not found', async () => {
      // Arrange
      const uid = 'non-existent-uid';
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(service.findByUid(uid)).rejects.toThrow(NotFoundException);
      await expect(service.findByUid(uid)).rejects.toThrow(
        `User with UID ${uid} not found`,
      );
    });

    it('should handle database errors', async () => {
      // Arrange
      const uid = 'firebase-uid-123';
      const error = new Error('Database error');
      (prisma.user.findUnique as jest.Mock).mockRejectedValue(error);

      // Act & Assert
      await expect(service.findByUid(uid)).rejects.toThrow(error);
    });
  });

  describe('create', () => {
    it('should create new user when user does not exist', async () => {
      // Arrange
      const newUser = {
        uid: mockCreateUserDto.uid,
        email: mockCreateUserDto.email,
        displayName: mockCreateUserDto.displayName,
        photoURL: mockCreateUserDto.photoURL,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      };
      (prisma.user.upsert as jest.Mock).mockResolvedValue(newUser);

      // Act
      const result = await service.create(mockCreateUserDto);

      // Assert
      expect(prisma.user.upsert).toHaveBeenCalledWith({
        where: { uid: mockCreateUserDto.uid },
        update: {
          email: mockCreateUserDto.email,
          displayName: mockCreateUserDto.displayName,
          photoURL: mockCreateUserDto.photoURL,
        },
        create: {
          uid: mockCreateUserDto.uid,
          email: mockCreateUserDto.email,
          displayName: mockCreateUserDto.displayName,
          photoURL: mockCreateUserDto.photoURL,
        },
      });
      expect(result).toEqual({
        id: mockCreateUserDto.uid,
        ...mockCreateUserDto,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });

    it('should update existing user when user already exists (upsert)', async () => {
      // Arrange
      const existingUser = {
        uid: mockCreateUserDto.uid,
        email: mockCreateUserDto.email,
        displayName: mockCreateUserDto.displayName,
        photoURL: mockCreateUserDto.photoURL,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date(),
      };
      (prisma.user.upsert as jest.Mock).mockResolvedValue(existingUser);

      // Act
      const result = await service.create(mockCreateUserDto);

      // Assert
      expect(prisma.user.upsert).toHaveBeenCalled();
      expect(result).toMatchObject({
        uid: mockCreateUserDto.uid,
        email: mockCreateUserDto.email,
        displayName: mockCreateUserDto.displayName,
        photoURL: mockCreateUserDto.photoURL,
      });
    });

    it('should preserve createdAt when updating existing user', async () => {
      // Arrange
      const originalCreatedAt = new Date('2024-01-01');
      const existingUser = {
        uid: mockCreateUserDto.uid,
        email: mockCreateUserDto.email,
        displayName: mockCreateUserDto.displayName,
        photoURL: mockCreateUserDto.photoURL,
        createdAt: originalCreatedAt,
        updatedAt: new Date(),
      };
      (prisma.user.upsert as jest.Mock).mockResolvedValue(existingUser);

      // Act
      const result = await service.create(mockCreateUserDto);

      // Assert
      expect(result.createdAt).toEqual(originalCreatedAt);
    });

    it('should handle database errors during upsert', async () => {
      // Arrange
      const error = new Error('Database upsert failed');
      (prisma.user.upsert as jest.Mock).mockRejectedValue(error);

      // Act & Assert
      await expect(service.create(mockCreateUserDto)).rejects.toThrow(error);
    });
  });
});
