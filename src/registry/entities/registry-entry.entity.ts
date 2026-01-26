export class RegistryEntry {
  id?: string;
  householdId: string;
  choreId: string;
  userId: string;
  times: number; // Number of times the chore was completed
  completedAt: Date;
  createdAt: Date;
}
