export class Household {
  id?: string;
  name: string;
  memberIds: string[]; // Array of user UIDs
  createdBy: string; // User UID who created the household
  createdAt: Date;
  updatedAt: Date;
}
