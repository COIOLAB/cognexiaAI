export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  OWNER = 'OWNER',
  USER = 'USER',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING = 'PENDING',
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  userType: string;
  organizationId?: string;
  organizationName?: string;
  roles: string[];
  profileImage?: string;
  phoneNumber?: string;
  lastLoginAt?: Date | string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface InviteUserRequest {
  email: string;
  role: UserRole;
  organizationId: string;
  name?: string;
}

export interface UpdateUserRequest {
  name?: string;
  role?: UserRole;
  status?: UserStatus;
  phoneNumber?: string;
}
