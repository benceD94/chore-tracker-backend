export class Chore {
  id?: string;
  householdId: string;
  name: string;
  points: number;
  description?: string;
  categoryId?: string;
  assignedTo?: string[]; // Array of user UIDs
  createdAt: Date;
  updatedAt: Date;
}
