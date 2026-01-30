/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class HouseholdAccessGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

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

    // Check if user is a member of the household
    const membership = await this.prisma.householdMember.findUnique({
      where: {
        userId_householdId: {
          userId: user.uid,
          householdId,
        },
      },
      include: {
        household: true,
      },
    });

    if (!membership) {
      // Check if household exists to provide better error message
      const household = await this.prisma.household.findUnique({
        where: { id: householdId },
      });

      if (!household) {
        throw new NotFoundException(
          `Household with ID ${householdId} not found`,
        );
      }

      throw new ForbiddenException('You do not have access to this household');
    }

    // Attach household to request for use in controllers
    request.household = membership.household;

    return true;
  }
}
