import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { UsersService } from '../users/users.service';
import { CreateHouseholdDto } from './dto/create-household.dto';
import { UpdateHouseholdDto } from './dto/update-household.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { HouseholdResponseDto } from './dto/household-response.dto';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { Household } from './entities/household.entity';

@Injectable()
export class HouseholdsService {
  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly usersService: UsersService,
  ) {}

  private async populateMemberDetails(
    household: Household,
  ): Promise<HouseholdResponseDto> {
    const memberDetailsPromises = household.memberIds.map(async (uid) => {
      try {
        const user = await this.usersService.findByUid(uid);
        return user;
      } catch (error) {
        console.warn(`User with UID ${uid} not found:`, error.message);
        return null;
      }
    });

    const memberDetails = (await Promise.all(memberDetailsPromises)).filter(
      (member): member is UserResponseDto => member !== null,
    );

    return {
      ...household,
      memberDetails,
    } as HouseholdResponseDto;
  }

  async findAllByUser(userUid: string): Promise<HouseholdResponseDto[]> {
    const households = await this.firebaseService.queryDocuments<Household>(
      'households',
      (query) => query.where('memberIds', 'array-contains', userUid),
    );

    return Promise.all(
      households.map((household) => this.populateMemberDetails(household)),
    );
  }

  async findOne(householdId: string): Promise<HouseholdResponseDto> {
    const household = await this.firebaseService.getDocument<Household>(
      `households/${householdId}`,
    );

    if (!household) {
      throw new NotFoundException(`Household with ID ${householdId} not found`);
    }

    return this.populateMemberDetails(household);
  }

  async create(
    createHouseholdDto: CreateHouseholdDto,
    creatorUid: string,
  ): Promise<HouseholdResponseDto> {
    const now = new Date();
    const householdData = {
      ...createHouseholdDto,
      memberIds: [creatorUid],
      createdBy: creatorUid,
      createdAt: now,
      updatedAt: now,
    };

    const householdId = await this.firebaseService.createDocument<Household>(
      'households',
      householdData,
    );

    const household: Household = {
      id: householdId,
      ...householdData,
    };

    return this.populateMemberDetails(household);
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

    const updatedHousehold: Household = {
      ...household,
      ...updatedData,
    };

    return this.populateMemberDetails(updatedHousehold);
  }

  async addMember(
    householdId: string,
    addMemberDto: AddMemberDto,
  ): Promise<HouseholdResponseDto> {
    const household = await this.findOne(householdId);

    // Check if user is already a member
    if (household.memberIds.includes(addMemberDto.userId)) {
      throw new ConflictException('User is already a member of this household');
    }

    const updatedMembers = [...household.memberIds, addMemberDto.userId];
    const now = new Date();

    await this.firebaseService.updateDocument<Household>(
      `households/${householdId}`,
      {
        memberIds: updatedMembers,
        updatedAt: now,
      },
    );

    const updatedHousehold: Household = {
      ...household,
      memberIds: updatedMembers,
      updatedAt: now,
    };

    return this.populateMemberDetails(updatedHousehold);
  }
}
