import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRegistryEntryDto } from './dto/create-registry-entry.dto';
import { BatchRegistryDto } from './dto/batch-registry.dto';
import { RegistryQueryDto, RegistryFilter } from './dto/registry-query.dto';
import { RegistryResponseDto } from './dto/registry-response.dto';

@Injectable()
export class RegistryService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    householdId: string,
    queryDto: RegistryQueryDto,
  ): Promise<RegistryResponseDto[]> {
    const { filter = RegistryFilter.ALL, userId, limit = 50 } = queryDto;

    const dateRange = this.getDateRange(filter);

    // Single query with JOINs - no N+1 problem!
    const entries = await this.prisma.registryEntry.findMany({
      where: {
        householdId,
        ...(userId && { userId }),
        ...(dateRange && {
          completedAt: {
            gte: dateRange.start,
            lte: dateRange.end,
          },
        }),
      },
      include: {
        chore: true,
        user: true,
      },
      orderBy: { completedAt: 'desc' },
      take: limit,
    });

    return entries.map((entry) => ({
      id: entry.id,
      householdId: entry.householdId,
      choreId: entry.choreId,
      userId: entry.userId,
      times: entry.times,
      completedAt: entry.completedAt,
      createdAt: entry.createdAt,
      points: entry.chore.points,
      choreName: entry.chore.name,
      userName: entry.user.displayName || entry.user.email || 'Unknown User',
    }));
  }

  async create(
    householdId: string,
    createRegistryEntryDto: CreateRegistryEntryDto,
  ): Promise<RegistryResponseDto> {
    const entry = await this.prisma.registryEntry.create({
      data: {
        householdId,
        choreId: createRegistryEntryDto.choreId,
        userId: createRegistryEntryDto.userId,
        times: createRegistryEntryDto.times ?? 1,
      },
      include: {
        chore: true,
        user: true,
      },
    });

    return {
      id: entry.id,
      householdId: entry.householdId,
      choreId: entry.choreId,
      userId: entry.userId,
      times: entry.times,
      completedAt: entry.completedAt,
      createdAt: entry.createdAt,
      points: entry.chore.points,
      choreName: entry.chore.name,
      userName: entry.user.displayName || entry.user.email || 'Unknown User',
    };
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
