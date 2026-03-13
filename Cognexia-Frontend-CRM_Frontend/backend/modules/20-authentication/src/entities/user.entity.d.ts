import { UserRole } from './user-role.entity';
export declare enum UserStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
    SUSPENDED = "suspended",
    PENDING = "pending"
}
export declare enum UserType {
    SUPER_ADMIN = "super_admin",
    ADMIN = "admin",
    MANAGER = "manager",
    SUPERVISOR = "supervisor",
    OPERATOR = "operator",
    VIEWER = "viewer",
    EXTERNAL = "external"
}
export declare class User {
    id: string;
    email: string;
    username: string;
    password: string;
    firstName: string;
    lastName: string;
    middleName?: string;
    phoneNumber?: string;
    profileImage?: string;
    status: UserStatus;
    userType: UserType;
    isEmailVerified: boolean;
    isTwoFactorEnabled: boolean;
    twoFactorSecret?: string;
    department?: string;
    jobTitle?: string;
    location?: string;
    managerId?: string;
    employeeId?: string;
    preferences?: Record<string, any>;
    settings?: Record<string, any>;
    lastLoginAt?: Date;
    lastLoginIp?: string;
    passwordChangedAt?: Date;
    passwordResetToken?: string;
    passwordResetExpires?: Date;
    emailVerificationToken?: string;
    emailVerificationExpires?: Date;
    loginAttempts: number;
    lockUntil?: Date;
    createdAt: Date;
    updatedAt: Date;
    userRoles: UserRole[];
    get fullName(): string;
    get isLocked(): boolean;
    get isActive(): boolean;
    hashPassword(): Promise<void>;
    validatePassword(password: string): Promise<boolean>;
    incrementLoginAttempts(): void;
    resetLoginAttempts(): void;
    updateLastLogin(ipAddress?: string): void;
    generatePasswordResetToken(): string;
    generateEmailVerificationToken(): string;
    clearPasswordResetToken(): void;
    clearEmailVerificationToken(): void;
    toJSON(): Omit<this, "password" | "twoFactorSecret" | "passwordResetToken" | "emailVerificationToken" | "hashPassword" | "fullName" | "isLocked" | "isActive" | "validatePassword" | "incrementLoginAttempts" | "resetLoginAttempts" | "updateLastLogin" | "generatePasswordResetToken" | "generateEmailVerificationToken" | "clearPasswordResetToken" | "clearEmailVerificationToken" | "toJSON">;
}
//# sourceMappingURL=user.entity.d.ts.map