import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateChoreDto } from './dto/create-chore.dto';
import { UpdateChoreDto } from './dto/update-chore.dto';
import { ChoreResponseDto } from './dto/chore-response.dto';

@Injectable()
export class ChoresService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(householdId: string): Promise<ChoreResponseDto[]> {
    const chores = await this.prisma.chore.findMany({
      where: { householdId },
      include: {
        category: true,
        assignments: {
          include: {
            user: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return chores.map((chore) => ({
      id: chore.id,
      householdId: chore.householdId,
      name: chore.name,
      description: chore.description ?? undefined,
      points: chore.points,
      categoryId: chore.categoryId ?? undefined,
      categoryName: chore.category?.name,
      assignedTo: chore.assignments.map((a) => a.userId),
      createdAt: chore.createdAt,
      updatedAt: chore.updatedAt,
    }));
  }

  async findOne(
    householdId: string,
    choreId: string,
  ): Promise<ChoreResponseDto> {
    const chore = await this.prisma.chore.findFirst({
      where: {
        id: choreId,
        householdId,
      },
      include: {
        category: true,
        assignments: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!chore) {
      throw new NotFoundException(`Chore with ID ${choreId} not found`);
    }

    return {
      id: chore.id,
      householdId: chore.householdId,
      name: chore.name,
      description: chore.description ?? undefined,
      points: chore.points,
      categoryId: chore.categoryId ?? undefined,
      categoryName: chore.category?.name,
      assignedTo: chore.assignments.map((a) => a.userId),
      createdAt: chore.createdAt,
      updatedAt: chore.updatedAt,
    };
  }

  async create(
    householdId: string,
    createChoreDto: CreateChoreDto,
  ): Promise<ChoreResponseDto> {
    const chore = await this.prisma.chore.create({
      data: {
        householdId,
        name: createChoreDto.name,
        description: createChoreDto.description,
        points: createChoreDto.points,
        categoryId: createChoreDto.categoryId,
        assignments: createChoreDto.assignedTo
          ? {
              create: createChoreDto.assignedTo.map((userId) => ({
                userId,
              })),
            }
          : undefined,
      },
      include: {
        category: true,
        assignments: {
          include: {
            user: true,
          },
        },
      },
    });

    return {
      id: chore.id,
      householdId: chore.householdId,
      name: chore.name,
      description: chore.description ?? undefined,
      points: chore.points,
      categoryId: chore.categoryId ?? undefined,
      categoryName: chore.category?.name,
      assignedTo: chore.assignments.map((a) => a.userId),
      createdAt: chore.createdAt,
      updatedAt: chore.updatedAt,
    };
  }

  async update(
    householdId: string,
    choreId: string,
    updateChoreDto: UpdateChoreDto,
  ): Promise<ChoreResponseDto> {
    // Verify chore exists and belongs to household
    await this.findOne(householdId, choreId);

    // Update chore assignments if provided
    if (updateChoreDto.assignedTo !== undefined) {
      // Delete existing assignments
      await this.prisma.choreAssignment.deleteMany({
        where: { choreId },
      });

      // Create new assignments
      if (updateChoreDto.assignedTo.length > 0) {
        await this.prisma.choreAssignment.createMany({
          data: updateChoreDto.assignedTo.map((userId) => ({
            choreId,
            userId,
          })),
        });
      }
    }

    // Update the chore itself
    const chore = await this.prisma.chore.update({
      where: { id: choreId },
      data: {
        name: updateChoreDto.name,
        description: updateChoreDto.description,
        categoryId: updateChoreDto.categoryId,
      },
      include: {
        category: true,
        assignments: {
          include: {
            user: true,
          },
        },
      },
    });

    return {
      id: chore.id,
      householdId: chore.householdId,
      name: chore.name,
      description: chore.description ?? undefined,
      points: chore.points,
      categoryId: chore.categoryId ?? undefined,
      categoryName: chore.category?.name,
      assignedTo: chore.assignments.map((a) => a.userId),
      createdAt: chore.createdAt,
      updatedAt: chore.updatedAt,
    };
  }

  async remove(householdId: string, choreId: string): Promise<void> {
    // Verify chore exists and belongs to household
    await this.findOne(householdId, choreId);

    // Delete the chore (assignments will cascade)
    await this.prisma.chore.delete({
      where: { id: choreId },
    });
  }
}
