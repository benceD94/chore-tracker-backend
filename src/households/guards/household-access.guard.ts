import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { FirebaseService } from '../../firebase/firebase.service';
import { Household } from '../entities/household.entity';

@Injectable()
export class HouseholdAccessGuard implements CanActivate {
  constructor(private readonly firebaseService: FirebaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const householdId = request.params.householdId;

    if (!user) {
      throw new ForbiddenException('User must be authenticated');
    }

    if (!householdId) {
      throw new ForbiddenException('Household ID is required');
    }

    // Fetch the household from Firestore
    const household = await this.firebaseService.getDocument<Household>(
      `households/${householdId}`,
    );

    if (!household) {
      throw new NotFoundException(`Household with ID ${householdId} not found`);
    }

    // Check if user is a member of the household
    if (!household.members.includes(user.uid)) {
      throw new ForbiddenException('You do not have access to this household');
    }

    // Attach household to request for use in controllers
    request.household = household;

    return true;
  }
}
