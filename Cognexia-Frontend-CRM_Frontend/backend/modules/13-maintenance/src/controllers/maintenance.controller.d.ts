export declare class MaintenanceController {
    private readonly logger;
    constructor();
    getAllEquipment(page?: number, limit?: number, workCenterId?: string, status?: string, criticality?: string): Promise<{
        success: boolean;
        data: {
            equipment: ({
                id: string;
                equipmentCode: string;
                name: string;
                type: string;
                workCenterId: string;
                workCenterName: string;
                manufacturer: string;
                model: string;
                serialNumber: string;
                installationDate: string;
                warrantyExpiry: string;
                status: string;
                criticality: string;
                maintenanceStatus: string;
                nextMaintenanceDate: string;
                lastMaintenanceDate: string;
                utilizationRate: number;
                mtbf: number;
                mttr: number;
                oeeImpact: number;
                specifications: {
                    maxPressure: number;
                    maxTemperature: number;
                    capacity: number;
                    powerRating: number;
                    maxSpeed?: undefined;
                };
                sensors: {
                    type: string;
                    value: number;
                    unit: string;
                    status: string;
                }[];
                maintenanceMetrics: {
                    preventiveMaintenance: number;
                    correctiveMaintenance: number;
                    maintenanceCost: number;
                    availabilityRate: number;
                };
            } | {
                id: string;
                equipmentCode: string;
                name: string;
                type: string;
                workCenterId: string;
                workCenterName: string;
                manufacturer: string;
                model: string;
                serialNumber: string;
                installationDate: string;
                warrantyExpiry: string;
                status: string;
                criticality: string;
                maintenanceStatus: string;
                nextMaintenanceDate: string;
                lastMaintenanceDate: string;
                utilizationRate: number;
                mtbf: number;
                mttr: number;
                oeeImpact: number;
                specifications: {
                    maxPressure: number;
                    maxSpeed: number;
                    capacity: number;
                    powerRating: number;
                    maxTemperature?: undefined;
                };
                sensors: {
                    type: string;
                    value: number;
                    unit: string;
                    status: string;
                }[];
                maintenanceMetrics: {
                    preventiveMaintenance: number;
                    correctiveMaintenance: number;
                    maintenanceCost: number;
                    availabilityRate: number;
                };
            })[];
            pagination: {
                currentPage: number;
                totalPages: number;
                totalItems: number;
                itemsPerPage: number;
            };
            summary: {
                totalEquipment: number;
                operational: number;
                maintenance: number;
                breakdown: number;
                avgUtilization: number;
                avgAvailability: number;
            };
        };
        message: string;
    }>;
    getEquipment(id: string): Promise<{
        success: boolean;
        data: {
            id: string;
            equipmentCode: string;
            name: string;
            type: string;
            workCenterId: string;
            workCenterName: string;
            manufacturer: string;
            model: string;
            serialNumber: string;
            installationDate: string;
            warrantyExpiry: string;
            status: string;
            criticality: string;
            maintenanceStatus: string;
            nextMaintenanceDate: string;
            lastMaintenanceDate: string;
            utilizationRate: number;
            mtbf: number;
            mttr: number;
            oeeImpact: number;
            specifications: {
                maxPressure: number;
                maxTemperature: number;
                capacity: number;
                powerRating: number;
                dimensions: {
                    length: number;
                    width: number;
                    height: number;
                };
                weight: number;
            };
            sensors: {
                id: string;
                type: string;
                value: number;
                unit: string;
                status: string;
                threshold: {
                    min: number;
                    max: number;
                };
                lastCalibration: string;
            }[];
            spareParts: {
                partNumber: string;
                partName: string;
                currentStock: number;
                minStock: number;
                maxStock: number;
                unitCost: number;
                lastReplaced: string;
                expectedLifespan: number;
            }[];
            maintenanceHistory: {
                id: string;
                date: string;
                type: string;
                description: string;
                duration: number;
                cost: number;
                technician: string;
                status: string;
                tasks: string[];
            }[];
            documents: {
                type: string;
                name: string;
                url: string;
            }[];
        };
        message: string;
    }>;
    getMaintenanceSchedule(dateFrom?: string, dateTo?: string, workCenterId?: string, maintenanceType?: string): Promise<{
        success: boolean;
        data: {
            summary: {
                totalScheduled: number;
                preventive: number;
                predictive: number;
                corrective: number;
                overdue: number;
                dueThisWeek: number;
                dueThisMonth: number;
            };
            schedule: {
                id: string;
                equipmentId: string;
                equipmentName: string;
                workCenterId: string;
                maintenanceType: string;
                frequency: string;
                scheduledDate: string;
                estimatedDuration: number;
                priority: string;
                status: string;
                assignedTechnician: string;
                description: string;
                tasks: string[];
                requiredSpareParts: {
                    partNumber: string;
                    partName: string;
                    quantity: number;
                }[];
                estimatedCost: number;
            }[];
            calendar: {
                date: string;
                maintenanceCount: number;
                totalDuration: number;
                techniciansRequired: number;
            }[];
        };
        message: string;
    }>;
    createMaintenanceTask(createTaskDto: any): Promise<{
        success: boolean;
        data: any;
        message: string;
    }>;
    getMaintenanceWorkOrders(status?: string, priority?: string, technician?: string): Promise<{
        success: boolean;
        data: {
            workOrders: ({
                id: string;
                workOrderNumber: string;
                equipmentId: string;
                equipmentName: string;
                maintenanceType: string;
                priority: string;
                status: string;
                assignedTechnician: string;
                technicianId: string;
                scheduledDate: string;
                actualStartDate: string;
                estimatedDuration: number;
                actualDuration: null;
                description: string;
                tasks: ({
                    task: string;
                    status: string;
                    duration: number;
                } | {
                    task: string;
                    status: string;
                    duration: null;
                })[];
                spareParts: {
                    partNumber: string;
                    partName: string;
                    quantityUsed: number;
                    cost: number;
                }[];
                totalCost: number;
                progress: number;
            } | {
                id: string;
                workOrderNumber: string;
                equipmentId: string;
                equipmentName: string;
                maintenanceType: string;
                priority: string;
                status: string;
                assignedTechnician: string;
                technicianId: string;
                scheduledDate: string;
                actualStartDate: null;
                estimatedDuration: number;
                actualDuration: null;
                description: string;
                tasks: {
                    task: string;
                    status: string;
                    duration: null;
                }[];
                spareParts: {
                    partNumber: string;
                    partName: string;
                    quantityUsed: number;
                    cost: number;
                }[];
                totalCost: number;
                progress: number;
            })[];
            summary: {
                totalWorkOrders: number;
                scheduled: number;
                inProgress: number;
                completed: number;
                overdue: number;
                averageCompletionTime: number;
            };
        };
        message: string;
    }>;
    startMaintenanceWorkOrder(id: string, startData: any): Promise<{
        success: boolean;
        data: {
            workOrderId: string;
            status: string;
            actualStartDate: Date;
            startedBy: any;
        };
        message: string;
    }>;
    completeMaintenanceWorkOrder(id: string, completionData: any): Promise<{
        success: boolean;
        data: {
            workOrderId: string;
            status: string;
            actualEndDate: Date;
            actualDuration: any;
            totalCost: any;
            completedBy: any;
            notes: any;
        };
        message: string;
    }>;
    getMaintenanceAnalytics(timeRange?: string): Promise<{
        success: boolean;
        data: {
            overview: {
                totalEquipment: number;
                operationalEquipment: number;
                maintenanceEquipment: number;
                breakdownEquipment: number;
                overallAvailability: number;
                mtbf: number;
                mttr: number;
                maintenanceCost: number;
                preventiveRatio: number;
            };
            kpis: {
                plannedMaintenanceCompliance: number;
                maintenanceEfficiency: number;
                spareParts_availability: number;
                technicianUtilization: number;
                energyEfficiencyImprovement: number;
                safetyIncidents: number;
            };
            trends: {
                labels: string[];
                availability: number[];
                mtbf: number[];
                mttr: number[];
                cost: number[];
            };
            costBreakdown: {
                labor: number;
                spareParts: number;
                external_services: number;
                tools_equipment: number;
            };
            maintenanceTypes: {
                preventive: number;
                predictive: number;
                corrective: number;
                emergency: number;
            };
            equipmentCriticality: {
                critical: {
                    count: number;
                    availability: number;
                };
                high: {
                    count: number;
                    availability: number;
                };
                medium: {
                    count: number;
                    availability: number;
                };
                low: {
                    count: number;
                    availability: number;
                };
            };
        };
        message: string;
    }>;
    getPredictiveInsights(equipmentId?: string): Promise<{
        success: boolean;
        data: {
            summary: {
                equipmentAnalyzed: number;
                predictiveAlerts: number;
                recommendedActions: number;
                potentialSavings: number;
                riskPrevention: number;
            };
            insights: {
                equipmentId: string;
                equipmentName: string;
                riskLevel: string;
                confidence: number;
                predictedFailureDate: string;
                failureMode: string;
                remainingUsefulLife: number;
                recommendation: string;
                costImpact: {
                    preventiveCost: number;
                    correctiveCost: number;
                    potentialSavings: number;
                };
                indicators: {
                    parameter: string;
                    trend: string;
                    deviation: number;
                }[];
            }[];
            aiPredictions: {
                model: string;
                accuracy: number;
                lastTraining: string;
                dataPoints: number;
                features: string[];
            };
            recommendations: {
                type: string;
                description: string;
                impact: string;
            }[];
        };
        message: string;
    }>;
    getSparePartsInventory(equipmentId?: string, status?: string): Promise<{
        success: boolean;
        data: {
            summary: {
                totalParts: number;
                inStock: number;
                lowStock: number;
                outOfStock: number;
                totalValue: number;
                turnoverRate: number;
            };
            spareParts: {
                id: string;
                partNumber: string;
                partName: string;
                category: string;
                equipmentIds: string[];
                equipmentNames: string[];
                manufacturer: string;
                currentStock: number;
                minStock: number;
                maxStock: number;
                reorderPoint: number;
                unitCost: number;
                totalValue: number;
                lastReceived: string;
                lastUsed: string;
                usageRate: number;
                expectedLifespan: number;
                status: string;
                supplier: string;
                leadTime: number;
            }[];
            lowStockAlerts: {
                partNumber: string;
                partName: string;
                currentStock: number;
                minStock: number;
                daysUntilStockout: number;
                recommendedOrderQuantity: number;
            }[];
            reorderRecommendations: {
                partNumber: string;
                partName: string;
                currentStock: number;
                recommendedQuantity: number;
                urgency: string;
                estimatedCost: number;
            }[];
        };
        message: string;
    }>;
}
//# sourceMappingURL=maintenance.controller.d.ts.map