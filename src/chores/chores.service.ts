import { Injectable, NotFoundException } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { CreateChoreDto } from './dto/create-chore.dto';
import { UpdateChoreDto } from './dto/update-chore.dto';
import { ChoreResponseDto } from './dto/chore-response.dto';
import { Chore } from './entities/chore.entity';
import { Category } from '../categories/entities/category.entity';

@Injectable()
export class ChoresService {
  constructor(private readonly firebaseService: FirebaseService) {}

  async findAll(householdId: string): Promise<ChoreResponseDto[]> {
    const chores = await this.firebaseService.queryDocuments<Chore>(
      `households/${householdId}/chores`,
      (query) => query.orderBy('name', 'asc'),
    );

    // Enrich chores with category names
    return Promise.all(
      chores.map((chore) => this.enrichChore(householdId, chore)),
    );
  }

  async findOne(
    householdId: string,
    choreId: string,
  ): Promise<ChoreResponseDto> {
    const chore = await this.firebaseService.getDocument<Chore>(
      `households/${householdId}/chores/${choreId}`,
    );

    if (!chore) {
      throw new NotFoundException(`Chore with ID ${choreId} not found`);
    }

    // Enrich with category name
    return this.enrichChore(householdId, chore);
  }

  async create(
    householdId: string,
    createChoreDto: CreateChoreDto,
  ): Promise<ChoreResponseDto> {
    const now = new Date();
    const choreData = {
      ...createChoreDto,
      householdId,
      createdAt: now,
      updatedAt: now,
    };

    const choreId = await this.firebaseService.createDocument<Chore>(
      `households/${householdId}/chores`,
      choreData,
    );

    const chore = {
      id: choreId,
      ...choreData,
    };

    // Enrich with category name
    return this.enrichChore(householdId, chore);
  }

  async update(
    householdId: string,
    choreId: string,
    updateChoreDto: UpdateChoreDto,
  ): Promise<ChoreResponseDto> {
    const chore = await this.findOne(householdId, choreId);

    const updatedData = {
      ...updateChoreDto,
      updatedAt: new Date(),
    };

    await this.firebaseService.updateDocument<Chore>(
      `households/${householdId}/chores/${choreId}`,
      updatedData,
    );

    const updatedChore = {
      ...chore,
      ...updatedData,
    };

    // Enrich with category name
    return this.enrichChore(householdId, updatedChore);
  }

  async remove(householdId: string, choreId: string): Promise<void> {
    // Verify chore exists first
    await this.findOne(householdId, choreId);

    await this.firebaseService.deleteDocument(
      `households/${householdId}/chores/${choreId}`,
    );
  }

  private async enrichChore(
    householdId: string,
    chore: Chore & { id?: string },
  ): Promise<ChoreResponseDto> {
    let categoryName: string | undefined;

    // Fetch category name if categoryId exists
    if (chore.categoryId) {
      const category = await this.firebaseService.getDocument<Category>(
        `households/${householdId}/categories/${chore.categoryId}`,
      );
      categoryName = category?.name;
    }

    return {
      ...chore,
      id: chore.id!,
      categoryName,
    };
  }
}
