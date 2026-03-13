// Global type declarations for Express
// This file extends the Express namespace to include our custom User interface

declare global {
  namespace Express {
    interface User {
      id: string;
      email?: string;
      role?: string;
      organizationId?: string;
      username?: string;
      firstName?: string;
      lastName?: string;
      permissions?: string[];
      isActive?: boolean;
    }
  }
}

export {};
