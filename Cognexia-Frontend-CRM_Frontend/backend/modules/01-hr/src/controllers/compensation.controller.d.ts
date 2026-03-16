import { Request, Response } from 'express';
export declare class CompensationController {
    private compensationService;
    constructor();
    createCompensationPlan: (req: Request, res: Response) => Promise<void>;
    getCompensationPlan: (req: Request, res: Response) => Promise<void>;
    updateCompensationPlan: (req: Request, res: Response) => Promise<void>;
    listCompensationPlans: (req: Request, res: Response) => Promise<void>;
    deactivateCompensationPlan: (req: Request, res: Response) => Promise<void>;
    createSalaryStructure: (req: Request, res: Response) => Promise<void>;
    getSalaryStructure: (req: Request, res: Response) => Promise<void>;
    updateSalaryStructure: (req: Request, res: Response) => Promise<void>;
    listSalaryStructures: (req: Request, res: Response) => Promise<void>;
    createBenefitsPlan: (req: Request, res: Response) => Promise<void>;
    getBenefitsPlan: (req: Request, res: Response) => Promise<void>;
    updateBenefitsPlan: (req: Request, res: Response) => Promise<void>;
    listBenefitsPlans: (req: Request, res: Response) => Promise<void>;
    createBenefitsEnrollment: (req: Request, res: Response) => Promise<void>;
    updateBenefitsEnrollment: (req: Request, res: Response) => Promise<void>;
    listBenefitsEnrollments: (req: Request, res: Response) => Promise<void>;
    getEmployeeBenefits: (req: Request, res: Response) => Promise<void>;
    getCompensationAnalytics: (req: Request, res: Response) => Promise<void>;
    getBenefitsUtilization: (req: Request, res: Response) => Promise<void>;
    getCompensationBenchmark: (req: Request, res: Response) => Promise<void>;
}
//# sourceMappingURL=compensation.controller.d.ts.map