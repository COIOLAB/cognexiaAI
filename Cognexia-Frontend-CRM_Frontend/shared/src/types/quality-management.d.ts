import { BaseEntity, AuditableEntity, CollaborationMode, AIInsight, RiskLevel, Priority, Status } from './core';
export declare enum QualityPlanType {
    MASTER_PLAN = "MASTER_PLAN",
    PROJECT_PLAN = "PROJECT_PLAN",
    PRODUCT_PLAN = "PRODUCT_PLAN",
    PROCESS_PLAN = "PROCESS_PLAN",
    SUPPLIER_PLAN = "SUPPLIER_PLAN",
    PREVENTIVE_PLAN = "PREVENTIVE_PLAN",
    CORRECTIVE_PLAN = "CORRECTIVE_PLAN",
    VALIDATION_PLAN = "VALIDATION_PLAN"
}
export declare enum QualityObjectiveType {
    DEFECT_REDUCTION = "DEFECT_REDUCTION",
    PROCESS_IMPROVEMENT = "PROCESS_IMPROVEMENT",
    CUSTOMER_SATISFACTION = "CUSTOMER_SATISFACTION",
    COMPLIANCE_ACHIEVEMENT = "COMPLIANCE_ACHIEVEMENT",
    COST_REDUCTION = "COST_REDUCTION",
    CYCLE_TIME_REDUCTION = "CYCLE_TIME_REDUCTION",
    FIRST_PASS_YIELD = "FIRST_PASS_YIELD",
    RIGHT_FIRST_TIME = "RIGHT_FIRST_TIME"
}
export declare enum InspectionType {
    INCOMING = "INCOMING",
    IN_PROCESS = "IN_PROCESS",
    FINAL = "FINAL",
    PATROL = "PATROL",
    AUDIT = "AUDIT",
    VERIFICATION = "VERIFICATION",
    VALIDATION = "VALIDATION",
    CALIBRATION = "CALIBRATION",
    PREVENTIVE = "PREVENTIVE"
}
export declare enum InspectionMethod {
    VISUAL = "VISUAL",
    DIMENSIONAL = "DIMENSIONAL",
    FUNCTIONAL = "FUNCTIONAL",
    DESTRUCTIVE = "DESTRUCTIVE",
    NON_DESTRUCTIVE = "NON_DESTRUCTIVE",
    STATISTICAL = "STATISTICAL",
    AI_VISION = "AI_VISION",
    SENSOR_BASED = "SENSOR_BASED",
    HYBRID = "HYBRID"
}
export declare enum InspectionStatus {
    PLANNED = "PLANNED",
    SCHEDULED = "SCHEDULED",
    IN_PROGRESS = "IN_PROGRESS",
    COMPLETED = "COMPLETED",
    PASSED = "PASSED",
    FAILED = "FAILED",
    ON_HOLD = "ON_HOLD",
    CANCELLED = "CANCELLED",
    REWORK_REQUIRED = "REWORK_REQUIRED"
}
export declare enum SamplingPlan {
    ZERO_ACCEPTANCE = "ZERO_ACCEPTANCE",
    SINGLE_SAMPLING = "SINGLE_SAMPLING",
    DOUBLE_SAMPLING = "DOUBLE_SAMPLING",
    MULTIPLE_SAMPLING = "MULTIPLE_SAMPLING",
    SEQUENTIAL_SAMPLING = "SEQUENTIAL_SAMPLING",
    SKIP_LOT_SAMPLING = "SKIP_LOT_SAMPLING",
    CONTINUOUS_SAMPLING = "CONTINUOUS_SAMPLING",
    ONE_HUNDRED_PERCENT = "ONE_HUNDRED_PERCENT"
}
export declare enum NonConformanceType {
    MINOR = "MINOR",
    MAJOR = "MAJOR",
    CRITICAL = "CRITICAL",
    OBSERVATION = "OBSERVATION",
    POTENTIAL = "POTENTIAL",
    CUSTOMER_COMPLAINT = "CUSTOMER_COMPLAINT",
    SUPPLIER_ISSUE = "SUPPLIER_ISSUE",
    PROCESS_DEVIATION = "PROCESS_DEVIATION"
}
export declare enum NonConformanceStatus {
    OPEN = "OPEN",
    INVESTIGATING = "INVESTIGATING",
    ROOT_CAUSE_IDENTIFIED = "ROOT_CAUSE_IDENTIFIED",
    CORRECTIVE_ACTION_PLANNED = "CORRECTIVE_ACTION_PLANNED",
    CORRECTIVE_ACTION_IMPLEMENTED = "CORRECTIVE_ACTION_IMPLEMENTED",
    VERIFICATION_PENDING = "VERIFICATION_PENDING",
    CLOSED = "CLOSED",
    REJECTED = "REJECTED"
}
export declare enum CorrectiveActionType {
    IMMEDIATE = "IMMEDIATE",
    CORRECTIVE = "CORRECTIVE",
    PREVENTIVE = "PREVENTIVE",
    CONTAINMENT = "CONTAINMENT",
    SYSTEMATIC = "SYSTEMATIC",
    PROCESS_IMPROVEMENT = "PROCESS_IMPROVEMENT",
    TRAINING = "TRAINING",
    PROCEDURAL = "PROCEDURAL"
}
export declare enum QualityControlPoint {
    RAW_MATERIAL = "RAW_MATERIAL",
    SETUP_APPROVAL = "SETUP_APPROVAL",
    FIRST_PIECE = "FIRST_PIECE",
    IN_PROCESS = "IN_PROCESS",
    FINAL_INSPECTION = "FINAL_INSPECTION",
    PACKAGING = "PACKAGING",
    SHIPPING = "SHIPPING",
    CUSTOMER_RECEIPT = "CUSTOMER_RECEIPT"
}
export declare enum QualityMetricType {
    DEFECT_RATE = "DEFECT_RATE",
    FIRST_PASS_YIELD = "FIRST_PASS_YIELD",
    CUSTOMER_SATISFACTION = "CUSTOMER_SATISFACTION",
    PROCESS_CAPABILITY = "PROCESS_CAPABILITY",
    COST_OF_QUALITY = "COST_OF_QUALITY",
    INSPECTION_EFFICIENCY = "INSPECTION_EFFICIENCY",
    SUPPLIER_QUALITY = "SUPPLIER_QUALITY",
    COMPLIANCE_RATE = "COMPLIANCE_RATE"
}
export declare enum CollaborativeDecisionType {
    ACCEPT = "ACCEPT",
    REJECT = "REJECT",
    REWORK = "REWORK",
    USE_AS_IS = "USE_AS_IS",
    CONCESSION = "CONCESSION",
    RETURN_TO_SUPPLIER = "RETURN_TO_SUPPLIER",
    ESCALATE = "ESCALATE",
    INVESTIGATE = "INVESTIGATE"
}
export interface QualityObjective {
    id: string;
    type: QualityObjectiveType;
    description: string;
    targetValue: number;
    currentValue?: number;
    unit: string;
    targetDate: Date;
    priority: Priority;
    status: Status;
    metrics: QualityMetric[];
    responsiblePersons: string[];
    reviewPeriod: number;
    lastReviewDate?: Date;
    aiInsights?: AIInsight[];
}
export interface QualityPlan extends BaseEntity {
    type: QualityPlanType;
    title: string;
    description: string;
    planningHorizon: {
        startDate: Date;
        endDate: Date;
    };
    objectives: QualityObjective[];
    controlPoints: QualityControlPoint[];
    inspectionRequirements: InspectionRequirement[];
    resources: QualityResource[];
    risks: QualityRisk[];
    collaborationMode: CollaborationMode;
    approvalStatus: Status;
    version: number;
    parentPlanId?: string;
    relatedPlans: string[];
}
export interface QualityResource {
    id: string;
    type: 'HUMAN' | 'EQUIPMENT' | 'SOFTWARE' | 'FACILITY' | 'CONSUMABLE';
    name: string;
    availability: number;
    capabilities: string[];
    certifications: QualityCertification[];
    maintenanceSchedule?: MaintenanceSchedule;
    utilizationRate?: number;
    cost: {
        hourly?: number;
        fixed?: number;
        variable?: number;
    };
}
export interface QualityCertification {
    id: string;
    name: string;
    standard: string;
    issuedBy: string;
    issuedDate: Date;
    expiryDate: Date;
    status: 'VALID' | 'EXPIRED' | 'PENDING_RENEWAL' | 'SUSPENDED';
}
export interface MaintenanceSchedule {
    frequency: number;
    lastMaintenanceDate: Date;
    nextMaintenanceDate: Date;
    maintenanceType: 'CALIBRATION' | 'PREVENTIVE' | 'CORRECTIVE' | 'VALIDATION';
}
export interface QualityRisk {
    id: string;
    description: string;
    category: string;
    probability: number;
    impact: number;
    riskLevel: RiskLevel;
    mitigationActions: string[];
    contingencyPlans: string[];
    owner: string;
    reviewDate: Date;
}
export interface InspectionRequirement {
    id: string;
    type: InspectionType;
    method: InspectionMethod;
    description: string;
    applicableProducts: string[];
    applicableProcesses: string[];
    controlCharacteristics: QualityCharacteristic[];
    samplingPlan: SamplingPlanDetails;
    acceptanceCriteria: AcceptanceCriteria;
    requiredCertifications: string[];
    estimatedDuration: number;
    priority: Priority;
    collaborativeDecisionRequired: boolean;
}
export interface QualityCharacteristic {
    id: string;
    name: string;
    type: 'VARIABLE' | 'ATTRIBUTE' | 'VISUAL';
    specification: QualitySpecification;
    measurementMethod: string;
    equipment: string[];
    criticality: 'CRITICAL' | 'MAJOR' | 'MINOR';
    statisticalControl: StatisticalControl;
}
export interface QualitySpecification {
    nominalValue?: number;
    tolerance?: {
        upper: number;
        lower: number;
    };
    targetValue?: number;
    units: string;
    acceptableValues?: string[];
    rejectableDefects?: string[];
}
export interface StatisticalControl {
    controlLimits: {
        upper: number;
        lower: number;
    };
    targetCpk: number;
    currentCpk?: number;
    sampleSize: number;
    frequency: number;
}
export interface SamplingPlanDetails {
    plan: SamplingPlan;
    sampleSize: number;
    batchSize?: number;
    acceptanceNumber: number;
    rejectionNumber: number;
    inspectionLevel: 'I' | 'II' | 'III' | 'S1' | 'S2' | 'S3' | 'S4';
    aql: number;
}
export interface AcceptanceCriteria {
    passCriteria: AcceptanceRule[];
    failCriteria: AcceptanceRule[];
    conditionalCriteria?: AcceptanceRule[];
    escalationCriteria?: AcceptanceRule[];
}
export interface AcceptanceRule {
    characteristic: string;
    operator: 'EQUALS' | 'GREATER_THAN' | 'LESS_THAN' | 'BETWEEN' | 'NOT_EQUALS' | 'CONTAINS';
    value: number | string;
    range?: {
        min: number | string;
        max: number | string;
    };
    logicalOperator?: 'AND' | 'OR';
}
export interface InspectionWorkflow extends AuditableEntity {
    workflowId: string;
    name: string;
    description: string;
    type: InspectionType;
    steps: InspectionStep[];
    triggers: WorkflowTrigger[];
    automationLevel: number;
    humanAICollaboration: CollaborationConfiguration;
    status: Status;
    version: number;
    approvedBy: string;
    effectiveDate: Date;
}
export interface InspectionStep {
    stepId: string;
    name: string;
    description: string;
    sequence: number;
    type: 'MANUAL' | 'AUTOMATED' | 'COLLABORATIVE' | 'AI_ASSISTED';
    requirements: InspectionRequirement[];
    expectedDuration: number;
    resources: string[];
    predecessorSteps: string[];
    successorSteps: string[];
    decision: {
        type: CollaborativeDecisionType;
        aiRecommendation?: boolean;
        humanOverrideAllowed: boolean;
        escalationRules?: EscalationRule[];
    };
}
export interface WorkflowTrigger {
    id: string;
    type: 'TIME_BASED' | 'EVENT_BASED' | 'CONDITION_BASED' | 'MANUAL';
    condition: string;
    parameters: Record<string, any>;
    active: boolean;
}
export interface CollaborationConfiguration {
    mode: CollaborationMode;
    humanRoles: HumanRole[];
    aiCapabilities: AICapability[];
    decisionProtocols: DecisionProtocol[];
    escalationMatrix: EscalationMatrix;
}
export interface HumanRole {
    roleId: string;
    name: string;
    responsibilities: string[];
    requiredCertifications: string[];
    experienceLevel: 'BEGINNER' | 'INTERMEDIATE' | 'EXPERT' | 'MASTER';
    collaborationPreferences: CollaborationPreference[];
}
export interface AICapability {
    capabilityId: string;
    name: string;
    type: 'VISION' | 'PREDICTION' | 'OPTIMIZATION' | 'ANOMALY_DETECTION' | 'RECOMMENDATION';
    accuracy: number;
    confidence: number;
    applications: string[];
    limitations: string[];
}
export interface DecisionProtocol {
    id: string;
    scenario: string;
    decisionMaker: 'HUMAN' | 'AI' | 'COLLABORATIVE';
    criteria: DecisionCriteria[];
    overrideRules: OverrideRule[];
}
export interface DecisionCriteria {
    parameter: string;
    threshold: number | string;
    operator: string;
    weight: number;
}
export interface OverrideRule {
    condition: string;
    newDecisionMaker: 'HUMAN' | 'AI';
    justificationRequired: boolean;
}
export interface EscalationMatrix {
    levels: EscalationLevel[];
    timeouts: EscalationTimeout[];
    notificationRules: NotificationRule[];
}
export interface EscalationLevel {
    level: number;
    name: string;
    roles: string[];
    authority: string[];
    maxResponseTime: number;
}
export interface EscalationTimeout {
    stepId: string;
    timeout: number;
    escalationLevel: number;
    autoEscalate: boolean;
}
export interface EscalationRule {
    condition: string;
    targetLevel: number;
    immediate: boolean;
    notificationRequired: boolean;
}
export interface NotificationRule {
    trigger: string;
    recipients: string[];
    method: 'EMAIL' | 'SMS' | 'IN_APP' | 'DASHBOARD' | 'ALL';
    template: string;
}
export interface CollaborationPreference {
    preferenceId: string;
    type: 'INTERACTION_STYLE' | 'FEEDBACK_MODE' | 'AUTOMATION_LEVEL' | 'DECISION_SUPPORT';
    value: string;
    context: string;
}
export interface InspectionOrder extends BaseEntity {
    orderNumber: string;
    workflowId: string;
    type: InspectionType;
    priority: Priority;
    scheduledDate: Date;
    dueDate: Date;
    productId?: string;
    batchId?: string;
    lotId?: string;
    processId?: string;
    quantity: number;
    samplingPlan: SamplingPlanDetails;
    inspector: InspectorAssignment;
    resources: ResourceAssignment[];
    status: InspectionStatus;
    collaborationSession?: CollaborationSession;
    results?: InspectionResult[];
    aiInsights?: AIInsight[];
}
export interface InspectorAssignment {
    inspectorId: string;
    name: string;
    certifications: string[];
    experience: number;
    specialties: string[];
    currentLoad: number;
    preferredCollaborationMode: CollaborationMode;
    performanceRating: number;
}
export interface ResourceAssignment {
    resourceId: string;
    resourceType: string;
    allocatedTime: number;
    status: 'ALLOCATED' | 'IN_USE' | 'COMPLETED' | 'UNAVAILABLE';
    calibrationStatus?: 'VALID' | 'DUE' | 'OVERDUE';
}
export interface CollaborationSession extends BaseEntity {
    sessionType: 'INSPECTION' | 'ANALYSIS' | 'DECISION_MAKING' | 'REVIEW';
    participants: SessionParticipant[];
    aiAssistants: AIAssistant[];
    startTime: Date;
    endTime?: Date;
    interactions: Interaction[];
    decisions: CollaborativeDecision[];
    outcomes: SessionOutcome[];
    satisfactionRating?: number;
}
export interface SessionParticipant {
    participantId: string;
    role: 'PRIMARY_INSPECTOR' | 'SECONDARY_INSPECTOR' | 'SUPERVISOR' | 'EXPERT' | 'TRAINEE';
    joinTime: Date;
    leaveTime?: Date;
    contributionLevel: number;
}
export interface AIAssistant {
    assistantId: string;
    name: string;
    type: 'VISUAL_ANALYSIS' | 'STATISTICAL_ANALYSIS' | 'RECOMMENDATION' | 'DOCUMENTATION';
    capabilities: string[];
    confidence: number;
    usageTime: number;
    recommendations: AIRecommendation[];
}
export interface Interaction {
    id: string;
    timestamp: Date;
    type: 'MEASUREMENT' | 'OBSERVATION' | 'QUESTION' | 'RECOMMENDATION' | 'DECISION' | 'OVERRIDE';
    participantId: string;
    content: string;
    attachments?: Attachment[];
    aiGenerated: boolean;
}
export interface Attachment {
    id: string;
    type: 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'MEASUREMENT_DATA' | 'AUDIO';
    filename: string;
    url: string;
    metadata: Record<string, any>;
}
export interface AIRecommendation {
    id: string;
    type: 'ACCEPT' | 'REJECT' | 'INVESTIGATE' | 'REWORK' | 'ESCALATE';
    confidence: number;
    reasoning: string;
    supportingData: Record<string, any>;
    alternatives: string[];
    timestamp: Date;
}
export interface CollaborativeDecision {
    id: string;
    decisionType: CollaborativeDecisionType;
    characteristic?: string;
    aiRecommendation?: AIRecommendation;
    humanInput: HumanDecisionInput;
    finalDecision: string;
    confidence: number;
    justification: string;
    timestamp: Date;
    overridden: boolean;
    overrideReason?: string;
}
export interface HumanDecisionInput {
    inspectorId: string;
    decision: string;
    confidence: number;
    reasoning: string;
    experience: string;
    alternativeConsidered: boolean;
    consultedResources: string[];
}
export interface SessionOutcome {
    type: 'LEARNING' | 'IMPROVEMENT' | 'ISSUE_IDENTIFIED' | 'BEST_PRACTICE';
    description: string;
    actionItems: ActionItem[];
    impact: 'LOW' | 'MEDIUM' | 'HIGH';
    category: string;
}
export interface ActionItem {
    id: string;
    description: string;
    assignee: string;
    dueDate: Date;
    status: Status;
    priority: Priority;
}
export interface InspectionResult extends BaseEntity {
    inspectionOrderId: string;
    characteristic: QualityCharacteristic;
    measurements: Measurement[];
    observations: Observation[];
    decision: CollaborativeDecision;
    conformanceStatus: 'CONFORM' | 'NON_CONFORM' | 'CONDITIONAL';
    inspector: string;
    inspectionDate: Date;
    equipment: string[];
    environmentalConditions?: EnvironmentalCondition[];
    uncertainty?: Uncertainty;
    traceabilityData: TraceabilityRecord[];
}
export interface Measurement {
    id: string;
    value: number | string;
    unit?: string;
    method: string;
    equipment: string;
    timestamp: Date;
    operator: string;
    repeatability: number;
    reproducibility: number;
    calibrationStatus: string;
    rawData?: Record<string, any>;
}
export interface Observation {
    id: string;
    type: 'VISUAL' | 'TACTILE' | 'AUDITORY' | 'OLFACTORY' | 'OTHER';
    description: string;
    severity: 'INFO' | 'WARNING' | 'CRITICAL';
    location?: string;
    images?: string[];
    inspector: string;
    timestamp: Date;
    aiAnalysis?: AIAnalysis;
}
export interface AIAnalysis {
    algorithm: string;
    confidence: number;
    findings: string[];
    recommendations: string[];
    anomalies: Anomaly[];
    patterns: Pattern[];
}
export interface Anomaly {
    type: string;
    description: string;
    severity: RiskLevel;
    probability: number;
    location?: Coordinate[];
    suggestedActions: string[];
}
export interface Pattern {
    type: string;
    description: string;
    frequency: number;
    trend: 'INCREASING' | 'DECREASING' | 'STABLE' | 'CYCLICAL';
    predictedOutcome: string;
}
export interface Coordinate {
    x: number;
    y: number;
    z?: number;
}
export interface EnvironmentalCondition {
    parameter: string;
    value: number;
    unit: string;
    acceptableRange: {
        min: number;
        max: number;
    };
    impact: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH';
}
export interface Uncertainty {
    value: number;
    unit: string;
    confidenceLevel: number;
    method: string;
    components: UncertaintyComponent[];
}
export interface UncertaintyComponent {
    source: string;
    value: number;
    type: 'TYPE_A' | 'TYPE_B';
    distribution: string;
}
export interface TraceabilityRecord {
    id: string;
    type: 'MATERIAL' | 'PROCESS' | 'EQUIPMENT' | 'PERSONNEL' | 'ENVIRONMENT';
    reference: string;
    description: string;
    timestamp: Date;
    location: string;
    batchId?: string;
    serialNumber?: string;
    relatedRecords: string[];
}
export interface NonConformance extends AuditableEntity {
    ncNumber: string;
    type: NonConformanceType;
    title: string;
    description: string;
    source: NonConformanceSource;
    detectionMethod: 'INSPECTION' | 'AUDIT' | 'CUSTOMER_FEEDBACK' | 'SUPPLIER_NOTIFICATION' | 'PROCESS_MONITORING' | 'AI_DETECTION';
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    priority: Priority;
    status: NonConformanceStatus;
    affectedProducts: AffectedProduct[];
    affectedProcesses: string[];
    rootCauseAnalysis?: RootCauseAnalysis;
    correctiveActions: CorrectiveAction[];
    preventiveActions: PreventiveAction[];
    verification: VerificationRecord[];
    costs: NonConformanceCost;
    containmentActions: ContainmentAction[];
    collaborationRequired: boolean;
    aiInsights?: AIInsight[];
    relatedNCs: string[];
}
export interface NonConformanceSource {
    type: 'INTERNAL' | 'EXTERNAL' | 'SUPPLIER' | 'CUSTOMER' | 'REGULATORY';
    reportedBy: string;
    reportedDate: Date;
    location: string;
    department: string;
    contactInfo?: ContactInfo;
}
export interface ContactInfo {
    name: string;
    email: string;
    phone?: string;
    organization?: string;
}
export interface AffectedProduct {
    productId: string;
    productName: string;
    quantity: number;
    batchId?: string;
    lotId?: string;
    serialNumbers?: string[];
    customerInfo?: CustomerInfo;
    disposition: ProductDisposition;
    estimatedCost: number;
}
export interface CustomerInfo {
    customerId: string;
    customerName: string;
    contactPerson: string;
    notificationDate?: Date;
    notificationMethod?: string;
    customerResponse?: string;
}
export interface ProductDisposition {
    action: 'QUARANTINE' | 'REWORK' | 'SCRAP' | 'USE_AS_IS' | 'RETURN' | 'CONCESSION';
    justification: string;
    approvedBy: string;
    approvalDate: Date;
    completionDate?: Date;
    cost: number;
}
export interface RootCauseAnalysis {
    method: '5_WHY' | 'FISHBONE' | 'FAULT_TREE' | 'DMAIC' | 'A3' | 'PARETO' | 'AI_ANALYSIS';
    analyst: string;
    startDate: Date;
    completionDate?: Date;
    findings: RootCauseFinding[];
    rootCauses: RootCause[];
    contributingFactors: ContributingFactor[];
    aiAssistance?: AIRootCauseAnalysis;
    evidenceFiles: string[];
    collaborationSessions: string[];
}
export interface RootCauseFinding {
    category: 'PEOPLE' | 'PROCESS' | 'EQUIPMENT' | 'MATERIAL' | 'ENVIRONMENT' | 'MEASUREMENT';
    finding: string;
    evidence: string;
    impact: 'HIGH' | 'MEDIUM' | 'LOW';
    verified: boolean;
}
export interface RootCause {
    id: string;
    category: string;
    description: string;
    probability: number;
    impact: 'HIGH' | 'MEDIUM' | 'LOW';
    verified: boolean;
    verificationMethod: string;
    verificationDate: Date;
    relatedFindings: string[];
}
export interface ContributingFactor {
    factor: string;
    category: string;
    contributionLevel: number;
    relationship: string;
    actionRequired: boolean;
}
export interface AIRootCauseAnalysis {
    algorithm: string;
    confidence: number;
    suggestedCauses: SuggestedCause[];
    correlations: Correlation[];
    patterns: AnalysisPattern[];
    recommendations: string[];
}
export interface SuggestedCause {
    cause: string;
    probability: number;
    evidenceSupport: number;
    similarCases: string[];
    suggestedInvestigation: string[];
}
export interface Correlation {
    variables: string[];
    strength: number;
    type: 'POSITIVE' | 'NEGATIVE' | 'NON_LINEAR';
    significance: number;
}
export interface AnalysisPattern {
    pattern: string;
    frequency: number;
    trend: 'INCREASING' | 'DECREASING' | 'STABLE' | 'CYCLICAL';
    implication: string;
}
export interface CorrectiveAction {
    id: string;
    type: CorrectiveActionType;
    description: string;
    rootCauseId?: string;
    responsible: string;
    targetDate: Date;
    actualDate?: Date;
    status: Status;
    priority: Priority;
    resources: ActionResource[];
    verification: ActionVerification[];
    effectiveness: ActionEffectiveness;
    cost: number;
    risks: ActionRisk[];
    dependencies: string[];
}
export interface PreventiveAction {
    id: string;
    description: string;
    justification: string;
    responsible: string;
    targetDate: Date;
    actualDate?: Date;
    status: Status;
    priority: Priority;
    scope: 'LOCAL' | 'DEPARTMENTAL' | 'ORGANIZATIONAL' | 'SUPPLY_CHAIN';
    resources: ActionResource[];
    verification: ActionVerification[];
    effectiveness: ActionEffectiveness;
    cost: number;
    riskReduction: number;
}
export interface ActionResource {
    type: 'HUMAN' | 'FINANCIAL' | 'EQUIPMENT' | 'TIME' | 'MATERIAL';
    description: string;
    quantity: number;
    unit: string;
    cost: number;
    availability: Date;
}
export interface ActionVerification {
    id: string;
    method: 'INSPECTION' | 'AUDIT' | 'MONITORING' | 'TESTING' | 'REVIEW' | 'AI_VERIFICATION';
    description: string;
    responsible: string;
    plannedDate: Date;
    actualDate?: Date;
    result: 'EFFECTIVE' | 'PARTIALLY_EFFECTIVE' | 'INEFFECTIVE' | 'PENDING';
    evidence: string[];
    followUpRequired: boolean;
}
export interface ActionEffectiveness {
    measurementMethod: string;
    baseline: EffectivenessMetric[];
    current: EffectivenessMetric[];
    target: EffectivenessMetric[];
    effectiveness: number;
    sustainabilityRisk: RiskLevel;
    reviewDate: Date;
}
export interface EffectivenessMetric {
    metric: string;
    value: number;
    unit: string;
    measurementDate: Date;
    source: string;
}
export interface ActionRisk {
    description: string;
    probability: number;
    impact: 'HIGH' | 'MEDIUM' | 'LOW';
    mitigation: string;
    contingency: string;
}
export interface VerificationRecord {
    id: string;
    type: 'INTERIM' | 'FINAL' | 'FOLLOW_UP';
    verifier: string;
    verificationDate: Date;
    method: string;
    criteria: VerificationCriteria[];
    results: VerificationResult[];
    conclusion: 'VERIFIED' | 'PARTIALLY_VERIFIED' | 'NOT_VERIFIED';
    recommendations: string[];
    nextVerificationDate?: Date;
}
export interface VerificationCriteria {
    criterion: string;
    expectedOutcome: string;
    measurement: string;
    acceptanceCriteria: string;
}
export interface VerificationResult {
    criterion: string;
    actualOutcome: string;
    measurement: number | string;
    unit?: string;
    result: 'MET' | 'NOT_MET' | 'PARTIALLY_MET';
    variance?: number;
    comments: string;
}
export interface NonConformanceCost {
    detection: number;
    investigation: number;
    containment: number;
    correction: number;
    prevention: number;
    external: number;
    total: number;
    currency: string;
}
export interface ContainmentAction {
    id: string;
    description: string;
    responsible: string;
    implementationDate: Date;
    status: Status;
    effectiveness: 'EFFECTIVE' | 'PARTIALLY_EFFECTIVE' | 'INEFFECTIVE';
    duration: number;
    cost: number;
    verification: string;
}
export interface QualityMetric extends BaseEntity {
    name: string;
    type: QualityMetricType;
    description: string;
    formula: string;
    unit: string;
    frequency: 'REAL_TIME' | 'HOURLY' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY';
    target: MetricTarget;
    current: MetricValue;
    history: MetricValue[];
    trends: Trend[];
    alerts: QualityAlert[];
    applicableEntities: string[];
}
export interface MetricTarget {
    value: number;
    operator: 'GREATER_THAN' | 'LESS_THAN' | 'EQUALS' | 'BETWEEN';
    range?: {
        min: number;
        max: number;
    };
    reviewDate: Date;
}
export interface MetricValue {
    value: number;
    timestamp: Date;
    source: string;
    confidence: number;
    validated: boolean;
    context: Record<string, any>;
}
export interface Trend {
    period: string;
    direction: 'IMPROVING' | 'DECLINING' | 'STABLE' | 'VOLATILE';
    magnitude: number;
    significance: number;
    prediction: TrendPrediction;
}
export interface TrendPrediction {
    nextPeriodValue: number;
    confidence: number;
    factors: string[];
    recommendations: string[];
}
export interface QualityAlert extends BaseEntity {
    type: 'THRESHOLD' | 'TREND' | 'ANOMALY' | 'COMPLIANCE' | 'SYSTEM';
    severity: 'INFO' | 'WARNING' | 'CRITICAL' | 'EMERGENCY';
    message: string;
    source: string;
    triggerCondition: string;
    triggerValue: number | string;
    currentValue: number | string;
    timestamp: Date;
    acknowledged: boolean;
    acknowledgedBy?: string;
    acknowledgedDate?: Date;
    resolved: boolean;
    resolvedBy?: string;
    resolvedDate?: Date;
    actions: AlertAction[];
    escalation: AlertEscalation;
}
export interface AlertAction {
    id: string;
    description: string;
    type: 'AUTOMATIC' | 'MANUAL' | 'COLLABORATIVE';
    status: Status;
    responsible?: string;
    completionDate?: Date;
    result?: string;
}
export interface AlertEscalation {
    level: number;
    escalationDate: Date;
    escalatedTo: string[];
    reason: string;
    maxLevel: number;
    autoEscalate: boolean;
}
export interface QualityDashboard {
    id: string;
    name: string;
    type: 'OPERATIONAL' | 'TACTICAL' | 'STRATEGIC' | 'EXECUTIVE';
    widgets: DashboardWidget[];
    filters: DashboardFilter[];
    refreshInterval: number;
    permissions: DashboardPermission[];
    collaborationEnabled: boolean;
    aiInsightsEnabled: boolean;
}
export interface DashboardWidget {
    id: string;
    type: 'METRIC' | 'CHART' | 'TABLE' | 'ALERT_SUMMARY' | 'TREND' | 'HEATMAP' | 'AI_INSIGHT';
    title: string;
    dataSource: string;
    configuration: Record<string, any>;
    position: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    refreshEnabled: boolean;
    drillDownEnabled: boolean;
}
export interface DashboardFilter {
    field: string;
    operator: string;
    value: any;
    active: boolean;
}
export interface DashboardPermission {
    role: string;
    permissions: ('VIEW' | 'EDIT' | 'DELETE' | 'SHARE' | 'EXPORT')[];
}
export interface QualityCollaborationRequest {
    id: string;
    type: 'INSPECTION_REVIEW' | 'ROOT_CAUSE_ANALYSIS' | 'CORRECTIVE_ACTION_PLANNING' | 'EXPERT_CONSULTATION' | 'TRAINING_SESSION';
    title: string;
    description: string;
    requesterId: string;
    priority: Priority;
    dueDate: Date;
    requiredExpertise: string[];
    context: CollaborationContext;
    participants: CollaborationParticipant[];
    aiAssistants: string[];
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
    outcome?: CollaborationOutcome;
}
export interface CollaborationContext {
    relatedEntities: string[];
    background: string;
    objectives: string[];
    constraints: string[];
    resources: string[];
    timeline: CollaborationTimeline;
}
export interface CollaborationTimeline {
    phases: CollaborationPhase[];
    milestones: Milestone[];
    dependencies: Dependency[];
}
export interface CollaborationPhase {
    phaseId: string;
    name: string;
    description: string;
    startDate: Date;
    endDate: Date;
    deliverables: string[];
    responsible: string[];
}
export interface Milestone {
    milestoneId: string;
    name: string;
    description: string;
    targetDate: Date;
    actualDate?: Date;
    status: Status;
    criteria: string[];
}
export interface Dependency {
    dependencyId: string;
    type: 'FINISH_TO_START' | 'START_TO_START' | 'FINISH_TO_FINISH' | 'START_TO_FINISH';
    predecessor: string;
    successor: string;
    lag: number;
}
export interface CollaborationParticipant {
    participantId: string;
    role: 'REQUESTER' | 'EXPERT' | 'REVIEWER' | 'APPROVER' | 'OBSERVER';
    expertise: string[];
    availability: ParticipantAvailability;
    contributionLevel: 'PRIMARY' | 'SECONDARY' | 'SUPPORT';
    status: 'INVITED' | 'ACCEPTED' | 'DECLINED' | 'ACTIVE' | 'COMPLETED';
}
export interface ParticipantAvailability {
    timeSlots: TimeSlot[];
    maxHoursPerWeek: number;
    preferredInteractionMode: 'SYNCHRONOUS' | 'ASYNCHRONOUS' | 'HYBRID';
}
export interface TimeSlot {
    startTime: Date;
    endTime: Date;
    recurring: boolean;
    recurrencePattern?: string;
}
export interface CollaborationOutcome {
    achievements: string[];
    decisions: CollaborativeDecision[];
    actionItems: ActionItem[];
    lessonsLearned: string[];
    knowledgeArtifacts: KnowledgeArtifact[];
    satisfactionRating: number;
    effectiveness: number;
    recommendations: string[];
}
export interface KnowledgeArtifact {
    id: string;
    type: 'DOCUMENT' | 'TEMPLATE' | 'CHECKLIST' | 'BEST_PRACTICE' | 'PROCEDURE';
    title: string;
    description: string;
    content: string;
    tags: string[];
    applicableScenarios: string[];
    accessLevel: 'PUBLIC' | 'RESTRICTED' | 'CONFIDENTIAL';
    version: number;
    approvedBy: string;
}
export interface QualityAIModel extends BaseEntity {
    name: string;
    type: 'CLASSIFICATION' | 'REGRESSION' | 'ANOMALY_DETECTION' | 'PREDICTION' | 'OPTIMIZATION' | 'RECOMMENDATION';
    purpose: string;
    algorithm: string;
    version: string;
    trainingData: TrainingDataset[];
    performance: ModelPerformance;
    deployment: ModelDeployment;
    validation: ModelValidation;
    monitoring: ModelMonitoring;
    retrainingSchedule: RetrainingSchedule;
    humanOversight: HumanOversight;
}
export interface TrainingDataset {
    id: string;
    name: string;
    description: string;
    size: number;
    features: string[];
    labels?: string[];
    dataQuality: number;
    lastUpdated: Date;
    source: string;
}
export interface ModelPerformance {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
    auc?: number;
    rmse?: number;
    mae?: number;
    customMetrics: CustomMetric[];
    benchmarkComparison: BenchmarkResult[];
}
export interface CustomMetric {
    name: string;
    value: number;
    unit?: string;
    higherIsBetter: boolean;
}
export interface BenchmarkResult {
    benchmark: string;
    score: number;
    ranking?: number;
    date: Date;
}
export interface ModelDeployment {
    environment: 'DEVELOPMENT' | 'TESTING' | 'STAGING' | 'PRODUCTION';
    version: string;
    deploymentDate: Date;
    rollbackVersion?: string;
    infrastructure: DeploymentInfrastructure;
    scalability: ScalabilityConfig;
}
export interface DeploymentInfrastructure {
    platform: string;
    resources: ResourceRequirement[];
    endpoints: APIEndpoint[];
    securityConfig: SecurityConfiguration;
}
export interface ResourceRequirement {
    type: 'CPU' | 'MEMORY' | 'GPU' | 'STORAGE' | 'NETWORK';
    quantity: number;
    unit: string;
}
export interface APIEndpoint {
    url: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    authentication: 'API_KEY' | 'TOKEN' | 'OAUTH' | 'NONE';
    rateLimit: number;
}
export interface SecurityConfiguration {
    encryption: boolean;
    accessControl: AccessControlRule[];
    auditLogging: boolean;
    dataPrivacy: PrivacySettings;
}
export interface AccessControlRule {
    role: string;
    permissions: string[];
    restrictions: string[];
}
export interface PrivacySettings {
    dataAnonymization: boolean;
    dataRetention: number;
    consentRequired: boolean;
    dataLocalization: string[];
}
export interface ScalabilityConfig {
    autoScaling: boolean;
    minInstances: number;
    maxInstances: number;
    scalingMetrics: string[];
    scalingThresholds: ScalingThreshold[];
}
export interface ScalingThreshold {
    metric: string;
    threshold: number;
    action: 'SCALE_UP' | 'SCALE_DOWN';
}
export interface ModelValidation {
    validationMethod: 'CROSS_VALIDATION' | 'HOLDOUT' | 'TIME_SERIES_SPLIT' | 'STRATIFIED';
    validationResults: ValidationResult[];
    biasAssessment: BiasAssessment;
    explainabilityReport: ExplainabilityReport;
}
export interface ValidationResult {
    metric: string;
    value: number;
    confidenceInterval: {
        lower: number;
        upper: number;
    };
    pValue?: number;
}
export interface BiasAssessment {
    assessmentDate: Date;
    biasTypes: BiasType[];
    mitigationStrategies: string[];
    fairnessMetrics: FairnessMetric[];
}
export interface BiasType {
    type: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
    description: string;
    affectedGroups: string[];
}
export interface FairnessMetric {
    name: string;
    value: number;
    threshold: number;
    passed: boolean;
}
export interface ExplainabilityReport {
    method: 'LIME' | 'SHAP' | 'ANCHOR' | 'COUNTERFACTUAL' | 'ATTENTION';
    featureImportance: FeatureImportance[];
    sampleExplanations: SampleExplanation[];
    globalInsights: string[];
}
export interface FeatureImportance {
    feature: string;
    importance: number;
    stability: number;
    interpretation: string;
}
export interface SampleExplanation {
    sampleId: string;
    prediction: any;
    explanation: string;
    contributingFeatures: FeatureContribution[];
    confidence: number;
}
export interface FeatureContribution {
    feature: string;
    value: any;
    contribution: number;
    direction: 'POSITIVE' | 'NEGATIVE';
}
export interface ModelMonitoring {
    performanceMonitoring: PerformanceMonitoring;
    driftDetection: DriftDetection;
    anomalyDetection: ModelAnomalyDetection;
    alerting: ModelAlerting;
}
export interface PerformanceMonitoring {
    metrics: MonitoringMetric[];
    frequency: string;
    thresholds: MonitoringThreshold[];
    dashboardUrl: string;
}
export interface MonitoringMetric {
    name: string;
    currentValue: number;
    baseline: number;
    trend: 'IMPROVING' | 'DEGRADING' | 'STABLE';
    significance: number;
}
export interface MonitoringThreshold {
    metric: string;
    warningThreshold: number;
    criticalThreshold: number;
    operator: 'GREATER_THAN' | 'LESS_THAN';
}
export interface DriftDetection {
    method: 'KS_TEST' | 'PSI' | 'CHI_SQUARE' | 'WASSERSTEIN';
    features: string[];
    driftScore: number;
    significantDrifts: SignificantDrift[];
    lastDetectionDate: Date;
}
export interface SignificantDrift {
    feature: string;
    driftScore: number;
    pValue: number;
    actionRequired: boolean;
    suggestedActions: string[];
}
export interface ModelAnomalyDetection {
    method: string;
    anomalies: ModelAnomaly[];
    baselinePattern: string;
    sensitivityLevel: number;
}
export interface ModelAnomaly {
    timestamp: Date;
    metric: string;
    value: number;
    expectedValue: number;
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
    possibleCauses: string[];
}
export interface ModelAlerting {
    channels: string[];
    recipients: string[];
    escalationRules: ModelEscalationRule[];
    suppressionRules: SuppressionRule[];
}
export interface ModelEscalationRule {
    condition: string;
    delay: number;
    escalationLevel: number;
    recipients: string[];
}
export interface SuppressionRule {
    condition: string;
    duration: number;
    justification: string;
}
export interface RetrainingSchedule {
    frequency: string;
    triggerConditions: RetrainingTrigger[];
    automatedRetraining: boolean;
    humanApprovalRequired: boolean;
    validationRequired: boolean;
    rollbackStrategy: RollbackStrategy;
}
export interface RetrainingTrigger {
    type: 'PERFORMANCE_DEGRADATION' | 'DATA_DRIFT' | 'TIME_BASED' | 'DATA_VOLUME' | 'BUSINESS_REQUEST';
    condition: string;
    threshold: number;
    priority: Priority;
}
export interface RollbackStrategy {
    automaticRollback: boolean;
    rollbackConditions: string[];
    rollbackVersion: string;
    validationSteps: string[];
}
export interface HumanOversight {
    oversightLevel: 'MINIMAL' | 'MODERATE' | 'HIGH' | 'CRITICAL';
    humanInTheLoop: HumanInTheLoopConfig;
    reviewSchedule: ReviewSchedule;
    auditTrail: AuditEntry[];
}
export interface HumanInTheLoopConfig {
    required: boolean;
    scenarios: HITLScenario[];
    reviewers: string[];
    responseTimeLimit: number;
}
export interface HITLScenario {
    condition: string;
    action: 'REQUIRE_REVIEW' | 'FLAG_FOR_REVIEW' | 'AUTO_ESCALATE' | 'BLOCK_PREDICTION';
    urgency: Priority;
}
export interface ReviewSchedule {
    frequency: string;
    reviewType: 'PERFORMANCE' | 'BIAS' | 'EXPLAINABILITY' | 'COMPLIANCE' | 'COMPREHENSIVE';
    reviewers: string[];
    deliverables: string[];
}
export interface AuditEntry {
    timestamp: Date;
    action: string;
    performer: string;
    details: Record<string, any>;
    impact: 'LOW' | 'MEDIUM' | 'HIGH';
}
//# sourceMappingURL=quality-management.d.ts.map