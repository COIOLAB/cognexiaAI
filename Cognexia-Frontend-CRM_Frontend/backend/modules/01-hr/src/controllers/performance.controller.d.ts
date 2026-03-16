import { Request, Response } from 'express';
export declare class PerformanceController {
    private performanceService;
    constructor();
    createReview: (req: Request, res: Response) => Promise<void>;
    getReview: (req: Request, res: Response) => Promise<void>;
    updateReview: (req: Request, res: Response) => Promise<void>;
    listReviews: (req: Request, res: Response) => Promise<void>;
    submitReview: (req: Request, res: Response) => Promise<void>;
    approveReview: (req: Request, res: Response) => Promise<void>;
    createGoal: (req: Request, res: Response) => Promise<void>;
    getGoal: (req: Request, res: Response) => Promise<void>;
    updateGoal: (req: Request, res: Response) => Promise<void>;
    listGoals: (req: Request, res: Response) => Promise<void>;
    updateGoalProgress: (req: Request, res: Response) => Promise<void>;
    getCompetencyFrameworks: (req: Request, res: Response) => Promise<void>;
    createCompetencyFramework: (req: Request, res: Response) => Promise<void>;
    getPerformanceAnalytics: (req: Request, res: Response) => Promise<void>;
    getTeamPerformanceMetrics: (req: Request, res: Response) => Promise<void>;
}
//# sourceMappingURL=performance.controller.d.ts.map