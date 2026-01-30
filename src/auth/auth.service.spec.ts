import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { FirebaseService } from '../firebase/firebase.service';
import { UsersService } from '../users/users.service';

describe('AuthService', () => {
  let service: AuthService;
  let firebaseService: jest.Mocked<FirebaseService>;
  let usersService: jest.Mocked<UsersService>;

  const mockDecodedToken = {
    uid: 'test-uid-123',
    email: 'test@example.com',
    email_verified: true,
    name: 'Test User',
    picture: 'https://example.com/photo.jpg',
    phone_number: '+1234567890',
    aud: 'test-project',
    auth_time: 1234567890,
    exp: 1234567890,
    iat: 1234567890,
    iss: 'https://securetoken.google.com/test-project',
    sub: 'test-uid-123',
    firebase: {
      identities: {},
      sign_in_provider: 'password',
    },
  };

  const mockUserRecord = {
    uid: 'test-uid-123',
    email: 'test@example.com',
    emailVerified: true,
    displayName: 'Test User',
    photoURL: 'https://example.com/photo.jpg',
    phoneNumber: '+1234567890',
    disabled: false,
    metadata: {
      creationTime: '2024-01-01T00:00:00Z',
      lastSignInTime: '2024-01-15T00:00:00Z',
      toJSON: () => ({}),
    },
    providerData: [],
    toJSON: () => ({}),
  };

  beforeEach(async () => {
    const mockFirebaseService = {
      verifyIdToken: jest.fn(),
      getUserByUid: jest.fn(),
    };

    const mockUsersService = {
      create: jest.fn(),
      findByUid: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: FirebaseService,
          useValue: mockFirebaseService,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    firebaseService = module.get(FirebaseService);
    usersService = module.get(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateToken', () => {
    it('should validate token and return user information', async () => {
      // Arrange
      const idToken = 'valid-firebase-token';
      firebaseService.verifyIdToken.mockResolvedValue(mockDecodedToken);
      usersService.create.mockResolvedValue({} as any);

      // Act
      const result = await service.validateToken(idToken);

      // Assert
      expect(firebaseService.verifyIdToken).toHaveBeenCalledWith(idToken);
      expect(firebaseService.verifyIdToken).toHaveBeenCalledTimes(1);
      expect(usersService.create).toHaveBeenCalledWith({
        uid: 'test-uid-123',
        email: 'test@example.com',
        displayName: 'Test User',
        photoURL: 'https://example.com/photo.jpg',
      });
      expect(result).toEqual({
        uid: 'test-uid-123',
        email: 'test@example.com',
        emailVerified: true,
        displayName: 'Test User',
        photoURL: 'https://example.com/photo.jpg',
        phoneNumber: '+1234567890',
      });
    });

    it('should handle token with missing optional fields', async () => {
      // Arrange
      const idToken = 'valid-firebase-token';
      const minimalDecodedToken = {
        ...mockDecodedToken,
        email: undefined,
        email_verified: false,
        name: undefined,
        picture: undefined,
        phone_number: undefined,
      };
      firebaseService.verifyIdToken.mockResolvedValue(minimalDecodedToken);
      usersService.create.mockResolvedValue({} as any);

      // Act
      const result = await service.validateToken(idToken);

      // Assert
      expect(usersService.create).toHaveBeenCalledWith({
        uid: 'test-uid-123',
        email: undefined,
        displayName: undefined,
        photoURL: undefined,
      });
      expect(result).toEqual({
        uid: 'test-uid-123',
        email: undefined,
        emailVerified: false,
        displayName: undefined,
        photoURL: undefined,
        phoneNumber: undefined,
      });
    });

    it('should throw error when token verification fails', async () => {
      // Arrange
      const idToken = 'invalid-token';
      const error = new Error('Token verification failed');
      firebaseService.verifyIdToken.mockRejectedValue(error);

      // Act & Assert
      await expect(service.validateToken(idToken)).rejects.toThrow(error);
      expect(firebaseService.verifyIdToken).toHaveBeenCalledWith(idToken);
    });

    it('should throw error for expired token', async () => {
      // Arrange
      const idToken = 'expired-token';
      const error = new Error('Firebase ID token has expired');
      firebaseService.verifyIdToken.mockRejectedValue(error);

      // Act & Assert
      await expect(service.validateToken(idToken)).rejects.toThrow(error);
    });
  });

  describe('getCurrentUser', () => {
    it('should retrieve user by UID and return user information', async () => {
      // Arrange
      const uid = 'test-uid-123';
      firebaseService.getUserByUid.mockResolvedValue(mockUserRecord as any);

      // Act
      const result = await service.getCurrentUser(uid);

      // Assert
      expect(firebaseService.getUserByUid).toHaveBeenCalledWith(uid);
      expect(firebaseService.getUserByUid).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        uid: 'test-uid-123',
        email: 'test@example.com',
        emailVerified: true,
        displayName: 'Test User',
        photoURL: 'https://example.com/photo.jpg',
        phoneNumber: '+1234567890',
      });
    });

    it('should handle user with missing optional fields', async () => {
      // Arrange
      const uid = 'test-uid-123';
      const minimalUserRecord = {
        ...mockUserRecord,
        email: undefined,
        displayName: undefined,
        photoURL: undefined,
        phoneNumber: undefined,
        emailVerified: false,
      };
      firebaseService.getUserByUid.mockResolvedValue(minimalUserRecord as any);

      // Act
      const result = await service.getCurrentUser(uid);

      // Assert
      expect(result).toEqual({
        uid: 'test-uid-123',
        email: undefined,
        emailVerified: false,
        displayName: undefined,
        photoURL: undefined,
        phoneNumber: undefined,
      });
    });

    it('should throw error when user is not found', async () => {
      // Arrange
      const uid = 'non-existent-uid';
      const error = new Error('User not found');
      firebaseService.getUserByUid.mockRejectedValue(error);

      // Act & Assert
      await expect(service.getCurrentUser(uid)).rejects.toThrow(error);
      expect(firebaseService.getUserByUid).toHaveBeenCalledWith(uid);
    });

    it('should throw error when Firebase service fails', async () => {
      // Arrange
      const uid = 'test-uid-123';
      const error = new Error('Firebase service error');
      firebaseService.getUserByUid.mockRejectedValue(error);

      // Act & Assert
      await expect(service.getCurrentUser(uid)).rejects.toThrow(error);
    });
  });

  describe('logout', () => {
    it('should return success message', () => {
      // Act
      const result = service.logout();

      // Assert
      expect(result).toEqual({ message: 'Logout successful' });
    });

    it('should not call any Firebase methods', () => {
      // Act
      service.logout();

      // Assert
      expect(firebaseService.verifyIdToken).not.toHaveBeenCalled();
      expect(firebaseService.getUserByUid).not.toHaveBeenCalled();
    });
  });
});
