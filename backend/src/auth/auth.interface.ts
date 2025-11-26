import { UserRole } from 'src/users/user.schema';

export interface IUserPayload {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
}
