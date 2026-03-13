import { EntityManager } from 'typeorm';
interface EmployeeSelfServiceProfile {
    employeeId: string;
    personalInfo: PersonalInfo;
    emergencyContacts: EmergencyContact[];
    bankingInfo: BankingInfo;
    taxWithholdings: TaxWithholding;
    preferences: EmployeePreferences;
    aiPersonalization: AIPersonalization;
    quantumInsights: QuantumPersonalInsights;
    biometricProfile: BiometricProfile;
    lastUpdated: Date;
    blockchainVerification: BlockchainRecord;
}
interface PersonalInfo {
    firstName: string;
    lastName: string;
    middleName?: string;
    preferredName?: string;
    email: string;
    personalEmail?: string;
    phone: string;
    mobilePhone?: string;
    address: Address;
    birthDate: Date;
    ssn: string;
    maritalStatus: MaritalStatus;
    gender?: Gender;
    ethnicity?: string;
    veteranStatus?: boolean;
    disabilityStatus?: boolean;
    aiValidated: boolean;
}
interface Address {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    isResidential: boolean;
}
interface EmergencyContact {
    id: string;
    name: string;
    relationship: string;
    phone: string;
    email?: string;
    address?: Address;
    isPrimary: boolean;
    priority: number;
}
interface BankingInfo {
    accounts: BankAccount[];
    preferredAccount: string;
    directDepositSplit?: DepositSplit[];
    aiOptimizedSavings: boolean;
}
interface BankAccount {
    id: string;
    bankName: string;
    accountType: AccountType;
    routingNumber: string;
    accountNumber: string;
    isActive: boolean;
    verificationStatus: VerificationStatus;
    blockchainVerified: boolean;
}
interface DepositSplit {
    accountId: string;
    splitType: 'percentage' | 'fixed_amount';
    value: number;
    priority: number;
}
interface TaxWithholding {
    federalWithholding: FederalWithholding;
    stateWithholding?: StateWithholding[];
    localWithholding?: LocalWithholding[];
    additionalWithholdings: AdditionalWithholding[];
    aiTaxOptimization: boolean;
}
interface FederalWithholding {
    filingStatus: FilingStatus;
    allowances: number;
    additionalWithholding: number;
    exemptFromFederalTax: boolean;
    w4OnFile: boolean;
    effectiveDate: Date;
}
interface TimeOffRequest {
    id: string;
    employeeId: string;
    requestType: TimeOffType;
    startDate: Date;
    endDate: Date;
    totalDays: number;
    reason?: string;
    status: RequestStatus;
    approver?: string;
    approvedDate?: Date;
    comments?: Comment[];
    aiImpactAnalysis: AIImpactAnalysis;
    workflowStage: WorkflowStage;
    metadata: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}
interface ExpenseReport {
    id: string;
    employeeId: string;
    title: string;
    totalAmount: number;
    currency: string;
    submissionDate: Date;
    expenses: ExpenseItem[];
    status: ExpenseStatus;
    approver?: string;
    reimbursementAmount: number;
    aiAuditResults: AIAuditResults;
    receiptVerification: ReceiptVerification;
    complianceCheck: ComplianceCheck;
    blockchainRecord: BlockchainRecord;
}
interface ExpenseItem {
    id: string;
    category: ExpenseCategory;
    description: string;
    amount: number;
    date: Date;
    merchant: string;
    receiptUrl?: string;
    mileage?: number;
    aiCategorization: boolean;
    fraudRiskScore: number;
}
interface GoalSetting {
    id: string;
    employeeId: string;
    managerId?: string;
    title: string;
    description: string;
    category: GoalCategory;
    targetDate: Date;
    priority: Priority;
    measurableOutcomes: MeasurableOutcome[];
    status: GoalStatus;
    progress: number;
    milestones: Milestone[];
    aiSuggestions: AISuggestion[];
    quantumProbabilityScore: number;
    lastUpdated: Date;
}
interface DocumentUpload {
    id: string;
    employeeId: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    documentType: DocumentType;
    category: DocumentCategory;
    uploadDate: Date;
    expirationDate?: Date;
    status: DocumentStatus;
    aiTextExtraction: AITextExtraction;
    complianceVerification: ComplianceVerification;
    blockchainHash: string;
    accessControls: AccessControl[];
}
interface PayStubAccess {
    employeeId: string;
    payPeriods: PayPeriodSummary[];
    ytdSummary: YTDSummary;
    taxDocuments: TaxDocument[];
    aiInsights: PayAnalysis[];
    downloadHistory: DownloadRecord[];
}
interface EmployeePreferences {
    communicationPreferences: CommunicationPreferences;
    workPreferences: WorkPreferences;
    notificationSettings: NotificationSettings;
    privacySettings: PrivacySettings;
    accessibilitySettings: AccessibilitySettings;
    aiPersonalizationLevel: AIPersonalizationLevel;
}
interface AIPersonalization {
    personalizedDashboard: DashboardLayout;
    predictiveInsights: PredictiveInsight[];
    recommendedActions: RecommendedAction[];
    learningPath: LearningRecommendation[];
    careerProgression: CareerInsight[];
    wellnessRecommendations: WellnessInsight[];
    personalizationScore: number;
}
interface QuantumPersonalInsights {
    personalityQuantumMap: QuantumPersonalityProfile;
    optimalWorkPatterns: WorkPattern[];
    stressFactors: StressFactor[];
    motivationDrivers: MotivationDriver[];
    collaborationOptimization: CollaborationInsight[];
    quantumWellnessScore: number;
}
declare enum MaritalStatus {
    SINGLE = "single",
    MARRIED = "married",
    DIVORCED = "divorced",
    WIDOWED = "widowed",
    SEPARATED = "separated"
}
declare enum Gender {
    MALE = "male",
    FEMALE = "female",
    NON_BINARY = "non_binary",
    PREFER_NOT_TO_SAY = "prefer_not_to_say"
}
declare enum AccountType {
    CHECKING = "checking",
    SAVINGS = "savings"
}
declare enum VerificationStatus {
    PENDING = "pending",
    VERIFIED = "verified",
    FAILED = "failed",
    EXPIRED = "expired"
}
declare enum FilingStatus {
    SINGLE = "single",
    MARRIED_JOINT = "married_joint",
    MARRIED_SEPARATE = "married_separate",
    HEAD_OF_HOUSEHOLD = "head_of_household"
}
declare enum TimeOffType {
    VACATION = "vacation",
    SICK_LEAVE = "sick_leave",
    PERSONAL = "personal",
    BEREAVEMENT = "bereavement",
    JURY_DUTY = "jury_duty",
    MEDICAL_LEAVE = "medical_leave",
    PARENTAL_LEAVE = "parental_leave",
    SABBATICAL = "sabbatical"
}
declare enum RequestStatus {
    DRAFT = "draft",
    SUBMITTED = "submitted",
    PENDING = "pending",
    APPROVED = "approved",
    DENIED = "denied",
    CANCELLED = "cancelled"
}
declare enum ExpenseStatus {
    DRAFT = "draft",
    SUBMITTED = "submitted",
    UNDER_REVIEW = "under_review",
    APPROVED = "approved",
    REJECTED = "rejected",
    PAID = "paid"
}
declare enum ExpenseCategory {
    TRAVEL = "travel",
    MEALS = "meals",
    LODGING = "lodging",
    TRANSPORTATION = "transportation",
    SUPPLIES = "supplies",
    EQUIPMENT = "equipment",
    TRAINING = "training",
    OTHER = "other"
}
declare enum GoalCategory {
    PERFORMANCE = "performance",
    SKILL_DEVELOPMENT = "skill_development",
    CAREER_ADVANCEMENT = "career_advancement",
    LEADERSHIP = "leadership",
    INNOVATION = "innovation",
    COLLABORATION = "collaboration"
}
declare enum Priority {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    CRITICAL = "critical"
}
declare enum GoalStatus {
    DRAFT = "draft",
    ACTIVE = "active",
    ON_TRACK = "on_track",
    AT_RISK = "at_risk",
    COMPLETED = "completed",
    CANCELLED = "cancelled"
}
declare enum DocumentType {
    IDENTIFICATION = "identification",
    CERTIFICATION = "certification",
    EDUCATION = "education",
    MEDICAL = "medical",
    LEGAL = "legal",
    PERSONAL = "personal"
}
declare enum DocumentCategory {
    I9_DOCUMENTS = "i9_documents",
    CERTIFICATIONS = "certifications",
    LICENSES = "licenses",
    TRANSCRIPTS = "transcripts",
    MEDICAL_RECORDS = "medical_records",
    OTHER = "other"
}
declare enum DocumentStatus {
    UPLOADED = "uploaded",
    PROCESSING = "processing",
    VERIFIED = "verified",
    REJECTED = "rejected",
    EXPIRED = "expired"
}
declare enum AIPersonalizationLevel {
    MINIMAL = "minimal",
    STANDARD = "standard",
    ADVANCED = "advanced",
    QUANTUM_ENHANCED = "quantum_enhanced"
}
interface WorkflowStage {
    currentStage: string;
    totalStages: number;
    nextApprover?: string;
    expectedCompletionDate?: Date;
}
interface AIImpactAnalysis {
    teamImpact: number;
    projectImpact: number;
    coverageRecommendations: string[];
    alternativeScheduling: string[];
}
interface AIAuditResults {
    complianceScore: number;
    fraudRiskScore: number;
    categoryAccuracy: number;
    flaggedItems: string[];
    recommendations: string[];
}
interface ReceiptVerification {
    ocrExtraction: OCRData;
    merchantVerification: boolean;
    amountVerification: boolean;
    dateVerification: boolean;
    aiConfidenceScore: number;
}
interface ComplianceCheck {
    policyCompliance: boolean;
    taxCompliance: boolean;
    regulatoryCompliance: boolean;
    violationsFound: string[];
    requiredActions: string[];
}
interface BlockchainRecord {
    transactionHash: string;
    blockHeight: number;
    timestamp: Date;
    verified: boolean;
}
export declare class EmployeeSelfServiceService {
    private readonly entityManager;
    private readonly logger;
    constructor(entityManager: EntityManager);
    getEmployeeProfile(employeeId: string): Promise<EmployeeSelfServiceProfile>;
    updatePersonalInfo(employeeId: string, personalInfo: Partial<PersonalInfo>): Promise<PersonalInfo>;
    submitTimeOffRequest(employeeId: string, requestData: Partial<TimeOffRequest>): Promise<TimeOffRequest>;
    getTimeOffBalance(employeeId: string): Promise<any>;
    submitExpenseReport(employeeId: string, expenseData: Partial<ExpenseReport>): Promise<ExpenseReport>;
    createGoal(employeeId: string, goalData: Partial<GoalSetting>): Promise<GoalSetting>;
    updateGoalProgress(goalId: string, progress: number, notes?: string): Promise<GoalSetting>;
    uploadDocument(employeeId: string, documentData: Partial<DocumentUpload>, fileBuffer: Buffer): Promise<DocumentUpload>;
    getPayStubs(employeeId: string, year?: number): Promise<PayStubAccess>;
    private buildPersonalizedProfile;
    private generateQuantumPersonalInsights;
    private aiValidatePersonalInfo;
    private analyzeTimeOffImpact;
    private processExpensesWithAI;
    private aiCategorizeExpense;
    private generateGoalSuggestions;
    private generateUniqueId;
    private createBlockchainRecord;
    private generateBlockchainHash;
    private triggerApprovalWorkflows;
    private initiateApprovalWorkflow;
    private getNextApprover;
    healthCheck(): Promise<any>;
}
export {};
//# sourceMappingURL=employee-self-service.service.d.ts.map