import { Test, TestingModule } from '@nestjs/testing';
import { RegistryService } from './registry.service';
import { FirebaseService } from '../firebase/firebase.service';
import { CreateRegistryEntryDto } from './dto/create-registry-entry.dto';
import { BatchRegistryDto } from './dto/batch-registry.dto';
import { RegistryQueryDto, RegistryFilter } from './dto/registry-query.dto';

describe('RegistryService', () => {
  let service: RegistryService;
  let firebaseService: jest.Mocked<FirebaseService>;

  const householdId = 'household-id-123';

  const mockRegistryEntry = {
    id: 'registry-id-123',
    choreId: 'chore-id-123',
    userId: 'user-uid-1',
    householdId,
    times: 1,
    completedAt: new Date('2024-01-15T10:00:00Z'),
    createdAt: new Date('2024-01-15T10:00:00Z'),
  };

  const mockCreateRegistryEntryDto: CreateRegistryEntryDto = {
    choreId: 'chore-id-456',
    userId: 'user-uid-2',
    times: 2,
  };

  beforeEach(async () => {
    const mockFirebaseService = {
      queryDocuments: jest.fn(),
      createDocument: jest.fn(),
      getDocument: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegistryService,
        {
          provide: FirebaseService,
          useValue: mockFirebaseService,
        },
      ],
    }).compile();

    service = module.get<RegistryService>(RegistryService);
    firebaseService = module.get(FirebaseService);

    // Setup default mocks for enrichment
    firebaseService.getDocument.mockImplementation((path: string) => {
      if (path.includes('/chores/')) {
        return Promise.resolve({ name: 'Test Chore', points: 0 });
      }
      if (path.startsWith('users/')) {
        return Promise.resolve({ displayName: 'Test User' });
      }
      return Promise.resolve(null);
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all registry entries without filters', async () => {
      // Arrange
      const queryDto: RegistryQueryDto = {
        filter: RegistryFilter.ALL,
      };
      const entries = [
        mockRegistryEntry,
        { ...mockRegistryEntry, id: 'registry-id-456' },
      ];
      firebaseService.queryDocuments.mockResolvedValueOnce(entries);

      // Act
      const result = await service.findAll(householdId, queryDto);

      // Assert
      expect(firebaseService.queryDocuments).toHaveBeenCalledWith(
        `households/${householdId}/registry`,
        expect.any(Function),
      );
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        ...mockRegistryEntry,
        points: 0,
        choreName: 'Test Chore',
        userName: 'Test User',
      });
    });

    it('should filter entries by userId when specified', async () => {
      // Arrange
      const queryDto: RegistryQueryDto = {
        filter: RegistryFilter.ALL,
        userId: 'user-uid-1',
      };
      const entries = [mockRegistryEntry];
      firebaseService.queryDocuments.mockResolvedValueOnce(entries);

      // Act
      const result = await service.findAll(householdId, queryDto);

      // Assert
      expect(firebaseService.queryDocuments).toHaveBeenCalled();
      expect(result[0]).toMatchObject({
        choreName: 'Test Chore',
        userName: 'Test User',
      });
    });

    it('should use custom limit when specified', async () => {
      // Arrange
      const queryDto: RegistryQueryDto = {
        filter: RegistryFilter.ALL,
        limit: 10,
      };
      firebaseService.queryDocuments.mockResolvedValue([mockRegistryEntry]);

      // Act
      await service.findAll(householdId, queryDto);

      // Assert
      expect(firebaseService.queryDocuments).toHaveBeenCalled();
    });

    it('should use default limit of 50 when not specified', async () => {
      // Arrange
      const queryDto: RegistryQueryDto = {
        filter: RegistryFilter.ALL,
      };
      firebaseService.queryDocuments.mockResolvedValue([mockRegistryEntry]);

      // Act
      await service.findAll(householdId, queryDto);

      // Assert
      expect(firebaseService.queryDocuments).toHaveBeenCalled();
    });

    it('should filter by TODAY', async () => {
      // Arrange
      const queryDto: RegistryQueryDto = {
        filter: RegistryFilter.TODAY,
      };
      firebaseService.queryDocuments.mockResolvedValueOnce([mockRegistryEntry]);

      // Act
      const result = await service.findAll(householdId, queryDto);

      // Assert
      expect(firebaseService.queryDocuments).toHaveBeenCalled();
      expect(result[0]).toMatchObject({
        choreId: mockRegistryEntry.choreId,
        userId: mockRegistryEntry.userId,
        choreName: expect.any(String),
        userName: expect.any(String),
      });
    });

    it('should filter by YESTERDAY', async () => {
      // Arrange
      const queryDto: RegistryQueryDto = {
        filter: RegistryFilter.YESTERDAY,
      };
      firebaseService.queryDocuments.mockResolvedValueOnce([mockRegistryEntry]);

      // Act
      const result = await service.findAll(householdId, queryDto);

      // Assert
      expect(firebaseService.queryDocuments).toHaveBeenCalled();
      expect(result[0]).toMatchObject({
        choreId: mockRegistryEntry.choreId,
        userId: mockRegistryEntry.userId,
        choreName: expect.any(String),
        userName: expect.any(String),
      });
    });

    it('should filter by THIS_WEEK', async () => {
      // Arrange
      const queryDto: RegistryQueryDto = {
        filter: RegistryFilter.THIS_WEEK,
      };
      firebaseService.queryDocuments.mockResolvedValueOnce([mockRegistryEntry]);

      // Act
      const result = await service.findAll(householdId, queryDto);

      // Assert
      expect(firebaseService.queryDocuments).toHaveBeenCalled();
      expect(result[0]).toMatchObject({
        choreId: mockRegistryEntry.choreId,
        choreName: expect.any(String),
        userName: expect.any(String),
      });
    });

    it('should filter by LAST_WEEK', async () => {
      // Arrange
      const queryDto: RegistryQueryDto = {
        filter: RegistryFilter.LAST_WEEK,
      };
      firebaseService.queryDocuments.mockResolvedValueOnce([mockRegistryEntry]);

      // Act
      const result = await service.findAll(householdId, queryDto);

      // Assert
      expect(firebaseService.queryDocuments).toHaveBeenCalled();
      expect(result[0]).toMatchObject({
        choreId: mockRegistryEntry.choreId,
        choreName: expect.any(String),
        userName: expect.any(String),
      });
    });

    it('should filter by THIS_MONTH', async () => {
      // Arrange
      const queryDto: RegistryQueryDto = {
        filter: RegistryFilter.THIS_MONTH,
      };
      firebaseService.queryDocuments.mockResolvedValueOnce([mockRegistryEntry]);

      // Act
      const result = await service.findAll(householdId, queryDto);

      // Assert
      expect(firebaseService.queryDocuments).toHaveBeenCalled();
      expect(result[0]).toMatchObject({
        choreId: mockRegistryEntry.choreId,
        choreName: expect.any(String),
        userName: expect.any(String),
      });
    });

    it('should combine date filter and user filter', async () => {
      // Arrange
      const queryDto: RegistryQueryDto = {
        filter: RegistryFilter.TODAY,
        userId: 'user-uid-1',
      };
      firebaseService.queryDocuments.mockResolvedValueOnce([mockRegistryEntry]);

      // Act
      const result = await service.findAll(householdId, queryDto);

      // Assert
      expect(firebaseService.queryDocuments).toHaveBeenCalled();
      expect(result[0]).toMatchObject({
        choreId: mockRegistryEntry.choreId,
        userId: mockRegistryEntry.userId,
        choreName: expect.any(String),
        userName: expect.any(String),
      });
    });

    it('should return empty array when no entries found', async () => {
      // Arrange
      const queryDto: RegistryQueryDto = {
        filter: RegistryFilter.ALL,
      };
      firebaseService.queryDocuments.mockResolvedValue([]);

      // Act
      const result = await service.findAll(householdId, queryDto);

      // Assert
      expect(result).toEqual([]);
    });

    it('should handle Firebase query errors', async () => {
      // Arrange
      const queryDto: RegistryQueryDto = {
        filter: RegistryFilter.ALL,
      };
      const error = new Error('Firebase query failed');
      firebaseService.queryDocuments.mockRejectedValue(error);

      // Act & Assert
      await expect(service.findAll(householdId, queryDto)).rejects.toThrow(
        error,
      );
    });
  });

  describe('create', () => {
    it('should create registry entry with default times', async () => {
      // Arrange
      const newEntryId = 'new-registry-id';
      const dtoWithoutTimes: CreateRegistryEntryDto = {
        choreId: 'chore-id-456',
        userId: 'user-uid-2',
      };
      firebaseService.createDocument.mockResolvedValue(newEntryId);

      // Act
      const result = await service.create(householdId, dtoWithoutTimes);

      // Assert
      expect(firebaseService.createDocument).toHaveBeenCalledWith(
        `households/${householdId}/registry`,
        expect.objectContaining({
          choreId: dtoWithoutTimes.choreId,
          userId: dtoWithoutTimes.userId,
          householdId,
          times: 1, // Default value
          completedAt: expect.any(Date),
          createdAt: expect.any(Date),
        }),
      );
      expect(result).toMatchObject({
        id: newEntryId,
        choreId: dtoWithoutTimes.choreId,
        userId: dtoWithoutTimes.userId,
        householdId,
        times: 1,
        choreName: expect.any(String),
        userName: expect.any(String),
        completedAt: expect.any(Date),
        createdAt: expect.any(Date),
      });
    });

    it('should create registry entry with specified times', async () => {
      // Arrange
      const newEntryId = 'new-registry-id';
      firebaseService.createDocument.mockResolvedValue(newEntryId);

      // Act
      const result = await service.create(
        householdId,
        mockCreateRegistryEntryDto,
      );

      // Assert
      expect(firebaseService.createDocument).toHaveBeenCalledWith(
        `households/${householdId}/registry`,
        expect.objectContaining({
          choreId: mockCreateRegistryEntryDto.choreId,
          userId: mockCreateRegistryEntryDto.userId,
          householdId,
          times: 2,
          completedAt: expect.any(Date),
          createdAt: expect.any(Date),
        }),
      );
      expect(result.times).toBe(2);
    });

    it('should set completedAt and createdAt to same time', async () => {
      // Arrange
      const newEntryId = 'new-registry-id';
      firebaseService.createDocument.mockResolvedValue(newEntryId);

      // Act
      const result = await service.create(
        householdId,
        mockCreateRegistryEntryDto,
      );

      // Assert
      expect(result.completedAt).toEqual(result.createdAt);
    });

    it('should handle Firebase create errors', async () => {
      // Arrange
      const error = new Error('Firebase create failed');
      firebaseService.createDocument.mockRejectedValue(error);

      // Act & Assert
      await expect(
        service.create(householdId, mockCreateRegistryEntryDto),
      ).rejects.toThrow(error);
    });
  });

  describe('createBatch', () => {
    it('should create multiple registry entries', async () => {
      // Arrange
      const batchDto: BatchRegistryDto = {
        chores: [
          { choreId: 'chore-1', userId: 'user-1', times: 1 },
          { choreId: 'chore-2', userId: 'user-2', times: 2 },
          { choreId: 'chore-3', userId: 'user-3', times: 3 },
        ],
      };
      firebaseService.createDocument
        .mockResolvedValueOnce('entry-id-1')
        .mockResolvedValueOnce('entry-id-2')
        .mockResolvedValueOnce('entry-id-3');

      // Act
      const result = await service.createBatch(householdId, batchDto);

      // Assert
      expect(firebaseService.createDocument).toHaveBeenCalledTimes(3);
      expect(result).toHaveLength(3);
      expect(result[0].choreId).toBe('chore-1');
      expect(result[1].choreId).toBe('chore-2');
      expect(result[2].choreId).toBe('chore-3');
      expect(result[0].times).toBe(1);
      expect(result[1].times).toBe(2);
      expect(result[2].times).toBe(3);
    });

    it('should return empty array when batch is empty', async () => {
      // Arrange
      const batchDto: BatchRegistryDto = {
        chores: [],
      };

      // Act
      const result = await service.createBatch(householdId, batchDto);

      // Assert
      expect(firebaseService.createDocument).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('should handle Firebase create errors during batch', async () => {
      // Arrange
      const batchDto: BatchRegistryDto = {
        chores: [
          { choreId: 'chore-1', userId: 'user-1' },
          { choreId: 'chore-2', userId: 'user-2' },
        ],
      };
      const error = new Error('Firebase create failed');
      firebaseService.createDocument
        .mockResolvedValueOnce('entry-id-1')
        .mockRejectedValueOnce(error);

      // Act & Assert
      await expect(service.createBatch(householdId, batchDto)).rejects.toThrow(
        error,
      );
      expect(firebaseService.createDocument).toHaveBeenCalledTimes(2);
    });

    it('should process entries sequentially in batch', async () => {
      // Arrange
      const batchDto: BatchRegistryDto = {
        chores: [
          { choreId: 'chore-1', userId: 'user-1' },
          { choreId: 'chore-2', userId: 'user-2' },
        ],
      };
      firebaseService.createDocument
        .mockResolvedValueOnce('entry-id-1')
        .mockResolvedValueOnce('entry-id-2');

      // Act
      const result = await service.createBatch(householdId, batchDto);

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('entry-id-1');
      expect(result[1].id).toBe('entry-id-2');
    });
  });
});
