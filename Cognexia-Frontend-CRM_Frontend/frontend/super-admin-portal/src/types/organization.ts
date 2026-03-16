export enum OrganizationStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  TRIAL = 'trial',
  CANCELLED = 'cancelled',
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  status: OrganizationStatus;
  subscriptionPlanId?: string;
  subscriptionPlan?: {
    id: string;
    name: string;
    price: number;
  };
  ownerId: string;
  owner?: {
    id: string;
    name: string;
    email: string;
  };
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  accountId?: string;
  industry?: string;
  accountType?: string;
  accountOwner?: string;
  accountStatus?: string;
  createdDate?: string;
  brandingLogo?: string;
  brandingColor?: string;
  userCount?: number;
  maxUsers?: number;
  trialEndsAt?: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface CreateOrganizationRequest {
  name: string;
  slug: string;
  email: string;
  ownerEmail: string;
  ownerName: string;
  subscriptionPlanId: string;
  phone?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  accountId?: string;
  industry?: string;
  accountType?: string;
  accountOwner?: string;
  accountStatus?: string;
  createdDate?: string;
}

export interface UpdateOrganizationRequest {
  name?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  accountId?: string;
  industry?: string;
  accountType?: string;
  accountOwner?: string;
  accountStatus?: string;
  createdDate?: string;
  brandingLogo?: string;
  brandingColor?: string;
  maxUsers?: number;
}

export interface OrganizationStats {
  totalUsers: number;
  activeUsers: number;
  totalRevenue: number;
  monthlyRevenue: number;
  storageUsed: number;
  apiCallsThisMonth: number;
}
