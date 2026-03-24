// User types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role?: string;
  userType?: string;
  roles?: string[];
  permissions?: string[];
  organizationId: string;
  organizationName?: string;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Organization types
export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  plan: string;
  isActive: boolean;
  settings?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// Role & Permission types
export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: Permission[];
}

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  description?: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  meta?: {
    pagination?: PaginationMeta;
    filters?: Record<string, any>;
    sorting?: Record<string, string>;
  };
}

export interface PaginatedApiResponse<T = any> {
  success: boolean;
  data: T[];
  message?: string;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Error types
export interface ApiError {
  success: false;
  message: string;
  errors?: Array<{
    field: string;
    value: any;
    constraints: Record<string, string>;
  }>;
  statusCode: number;
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  organizationName: string;
  industry: string;
  companySize: string;
}

// =================== CRM - CUSTOMER TYPES ===================

export enum CustomerType {
  B2B = 'b2b',
  B2C = 'b2c',
  B2B2C = 'b2b2c',
}

export enum CustomerStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PROSPECT = 'prospect',
  CHURNED = 'churned',
  SUSPENDED = 'suspended',
}

export enum CustomerSize {
  STARTUP = 'startup',
  SMB = 'small_medium',
  ENTERPRISE = 'enterprise',
  LARGE_ENTERPRISE = 'large_enterprise',
  INDIVIDUAL = 'individual',
}

export enum CustomerTier {
  BRONZE = 'bronze',
  SILVER = 'silver',
  GOLD = 'gold',
  PLATINUM = 'platinum',
  DIAMOND = 'diamond',
}

export enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum GrowthPotential {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  VERY_HIGH = 'very_high',
}

export interface Customer {
  id: string;
  customerCode: string;
  companyName: string;
  customerType: CustomerType;
  status: CustomerStatus;
  industry: string;
  size: CustomerSize;
  primaryContact: {
    firstName: string;
    lastName: string;
    title: string;
    email: string;
    phone: string;
    mobile?: string;
    linkedin?: string;
    skype?: string;
  };
  address: {
    street: string;
    city: string;
    state?: string;
    country: string;
    zipCode: string;
    region: string;
    latitude?: number;
    longitude?: number;
  };
  demographics: {
    foundedYear?: number;
    employeeCount?: number;
    annualRevenue?: number;
    website?: string;
    taxId?: string;
    duns?: string;
    sicCode?: string;
    naicsCode?: string;
  };
  preferences: {
    language: string;
    currency: string;
    timezone: string;
    communicationChannels: string[];
    marketingOptIn: boolean;
    newsletterOptIn: boolean;
    eventInvitations: boolean;
    privacySettings: {
      dataSharing: boolean;
      analytics: boolean;
      marketing: boolean;
    };
  };
  salesMetrics: {
    totalRevenue: number;
    lastOrderDate?: string;
    lastOrderValue?: number;
    averageOrderValue: number;
    orderFrequency?: string;
    paymentTerms: string;
    creditLimit?: number;
    outstandingBalance?: number;
    discountRate?: number;
  };
  relationshipMetrics: {
    customerSince: string;
    loyaltyScore: number;
    satisfactionScore: number;
    npsScore: number;
    lastInteractionDate?: string;
    interactionFrequency?: string;
    preferredSalesRep?: string;
    accountManager?: string;
    supportTickets?: number;
    escalations?: number;
  };
  segmentation: {
    segment: string;
    tier: CustomerTier;
    riskLevel: RiskLevel;
    growthPotential: GrowthPotential;
    competitiveThreats?: string[];
    strategicValue?: number;
  };
  socialMedia?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    youtube?: string;
  };
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerDto {
  companyName: string;
  customerType: CustomerType;
  industry: string;
  size: CustomerSize;
  primaryContact: {
    firstName: string;
    lastName: string;
    title: string;
    email: string;
    phone: string;
    mobile?: string;
    linkedin?: string;
  };
  address: {
    street: string;
    city: string;
    state?: string;
    country: string;
    zipCode: string;
    region: string;
  };
  demographics?: Partial<Customer['demographics']>;
  preferences?: Partial<Customer['preferences']>;
  salesMetrics?: Partial<Customer['salesMetrics']>;
  tags?: string[];
}

export interface UpdateCustomerDto extends Partial<CreateCustomerDto> {
  status?: CustomerStatus;
  segmentation?: Partial<Customer['segmentation']>;
}

export interface CustomerFilters {
  page?: number;
  limit?: number;
  segment?: string;
  region?: string;
  industry?: string;
  status?: CustomerStatus;
  customerType?: CustomerType;
  tier?: CustomerTier;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// =================== CRM - CONTACT TYPES ===================

export enum ContactType {
  PRIMARY = 'primary',
  DECISION_MAKER = 'decision_maker',
  INFLUENCER = 'influencer',
  TECHNICAL = 'technical',
  FINANCIAL = 'financial',
  LEGAL = 'legal',
  END_USER = 'end_user',
  CHAMPION = 'champion',
  GATEKEEPER = 'gatekeeper',
}

export enum ContactStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DO_NOT_CONTACT = 'do_not_contact',
  BOUNCED = 'bounced',
  UNSUBSCRIBED = 'unsubscribed',
}

export enum ContactRole {
  CEO = 'ceo',
  CTO = 'cto',
  CFO = 'cfo',
  VP_SALES = 'vp_sales',
  VP_MARKETING = 'vp_marketing',
  VP_OPERATIONS = 'vp_operations',
  DIRECTOR = 'director',
  MANAGER = 'manager',
  SUPERVISOR = 'supervisor',
  ANALYST = 'analyst',
  COORDINATOR = 'coordinator',
  SPECIALIST = 'specialist',
  CONSULTANT = 'consultant',
  OTHER = 'other',
}

export interface Contact {
  id: string;
  type: ContactType;
  status: ContactStatus;
  firstName: string;
  lastName: string;
  middleName?: string;
  fullName: string;
  title: string;
  department?: string;
  role?: ContactRole;
  seniorityLevel?: string;
  reportsTo?: string;
  email: string;
  secondaryEmail?: string;
  workPhone?: string;
  mobilePhone?: string;
  homePhone?: string;
  fax?: string;
  workAddress?: {
    street: string;
    suite?: string;
    city: string;
    state?: string;
    country: string;
    zipCode: string;
  };
  personalAddress?: {
    street: string;
    city: string;
    state?: string;
    country: string;
    zipCode: string;
  };
  socialProfiles?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
    github?: string;
    website?: string;
    blog?: string;
  };
  yearsOfExperience?: number;
  education?: {
    degree?: string;
    institution?: string;
    graduationYear?: number;
    fieldOfStudy?: string;
    certifications?: string[];
  };
  skills: string[];
  interests: string[];
  languages: string[];
  influence: number;
  budgetAuthority: boolean;
  customerId: string;
  customer?: Customer;
  createdAt: string;
  updatedAt: string;
}

export interface CreateContactDto {
  type: ContactType;
  firstName: string;
  lastName: string;
  middleName?: string;
  title: string;
  department?: string;
  role?: ContactRole;
  email: string;
  secondaryEmail?: string;
  workPhone?: string;
  mobilePhone?: string;
  workAddress?: Contact['workAddress'];
  socialProfiles?: Contact['socialProfiles'];
  education?: Contact['education'];
  skills?: string[];
  interests?: string[];
  languages?: string[];
  influence?: number;
  budgetAuthority?: boolean;
  customerId: string;
}

export interface UpdateContactDto extends Partial<CreateContactDto> {
  status?: ContactStatus;
}

export interface ContactFilters {
  page?: number;
  limit?: number;
  type?: ContactType;
  status?: ContactStatus;
  role?: ContactRole;
  customerId?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// =================== CRM - LEAD TYPES ===================

export enum LeadStatus {
  NEW = 'new',
  CONTACTED = 'contacted',
  QUALIFIED = 'qualified',
  UNQUALIFIED = 'unqualified',
  CONVERTED = 'converted',
  LOST = 'lost',
}

export enum LeadSource {
  WEBSITE = 'website',
  REFERRAL = 'referral',
  SOCIAL_MEDIA = 'social_media',
  EMAIL_CAMPAIGN = 'email_campaign',
  COLD_CALL = 'cold_call',
  TRADE_SHOW = 'trade_show',
  PARTNER = 'partner',
  OTHER = 'other',
}

export interface Lead {
  id: string;
  leadCode: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone?: string;
  company?: string;
  title?: string;
  status: LeadStatus;
  source: LeadSource;
  score: number;
  qualificationStatus?: 'qualified' | 'unqualified' | 'pending';
  assignedTo?: string;
  customerId?: string;
  opportunityId?: string;
  notes?: string;
  budget?: number;
  timeline?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLeadDto {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  title?: string;
  source: LeadSource;
  notes?: string;
  assignedTo?: string;
}

export interface UpdateLeadDto extends Partial<CreateLeadDto> {
  status?: LeadStatus;
  score?: number;
}

export interface LeadFilters {
  page?: number;
  limit?: number;
  status?: LeadStatus;
  source?: LeadSource;
  assignedTo?: string;
  minScore?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface QualifyLeadDto {
  qualified: boolean;
  notes?: string;
  budget?: number;
  timeline?: string;
}

export interface ConvertLeadDto {
  createCustomer: boolean;
  createOpportunity: boolean;
}

// =================== CRM - OPPORTUNITY TYPES ===================

export enum OpportunityStage {
  PROSPECTING = 'prospecting',
  QUALIFICATION = 'qualification',
  PROPOSAL = 'proposal',
  NEGOTIATION = 'negotiation',
  CLOSED_WON = 'closed_won',
  CLOSED_LOST = 'closed_lost',
}

export enum OpportunityStatus {
  OPEN = 'open',
  WON = 'won',
  LOST = 'lost',
}

export interface Opportunity {
  opportunityNumber: String;
  id: string;
  opportunityCode: string;
  name: string;
  description?: string;
  stage: OpportunityStage;
  status: OpportunityStatus;
  amount: number;
  probability: number;
  weightedValue: number;
  expectedCloseDate: string;
  actualCloseDate?: string;
  customerId: string;
  customer?: Customer;
  contactId?: string;
  assignedTo?: string;
  products?: string[];
  competitors?: string[];
  lostReason?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOpportunityDto {
  name: string;
  description?: string;
  amount: number;
  expectedCloseDate: string;
  customerId: string;
  contactId?: string;
  assignedTo?: string;
  products?: string[];
}

export interface UpdateOpportunityDto extends Partial<CreateOpportunityDto> {
  stage?: OpportunityStage;
  status?: OpportunityStatus;
  probability?: number;
  actualCloseDate?: string;
  lostReason?: string;
}

export interface OpportunityFilters {
  page?: number;
  limit?: number;
  stage?: OpportunityStage;
  status?: OpportunityStatus;
  customerId?: string;
  assignedTo?: string;
  minAmount?: number;
  maxAmount?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// =================== CRM - ACCOUNT TYPES ===================

export enum AccountType {
  PROSPECT = 'prospect',
  CUSTOMER = 'customer',
  PARTNER = 'partner',
  COMPETITOR = 'competitor',
  VENDOR = 'vendor',
  RESELLER = 'reseller',
}

export enum AccountStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  POTENTIAL = 'potential',
  LOST = 'lost',
  CHURNED = 'churned',
}

export interface Account {
  id: string;
  accountNumber: string;
  name: string;
  type: AccountType;
  status: AccountStatus;
  industry: string;
  website?: string;
  parentAccount?: string;
  owner: string;
  team: string[];
  revenue: number;
  priorityScore: number;
  details: {
    employees?: number;
    annualRevenue?: number;
    description?: string;
    phone?: string;
    territory?: string;
    segment?: string;
    tier?: string;
  };
  tags: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  customers?: Customer[];
  opportunities?: Opportunity[];
}

export interface CreateAccountDto {
  name: string;
  type?: AccountType;
  industry?: string;
  owner?: string;
  website?: string;
  parentAccount?: string;
  parentAccountId?: string;
  description?: string;
  phone?: string;
  team?: string[];
  revenue?: number;
  priorityScore?: number;
  details?: {
    employees?: number;
    annualRevenue?: number;
    description?: string;
    phone?: string;
    territory?: string;
    segment?: string;
    tier?: string;
  };
  tags?: string[];
}

export interface UpdateAccountDto extends Partial<CreateAccountDto> {
  status?: AccountStatus;
}

export interface AccountFilters {
  page?: number;
  limit?: number;
  type?: AccountType;
  status?: AccountStatus;
  industry?: string;
  owner?: string;
  parentAccount?: string;
  minRevenue?: number;
  maxRevenue?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// =================== SALES - QUOTE TYPES ===================

export enum QuoteStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  VIEWED = 'viewed',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
  REVISED = 'revised',
}

export interface QuoteLineItem {
  productId: string;
  productName: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  totalPrice: number;
}

export interface QuoteTotals {
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
}

export interface SalesQuote {
  id: string;
  quoteNumber: string;
  title: string;
  status: QuoteStatus;
  validUntil: string;
  lineItems: QuoteLineItem[];
  totals: QuoteTotals;
  terms?: string;
  notes?: string;
  customerId: string;
  customerName: string;
  opportunityId?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface CreateQuoteDto {
  title: string;
  customerId: string;
  opportunityId?: string;
  validUntil: string;
  lineItems: QuoteLineItem[];
  terms?: string;
  notes?: string;
}

export interface UpdateQuoteDto extends Partial<CreateQuoteDto> {
  status?: QuoteStatus;
}

export interface QuoteFilters {
  page?: number;
  limit?: number;
  status?: QuoteStatus;
  customerId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface QuoteStats {
  totalQuotes: number;
  totalValue: number;
  acceptanceRate: number;
  expiringCount: number;
  statusBreakdown: Record<QuoteStatus, number>;
}

// =================== SALES - ORDER TYPES ===================

export enum OrderStatus {
  DRAFT = 'draft',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export interface OrderLineItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  totalPrice: number;
}

export interface SalesOrder {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  status: OrderStatus;
  orderDate: string;
  totalAmount: number;
  currency: string;
  salesRep: {
    id: string;
    name: string;
    email: string;
  };
  items: OrderLineItem[];
  shipping: {
    address: string;
    method: string;
    trackingNumber?: string;
  };
  payment: {
    terms: string;
    method: string;
    status: string;
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderDto {
  customerId: string;
  salesRepId: string;
  items: OrderLineItem[];
  shipping: {
    address: string;
    method: string;
  };
  payment: {
    terms: string;
    method: string;
  };
  notes?: string;
}

export interface UpdateOrderDto extends Partial<CreateOrderDto> {
  status?: OrderStatus;
}

export interface OrderFilters {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  customerId?: string;
  salesRepId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface OrderStats {
  totalOrders: number;
  totalValue: number;
  avgOrderValue: number;
  statusBreakdown: Record<OrderStatus, number>;
}

// =================== SALES - PIPELINE & ANALYTICS TYPES ===================

export interface PipelineStage {
  name: string;
  count: number;
  value: number;
  avgProbability: number;
  opportunities: number;
}

export interface PipelineData {
  stages: PipelineStage[];
  totalPipelineValue: number;
  weightedPipelineValue: number;
  avgSalesCycle: number;
  conversionRates: {
    prospectingToQualification: number;
    qualificationToProposal: number;
    proposalToNegotiation: number;
    negotiationToClosed: number;
  };
}

export interface SalesKPIs {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  conversionRate: number;
  salesCycleLength: number;
  customerRetentionRate: number;
}

export interface SalesTrends {
  revenueGrowth: number;
  orderGrowth: number;
  customerGrowth: number;
}

export interface TopProduct {
  name: string;
  revenue: number;
  orders: number;
}

export interface TopCustomer {
  name: string;
  revenue: number;
  orders: number;
}

export interface SalesAnalytics {
  period: string;
  kpis: SalesKPIs;
  trends: SalesTrends;
  topProducts: TopProduct[];
  topCustomers: TopCustomer[];
  salesRepPerformance?: any;
  forecast?: any;
}

export interface SalesForecast {
  period: string;
  forecast: any[];
  confidence: number;
  factors: string[];
  scenarios: {
    conservative: number;
    realistic: number;
    optimistic: number;
  };
}

export interface SalesRepQuota {
  salesRepId: string;
  name: string;
  quota: number;
  achievement: number;
  rate: number;
}

export interface TeamQuotas {
  teamQuota: number;
  currentAchievement: number;
  achievementRate: number;
  individualQuotas: SalesRepQuota[];
}

export interface TeamPerformance {
  totalRevenue: number;
  totalDeals: number;
  avgDealSize: number;
  teamMembers: any[];
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

// Query types
export interface QueryOptions {
  enabled?: boolean;
  staleTime?: number;
  cacheTime?: number;
  refetchOnMount?: boolean;
  refetchOnWindowFocus?: boolean;
}

// =================== MARKETING - CAMPAIGN TYPES ===================

export enum CampaignType {
  EMAIL = 'email',
  SMS = 'sms',
  SOCIAL_MEDIA = 'social_media',
  DISPLAY_ADS = 'display_ads',
  CONTENT_MARKETING = 'content_marketing',
  WEBINAR = 'webinar',
  EVENT = 'event',
}

export enum CampaignStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum ChannelType {
  EMAIL = 'email',
  SMS = 'sms',
  SOCIAL = 'social',
  WEB = 'web',
  MOBILE = 'mobile',
}

export interface CampaignPerformance {
  impressions: number;
  clicks: number;
  clickThroughRate: number;
  conversions: number;
  conversionRate: number;
  costPerClick: number;
  costPerConversion: number;
  roi: number;
}

export interface Campaign {
  id: string;
  name: string;
  type: CampaignType;
  status: CampaignStatus;
  startDate: string;
  endDate: string;
  budget: number;
  spent: number;
  objectives: string[];
  channels: ChannelType[];
  targetAudience?: {
    demographics?: string;
    industries?: string[];
    geography?: string[];
    segment?: string;
    criteria?: string;
  };
  performance: CampaignPerformance;
  manager?: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateCampaignDto {
  name: string;
  type: CampaignType;
  startDate: string;
  endDate: string;
  budget: number;
  objectives?: string[];
  channels?: ChannelType[];
  targetAudience?: Campaign['targetAudience'];
}

export interface UpdateCampaignDto extends Partial<CreateCampaignDto> {
  status?: CampaignStatus;
  spent?: number;
}

export interface CampaignFilters {
  page?: number;
  limit?: number;
  status?: CampaignStatus;
  type?: CampaignType;
  channel?: ChannelType;
  search?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CampaignStats {
  totalCampaigns: number;
  activeCampaigns: number;
  totalBudget: number;
  totalSpent: number;
  avgROI: number;
}

// =================== MARKETING - EMAIL TEMPLATE TYPES ===================

export enum TemplateCategory {
  WELCOME = 'welcome',
  PROMOTIONAL = 'promotional',
  TRANSACTIONAL = 'transactional',
  NEWSLETTER = 'newsletter',
  ABANDONED_CART = 'abandoned_cart',
  EVENT = 'event',
  SURVEY = 'survey',
}

export interface TemplateVariable {
  name: string;
  type: string;
  defaultValue?: any;
  description?: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  category: TemplateCategory;
  subject: string;
  bodyHtml: string;
  bodyText?: string;
  variables?: TemplateVariable[];
  metadata?: {
    version?: string;
    author?: string;
    description?: string;
    previewText?: string;
  };
  isActive: boolean;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmailTemplateDto {
  name: string;
  category: TemplateCategory;
  subject: string;
  bodyHtml: string;
  bodyText?: string;
  variables?: TemplateVariable[];
  metadata?: EmailTemplate['metadata'];
}

export interface UpdateEmailTemplateDto extends Partial<CreateEmailTemplateDto> {
  isActive?: boolean;
}

export interface TemplateFilters {
  page?: number;
  limit?: number;
  category?: TemplateCategory;
  search?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface TemplateStats {
  totalTemplates: number;
  activeTemplates: number;
  avgUsage: number;
  byCategory: Record<TemplateCategory, number>;
}

// =================== MARKETING - EMAIL CAMPAIGN TYPES ===================

export enum EmailCampaignStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  SENDING = 'sending',
  SENT = 'sent',
  PAUSED = 'paused',
  CANCELLED = 'cancelled',
}

export interface EmailStats {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  unsubscribed: number;
  openRate: number;
  clickRate: number;
  bounceRate: number;
  unsubscribeRate: number;
  conversions?: number;
  conversionRate?: number;
}

export interface EmailCampaign {
  id: string;
  name: string;
  templateId: string;
  template?: EmailTemplate;
  status: EmailCampaignStatus;
  scheduledFor?: string;
  sentAt?: string;
  recipients: number;
  stats: EmailStats;
  segmentIds?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmailCampaignDto {
  name: string;
  templateId: string;
  scheduledFor?: string;
  segmentIds?: string[];
  recipientIds?: string[];
}

export interface UpdateEmailCampaignDto extends Partial<CreateEmailCampaignDto> {
  status?: EmailCampaignStatus;
}

export interface EmailCampaignFilters {
  page?: number;
  limit?: number;
  status?: EmailCampaignStatus;
  templateId?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface EmailCampaignStats {
  totalSent: number;
  avgOpenRate: number;
  avgClickRate: number;
  totalConversions: number;
}

// =================== MARKETING - SEGMENT TYPES ===================

export enum SegmentType {
  DEMOGRAPHIC = 'demographic',
  BEHAVIORAL = 'behavioral',
  GEOGRAPHIC = 'geographic',
  PSYCHOGRAPHIC = 'psychographic',
  FIRMOGRAPHIC = 'firmographic',
  TECHNOGRAPHIC = 'technographic',
  VALUE_BASED = 'value_based',
  LIFECYCLE = 'lifecycle',
}

export enum SegmentCriteria {
  DEMOGRAPHIC = 'demographic',
  BEHAVIORAL = 'behavioral',
  GEOGRAPHIC = 'geographic',
  PSYCHOGRAPHIC = 'psychographic',
  TRANSACTIONAL = 'transactional',
  ENGAGEMENT = 'engagement',
}

export interface SegmentCondition {
  field: string;
  operator: string;
  value: any;
}

export interface SegmentRules {
  rules: SegmentCondition[];
  conditions: 'AND' | 'OR' | string;
}

export interface MarketingSegment {
  id: string;
  name: string;
  description?: string;
  type: SegmentType;
  criteria: SegmentRules;
  customerCount?: number;
  segmentValue?: number;
  size?: number;
  lastCalculated?: string;
  contactIds?: string[];
  campaignIds?: string[];
  lastRefresh?: string;
  isActive: boolean;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateSegmentDto {
  name: string;
  description: string;
  criteria: SegmentCriteria;
  conditions: SegmentCondition[];
  tags?: string[];
  isActive?: boolean;
}

export interface UpdateSegmentDto extends Partial<CreateSegmentDto> {
  isActive?: boolean;
}

export interface SegmentFilters {
  page?: number;
  limit?: number;
  type?: SegmentType;
  search?: string;
  minSize?: number;
  maxSize?: number;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SegmentStats {
  totalSegments: number;
  totalContacts: number;
  activeSegments: number;
}

// =================== MARKETING - ANALYTICS TYPES ===================

export interface MarketingKPIs {
  totalCampaigns: number;
  totalSpent: number;
  totalRevenue: number;
  avgROI: number;
  emailsSent: number;
  conversionRate: number;
}

export interface ChannelPerformance {
  channel: ChannelType;
  campaigns: number;
  spent: number;
  revenue: number;
  roi: number;
  conversions: number;
}

export interface CampaignAnalyticsItem {
  id: string;
  name: string;
  type: CampaignType;
  spent: number;
  revenue: number;
  roi: number;
  conversions: number;
}

export interface EmailAnalytics {
  totalSent: number;
  avgOpenRate: number;
  avgClickRate: number;
  avgBounceRate: number;
  avgUnsubscribeRate: number;
  topPerformingEmails: {
    id: string;
    name: string;
    openRate: number;
    clickRate: number;
  }[];
}

export interface EngagementTrend {
  date: string;
  impressions: number;
  clicks: number;
  conversions: number;
}

export interface ROIMetrics {
  totalInvestment: number;
  totalRevenue: number;
  overallROI: number;
  costPerAcquisition: number;
  customerLifetimeValue: number;
  byChannel: {
    channel: ChannelType;
    roi: number;
  }[];
  byCampaignType: {
    type: CampaignType;
    roi: number;
  }[];
}

export interface ConversionFunnel {
  stage: string;
  count: number;
  rate: number;
}

export interface MarketingAnalytics {
  period: string;
  kpis: MarketingKPIs;
  channelPerformance: ChannelPerformance[];
  topCampaigns: CampaignAnalyticsItem[];
  emailAnalytics: EmailAnalytics;
  engagementTrends: EngagementTrend[];
  roiMetrics: ROIMetrics;
  conversionFunnel: ConversionFunnel[];
}

export interface MarketingOverview {
  activeCampaigns: number;
  emailsSentToday: number;
  activeSegments: number;
  overallROI: number;
  recentCampaigns: Campaign[];
  upcomingEmails: EmailCampaign[];
}

// =================== MARKETING - CONTENT TYPES ===================

export enum ContentType {
  IMAGE = 'image',
  VIDEO = 'video',
  DOCUMENT = 'document',
  TEMPLATE = 'template',
}

export interface ContentAsset {
  id: string;
  name: string;
  type: ContentType;
  url: string;
  size: number;
  thumbnailUrl?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ContentFilters {
  page?: number;
  limit?: number;
  type?: ContentType;
  search?: string;
  tags?: string[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ContentStats {
  totalAssets: number;
  recentUploads: number;
  storageUsed: number;
  byType: Record<ContentType, number>;
}

// =================== CUSTOMER SUPPORT TYPES ===================

export enum TicketStatus {
  NEW = 'new',
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  PENDING = 'pending',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
  REOPENED = 'reopened',
}

export enum TicketPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
  CRITICAL = 'critical',
}

export enum TicketCategory {
  TECHNICAL = 'technical',
  BILLING = 'billing',
  GENERAL_INQUIRY = 'general_inquiry',
  FEATURE_REQUEST = 'feature_request',
  BUG = 'bug',
  COMPLAINT = 'complaint',
  OTHER = 'other',
}

export enum TicketChannel {
  WEB = 'web',
  EMAIL = 'email',
  PHONE = 'phone',
  CHAT = 'chat',
  WHATSAPP = 'whatsapp',
  SLACK = 'slack',
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: TicketCategory;
  channel: TicketChannel;
  customerId: string;
  customerName?: string;
  customerEmail?: string;
  assignedTo?: string;
  assignedToName?: string;
  slaId?: string;
  dueDate?: string;
  firstResponseAt?: string;
  resolvedAt?: string;
  closedAt?: string;
  satisfactionRating?: number;
  attachments?: string[];
  tags?: string[];
  customFields?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface TicketResponse {
  id: string;
  ticketId: string;
  message: string;
  isInternal: boolean;
  attachments?: string[];
  createdBy: string;
  createdByName?: string;
  createdAt: string;
}

export interface CreateTicketDto {
  subject: string;
  description: string;
  priority: TicketPriority;
  category: TicketCategory;
  channel: TicketChannel;
  customerId: string;
  tags?: string[];
  attachments?: string[];
}

export interface UpdateTicketDto {
  subject?: string;
  description?: string;
  status?: TicketStatus;
  priority?: TicketPriority;
  category?: TicketCategory;
  assignedTo?: string;
  tags?: string[];
}

export interface AssignTicketDto {
  agentId: string;
}

export interface EscalateTicketDto {
  reason: string;
  escalateTo?: string;
}

export interface AddResponseDto {
  message: string;
  isInternal: boolean;
  attachments?: string[];
}

export interface TicketFilters {
  page?: number;
  limit?: number;
  status?: TicketStatus;
  priority?: TicketPriority;
  category?: TicketCategory;
  channel?: TicketChannel;
  assignedTo?: string;
  customerId?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface TicketStatistics {
  total: number;
  new: number;
  open: number;
  inProgress: number;
  pending: number;
  resolved: number;
  closed: number;
  overdue: number;
  avgResolutionTime: number;
  avgFirstResponseTime: number;
  avgSatisfactionRating: number;
  byPriority: Record<TicketPriority, number>;
  byCategory: Record<TicketCategory, number>;
  byChannel: Record<TicketChannel, number>;
}

// =================== KNOWLEDGE BASE TYPES ===================

export enum ArticleStatus {
  DRAFT = 'draft',
  REVIEW = 'review',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export enum ArticleVisibility {
  PUBLIC = 'public',
  INTERNAL = 'internal',
  CUSTOMER = 'customer',
  PARTNER = 'partner',
}

export enum ArticleType {
  HOW_TO = 'how_to',
  TROUBLESHOOTING = 'troubleshooting',
  FAQ = 'faq',
  BEST_PRACTICE = 'best_practice',
  POLICY = 'policy',
  ANNOUNCEMENT = 'announcement',
  TUTORIAL = 'tutorial',
}

export interface KnowledgeBaseArticle {
  id: string;
  articleNumber: string;
  title: string;
  content: string;
  summary?: string;
  status: ArticleStatus;
  visibility: ArticleVisibility;
  type: ArticleType;
  category: string;
  tags: string[];
  keywords: string[];
  viewCount: number;
  helpfulCount: number;
  notHelpfulCount: number;
  organizationId?: string;
  relatedArticles?: string[];
  attachments?: string[];
  videoLinks?: string[];
  author: string;
  authorName?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateArticleDto {
  title: string;
  content: string;
  summary?: string;
  type: ArticleType;
  category: string;
  tags: string[];
  keywords: string[];
  visibility: ArticleVisibility;
  attachments?: string[];
  videoLinks?: string[];
  organizationId?: string;
}

export interface UpdateArticleDto {
  title?: string;
  content?: string;
  summary?: string;
  status?: ArticleStatus;
  type?: ArticleType;
  category?: string;
  tags?: string[];
  keywords?: string[];
  visibility?: ArticleVisibility;
  organizationId?: string | null;
}

export interface ArticleFilters {
  page?: number;
  limit?: number;
  status?: ArticleStatus;
  type?: ArticleType;
  category?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  organizationId?: string;
}

export interface ArticleStats {
  totalArticles: number;
  published: number;
  drafts: number;
  totalViews: number;
  avgHelpfulness: number;
  byType: Record<ArticleType, number>;
}

// =================== SLA TYPES ===================

export enum SLAPriorityLevel {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

export interface SLAPolicy {
  id: string;
  name: string;
  description?: string;
  priority: SLAPriorityLevel;
  firstResponseTime: number; // minutes
  resolutionTime: number; // minutes
  businessHoursOnly: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSLADto {
  name: string;
  description?: string;
  priority: SLAPriorityLevel;
  firstResponseTime: number;
  resolutionTime: number;
  businessHoursOnly: boolean;
}

export interface UpdateSLADto {
  name?: string;
  description?: string;
  firstResponseTime?: number;
  resolutionTime?: number;
  businessHoursOnly?: boolean;
  isActive?: boolean;
}

export interface SLACompliance {
  ticketId: string;
  slaId: string;
  firstResponseCompliant: boolean;
  firstResponseTime: number;
  firstResponseTarget: number;
  resolutionCompliant: boolean;
  resolutionTime?: number;
  resolutionTarget: number;
  violationType?: 'first_response' | 'resolution' | 'both';
  breachTime?: string;
}

export interface SLAMetrics {
  totalTickets: number;
  compliantTickets: number;
  violatedTickets: number;
  complianceRate: number;
  avgFirstResponseTime: number;
  avgResolutionTime: number;
  byPriority: {
    priority: SLAPriorityLevel;
    compliant: number;
    violated: number;
    rate: number;
  }[];
}

export interface SLAViolation {
  id: string;
  ticketId: string;
  ticketNumber: string;
  slaId: string;
  slaName: string;
  violationType: 'first_response' | 'resolution' | 'both';
  targetTime: number;
  actualTime: number;
  breachTime: string;
  createdAt: string;
}

// =================== LIVE CHAT TYPES ===================

export enum ChatStatus {
  ACTIVE = 'active',
  WAITING = 'waiting',
  ENDED = 'ended',
  TRANSFERRED = 'transferred',
}

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  FILE = 'file',
  SYSTEM = 'system',
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  message: string;
  type: MessageType;
  senderId: string;
  senderName: string;
  senderType: 'customer' | 'agent' | 'system';
  attachments?: string[];
  createdAt: string;
}

export interface ChatSession {
  id: string;
  sessionNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  agentId?: string;
  agentName?: string;
  status: ChatStatus;
  startedAt: string;
  endedAt?: string;
  messages: ChatMessage[];
  rating?: number;
  feedback?: string;
  tags?: string[];
}

export interface InitiateChatDto {
  customerId: string;
  initialMessage: string;
}

export interface SendMessageDto {
  message: string;
  type: MessageType;
  attachments?: string[];
}

export interface TransferChatDto {
  toAgentId: string;
  reason?: string;
}

export interface ChatFilters {
  page?: number;
  limit?: number;
  status?: ChatStatus;
  agentId?: string;
  customerId?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ChatStatistics {
  activeChats: number;
  waitingChats: number;
  totalChatsToday: number;
  avgChatDuration: number;
  avgResponseTime: number;
  avgRating: number;
  byAgent: {
    agentId: string;
    agentName: string;
    activeChats: number;
    totalChats: number;
    avgRating: number;
  }[];
}

// =================== SUPPORT ANALYTICS TYPES ===================

export interface AgentPerformance {
  agentId: string;
  agentName: string;
  ticketsResolved: number;
  avgResolutionTime: number;
  avgFirstResponseTime: number;
  avgSatisfactionRating: number;
  activeTickets: number;
  slaComplianceRate: number;
}

export interface CategoryBreakdown {
  category: TicketCategory;
  count: number;
  percentage: number;
  avgResolutionTime: number;
}

export interface ResponseTimeMetrics {
  avgFirstResponse: number;
  avgFullResolution: number;
  byPriority: {
    priority: TicketPriority;
    firstResponse: number;
    resolution: number;
  }[];
  trend: {
    date: string;
    firstResponse: number;
    resolution: number;
  }[];
}

export interface SupportAnalytics {
  period: string;
  ticketStats: TicketStatistics;
  slaMetrics: SLAMetrics;
  agentPerformance: AgentPerformance[];
  categoryBreakdown: CategoryBreakdown[];
  responseTimeMetrics: ResponseTimeMetrics;
  chatStats: ChatStatistics;
}

export interface SupportOverview {
  openTickets: number;
  activeChats: number;
  slaCompliance: number;
  avgSatisfaction: number;
  recentTickets: SupportTicket[];
  criticalTickets: SupportTicket[];
  slaViolations: SLAViolation[];
  agentAvailability: {
    available: number;
    busy: number;
    offline: number;
  };
  knowledgeBaseStats: ArticleStats;
}

// =================== ACTIVITY & TASKS TYPES ===================

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  WAITING = 'waiting',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export interface Task {
  id: string;
  organizationId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  createdBy: string;
  assignedTo?: string;
  assignedToName?: string;
  relatedToId?: string;
  relatedToType?: string; // 'customer', 'lead', 'opportunity', etc.
  dueDate?: string;
  completedAt?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  priority: TaskPriority;
  assignedTo?: string;
  relatedToId?: string;
  relatedToType?: string;
  dueDate?: string;
  tags?: string[];
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assignedTo?: string;
  dueDate?: string;
  tags?: string[];
}

export interface TaskQueryDto {
  status?: TaskStatus;
  priority?: TaskPriority;
  assignedTo?: string;
  relatedToId?: string;
  relatedToType?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface TaskStatistics {
  total: number;
  todo: number;
  inProgress: number;
  waiting: number;
  completed: number;
  cancelled: number;
  overdue: number;
  completionRate: number;
  avgCompletionTime: number;
  byPriority: Record<TaskPriority, number>;
}

// =================== ACTIVITY TYPES ===================

export enum ActivityType {
  NOTE = 'note',
  CALL = 'call',
  EMAIL = 'email',
  MEETING = 'meeting',
  TASK_CREATED = 'task_created',
  TASK_COMPLETED = 'task_completed',
  STATUS_CHANGED = 'status_changed',
  FIELD_UPDATED = 'field_updated',
  FILE_UPLOADED = 'file_uploaded',
  COMMENT = 'comment',
}

export interface Activity {
  id: string;
  organizationId: string;
  activityType: ActivityType;
  title: string;
  description?: string;
  performedBy: string;
  performedByName?: string;
  relatedToId?: string;
  relatedToType?: string;
  metadata?: Record<string, any>;
  isSystemGenerated: boolean;
  createdAt: string;
}

export interface CreateActivityDto {
  activityType: ActivityType;
  title: string;
  description?: string;
  relatedToId?: string;
  relatedToType?: string;
  metadata?: Record<string, any>;
}

export interface ActivityQueryDto {
  activityType?: ActivityType;
  relatedToId?: string;
  relatedToType?: string;
  performedBy?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}

// =================== NOTE TYPES ===================

export interface Note {
  id: string;
  organizationId: string;
  content: string;
  createdBy: string;
  createdByName?: string;
  relatedToId?: string;
  relatedToType?: string;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNoteDto {
  content: string;
  relatedToId?: string;
  relatedToType?: string;
}

// =================== EVENT TYPES ===================

export enum EventType {
  MEETING = 'meeting',
  CALL = 'call',
  DEMO = 'demo',
  FOLLOWUP = 'followup',
  DEADLINE = 'deadline',
  OTHER = 'other',
}

export interface EventAttendee {
  userId: string;
  email: string;
  status: 'invited' | 'accepted' | 'declined' | 'tentative';
}

export interface Event {
  id: string;
  organizationId: string;
  title: string;
  description?: string;
  eventType: EventType;
  startTime: string;
  endTime: string;
  location?: string;
  meetingLink?: string;
  createdBy: string;
  attendees?: EventAttendee[];
  relatedToId?: string;
  relatedToType?: string;
  isAllDay: boolean;
  reminderMinutes?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventDto {
  title: string;
  description?: string;
  eventType: EventType;
  startTime: string;
  endTime: string;
  location?: string;
  meetingLink?: string;
  attendees?: EventAttendee[];
  relatedToId?: string;
  relatedToType?: string;
  isAllDay?: boolean;
  reminderMinutes?: number;
}

export interface UpdateEventDto {
  title?: string;
  description?: string;
  eventType?: EventType;
  startTime?: string;
  endTime?: string;
  location?: string;
  meetingLink?: string;
  attendees?: EventAttendee[];
  isAllDay?: boolean;
  reminderMinutes?: number;
}

export interface EventQueryDto {
  eventType?: EventType;
  startDate?: string;
  endDate?: string;
  createdBy?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// =================== REMINDER TYPES ===================

export enum ReminderType {
  TASK = 'task',
  EVENT = 'event',
  FOLLOWUP = 'followup',
  CUSTOM = 'custom',
}

export interface Reminder {
  id: string;
  organizationId: string;
  reminderType: ReminderType;
  title: string;
  description?: string;
  remindAt: string;
  userId: string;
  relatedToId?: string;
  relatedToType?: string;
  isSent: boolean;
  sentAt?: string;
  createdAt: string;
}

// =================== REPORTING & BI TYPES ===================

export enum ReportType {
  SALES = 'sales',
  MARKETING = 'marketing',
  SUPPORT = 'support',
  PIPELINE = 'pipeline',
  CUSTOM = 'custom',
}

export enum ChartType {
  LINE = 'line',
  BAR = 'bar',
  PIE = 'pie',
  AREA = 'area',
  FUNNEL = 'funnel',
  TABLE = 'table',
}

export enum ScheduleFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
}

export enum DeliveryFormat {
  PDF = 'pdf',
  EXCEL = 'excel',
  CSV = 'csv',
}

export enum DashboardType {
  PERSONAL = 'personal',
  TEAM = 'team',
  ORGANIZATIONAL = 'organizational',
  EXECUTIVE = 'executive',
}

export enum WidgetType {
  CHART = 'chart',
  TABLE = 'table',
  METRIC = 'metric',
  LIST = 'list',
  MAP = 'map',
}

export interface ReportFilter {
  field: string;
  operator: string;
  value: any;
}

export interface ReportAggregation {
  field: string;
  function: 'sum' | 'avg' | 'count' | 'min' | 'max';
}

export interface ReportConfig {
  entity: string;
  columns: string[];
  filters?: ReportFilter[];
  groupBy?: string;
  orderBy?: { field: string; direction: 'ASC' | 'DESC' };
  limit?: number;
  aggregations?: ReportAggregation[];
}

export interface Report {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  reportType: ReportType;
  chartType: ChartType;
  config: ReportConfig;
  createdById: string;
  isPublic: boolean;
  isFavorite: boolean;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReportDto {
  name: string;
  description?: string;
  reportType: ReportType;
  chartType: ChartType;
  config: ReportConfig;
  isPublic?: boolean;
  isFavorite?: boolean;
}

export interface UpdateReportDto {
  name?: string;
  description?: string;
  chartType?: ChartType;
  config?: ReportConfig;
  isPublic?: boolean;
  isFavorite?: boolean;
}

export interface RunReportDto {
  startDate?: string;
  endDate?: string;
  additionalFilters?: ReportFilter[];
}

export interface ReportResult {
  data: any[];
  total: number;
  aggregations?: Record<string, any>;
  executionTime: number;
}

export interface ReportSchedule {
  id: string;
  tenantId: string;
  reportId: string;
  name: string;
  frequency: ScheduleFrequency;
  format: DeliveryFormat;
  recipients: string[];
  scheduleTime?: string;
  dayOfWeek?: number;
  dayOfMonth?: number;
  isActive: boolean;
  lastRunAt?: string;
  nextRunAt?: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  report?: Report;
}

export interface CreateReportScheduleDto {
  reportId: string;
  name: string;
  frequency: ScheduleFrequency;
  format: DeliveryFormat;
  recipients: string[];
  scheduleTime?: string;
  dayOfWeek?: number;
  dayOfMonth?: number;
}

export interface UpdateReportScheduleDto {
  name?: string;
  frequency?: ScheduleFrequency;
  format?: DeliveryFormat;
  recipients?: string[];
  scheduleTime?: string;
  dayOfWeek?: number;
  dayOfMonth?: number;
  isActive?: boolean;
}

export interface WidgetLayout {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DashboardWidget {
  id: string;
  title: string;
  type: WidgetType;
  chartType?: ChartType;
  dataSource: Record<string, any>;
  layout: WidgetLayout;
  config?: Record<string, any>;
  refreshInterval?: number;
}

export interface Dashboard {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  type: DashboardType;
  widgets: DashboardWidget[];
  isDefault: boolean;
  isPublic: boolean;
  tags?: string[];
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDashboardDto {
  name: string;
  description?: string;
  type: DashboardType;
  widgets: DashboardWidget[];
  isDefault?: boolean;
  isPublic?: boolean;
  tags?: string[];
}

export interface UpdateDashboardDto {
  name?: string;
  description?: string;
  type?: DashboardType;
  widgets?: DashboardWidget[];
  isDefault?: boolean;
  isPublic?: boolean;
  tags?: string[];
}

export interface DashboardQueryDto {
  type?: DashboardType;
  isPublic?: boolean;
  search?: string;
}

export interface FunnelAnalysisDto {
  stages: string[];
  startDate?: string;
  endDate?: string;
}

export interface FunnelStageData {
  stage: string;
  count: number;
  value: number;
  conversionRate: number;
  dropoffRate: number;
}

export interface CohortAnalysisDto {
  cohortPeriod: 'week' | 'month' | 'quarter';
  metric: string;
  startDate: string;
  endDate: string;
  periodsToShow?: number;
}

export interface RevenueForecastDto {
  months?: number;
  includeSeasonal?: boolean;
  confidenceInterval?: number;
}

export interface ForecastDataPoint {
  period: string;
  predicted: number;
  lower: number;
  upper: number;
  actual?: number;
}

// ========================================
// Phase 8: Product & Pricing Types
// ========================================

export enum ProductType {
  PHYSICAL = 'physical',
  DIGITAL = 'digital',
  SERVICE = 'service',
  SUBSCRIPTION = 'subscription',
}

export enum ProductStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DISCONTINUED = 'discontinued',
  OUT_OF_STOCK = 'out_of_stock',
}

export enum BundleType {
  FIXED = 'fixed',
  FLEXIBLE = 'flexible',
  SUBSCRIPTION = 'subscription',
}

export enum PriceListType {
  STANDARD = 'standard',
  CUSTOMER_SPECIFIC = 'customer_specific',
  VOLUME = 'volume',
  PROMOTIONAL = 'promotional',
  SEASONAL = 'seasonal',
}

export enum DiscountType {
  PERCENTAGE = 'percentage',
  FIXED_AMOUNT = 'fixed_amount',
  BUY_X_GET_Y = 'buy_x_get_y',
  FREE_SHIPPING = 'free_shipping',
}

export enum DiscountApplicability {
  ALL_PRODUCTS = 'all_products',
  SPECIFIC_PRODUCTS = 'specific_products',
  CATEGORIES = 'categories',
  CART_TOTAL = 'cart_total',
}

export interface Product {
  id: string;
  tenantId: string;
  sku: string;
  name: string;
  description?: string;
  shortDescription?: string;
  type: ProductType;
  status: ProductStatus;
  basePrice: number;
  costPrice?: number;
  msrp?: number;
  currency: string;
  trackInventory: boolean;
  quantityInStock: number;
  quantityReserved: number;
  lowStockThreshold: number;
  allowBackorder: boolean;
  categoryId?: string;
  brand?: string;
  manufacturer?: string;
  model?: string;
  tags?: string[];
  weight?: number;
  weightUnit?: string;
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: string;
  };
  imageUrls?: string[];
  primaryImageUrl?: string;
  videoUrls?: string[];
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  slug?: string;
  attributes?: Record<string, any>;
  specifications?: Record<string, any>;
  totalSold: number;
  totalRevenue: number;
  viewCount: number;
  averageRating: number;
  reviewCount: number;
  isFeatured: boolean;
  isOnSale: boolean;
  salePrice?: number;
  saleStartDate?: string;
  saleEndDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductDto {
  sku?: string;
  name: string;
  description?: string;
  shortDescription?: string;
  type: ProductType;
  status?: ProductStatus;
  basePrice: number;
  costPrice?: number;
  msrp?: number;
  currency?: string;
  trackInventory?: boolean;
  quantityInStock?: number;
  lowStockThreshold?: number;
  allowBackorder?: boolean;
  categoryId?: string;
  brand?: string;
  manufacturer?: string;
  model?: string;
  tags?: string[];
  weight?: number;
  weightUnit?: string;
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: string;
  };
  imageUrls?: string[];
  primaryImageUrl?: string;
  attributes?: Record<string, any>;
  specifications?: Record<string, any>;
  isFeatured?: boolean;
  isOnSale?: boolean;
  salePrice?: number;
  saleStartDate?: string;
  saleEndDate?: string;
}

export interface UpdateProductDto extends Partial<CreateProductDto> {}

export interface ProductQueryDto {
  categoryId?: string;
  status?: ProductStatus;
  type?: ProductType;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  tags?: string[];
  isFeatured?: boolean;
  isOnSale?: boolean;
}

export interface ProductCategory {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  slug?: string;
  displayOrder: number;
  active: boolean;
  parent?: ProductCategory;
  children?: ProductCategory[];
  metaTitle?: string;
  metaDescription?: string;
  imageUrl?: string;
  iconUrl?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryDto {
  name: string;
  description?: string;
  slug?: string;
  displayOrder?: number;
  active?: boolean;
  parentId?: string;
  metaTitle?: string;
  metaDescription?: string;
  imageUrl?: string;
  iconUrl?: string;
  metadata?: Record<string, any>;
}

export interface UpdateCategoryDto extends Partial<CreateCategoryDto> {}

export interface BundleItem {
  productId: string;
  quantity: number;
  optional?: boolean;
  discountPercentage?: number;
}

export interface ProductBundle {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  sku: string;
  type: BundleType;
  active: boolean;
  items: BundleItem[];
  bundlePrice: number;
  originalPrice?: number;
  discountPercentage: number;
  currency: string;
  minItemsRequired?: number;
  maxItemsAllowed?: number;
  subscriptionInterval?: string;
  subscriptionPrice?: number;
  availableFrom?: string;
  availableTo?: string;
  trackInventory: boolean;
  quantityInStock: number;
  imageUrl?: string;
  imageUrls?: string[];
  totalSold: number;
  totalRevenue: number;
  slug?: string;
  metaTitle?: string;
  metaDescription?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBundleDto {
  name: string;
  description?: string;
  sku: string;
  type: BundleType;
  items: BundleItem[];
  bundlePrice: number;
  originalPrice?: number;
  discountPercentage?: number;
  currency?: string;
  minItemsRequired?: number;
  maxItemsAllowed?: number;
  subscriptionInterval?: string;
  subscriptionPrice?: number;
  availableFrom?: string;
  availableTo?: string;
  trackInventory?: boolean;
  quantityInStock?: number;
  imageUrl?: string;
  imageUrls?: string[];
}

export interface UpdateBundleDto extends Partial<CreateBundleDto> {}

export interface PriceListItem {
  productId: string;
  price: number;
  minQuantity?: number;
  maxQuantity?: number;
}

export interface PriceList {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  type: PriceListType;
  currency: string;
  active: boolean;
  priority: number;
  validFrom?: string;
  validTo?: string;
  customerIds?: string[];
  customerSegments?: string[];
  prices: PriceListItem[];
  isVolumePricing: boolean;
  conditions?: {
    minOrderValue?: number;
    maxOrderValue?: number;
    applicableCategories?: string[];
    excludedCategories?: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreatePriceListDto {
  name: string;
  description?: string;
  type: PriceListType;
  currency?: string;
  active?: boolean;
  priority?: number;
  validFrom?: string;
  validTo?: string;
  customerIds?: string[];
  customerSegments?: string[];
  prices: PriceListItem[];
  isVolumePricing?: boolean;
  conditions?: {
    minOrderValue?: number;
    maxOrderValue?: number;
    applicableCategories?: string[];
    excludedCategories?: string[];
  };
}

export interface UpdatePriceListDto extends Partial<CreatePriceListDto> {}

export interface BuyXGetYConfig {
  buyQuantity: number;
  getQuantity: number;
  getProductId?: string;
  getDiscount?: number;
}

export interface Discount {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  code?: string;
  type: DiscountType;
  value: number;
  applicability: DiscountApplicability;
  active: boolean;
  validFrom?: string;
  validTo?: string;
  applicableProductIds?: string[];
  applicableCategoryIds?: string[];
  maxUses?: number;
  currentUses: number;
  maxUsesPerCustomer?: number;
  minPurchaseAmount?: number;
  minQuantity?: number;
  buyXGetYConfig?: BuyXGetYConfig;
  canCombineWithOtherDiscounts: boolean;
  excludedDiscountIds?: string[];
  priority: number;
  customerSegments?: string[];
  excludedCustomerIds?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateDiscountDto {
  name: string;
  description?: string;
  code?: string;
  type: DiscountType;
  value: number;
  applicability: DiscountApplicability;
  active?: boolean;
  validFrom?: string;
  validTo?: string;
  applicableProductIds?: string[];
  applicableCategoryIds?: string[];
  maxUses?: number;
  maxUsesPerCustomer?: number;
  minPurchaseAmount?: number;
  minQuantity?: number;
  buyXGetYConfig?: BuyXGetYConfig;
  canCombineWithOtherDiscounts?: boolean;
  excludedDiscountIds?: string[];
  priority?: number;
  customerSegments?: string[];
  excludedCustomerIds?: string[];
}

export interface UpdateDiscountDto extends Partial<CreateDiscountDto> {}

export interface CalculatePriceDto {
  productId: string;
  quantity: number;
  customerId?: string;
  discountCode?: string;
}

export interface PriceCalculationResult {
  productId: string;
  quantity: number;
  basePrice: number;
  unitPrice: number;
  subtotal: number;
  discounts: Array<{
    name: string;
    type: string;
    amount: number;
  }>;
  total: number;
}

export interface InventoryTransaction {
  id: string;
  tenantId: string;
  productId: string;
  type: 'purchase' | 'sale' | 'adjustment' | 'transfer' | 'return';
  quantity: number;
  reason?: string;
  notes?: string;
  referenceId?: string;
  warehouseId?: string;
  performedById: string;
  createdAt: string;
}

export interface InventoryItem {
  productId: string;
  sku: string;
  name: string;
  quantityInStock: number;
  quantityReserved: number;
  availableQuantity: number;
  lowStockThreshold: number;
  isLowStock: boolean;
  warehouseId?: string;
  lastRestockDate?: string;
}

export interface StockAlert {
  id: string;
  productId: string;
  sku: string;
  productName: string;
  severity: 'critical' | 'warning' | 'info';
  type: 'low_stock' | 'out_of_stock' | 'overstock' | 'expiring';
  currentStock: number;
  threshold: number;
  message: string;
  resolved: boolean;
  createdAt: string;
}

export interface AdjustStockDto {
  productId: string;
  quantity: number;
  type: 'add' | 'remove';
  reason?: string;
  notes?: string;
}

// ========================================
// Phase 9: Document Management Types
// ========================================

export enum DocumentType {
  CONTRACT = 'contract',
  PROPOSAL = 'proposal',
  INVOICE = 'invoice',
  QUOTE = 'quote',
  AGREEMENT = 'agreement',
  NDA = 'nda',
  PRESENTATION = 'presentation',
  REPORT = 'report',
  OTHER = 'other',
}

export enum DocumentStatus {
  DRAFT = 'draft',
  IN_REVIEW = 'in_review',
  APPROVED = 'approved',
  SIGNED = 'signed',
  EXPIRED = 'expired',
  ARCHIVED = 'archived',
}

export enum ContractStatus {
  DRAFT = 'draft',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  SENT_FOR_SIGNATURE = 'sent_for_signature',
  SIGNED = 'signed',
  ACTIVE = 'active',
  EXPIRED = 'expired',
  TERMINATED = 'terminated',
  RENEWED = 'renewed',
}

export enum ContractType {
  SERVICE_AGREEMENT = 'service_agreement',
  MASTER_SERVICE_AGREEMENT = 'master_service_agreement',
  SUBSCRIPTION = 'subscription',
  LICENSE = 'license',
  NDA = 'nda',
  SLA = 'sla',
  PARTNERSHIP = 'partnership',
  VENDOR = 'vendor',
  EMPLOYMENT = 'employment',
  OTHER = 'other',
}

export enum RenewalType {
  MANUAL = 'manual',
  AUTO_RENEW = 'auto_renew',
  NO_RENEWAL = 'no_renewal',
}

export enum SignatureStatus {
  PENDING = 'pending',
  SENT = 'sent',
  VIEWED = 'viewed',
  SIGNED = 'signed',
  DECLINED = 'declined',
  EXPIRED = 'expired',
}

export enum SignatureProvider {
  DOCUSIGN = 'docusign',
  HELLOSIGN = 'hellosign',
  ADOBE_SIGN = 'adobe_sign',
  INTERNAL = 'internal',
}

export interface DocumentVersion {
  id: string;
  documentId: string;
  versionNumber: number;
  fileName: string;
  fileSize: number;
  storagePath: string;
  uploadedById: string;
  uploadedByName?: string;
  changeDescription?: string;
  createdAt: string;
}

export interface Document {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  documentType: DocumentType;
  status: DocumentStatus;
  storageProvider: string;
  storagePath?: string;
  storageBucket?: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  fileExtension: string;
  entityType?: string;
  entityId?: string;
  currentVersion: number;
  versions?: DocumentVersion[];
  metadata?: {
    tags?: string[];
    category?: string;
    isConfidential?: boolean;
    accessLevel?: string;
    [key: string]: any;
  };
  expiryDate?: string;
  isExpired: boolean;
  isPublic: boolean;
  sharedWith?: string[];
  uploadedById: string;
  uploadedByName?: string;
  createdAt: string;
  updatedAt: string;
  lastAccessedAt?: string;
}

export interface CreateDocumentDto {
  name: string;
  description?: string;
  documentType: DocumentType;
  file: File;
  entityType?: string;
  entityId?: string;
  metadata?: {
    tags?: string[];
    category?: string;
    isConfidential?: boolean;
    accessLevel?: string;
  };
  expiryDate?: string;
  isPublic?: boolean;
}

export interface UpdateDocumentDto {
  name?: string;
  description?: string;
  documentType?: DocumentType;
  status?: DocumentStatus;
  metadata?: Record<string, any>;
  expiryDate?: string;
  isPublic?: boolean;
}

export interface ShareDocumentDto {
  userIds: string[];
  message?: string;
}

export interface Contract {
  id: string;
  tenantId: string;
  name: string;
  contractNumber: string;
  contractType: ContractType;
  status: ContractStatus;
  customerId?: string;
  customerName?: string;
  documentId?: string;
  value?: number;
  currency: string;
  billingFrequency?: string;
  recurringAmount?: number;
  startDate: string;
  endDate: string;
  signedDate?: string;
  activationDate?: string;
  terminationDate?: string;
  renewalType: RenewalType;
  renewalNoticeDays: number;
  renewalTermMonths?: number;
  renewalReminderSent: boolean;
  terms?: string;
  notes?: string;
  ownerId: string;
  ownerName?: string;
  approvedById?: string;
  approvedByName?: string;
  approvedAt?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateContractDto {
  name: string;
  contractType: ContractType;
  customerId?: string;
  value?: number;
  currency?: string;
  billingFrequency?: string;
  recurringAmount?: number;
  startDate: string;
  endDate: string;
  renewalType?: RenewalType;
  renewalNoticeDays?: number;
  renewalTermMonths?: number;
  terms?: string;
  notes?: string;
  metadata?: Record<string, any>;
}

export interface UpdateContractDto extends Partial<CreateContractDto> {
  status?: ContractStatus;
  signedDate?: string;
  activationDate?: string;
  terminationDate?: string;
}

export interface DocumentSignature {
  id: string;
  tenantId: string;
  documentId: string;
  signerName: string;
  signerEmail: string;
  signerRole?: string;
  signingOrder: number;
  status: SignatureStatus;
  provider: SignatureProvider;
  providerEnvelopeId?: string;
  providerSignatureId?: string;
  signatureData?: string;
  ipAddress?: string;
  viewedAt?: string;
  signedAt?: string;
  declinedAt?: string;
  declineReason?: string;
  lastReminderSentAt?: string;
  reminderCount: number;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SignatureRecipient {
  name: string;
  email: string;
  role?: string;
  signingOrder: number;
}

export interface CreateSignatureRequestDto {
  documentId: string;
  recipients: SignatureRecipient[];
  message?: string;
  expiresInDays?: number;
  provider?: SignatureProvider;
}

export interface SignDocumentDto {
  signatureData: string;
}

export interface SignatureAuditTrail {
  documentId: string;
  documentName: string;
  events: Array<{
    id: string;
    signerName: string;
    signerEmail: string;
    action: string;
    timestamp: string;
    ipAddress?: string;
    details?: string;
  }>;
}

// ========================================
// Phase 10: Call Center Management Types
// ========================================

export enum CallDirection {
  INBOUND = 'INBOUND',
  OUTBOUND = 'OUTBOUND',
}

export enum CallStatus {
  INITIATED = 'INITIATED',
  RINGING = 'RINGING',
  IN_PROGRESS = 'IN_PROGRESS',
  ON_HOLD = 'ON_HOLD',
  COMPLETED = 'COMPLETED',
  MISSED = 'MISSED',
  BUSY = 'BUSY',
  FAILED = 'FAILED',
  NO_ANSWER = 'NO_ANSWER',
  VOICEMAIL = 'VOICEMAIL',
}

export enum CallDisposition {
  ANSWERED = 'ANSWERED',
  NOT_ANSWERED = 'NOT_ANSWERED',
  BUSY = 'BUSY',
  FAILED = 'FAILED',
  VOICEMAIL = 'VOICEMAIL',
  CALLBACK_REQUESTED = 'CALLBACK_REQUESTED',
  INTERESTED = 'INTERESTED',
  NOT_INTERESTED = 'NOT_INTERESTED',
  DO_NOT_CALL = 'DO_NOT_CALL',
}

export enum QueueStrategy {
  ROUND_ROBIN = 'ROUND_ROBIN',
  LONGEST_IDLE = 'LONGEST_IDLE',
  MOST_IDLE = 'MOST_IDLE',
  RING_ALL = 'RING_ALL',
  SKILL_BASED = 'SKILL_BASED',
  PRIORITY = 'PRIORITY',
}

export enum RecordingStatus {
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  DELETED = 'DELETED',
}

export interface Call {
  id: string;
  tenantId: string;
  callSid: string;
  direction: CallDirection;
  status: CallStatus;
  disposition?: CallDisposition;
  fromNumber: string;
  toNumber: string;
  forwardedFrom?: string;
  customerId?: string;
  customerName?: string;
  leadId?: string;
  leadName?: string;
  agentId?: string;
  agentName?: string;
  startTime?: string;
  answerTime?: string;
  endTime?: string;
  duration: number;
  talkDuration: number;
  holdDuration: number;
  ringDuration: number;
  audioQuality?: number;
  callQuality?: string;
  notes?: string;
  summary?: string;
  tags?: string[];
  transcript?: string;
  queueId?: string;
  queueWaitTime?: number;
  ivrPath?: string[];
  isTransferred: boolean;
  transferredTo?: string;
  transferredFrom?: string;
  isConference: boolean;
  conferenceParticipants?: string[];
  cost?: number;
  currency?: string;
  isAnalyzed: boolean;
  sentimentAnalysis?: {
    score: number;
    magnitude: number;
    emotions: string[];
  };
  keyPhrases?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface InitiateCallDto {
  toNumber: string;
  fromNumber?: string;
  customerId?: string;
  leadId?: string;
}

export interface UpdateCallDto {
  status?: CallStatus;
  disposition?: CallDisposition;
  notes?: string;
  summary?: string;
  tags?: string[];
}

export interface CallRecording {
  id: string;
  callId: string;
  recordingSid: string;
  type: string;
  status: RecordingStatus;
  url?: string;
  storageUrl?: string;
  format?: string;
  duration?: number;
  fileSize?: number;
  transcript?: string;
  transcriptConfidence?: number;
  isTranscribed: boolean;
  keywords?: string[];
  createdAt: string;
}

export interface CallQueue {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  phoneNumber: string;
  isActive: boolean;
  routingStrategy: QueueStrategy;
  priority: number;
  maxQueueSize: number;
  maxWaitTime: number;
  ringTimeout: number;
  requiredSkills?: string[];
  businessHours?: Record<string, any>;
  holidays?: string[];
  holdMusicUrl?: string;
  greetingMessageUrl?: string;
  queueFullMessageUrl?: string;
  afterHoursMessageUrl?: string;
  enableVoicemail: boolean;
  enableCallback: boolean;
  currentQueueSize: number;
  totalCallsToday: number;
  totalCallsHandled: number;
  totalCallsAbandoned: number;
  averageWaitTime: number;
  averageHandleTime: number;
  serviceLevelPercentage: number;
  serviceLevelThreshold: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateQueueDto {
  name: string;
  description?: string;
  phoneNumber: string;
  routingStrategy?: QueueStrategy;
  priority?: number;
  maxQueueSize?: number;
  maxWaitTime?: number;
  requiredSkills?: string[];
}

export interface UpdateQueueDto extends Partial<CreateQueueDto> {
  isActive?: boolean;
}

export interface CallAnalytics {
  totalCalls: number;
  inboundCalls: number;
  outboundCalls: number;
  answeredCalls: number;
  missedCalls: number;
  averageDuration: number;
  averageWaitTime: number;
  averageTalkTime: number;
  answerRate: number;
  missRate: number;
  callsByHour: Array<{ hour: number; count: number }>;
  callsByDay: Array<{ day: string; count: number }>;
  topAgents: Array<{ agentId: string; agentName: string; callCount: number; avgDuration: number }>;
  dispositionBreakdown: Record<string, number>;
}

// =================== AUDIT LOG TYPES ===================

export enum AuditAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  LOGIN = 'login',
  LOGOUT = 'logout',
  EXPORT = 'export',
  IMPORT = 'import',
  APPROVE = 'approve',
  REJECT = 'reject',
}

export interface AuditLog {
  id: string;
  organizationId?: string;
  user_id?: string;
  user_email?: string;
  action: AuditAction | string;
  entity_type?: string;
  entity_id?: string;
  metadata?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  status: 'success' | 'failed' | 'partial';
  created_at: string;
}

export interface AuditLogFilters extends PaginationParams {
  userId?: string;
  entityType?: string;
  action?: string;
  startDate?: string;
  endDate?: string;
}
