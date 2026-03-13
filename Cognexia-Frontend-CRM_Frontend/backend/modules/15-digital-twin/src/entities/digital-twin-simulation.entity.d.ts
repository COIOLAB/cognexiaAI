import { DigitalTwin } from './digital-twin.entity';
export declare enum SimulationType {
    PREDICTIVE_MAINTENANCE = "predictive_maintenance",
    PROCESS_OPTIMIZATION = "process_optimization",
    WHAT_IF_ANALYSIS = "what_if_analysis",
    FAILURE_ANALYSIS = "failure_analysis",
    CAPACITY_PLANNING = "capacity_planning",
    ENERGY_OPTIMIZATION = "energy_optimization",
    QUALITY_PREDICTION = "quality_prediction",
    SUPPLY_CHAIN = "supply_chain",
    SAFETY_ANALYSIS = "safety_analysis",
    STRESS_TESTING = "stress_testing",
    PRODUCTION_SCHEDULING = "production_scheduling",
    RISK_ASSESSMENT = "risk_assessment"
}
export declare enum SimulationStatus {
    QUEUED = "queued",
    RUNNING = "running",
    COMPLETED = "completed",
    FAILED = "failed",
    CANCELLED = "cancelled",
    PAUSED = "paused"
}
export declare enum SimulationPriority {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    URGENT = "urgent"
}
export declare enum ComputeType {
    CLASSICAL = "classical",
    QUANTUM = "quantum",
    HYBRID = "hybrid",
    GPU_ACCELERATED = "gpu_accelerated",
    DISTRIBUTED = "distributed",
    EDGE_COMPUTING = "edge_computing"
}
export declare class DigitalTwinSimulation {
    id: string;
    name: string;
    description?: string;
    simulationType: SimulationType;
    status: SimulationStatus;
    priority: SimulationPriority;
    computeType: ComputeType;
    twinId: string;
    digitalTwin: DigitalTwin;
    configuration: {
        timeHorizon: number;
        timeStep: number;
        accuracy: 'low' | 'medium' | 'high' | 'ultra';
        modelComplexity: 'simple' | 'moderate' | 'complex' | 'ultra_complex';
        enableUncertainty: boolean;
        monteCarloRuns?: number;
        confidenceLevel?: number;
        parallelization: boolean;
        realTimeData: boolean;
        historicalDataRange?: {
            start: string;
            end: string;
        };
        variables: Array<{
            name: string;
            type: 'input' | 'output' | 'state';
            range?: {
                min: number;
                max: number;
            };
            distribution?: string;
            constraints?: Record<string, any>;
        }>;
        objectives: Array<{
            name: string;
            type: 'minimize' | 'maximize' | 'target';
            weight: number;
            target?: number;
            tolerance?: number;
        }>;
        constraints: Array<{
            name: string;
            expression: string;
            type: 'equality' | 'inequality';
            bounds?: {
                lower?: number;
                upper?: number;
            };
        }>;
    };
    scenario: {
        name: string;
        baseline: Record<string, any>;
        variations: Array<{
            name: string;
            description: string;
            parameters: Record<string, any>;
            probability?: number;
        }>;
        externalFactors: Array<{
            factor: string;
            impact: 'low' | 'medium' | 'high';
            variability: number;
            correlation?: Record<string, number>;
        }>;
        businessRules: Array<{
            rule: string;
            condition: string;
            action: string;
            priority: number;
        }>;
        kpis: Array<{
            name: string;
            formula: string;
            target: number;
            threshold: {
                warning: number;
                critical: number;
            };
        }>;
    };
    execution?: {
        startedAt?: string;
        completedAt?: string;
        duration?: number;
        progress: number;
        currentPhase?: string;
        estimatedTimeRemaining?: number;
        resourceUtilization: {
            cpu?: number;
            memory?: number;
            gpu?: number;
            disk?: number;
            network?: number;
        };
        computeResources: {
            nodes?: number;
            cores?: number;
            qubits?: number;
            gpuCards?: number;
            memoryGB?: number;
        };
        errors?: Array<{
            timestamp: string;
            severity: 'warning' | 'error' | 'critical';
            code: string;
            message: string;
            context?: Record<string, any>;
        }>;
        warnings?: Array<{
            timestamp: string;
            type: string;
            message: string;
        }>;
    };
    results?: {
        summary: {
            objectiveValues: Record<string, number>;
            keyMetrics: Record<string, any>;
            convergenceStatus: 'converged' | 'not_converged' | 'partially_converged';
            accuracyAchieved: number;
            qualityScore: number;
        };
        timeSeries?: Array<{
            timestamp: string;
            values: Record<string, number>;
        }>;
        optimization?: {
            optimalParameters: Record<string, any>;
            improvementPercent: number;
            sensitivityAnalysis: Record<string, number>;
            robustness: number;
        };
        predictions?: Array<{
            variable: string;
            forecast: Array<{
                time: string;
                value: number;
                confidence?: number;
                upperBound?: number;
                lowerBound?: number;
            }>;
            accuracy: number;
        }>;
        anomalies?: Array<{
            timestamp: string;
            variable: string;
            severity: 'low' | 'medium' | 'high' | 'critical';
            description: string;
            likelihood: number;
            impact: number;
        }>;
        recommendations?: Array<{
            type: string;
            description: string;
            priority: 'low' | 'medium' | 'high';
            impact: number;
            effort: number;
            roi: number;
            implementationSteps: string[];
        }>;
        riskAssessment?: {
            overallRisk: 'low' | 'medium' | 'high' | 'critical';
            riskFactors: Array<{
                factor: string;
                probability: number;
                impact: number;
                riskLevel: string;
                mitigation: string;
            }>;
            probabilityDistribution: Record<string, number>;
        };
        comparisons?: Array<{
            scenario: string;
            metrics: Record<string, number>;
            improvements: Record<string, number>;
            tradeoffs: Record<string, any>;
        }>;
    };
    modelInfo: {
        type: string;
        version: string;
        framework: string;
        algorithms: string[];
        complexity: number;
        validationStatus: 'validated' | 'pending' | 'failed';
        calibrationDate?: string;
        accuracy?: number;
        confidence?: number;
        limitations: string[];
        assumptions: string[];
        dataRequirements: Array<{
            dataset: string;
            required: boolean;
            frequency: string;
            quality: 'low' | 'medium' | 'high';
        }>;
        performance: {
            computationTime?: number;
            memoryUsage?: number;
            scalability?: 'low' | 'medium' | 'high';
            reliability?: number;
        };
    };
    quantumInfo?: {
        processor: string;
        qubits: number;
        gateCount: number;
        circuitDepth: number;
        errorRate: number;
        coherenceTime: number;
        algorithms: string[];
        entanglementMeasure?: number;
        quantumAdvantage?: boolean;
        classicalComparison?: {
            speedup: number;
            accuracyImprovement: number;
            memoryReduction: number;
        };
    };
    validation?: {
        dataQuality: {
            completeness: number;
            accuracy: number;
            consistency: number;
            timeliness: number;
        };
        modelValidation: {
            statisticalTests: Record<string, any>;
            crossValidation: number;
            holdoutValidation: number;
            residualAnalysis: Record<string, any>;
        };
        resultValidation: {
            sanityChecks: boolean;
            boundaryConditions: boolean;
            physicalConstraints: boolean;
            businessLogic: boolean;
        };
        uncertainty: {
            parameterUncertainty: Record<string, number>;
            modelUncertainty: number;
            dataUncertainty: number;
            propagatedUncertainty: Record<string, number>;
        };
    };
    costInfo?: {
        estimatedCost: number;
        actualCost?: number;
        currency: string;
        breakdown: {
            compute?: number;
            storage?: number;
            network?: number;
            licensing?: number;
            personnel?: number;
        };
        resourceHours: {
            cpuHours?: number;
            gpuHours?: number;
            quantumHours?: number;
            storageGB?: number;
        };
        costEfficiency: {
            costPerResult: number;
            costPerAccuracy: number;
            resourceUtilizationRate: number;
        };
    };
    tags: string[];
    metadata?: Record<string, any>;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
    isCompleted(): boolean;
    isRunning(): boolean;
    isFailed(): boolean;
    getProgress(): number;
    getDuration(): number;
    getEstimatedTimeRemaining(): number;
    hasQuantumAdvantage(): boolean;
    getAccuracy(): number;
    getQualityScore(): number;
    getCriticalAnomalies(): any[];
    getHighPriorityRecommendations(): any[];
    getROI(): number;
    getRiskLevel(): string;
    getConvergenceStatus(): string;
    updateProgress(progress: number, phase?: string): void;
    addError(severity: 'warning' | 'error' | 'critical', code: string, message: string, context?: Record<string, any>): void;
    addRecommendation(type: string, description: string, priority: 'low' | 'medium' | 'high', impact: number, effort: number, roi: number, steps: string[]): void;
    calculateCostEfficiency(): Record<string, number>;
    getExecutionSummary(): Record<string, any>;
    isHighPriority(): boolean;
    requiresAttention(): boolean;
    getSimulationTypeCategory(): string;
}
//# sourceMappingURL=digital-twin-simulation.entity.d.ts.map