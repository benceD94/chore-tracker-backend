import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { FirebaseService } from '../firebase/firebase.service';
import { NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';

describe('UsersService', () => {
  let service: UsersService;
  let firebaseService: jest.Mocked<FirebaseService>;

  const mockUser = {
    id: 'user-doc-id-123',
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
    const mockFirebaseService = {
      getDocument: jest.fn(),
      updateDocument: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: FirebaseService,
          useValue: mockFirebaseService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    firebaseService = module.get(FirebaseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findByUid', () => {
    it('should return user when found', async () => {
      // Arrange
      const uid = 'firebase-uid-123';
      firebaseService.getDocument.mockResolvedValue(mockUser);

      // Act
      const result = await service.findByUid(uid);

      // Assert
      expect(firebaseService.getDocument).toHaveBeenCalledWith(`users/${uid}`);
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException when user not found', async () => {
      // Arrange
      const uid = 'non-existent-uid';
      firebaseService.getDocument.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findByUid(uid)).rejects.toThrow(NotFoundException);
      await expect(service.findByUid(uid)).rejects.toThrow(
        `User with UID ${uid} not found`,
      );
    });

    it('should handle Firebase get errors', async () => {
      // Arrange
      const uid = 'firebase-uid-123';
      const error = new Error('Firebase get failed');
      firebaseService.getDocument.mockRejectedValue(error);

      // Act & Assert
      await expect(service.findByUid(uid)).rejects.toThrow(error);
    });
  });

  describe('create', () => {
    it('should create new user when user does not exist', async () => {
      // Arrange
      firebaseService.getDocument.mockResolvedValue(null);
      firebaseService.updateDocument.mockResolvedValue(undefined);

      // Act
      const result = await service.create(mockCreateUserDto);

      // Assert
      expect(firebaseService.getDocument).toHaveBeenCalledWith(
        `users/${mockCreateUserDto.uid}`,
      );
      expect(firebaseService.updateDocument).toHaveBeenCalledWith(
        `users/${mockCreateUserDto.uid}`,
        expect.objectContaining({
          uid: mockCreateUserDto.uid,
          email: mockCreateUserDto.email,
          displayName: mockCreateUserDto.displayName,
          photoURL: mockCreateUserDto.photoURL,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        }),
      );
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
        id: mockCreateUserDto.uid,
        uid: mockCreateUserDto.uid,
        email: 'old@example.com',
        displayName: 'Old Name',
        photoURL: 'https://example.com/old-photo.jpg',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      firebaseService.getDocument.mockResolvedValue(existingUser);
      firebaseService.updateDocument.mockResolvedValue(undefined);

      // Act
      const result = await service.create(mockCreateUserDto);

      // Assert
      expect(firebaseService.getDocument).toHaveBeenCalledWith(
        `users/${mockCreateUserDto.uid}`,
      );
      expect(firebaseService.updateDocument).toHaveBeenCalledWith(
        `users/${mockCreateUserDto.uid}`,
        expect.objectContaining({
          uid: mockCreateUserDto.uid,
          email: mockCreateUserDto.email,
          displayName: mockCreateUserDto.displayName,
          photoURL: mockCreateUserDto.photoURL,
          updatedAt: expect.any(Date),
        }),
      );
      expect(result).toEqual({
        ...existingUser,
        ...mockCreateUserDto,
        updatedAt: expect.any(Date),
      });
    });

    it('should preserve createdAt when updating existing user', async () => {
      // Arrange
      const originalCreatedAt = new Date('2024-01-01');
      const existingUser = {
        id: mockCreateUserDto.uid,
        uid: mockCreateUserDto.uid,
        email: 'old@example.com',
        displayName: 'Old Name',
        createdAt: originalCreatedAt,
        updatedAt: new Date('2024-01-01'),
      };

      firebaseService.getDocument.mockResolvedValue(existingUser);
      firebaseService.updateDocument.mockResolvedValue(undefined);

      // Act
      const result = await service.create(mockCreateUserDto);

      // Assert
      expect(result.createdAt).toEqual(originalCreatedAt);
    });

    it('should throw error when Firebase update fails during create', async () => {
      // Arrange
      const error = new Error('Firebase update failed');
      firebaseService.getDocument.mockResolvedValue(null);
      firebaseService.updateDocument.mockRejectedValue(error);

      // Act & Assert
      await expect(service.create(mockCreateUserDto)).rejects.toThrow(error);
    });

    it('should throw error when Firebase update fails during upsert', async () => {
      // Arrange
      const existingUser = {
        id: mockCreateUserDto.uid,
        uid: mockCreateUserDto.uid,
        email: 'old@example.com',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };
      const error = new Error('Firebase update failed');
      firebaseService.getDocument.mockResolvedValue(existingUser);
      firebaseService.updateDocument.mockRejectedValue(error);

      // Act & Assert
      await expect(service.create(mockCreateUserDto)).rejects.toThrow(error);
    });

    it('should rethrow non-NotFoundException errors from findByUid', async () => {
      // Arrange
      const error = new Error('Unexpected Firebase error');
      firebaseService.getDocument.mockRejectedValue(error);

      // Act & Assert
      await expect(service.create(mockCreateUserDto)).rejects.toThrow(error);
      expect(firebaseService.updateDocument).not.toHaveBeenCalled();
    });
  });
});
