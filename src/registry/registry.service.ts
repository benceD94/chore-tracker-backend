import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { CreateRegistryEntryDto } from './dto/create-registry-entry.dto';
import { BatchRegistryDto } from './dto/batch-registry.dto';
import { RegistryQueryDto, RegistryFilter } from './dto/registry-query.dto';
import { RegistryResponseDto } from './dto/registry-response.dto';
import { RegistryEntry } from './entities/registry-entry.entity';
import { Chore } from '../chores/entities/chore.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class RegistryService {
  constructor(private readonly firebaseService: FirebaseService) {}

  async findAll(
    householdId: string,
    queryDto: RegistryQueryDto,
  ): Promise<RegistryResponseDto[]> {
    const { filter = RegistryFilter.ALL, userId, limit = 50 } = queryDto;

    const dateRange = this.getDateRange(filter);

    const entries = await this.firebaseService.queryDocuments<RegistryEntry>(
      `households/${householdId}/registry`,
      (query) => {
        let q = query;

        // Filter by date range if not "all"
        if (dateRange) {
          q = q
            .where('completedAt', '>=', dateRange.start)
            .where('completedAt', '<=', dateRange.end);
        }

        // Filter by user if specified
        if (userId) {
          q = q.where('userId', '==', userId);
        }

        // Order by completion date descending and limit
        q = q.orderBy('completedAt', 'desc').limit(limit);

        return q;
      },
    );

    // Enrich entries with denormalized data
    return Promise.all(
      entries.map((entry) =>
        this.enrichRegistryEntry(
          householdId,
          entry as RegistryEntry & { id: string },
        ),
      ),
    );
  }

  async create(
    householdId: string,
    createRegistryEntryDto: CreateRegistryEntryDto,
  ): Promise<RegistryResponseDto> {
    const now = new Date();
    const entryData = {
      ...createRegistryEntryDto,
      householdId,
      times: createRegistryEntryDto.times ?? 1,
      completedAt: now,
      createdAt: now,
    };

    const entryId = await this.firebaseService.createDocument<RegistryEntry>(
      `households/${householdId}/registry`,
      entryData,
    );

    const entry = {
      id: entryId,
      ...entryData,
    };

    // Enrich with denormalized data
    return this.enrichRegistryEntry(householdId, entry);
  }

  async createBatch(
    householdId: string,
    batchRegistryDto: BatchRegistryDto,
  ): Promise<RegistryResponseDto[]> {
    const results: RegistryResponseDto[] = [];

    for (const entry of batchRegistryDto.chores) {
      const result = await this.create(householdId, entry);
      results.push(result);
    }

    return results;
  }

  private async enrichRegistryEntry(
    householdId: string,
    entry: RegistryEntry & { id: string },
  ): Promise<RegistryResponseDto> {
    // Fetch chore to get the chore name
    const chore = await this.firebaseService.getDocument<Chore>(
      `households/${householdId}/chores/${entry.choreId}`,
    );

    // Fetch user from users collection to get display name (using UID as document ID)
    const user = await this.firebaseService.getDocument<User>(
      `users/${entry.userId}`,
    );

    return {
      ...entry,
      points: chore?.points || 0,
      choreName: chore?.name || 'Unknown Chore',
      userName: user?.displayName || 'Unknown User',
    };
  }

  private getDateRange(
    filter: RegistryFilter,
  ): { start: Date; end: Date } | null {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (filter) {
      case RegistryFilter.TODAY:
        return {
          start: today,
          end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1),
        };

      case RegistryFilter.YESTERDAY: {
        const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
        return {
          start: yesterday,
          end: new Date(yesterday.getTime() + 24 * 60 * 60 * 1000 - 1),
        };
      }

      case RegistryFilter.THIS_WEEK: {
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday
        return {
          start: startOfWeek,
          end: new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000 - 1),
        };
      }

      case RegistryFilter.LAST_WEEK: {
        const startOfLastWeek = new Date(today);
        startOfLastWeek.setDate(today.getDate() - today.getDay() - 7);
        return {
          start: startOfLastWeek,
          end: new Date(
            startOfLastWeek.getTime() + 7 * 24 * 60 * 60 * 1000 - 1,
          ),
        };
      }

      case RegistryFilter.THIS_MONTH: {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        return {
          start: startOfMonth,
          end: new Date(endOfMonth.getTime() + 24 * 60 * 60 * 1000 - 1),
        };
      }

      case RegistryFilter.ALL:
      default:
        return null;
    }
  }
}
