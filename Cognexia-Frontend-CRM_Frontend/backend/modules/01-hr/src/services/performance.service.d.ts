import { UUID } from 'crypto';
import { PerformanceReview, PerformanceGoal, CompetencyFramework, ReviewType, GoalStatus, CreatePerformanceReviewRequest, CreatePerformanceGoalRequest, PaginationOptions, PaginatedResponse, FilterOptions } from '../types';
export interface PerformanceService {
    createReview(organizationId: UUID, data: CreatePerformanceReviewRequest): Promise<PerformanceReview>;
    getReviewById(id: UUID): Promise<PerformanceReview | null>;
    updateReview(id: UUID, data: Partial<PerformanceReview>): Promise<PerformanceReview>;
    listReviews(organizationId: UUID, options: PaginationOptions & FilterOptions): Promise<PaginatedResponse<PerformanceReview>>;
    submitReview(id: UUID, reviewData: Partial<PerformanceReview>): Promise<PerformanceReview>;
    createGoal(organizationId: UUID, data: CreatePerformanceGoalRequest): Promise<PerformanceGoal>;
    getGoalById(id: UUID): Promise<PerformanceGoal | null>;
    updateGoal(id: UUID, data: Partial<PerformanceGoal>): Promise<PerformanceGoal>;
    listGoals(organizationId: UUID, options: PaginationOptions & FilterOptions): Promise<PaginatedResponse<PerformanceGoal>>;
    updateGoalProgress(id: UUID, progress: number, notes?: string): Promise<PerformanceGoal>;
    getCompetencyFramework(organizationId: UUID): Promise<CompetencyFramework[]>;
    createCompetencyFramework(organizationId: UUID, data: Partial<CompetencyFramework>): Promise<CompetencyFramework>;
    getPerformanceAnalytics(organizationId: UUID, employeeId?: UUID): Promise<any>;
    getTeamPerformanceMetrics(managerId: UUID): Promise<any>;
}
export declare class PerformanceServiceImpl implements PerformanceService {
    private performanceModel;
    constructor();
    /**
     * Creates a new performance review
     */
    createReview(organizationId: UUID, data: CreatePerformanceReviewRequest): Promise<PerformanceReview>;
    /**
     * Gets a performance review by ID
     */
    getReviewById(id: UUID): Promise<PerformanceReview | null>;
    /**
     * Updates a performance review
     */
    updateReview(id: UUID, data: Partial<PerformanceReview>): Promise<PerformanceReview>;
    /**
     * Lists performance reviews with pagination and filtering
     */
    listReviews(organizationId: UUID, options: PaginationOptions & FilterOptions): Promise<PaginatedResponse<PerformanceReview>>;
    /**
     * Submits a performance review for approval
     */
    submitReview(id: UUID, reviewData: Partial<PerformanceReview>): Promise<PerformanceReview>;
    /**
     * Creates a new performance goal
     */
    createGoal(organizationId: UUID, data: CreatePerformanceGoalRequest): Promise<PerformanceGoal>;
    /**
     * Gets a performance goal by ID
     */
    getGoalById(id: UUID): Promise<PerformanceGoal | null>;
    /**
     * Updates a performance goal
     */
    updateGoal(id: UUID, data: Partial<PerformanceGoal>): Promise<PerformanceGoal>;
    /**
     * Lists performance goals with pagination and filtering
     */
    listGoals(organizationId: UUID, options: PaginationOptions & FilterOptions): Promise<PaginatedResponse<PerformanceGoal>>;
    /**
     * Updates goal progress
     */
    updateGoalProgress(id: UUID, progress: number, notes?: string): Promise<PerformanceGoal>;
    /**
     * Gets competency framework for organization
     */
    getCompetencyFramework(organizationId: UUID): Promise<CompetencyFramework[]>;
    /**
     * Creates a competency framework
     */
    createCompetencyFramework(organizationId: UUID, data: Partial<CompetencyFramework>): Promise<CompetencyFramework>;
    /**
     * Gets performance analytics
     */
    getPerformanceAnalytics(organizationId: UUID, employeeId?: UUID): Promise<any>;
    /**
     * Gets team performance metrics for a manager
     */
    getTeamPerformanceMetrics(managerId: UUID): Promise<any>;
    /**
     * Private helper methods
     */
    private validateReviewData;
    private validateGoalData;
    private isValidStatusTransition;
    private calculateOverallRating;
}
export interface CreatePerformanceReviewRequest {
    employeeId: UUID;
    reviewerId: UUID;
    reviewType: ReviewType;
    reviewPeriod: {
        startDate: Date;
        endDate: Date;
        name: string;
    };
    competencyFrameworkId?: UUID;
    goals?: UUID[];
}
export interface CreatePerformanceGoalRequest {
    employeeId: UUID;
    title: string;
    description: string;
    category: string;
    targetDate: Date;
    targetValue?: number;
    targetUnit?: string;
    weight: number;
    reviewId?: UUID;
}
export interface PerformanceGoal {
    id: UUID;
    organizationId: UUID;
    employeeId: UUID;
    reviewId?: UUID;
    title: string;
    description: string;
    category: string;
    targetDate: Date;
    targetValue?: number;
    currentValue?: number;
    targetUnit?: string;
    weight: number;
    progress: number;
    status: GoalStatus;
    progressNotes?: string;
    lastUpdated?: Date;
    tags?: string[];
    metadata?: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}
export interface CompetencyFramework {
    id: UUID;
    organizationId: UUID;
    name: string;
    description?: string;
    competencies: Competency[];
    isActive: boolean;
    version: string;
    tags?: string[];
    metadata?: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}
export interface Competency {
    id: UUID;
    name: string;
    description: string;
    category: string;
    weight: number;
    behaviorIndicators: string[];
    proficiencyLevels: ProficiencyLevel[];
}
export interface ProficiencyLevel {
    level: number;
    name: string;
    description: string;
    behaviorExamples: string[];
}
export declare enum GoalStatus {
    NOT_STARTED = "not_started",
    IN_PROGRESS = "in_progress",
    COMPLETED = "completed",
    CANCELLED = "cancelled",
    OVERDUE = "overdue"
}
//# sourceMappingURL=performance.service.d.ts.map