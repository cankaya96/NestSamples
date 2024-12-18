import { User } from '@prisma/client';

export class UserEntity implements User {
  id: number;
  email: string;
  name: string | null;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}
