import { Request, Response } from 'express';
export declare class LearningDevelopmentController {
    private learningDevelopmentService;
    constructor();
    /**
     * Create training course
     * POST /api/v1/hr/learning/courses
     */
    createCourse: (req: Request, res: Response) => Promise<void>;
    /**
     * Get training courses
     * GET /api/v1/hr/learning/courses
     */
    getCourses: (req: Request, res: Response) => Promise<void>;
    /**
     * Get course by ID
     * GET /api/v1/hr/learning/courses/:id
     */
    getCourse: (req: Request, res: Response) => Promise<void>;
    /**
     * Update course
     * PUT /api/v1/hr/learning/courses/:id
     */
    updateCourse: (req: Request, res: Response) => Promise<void>;
    /**
     * Delete course
     * DELETE /api/v1/hr/learning/courses/:id
     */
    deleteCourse: (req: Request, res: Response) => Promise<void>;
    /**
     * Enroll employee in course
     * POST /api/v1/hr/learning/enrollments
     */
    enrollInCourse: (req: Request, res: Response) => Promise<void>;
    /**
     * Get course enrollments
     * GET /api/v1/hr/learning/enrollments
     */
    getCourseEnrollments: (req: Request, res: Response) => Promise<void>;
    /**
     * Get employee enrollments
     * GET /api/v1/hr/learning/employees/:employeeId/enrollments
     */
    getEmployeeEnrollments: (req: Request, res: Response) => Promise<void>;
    /**
     * Update enrollment progress
     * PUT /api/v1/hr/learning/enrollments/:id/progress
     */
    updateEnrollmentProgress: (req: Request, res: Response) => Promise<void>;
    /**
     * Complete course enrollment
     * POST /api/v1/hr/learning/enrollments/:id/complete
     */
    completeEnrollment: (req: Request, res: Response) => Promise<void>;
    /**
     * Create learning path
     * POST /api/v1/hr/learning/learning-paths
     */
    createLearningPath: (req: Request, res: Response) => Promise<void>;
    /**
     * Get learning paths
     * GET /api/v1/hr/learning/learning-paths
     */
    getLearningPaths: (req: Request, res: Response) => Promise<void>;
    /**
     * Enroll in learning path
     * POST /api/v1/hr/learning/learning-paths/:id/enroll
     */
    enrollInLearningPath: (req: Request, res: Response) => Promise<void>;
    /**
     * Skill gap analysis
     * POST /api/v1/hr/learning/skill-gap-analysis
     */
    performSkillGapAnalysis: (req: Request, res: Response) => Promise<void>;
    /**
     * Get employee skill matrix
     * GET /api/v1/hr/learning/employees/:employeeId/skills
     */
    getEmployeeSkillMatrix: (req: Request, res: Response) => Promise<void>;
    /**
     * Update employee skill assessment
     * PUT /api/v1/hr/learning/employees/:employeeId/skills/:skillId
     */
    updateEmployeeSkillAssessment: (req: Request, res: Response) => Promise<void>;
    /**
     * Create certification
     * POST /api/v1/hr/learning/certifications
     */
    createCertification: (req: Request, res: Response) => Promise<void>;
    /**
     * Get certifications
     * GET /api/v1/hr/learning/certifications
     */
    getCertifications: (req: Request, res: Response) => Promise<void>;
    /**
     * Award certification to employee
     * POST /api/v1/hr/learning/certifications/:id/award
     */
    awardCertification: (req: Request, res: Response) => Promise<void>;
    /**
     * Get employee certifications
     * GET /api/v1/hr/learning/employees/:employeeId/certifications
     */
    getEmployeeCertifications: (req: Request, res: Response) => Promise<void>;
    /**
     * Get personalized learning recommendations
     * GET /api/v1/hr/learning/employees/:employeeId/recommendations
     */
    getPersonalizedLearningRecommendations: (req: Request, res: Response) => Promise<void>;
    /**
     * Create learning goal
     * POST /api/v1/hr/learning/goals
     */
    createLearningGoal: (req: Request, res: Response) => Promise<void>;
    /**
     * Get learning goals
     * GET /api/v1/hr/learning/goals
     */
    getLearningGoals: (req: Request, res: Response) => Promise<void>;
    /**
     * Update learning goal progress
     * PUT /api/v1/hr/learning/goals/:id/progress
     */
    updateLearningGoalProgress: (req: Request, res: Response) => Promise<void>;
    /**
     * Generate learning analytics
     * GET /api/v1/hr/learning/analytics
     */
    getLearningAnalytics: (req: Request, res: Response) => Promise<void>;
    /**
     * Get learning effectiveness metrics
     * GET /api/v1/hr/learning/effectiveness-metrics
     */
    getLearningEffectivenessMetrics: (req: Request, res: Response) => Promise<void>;
    /**
     * Generate ROI analysis for training
     * GET /api/v1/hr/learning/roi-analysis
     */
    getTrainingROIAnalysis: (req: Request, res: Response) => Promise<void>;
    /**
     * AI-powered learning content recommendations
     * GET /api/v1/hr/learning/ai/content-recommendations
     */
    getAIContentRecommendations: (req: Request, res: Response) => Promise<void>;
    /**
     * Predictive learning analytics
     * GET /api/v1/hr/learning/ai/predictive-analytics
     */
    getPredictiveLearningAnalytics: (req: Request, res: Response) => Promise<void>;
    /**
     * Learning path optimization
     * POST /api/v1/hr/learning/ai/optimize-learning-path
     */
    optimizeLearningPath: (req: Request, res: Response) => Promise<void>;
    /**
     * Generate learning reports
     * GET /api/v1/hr/learning/reports/:reportType
     */
    generateLearningReport: (req: Request, res: Response) => Promise<void>;
    /**
     * Import learning data
     * POST /api/v1/hr/learning/import
     */
    importLearningData: (req: Request, res: Response) => Promise<void>;
    /**
     * Export learning data
     * GET /api/v1/hr/learning/export
     */
    exportLearningData: (req: Request, res: Response) => Promise<void>;
    /**
     * Health Check
     */
    healthCheck: (req: Request, res: Response) => Promise<void>;
}
//# sourceMappingURL=learning-development.controller.d.ts.map