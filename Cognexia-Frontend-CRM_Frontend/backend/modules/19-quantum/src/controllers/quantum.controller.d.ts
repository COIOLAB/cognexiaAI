export declare class QuantumController {
    private readonly logger;
    constructor();
    getQuantumProcessors(): Promise<{
        success: boolean;
        data: {
            processors: {
                id: string;
                name: string;
                type: string;
                qubits: number;
                coherenceTime: number;
                gateTime: number;
                fidelity: number;
                status: string;
                temperature: number;
                availability: number;
                quantumVolume: number;
                location: string;
                lastCalibration: string;
                nextMaintenance: string;
                currentJobs: number;
                queuedJobs: number;
                completedJobs: number;
                totalOperationTime: number;
            }[];
            summary: {
                totalProcessors: number;
                operationalProcessors: number;
                totalQubits: number;
                avgFidelity: number;
                totalJobs: number;
                avgWaitTime: number;
            };
        };
        message: string;
    }>;
    getQuantumOptimizationJobs(status?: string, algorithm?: string): Promise<{
        success: boolean;
        data: {
            jobs: ({
                id: string;
                jobId: string;
                name: string;
                algorithm: string;
                status: string;
                priority: string;
                processorId: string;
                processorName: string;
                submissionTime: string;
                startTime: string;
                completionTime: string;
                executionTime: number;
                qubitsUsed: number;
                circuitDepth: number;
                iterations: number;
                parameters: {
                    workCenters: number;
                    jobs: number;
                    constraints: number;
                    optimizationTarget: string;
                    routes?: undefined;
                    nodes?: undefined;
                    vehicles?: undefined;
                    qualityParameters?: undefined;
                    tolerances?: undefined;
                    processes?: undefined;
                };
                results: {
                    optimalSolution: {
                        makespan: number;
                        utilization: number;
                        improvement: number;
                    };
                    classicalComparison: {
                        classicalMakespan: number;
                        quantumAdvantage: number;
                    };
                    confidence: number;
                    convergence: boolean;
                };
                cost: number;
                energyConsumption: number;
                estimatedCompletion?: undefined;
                currentIteration?: undefined;
                estimatedCost?: undefined;
                progress?: undefined;
                estimatedStartTime?: undefined;
                estimatedExecutionTime?: undefined;
                qubitsRequired?: undefined;
                queuePosition?: undefined;
            } | {
                id: string;
                jobId: string;
                name: string;
                algorithm: string;
                status: string;
                priority: string;
                processorId: string;
                processorName: string;
                submissionTime: string;
                startTime: string;
                estimatedCompletion: string;
                executionTime: null;
                qubitsUsed: number;
                circuitDepth: number;
                iterations: number;
                currentIteration: number;
                parameters: {
                    routes: number;
                    nodes: number;
                    vehicles: number;
                    constraints: number;
                    optimizationTarget: string;
                    workCenters?: undefined;
                    jobs?: undefined;
                    qualityParameters?: undefined;
                    tolerances?: undefined;
                    processes?: undefined;
                };
                estimatedCost: number;
                progress: number;
                completionTime?: undefined;
                results?: undefined;
                cost?: undefined;
                energyConsumption?: undefined;
                estimatedStartTime?: undefined;
                estimatedExecutionTime?: undefined;
                qubitsRequired?: undefined;
                queuePosition?: undefined;
            } | {
                id: string;
                jobId: string;
                name: string;
                algorithm: string;
                status: string;
                priority: string;
                processorId: string;
                processorName: string;
                submissionTime: string;
                estimatedStartTime: string;
                estimatedExecutionTime: number;
                qubitsRequired: number;
                parameters: {
                    qualityParameters: number;
                    tolerances: number;
                    processes: number;
                    optimizationTarget: string;
                    workCenters?: undefined;
                    jobs?: undefined;
                    constraints?: undefined;
                    routes?: undefined;
                    nodes?: undefined;
                    vehicles?: undefined;
                };
                estimatedCost: number;
                queuePosition: number;
                startTime?: undefined;
                completionTime?: undefined;
                executionTime?: undefined;
                qubitsUsed?: undefined;
                circuitDepth?: undefined;
                iterations?: undefined;
                results?: undefined;
                cost?: undefined;
                energyConsumption?: undefined;
                estimatedCompletion?: undefined;
                currentIteration?: undefined;
                progress?: undefined;
            })[];
            summary: {
                totalJobs: number;
                completed: number;
                running: number;
                queued: number;
                failed: number;
                avgExecutionTime: number;
                totalQuantumAdvantage: number;
                totalCostSavings: number;
            };
        };
        message: string;
    }>;
    submitQuantumOptimization(optimizationRequest: any): Promise<{
        success: boolean;
        data: {
            jobId: string;
            submissionTime: Date;
            estimatedStartTime: Date;
            estimatedExecutionTime: number;
            queuePosition: number;
            processorAssigned: string;
            estimatedCost: number;
            status: string;
        };
        message: string;
    }>;
    getQuantumSensors(sensorType?: string, workCenterId?: string): Promise<{
        success: boolean;
        data: {
            sensors: ({
                id: string;
                sensorId: string;
                name: string;
                type: string;
                technology: string;
                workCenterId: string;
                workCenterName: string;
                location: {
                    x: number;
                    y: number;
                    z: number;
                };
                status: string;
                sensitivity: number;
                resolution: number;
                bandwidth: number;
                temperature: number;
                coherenceTime: number;
                lastCalibration: string;
                currentReading: {
                    magneticField: number;
                    fieldGradient: number;
                    noise: number;
                    snr: number;
                    timestamp: Date;
                    gravity?: undefined;
                    gradient?: undefined;
                    drift?: undefined;
                    uncertainty?: undefined;
                    frequency?: undefined;
                    fractionalFrequency?: undefined;
                    allanDeviation?: undefined;
                    uptime?: undefined;
                };
                applications: string[];
                specifications: {
                    range: string;
                    accuracy: string;
                    stability: string;
                    operatingTemp: string;
                    repeatability?: undefined;
                    drift?: undefined;
                    availability?: undefined;
                    warmupTime?: undefined;
                };
                measurementTime?: undefined;
                stability?: undefined;
                accuracy?: undefined;
                atom?: undefined;
                laserFrequency?: undefined;
            } | {
                id: string;
                sensorId: string;
                name: string;
                type: string;
                technology: string;
                workCenterId: string;
                workCenterName: string;
                location: {
                    x: number;
                    y: number;
                    z: number;
                };
                status: string;
                sensitivity: number;
                resolution: number;
                measurementTime: number;
                temperature: number;
                lastCalibration: string;
                currentReading: {
                    gravity: number;
                    gradient: number;
                    drift: number;
                    uncertainty: number;
                    timestamp: Date;
                    magneticField?: undefined;
                    fieldGradient?: undefined;
                    noise?: undefined;
                    snr?: undefined;
                    frequency?: undefined;
                    fractionalFrequency?: undefined;
                    allanDeviation?: undefined;
                    uptime?: undefined;
                };
                applications: string[];
                specifications: {
                    range: string;
                    accuracy: string;
                    repeatability: string;
                    drift: string;
                    stability?: undefined;
                    operatingTemp?: undefined;
                    availability?: undefined;
                    warmupTime?: undefined;
                };
                bandwidth?: undefined;
                coherenceTime?: undefined;
                stability?: undefined;
                accuracy?: undefined;
                atom?: undefined;
                laserFrequency?: undefined;
            } | {
                id: string;
                sensorId: string;
                name: string;
                type: string;
                technology: string;
                workCenterId: string;
                workCenterName: string;
                location: {
                    x: number;
                    y: number;
                    z: number;
                };
                status: string;
                stability: number;
                accuracy: number;
                atom: string;
                laserFrequency: number;
                temperature: number;
                lastCalibration: string;
                currentReading: {
                    frequency: number;
                    fractionalFrequency: number;
                    allanDeviation: number;
                    uptime: number;
                    timestamp: Date;
                    magneticField?: undefined;
                    fieldGradient?: undefined;
                    noise?: undefined;
                    snr?: undefined;
                    gravity?: undefined;
                    gradient?: undefined;
                    drift?: undefined;
                    uncertainty?: undefined;
                };
                applications: string[];
                specifications: {
                    stability: string;
                    accuracy: string;
                    availability: string;
                    warmupTime: string;
                    range?: undefined;
                    operatingTemp?: undefined;
                    repeatability?: undefined;
                    drift?: undefined;
                };
                sensitivity?: undefined;
                resolution?: undefined;
                bandwidth?: undefined;
                coherenceTime?: undefined;
                measurementTime?: undefined;
            })[];
            summary: {
                totalSensors: number;
                operationalSensors: number;
                calibrationDue: number;
                avgPrecision: number;
                dataPoints: number;
                measurementAccuracy: number;
            };
        };
        message: string;
    }>;
    getQuantumSecurity(): Promise<{
        success: boolean;
        data: {
            quantumKeyDistribution: {
                systems: {
                    id: string;
                    name: string;
                    status: string;
                    protocol: string;
                    keyRate: number;
                    quantumBitErrorRate: number;
                    distance: number;
                    security: string;
                    uptime: number;
                    keysGenerated: number;
                    lastKeyExchange: Date;
                    endpoints: {
                        location: string;
                        status: string;
                    }[];
                }[];
                totalKeyRate: number;
                avgQBER: number;
                totalKeys: number;
                securityLevel: string;
            };
            quantumRandomNumberGeneration: {
                generators: {
                    id: string;
                    name: string;
                    technology: string;
                    status: string;
                    bitRate: number;
                    entropy: number;
                    randomnessTests: {
                        frequency: string;
                        blockFrequency: string;
                        runs: string;
                        longestRun: string;
                        matrix: string;
                        spectral: string;
                        template: string;
                        universal: string;
                        approximate: string;
                        random: string;
                        serial: string;
                        linearComplexity: string;
                    };
                    bitsGenerated: number;
                    lastTest: string;
                }[];
                totalBitRate: number;
                qualityScore: number;
                applicationsCovered: string[];
            };
            postQuantumCryptography: {
                algorithms: {
                    name: string;
                    type: string;
                    status: string;
                    keySize: number;
                    securityLevel: number;
                    performance: string;
                    usage: string;
                }[];
                migrationStatus: string;
                systemsCovered: number;
                quantumReadiness: string;
            };
            threats: {
                quantumComputerThreat: string;
                estimatedTimeToQuantumSupremacy: string;
                vulnerableAlgorithms: string[];
                protectedSystems: number;
                unprotectedSystems: number;
            };
        };
        message: string;
    }>;
    getQuantumAnalytics(): Promise<{
        success: boolean;
        data: {
            overview: {
                quantumProcessors: number;
                quantumSensors: number;
                quantumOptimizationJobs: number;
                quantumSecuritySystems: number;
                totalQuantumAdvantage: number;
                quantumReadiness: number;
                totalInvestment: number;
                roiFromQuantum: number;
            };
            performance: {
                processorUtilization: number;
                avgFidelity: number;
                avgCoherenceTime: number;
                optimizationSuccess: number;
                sensorAccuracy: number;
                securityCoverage: number;
            };
            applications: {
                manufacturing: {
                    optimizationProblems: number;
                    avgImprovement: number;
                    costSavings: number;
                    applications: string[];
                };
                sensing: {
                    measurements: number;
                    precision: number;
                    applications: string[];
                };
                security: {
                    keysGenerated: number;
                    securityLevel: string;
                    systemsProtected: number;
                    threats: string;
                };
            };
            trends: {
                labels: string[];
                processorUsage: number[];
                optimizationJobs: number[];
                sensorReadings: number[];
                securityKeys: number[];
            };
            researchAreas: {
                area: string;
                progress: number;
                applications: string;
                nextMilestone: string;
            }[];
            futureCapabilities: {
                quantumSupremacy: string;
                faultTolerance: string;
                scalability: string;
                errorCorrection: string;
            };
        };
        message: string;
    }>;
}
//# sourceMappingURL=quantum.controller.d.ts.map