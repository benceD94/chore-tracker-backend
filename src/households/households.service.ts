import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHouseholdDto } from './dto/create-household.dto';
import { UpdateHouseholdDto } from './dto/update-household.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { HouseholdResponseDto } from './dto/household-response.dto';

@Injectable()
export class HouseholdsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllByUser(userUid: string): Promise<HouseholdResponseDto[]> {
    const households = await this.prisma.household.findMany({
      where: {
        members: {
          some: { userId: userUid },
        },
      },
      include: {
        members: {
          include: {
            user: true,
          },
        },
      },
    });

    return households.map((household) => ({
      id: household.id,
      name: household.name,
      createdBy: household.createdBy,
      memberIds: household.members.map((m) => m.userId),
      memberDetails: household.members.map((m) => ({
        id: m.user.uid,
        uid: m.user.uid,
        email: m.user.email ?? undefined,
        displayName: m.user.displayName ?? undefined,
        photoURL: m.user.photoURL ?? undefined,
        createdAt: m.user.createdAt,
        updatedAt: m.user.updatedAt,
      })),
      createdAt: household.createdAt,
      updatedAt: household.updatedAt,
    }));
  }

  async findOne(householdId: string): Promise<HouseholdResponseDto> {
    const household = await this.prisma.household.findUnique({
      where: { id: householdId },
      include: {
        members: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!household) {
      throw new NotFoundException(`Household with ID ${householdId} not found`);
    }

    return {
      id: household.id,
      name: household.name,
      createdBy: household.createdBy,
      memberIds: household.members.map((m) => m.userId),
      memberDetails: household.members.map((m) => ({
        id: m.user.uid,
        uid: m.user.uid,
        email: m.user.email ?? undefined,
        displayName: m.user.displayName ?? undefined,
        photoURL: m.user.photoURL ?? undefined,
        createdAt: m.user.createdAt,
        updatedAt: m.user.updatedAt,
      })),
      createdAt: household.createdAt,
      updatedAt: household.updatedAt,
    };
  }

  async create(
    createHouseholdDto: CreateHouseholdDto,
    creatorUid: string,
  ): Promise<HouseholdResponseDto> {
    const household = await this.prisma.household.create({
      data: {
        name: createHouseholdDto.name,
        createdBy: creatorUid,
        members: {
          create: {
            userId: creatorUid,
          },
        },
      },
      include: {
        members: {
          include: {
            user: true,
          },
        },
      },
    });

    return {
      id: household.id,
      name: household.name,
      createdBy: household.createdBy,
      memberIds: household.members.map((m) => m.userId),
      memberDetails: household.members.map((m) => ({
        id: m.user.uid,
        uid: m.user.uid,
        email: m.user.email ?? undefined,
        displayName: m.user.displayName ?? undefined,
        photoURL: m.user.photoURL ?? undefined,
        createdAt: m.user.createdAt,
        updatedAt: m.user.updatedAt,
      })),
      createdAt: household.createdAt,
      updatedAt: household.updatedAt,
    };
  }

  async update(
    householdId: string,
    updateHouseholdDto: UpdateHouseholdDto,
  ): Promise<HouseholdResponseDto> {
    const household = await this.prisma.household.update({
      where: { id: householdId },
      data: {
        name: updateHouseholdDto.name,
      },
      include: {
        members: {
          include: {
            user: true,
          },
        },
      },
    });

    return {
      id: household.id,
      name: household.name,
      createdBy: household.createdBy,
      memberIds: household.members.map((m) => m.userId),
      memberDetails: household.members.map((m) => ({
        id: m.user.uid,
        uid: m.user.uid,
        email: m.user.email ?? undefined,
        displayName: m.user.displayName ?? undefined,
        photoURL: m.user.photoURL ?? undefined,
        createdAt: m.user.createdAt,
        updatedAt: m.user.updatedAt,
      })),
      createdAt: household.createdAt,
      updatedAt: household.updatedAt,
    };
  }

  async addMember(
    householdId: string,
    addMemberDto: AddMemberDto,
  ): Promise<HouseholdResponseDto> {
    // Check if user is already a member
    const existingMembership = await this.prisma.householdMember.findUnique({
      where: {
        userId_householdId: {
          userId: addMemberDto.userId,
          householdId,
        },
      },
    });

    if (existingMembership) {
      throw new ConflictException('User is already a member of this household');
    }

    // Add the new member
    await this.prisma.householdMember.create({
      data: {
        userId: addMemberDto.userId,
        householdId,
      },
    });

    // Fetch and return the updated household
    return this.findOne(householdId);
  }
}
