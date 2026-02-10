export type UserRole =
  | 'admin'
  | 'client'
  | 'interno'
  | 'registering'
  | 'registered';

export interface User {
  id: string;
  name: string;
  email: string;
  position: string;
  phone?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthUser extends User {
  isAdmin: boolean;
}
