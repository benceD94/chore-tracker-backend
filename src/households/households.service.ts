import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { CreateHouseholdDto } from './dto/create-household.dto';
import { UpdateHouseholdDto } from './dto/update-household.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { HouseholdResponseDto } from './dto/household-response.dto';
import { Household } from './entities/household.entity';

@Injectable()
export class HouseholdsService {
  constructor(private readonly firebaseService: FirebaseService) {}

  async findAllByUser(userUid: string): Promise<HouseholdResponseDto[]> {
    const households = await this.firebaseService.queryDocuments<Household>(
      'households',
      (query) => query.where('members', 'array-contains', userUid),
    );

    return households as HouseholdResponseDto[];
  }

  async findOne(householdId: string): Promise<HouseholdResponseDto> {
    const household = await this.firebaseService.getDocument<Household>(
      `households/${householdId}`,
    );

    if (!household) {
      throw new NotFoundException(`Household with ID ${householdId} not found`);
    }

    return household as HouseholdResponseDto;
  }

  async create(
    createHouseholdDto: CreateHouseholdDto,
    creatorUid: string,
  ): Promise<HouseholdResponseDto> {
    const now = new Date();
    const householdData = {
      ...createHouseholdDto,
      members: [creatorUid],
      createdBy: creatorUid,
      createdAt: now,
      updatedAt: now,
    };

    const householdId = await this.firebaseService.createDocument<Household>(
      'households',
      householdData,
    );

    return {
      id: householdId,
      ...householdData,
    };
  }

  async update(
    householdId: string,
    updateHouseholdDto: UpdateHouseholdDto,
  ): Promise<HouseholdResponseDto> {
    const household = await this.findOne(householdId);

    const updatedData = {
      ...updateHouseholdDto,
      updatedAt: new Date(),
    };

    await this.firebaseService.updateDocument<Household>(
      `households/${householdId}`,
      updatedData,
    );

    return {
      ...household,
      ...updatedData,
    };
  }

  async addMember(
    householdId: string,
    addMemberDto: AddMemberDto,
  ): Promise<HouseholdResponseDto> {
    const household = await this.findOne(householdId);

    // Check if user is already a member
    if (household.members.includes(addMemberDto.userId)) {
      throw new ConflictException('User is already a member of this household');
    }

    const updatedMembers = [...household.members, addMemberDto.userId];

    await this.firebaseService.updateDocument<Household>(
      `households/${householdId}`,
      {
        members: updatedMembers,
        updatedAt: new Date(),
      },
    );

    return {
      ...household,
      members: updatedMembers,
      updatedAt: new Date(),
    };
  }
}
