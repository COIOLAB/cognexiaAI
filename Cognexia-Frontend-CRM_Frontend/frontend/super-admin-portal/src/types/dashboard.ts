export interface PlatformMetrics {
  totalOrganizations: number;
  activeOrganizations: number;
  trialOrganizations: number;
  suspendedOrganizations: number;
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
  monthlyRecurringRevenue: number;
  annualRecurringRevenue: number;
  averageRevenuePerUser: number;
  totalRevenue: number;
  revenueThisMonth: number;
  churnRate: number;
  growthRate: number;
}

export interface RevenueDataPoint {
  date: string;
  revenue: number;
  subscriptions: number;
  newOrganizations: number;
}

export interface OrganizationGrowthDataPoint {
  date: string;
  total: number;
  active: number;
  trial: number;
  churned: number;
}

export interface SubscriptionDistribution {
  planName: string;
  count: number;
  revenue: number;
  percentage: number;
}

export interface ActivityLog {
  id: string;
  type: 'ORGANIZATION_CREATED' | 'ORGANIZATION_SUSPENDED' | 'USER_INVITED' | 'SUBSCRIPTION_UPGRADED' | 'SUBSCRIPTION_DOWNGRADED' | 'SUBSCRIPTION_CANCELED' | 'PAYMENT_RECEIVED' | 'PAYMENT_FAILED';
  title: string;
  description: string;
  organizationId?: string;
  organizationName?: string;
  userId?: string;
  userName?: string;
  metadata?: Record<string, any>;
  createdAt: Date | string;
}

export interface SystemHealth {
  status: 'HEALTHY' | 'DEGRADED' | 'DOWN';
  apiStatus: 'UP' | 'DOWN';
  databaseStatus: 'UP' | 'DOWN';
  redisStatus: 'UP' | 'DOWN';
  stripeStatus: 'UP' | 'DOWN';
  emailServiceStatus: 'UP' | 'DOWN';
  uptime: number;
  avgResponseTime: number;
  errorRate: number;
  requestsPerMinute: number;
  lastChecked: Date | string;
}

export interface SystemMetrics {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  activeConnections: number;
  queueSize: number;
  cacheHitRate: number;
}

export interface ErrorLog {
  id: string;
  level: 'ERROR' | 'WARNING' | 'CRITICAL';
  message: string;
  stack?: string;
  endpoint?: string;
  method?: string;
  statusCode?: number;
  userId?: string;
  organizationId?: string;
  metadata?: Record<string, any>;
  count: number;
  firstOccurred: Date | string;
  lastOccurred: Date | string;
}

export interface AnalyticsTimeRange {
  start: Date | string;
  end: Date | string;
  preset?: '7d' | '30d' | '90d' | '1y' | 'custom';
}

export interface ChurnAnalytics {
  churnRate: number;
  churnedOrganizations: number;
  churnReasonDistribution: {
    reason: string;
    count: number;
    percentage: number;
  }[];
  churnTrend: {
    date: string;
    churnRate: number;
    churned: number;
  }[];
}

export interface CustomerMetrics {
  totalCustomers: number;
  activeCustomers: number;
  averageLifetimeValue: number;
  averageCustomerAge: number;
  retentionRate: number;
  customersByPlan: {
    planName: string;
    count: number;
  }[];
}
