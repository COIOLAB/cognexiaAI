import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Logger,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Roles } from '../../../auth/decorators/roles.decorator';

@ApiTags('Maintenance Management')
@Controller('maintenance')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class MaintenanceController {
  private readonly logger = new Logger(MaintenanceController.name);

  constructor() {}

  // =================== EQUIPMENT MANAGEMENT ===================

  @Get('equipment')
  @ApiOperation({ 
    summary: 'Get all equipment',
    description: 'Retrieve all equipment with maintenance status and history'
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'workCenterId', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'criticality', required: false })
  @ApiResponse({ status: 200, description: 'Equipment list retrieved successfully' })
  @Roles('admin', 'manager', 'supervisor', 'maintenance_technician', 'viewer')
  async getAllEquipment(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('workCenterId') workCenterId?: string,
    @Query('status') status?: string,
    @Query('criticality') criticality?: string,
  ) {
    try {
      return {
        success: true,
        data: {
          equipment: [
            {
              id: 'EQ-001',
              equipmentCode: 'HPR-001',
              name: 'High Pressure Reactor',
              type: 'reactor',
              workCenterId: 'WC-001',
              workCenterName: 'Chemical Reactor Unit',
              manufacturer: 'ChemTech Industries',
              model: 'HPR-500',
              serialNumber: 'CT-2023-001',
              installationDate: '2023-01-15',
              warrantyExpiry: '2026-01-15',
              status: 'operational',
              criticality: 'critical',
              maintenanceStatus: 'scheduled',
              nextMaintenanceDate: '2024-03-15',
              lastMaintenanceDate: '2024-01-15',
              utilizationRate: 87.5,
              mtbf: 720, // hours
              mttr: 4.5, // hours
              oeeImpact: 15.2,
              specifications: {
                maxPressure: 50, // PSI
                maxTemperature: 200, // °C
                capacity: 1000, // L
                powerRating: 75, // kW
              },
              sensors: [
                { type: 'temperature', value: 145.2, unit: '°C', status: 'normal' },
                { type: 'pressure', value: 25.8, unit: 'PSI', status: 'normal' },
                { type: 'vibration', value: 2.1, unit: 'mm/s', status: 'normal' }
              ],
              maintenanceMetrics: {
                preventiveMaintenance: 85.2,
                correctiveMaintenance: 14.8,
                maintenanceCost: 15240,
                availabilityRate: 96.8
              }
            },
            {
              id: 'EQ-002',
              equipmentCode: 'TP-001',
              name: 'Tablet Press Machine',
              type: 'press',
              workCenterId: 'WC-002',
              workCenterName: 'Tabletting Line',
              manufacturer: 'PharmaTech Solutions',
              model: 'TP-2000',
              serialNumber: 'PT-2023-002',
              installationDate: '2023-03-20',
              warrantyExpiry: '2026-03-20',
              status: 'operational',
              criticality: 'high',
              maintenanceStatus: 'due_soon',
              nextMaintenanceDate: '2024-02-25',
              lastMaintenanceDate: '2023-12-25',
              utilizationRate: 92.3,
              mtbf: 480, // hours
              mttr: 3.2, // hours
              oeeImpact: 12.8,
              specifications: {
                maxPressure: 80, // kN
                maxSpeed: 1200, // tablets/min
                capacity: 50000, // tablets/hour
                powerRating: 45, // kW
              },
              sensors: [
                { type: 'force', value: 65.2, unit: 'kN', status: 'normal' },
                { type: 'speed', value: 950, unit: 'rpm', status: 'normal' },
                { type: 'temperature', value: 65.1, unit: '°C', status: 'warning' }
              ],
              maintenanceMetrics: {
                preventiveMaintenance: 78.5,
                correctiveMaintenance: 21.5,
                maintenanceCost: 12850,
                availabilityRate: 94.2
              }
            }
          ],
          pagination: {
            currentPage: page || 1,
            totalPages: 1,
            totalItems: 2,
            itemsPerPage: limit || 20
          },
          summary: {
            totalEquipment: 25,
            operational: 22,
            maintenance: 2,
            breakdown: 1,
            avgUtilization: 89.7,
            avgAvailability: 95.5
          }
        },
        message: 'Equipment list retrieved successfully'
      };
    } catch (error) {
      this.logger.error('Error getting equipment:', error);
      throw new HttpException('Failed to retrieve equipment', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('equipment/:id')
  @ApiOperation({ summary: 'Get equipment details by ID' })
  @ApiParam({ name: 'id', description: 'Equipment UUID' })
  @ApiResponse({ status: 200, description: 'Equipment details found' })
  @ApiResponse({ status: 404, description: 'Equipment not found' })
  @Roles('admin', 'manager', 'supervisor', 'maintenance_technician', 'viewer')
  async getEquipment(@Param('id') id: string) {
    try {
      return {
        success: true,
        data: {
          id,
          equipmentCode: 'HPR-001',
          name: 'High Pressure Reactor',
          type: 'reactor',
          workCenterId: 'WC-001',
          workCenterName: 'Chemical Reactor Unit',
          manufacturer: 'ChemTech Industries',
          model: 'HPR-500',
          serialNumber: 'CT-2023-001',
          installationDate: '2023-01-15',
          warrantyExpiry: '2026-01-15',
          status: 'operational',
          criticality: 'critical',
          maintenanceStatus: 'scheduled',
          nextMaintenanceDate: '2024-03-15',
          lastMaintenanceDate: '2024-01-15',
          utilizationRate: 87.5,
          mtbf: 720,
          mttr: 4.5,
          oeeImpact: 15.2,
          specifications: {
            maxPressure: 50,
            maxTemperature: 200,
            capacity: 1000,
            powerRating: 75,
            dimensions: { length: 3.5, width: 2.2, height: 4.1 },
            weight: 2850
          },
          sensors: [
            { 
              id: 'TEMP-001', 
              type: 'temperature', 
              value: 145.2, 
              unit: '°C', 
              status: 'normal',
              threshold: { min: 140, max: 150 },
              lastCalibration: '2024-01-10'
            },
            { 
              id: 'PRES-001', 
              type: 'pressure', 
              value: 25.8, 
              unit: 'PSI', 
              status: 'normal',
              threshold: { min: 20, max: 30 },
              lastCalibration: '2024-01-10'
            }
          ],
          spareParts: [
            {
              partNumber: 'SP-001',
              partName: 'Reactor Seal',
              currentStock: 5,
              minStock: 2,
              maxStock: 10,
              unitCost: 450.00,
              lastReplaced: '2024-01-15',
              expectedLifespan: 2160 // hours
            },
            {
              partNumber: 'SP-002',
              partName: 'Pressure Valve',
              currentStock: 1,
              minStock: 2,
              maxStock: 5,
              unitCost: 280.00,
              lastReplaced: '2023-12-10',
              expectedLifespan: 4320 // hours
            }
          ],
          maintenanceHistory: [
            {
              id: 'MH-001',
              date: '2024-01-15',
              type: 'preventive',
              description: 'Quarterly preventive maintenance',
              duration: 4.5,
              cost: 850.00,
              technician: 'Mike Johnson',
              status: 'completed',
              tasks: [
                'Seal replacement',
                'Calibration check',
                'Lubrication',
                'Safety system test'
              ]
            }
          ],
          documents: [
            {
              type: 'manual',
              name: 'Operation Manual',
              url: '/docs/HPR-001-manual.pdf'
            },
            {
              type: 'maintenance_procedure',
              name: 'Maintenance SOP',
              url: '/docs/HPR-001-maintenance-sop.pdf'
            }
          ]
        },
        message: 'Equipment details retrieved successfully'
      };
    } catch (error) {
      this.logger.error(`Error getting equipment ${id}:`, error);
      throw new HttpException('Equipment not found', HttpStatus.NOT_FOUND);
    }
  }

  // =================== MAINTENANCE SCHEDULING ===================

  @Get('schedule')
  @ApiOperation({ 
    summary: 'Get maintenance schedule',
    description: 'Get preventive and predictive maintenance schedule'
  })
  @ApiQuery({ name: 'dateFrom', required: false })
  @ApiQuery({ name: 'dateTo', required: false })
  @ApiQuery({ name: 'workCenterId', required: false })
  @ApiQuery({ name: 'maintenanceType', required: false })
  @ApiResponse({ status: 200, description: 'Maintenance schedule retrieved successfully' })
  @Roles('admin', 'manager', 'supervisor', 'maintenance_technician', 'viewer')
  async getMaintenanceSchedule(
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('workCenterId') workCenterId?: string,
    @Query('maintenanceType') maintenanceType?: string,
  ) {
    try {
      return {
        success: true,
        data: {
          summary: {
            totalScheduled: 45,
            preventive: 35,
            predictive: 8,
            corrective: 2,
            overdue: 3,
            dueThisWeek: 8,
            dueThisMonth: 15
          },
          schedule: [
            {
              id: 'MS-001',
              equipmentId: 'EQ-001',
              equipmentName: 'High Pressure Reactor',
              workCenterId: 'WC-001',
              maintenanceType: 'preventive',
              frequency: 'quarterly',
              scheduledDate: '2024-03-15',
              estimatedDuration: 4.5,
              priority: 'high',
              status: 'scheduled',
              assignedTechnician: 'Mike Johnson',
              description: 'Quarterly preventive maintenance',
              tasks: [
                'Seal inspection and replacement',
                'Calibration verification',
                'Lubrication points check',
                'Safety systems test'
              ],
              requiredSpareParts: [
                { partNumber: 'SP-001', partName: 'Reactor Seal', quantity: 1 },
                { partNumber: 'SP-003', partName: 'Lubricant', quantity: 2 }
              ],
              estimatedCost: 950.00
            },
            {
              id: 'MS-002',
              equipmentId: 'EQ-002',
              equipmentName: 'Tablet Press Machine',
              workCenterId: 'WC-002',
              maintenanceType: 'predictive',
              frequency: 'condition_based',
              scheduledDate: '2024-02-25',
              estimatedDuration: 3.0,
              priority: 'medium',
              status: 'due_soon',
              assignedTechnician: 'Sarah Wilson',
              description: 'Predictive maintenance based on vibration analysis',
              tasks: [
                'Bearing inspection',
                'Alignment check',
                'Force calibration',
                'Speed sensor validation'
              ],
              requiredSpareParts: [
                { partNumber: 'SP-005', partName: 'Bearing Set', quantity: 1 }
              ],
              estimatedCost: 1200.00
            },
            {
              id: 'MS-003',
              equipmentId: 'EQ-003',
              equipmentName: 'Centrifuge Unit',
              workCenterId: 'WC-003',
              maintenanceType: 'corrective',
              frequency: 'emergency',
              scheduledDate: '2024-02-18',
              estimatedDuration: 6.0,
              priority: 'critical',
              status: 'overdue',
              assignedTechnician: 'Robert Davis',
              description: 'Emergency repair - bearing failure',
              tasks: [
                'Replace main bearings',
                'Motor alignment',
                'Balance rotor',
                'Performance test'
              ],
              requiredSpareParts: [
                { partNumber: 'SP-010', partName: 'Main Bearing', quantity: 2 },
                { partNumber: 'SP-011', partName: 'Coupling', quantity: 1 }
              ],
              estimatedCost: 2850.00
            }
          ],
          calendar: [
            {
              date: '2024-02-20',
              maintenanceCount: 3,
              totalDuration: 8.5,
              techniciansRequired: 2
            },
            {
              date: '2024-02-25',
              maintenanceCount: 2,
              totalDuration: 6.0,
              techniciansRequired: 2
            }
          ]
        },
        message: 'Maintenance schedule retrieved successfully'
      };
    } catch (error) {
      this.logger.error('Error getting maintenance schedule:', error);
      throw new HttpException('Failed to retrieve maintenance schedule', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('schedule')
  @ApiOperation({ 
    summary: 'Create maintenance task',
    description: 'Schedule a new maintenance task'
  })
  @ApiResponse({ status: 201, description: 'Maintenance task scheduled successfully' })
  @Roles('admin', 'manager', 'supervisor', 'maintenance_technician')
  async createMaintenanceTask(@Body() createTaskDto: any) {
    try {
      return {
        success: true,
        data: {
          id: 'ms-' + Date.now(),
          ...createTaskDto,
          status: 'scheduled',
          createdAt: new Date()
        },
        message: 'Maintenance task scheduled successfully'
      };
    } catch (error) {
      this.logger.error('Error creating maintenance task:', error);
      throw new HttpException('Failed to create maintenance task', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // =================== WORK ORDERS ===================

  @Get('work-orders')
  @ApiOperation({ 
    summary: 'Get maintenance work orders',
    description: 'Retrieve all maintenance work orders'
  })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'priority', required: false })
  @ApiQuery({ name: 'technician', required: false })
  @ApiResponse({ status: 200, description: 'Maintenance work orders retrieved successfully' })
  @Roles('admin', 'manager', 'supervisor', 'maintenance_technician', 'viewer')
  async getMaintenanceWorkOrders(
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('technician') technician?: string,
  ) {
    try {
      return {
        success: true,
        data: {
          workOrders: [
            {
              id: 'MWO-001',
              workOrderNumber: 'MWO-2024-001',
              equipmentId: 'EQ-001',
              equipmentName: 'High Pressure Reactor',
              maintenanceType: 'preventive',
              priority: 'high',
              status: 'in_progress',
              assignedTechnician: 'Mike Johnson',
              technicianId: 'TECH-001',
              scheduledDate: '2024-02-20T08:00:00Z',
              actualStartDate: '2024-02-20T08:15:00Z',
              estimatedDuration: 4.5,
              actualDuration: null,
              description: 'Quarterly preventive maintenance',
              tasks: [
                { task: 'Seal inspection', status: 'completed', duration: 1.0 },
                { task: 'Calibration check', status: 'in_progress', duration: null },
                { task: 'Lubrication', status: 'pending', duration: null },
                { task: 'Safety test', status: 'pending', duration: null }
              ],
              spareParts: [
                { partNumber: 'SP-001', partName: 'Reactor Seal', quantityUsed: 1, cost: 450.00 },
                { partNumber: 'SP-003', partName: 'Lubricant', quantityUsed: 2, cost: 85.00 }
              ],
              totalCost: 535.00,
              progress: 35.0
            },
            {
              id: 'MWO-002',
              workOrderNumber: 'MWO-2024-002',
              equipmentId: 'EQ-002',
              equipmentName: 'Tablet Press Machine',
              maintenanceType: 'corrective',
              priority: 'critical',
              status: 'scheduled',
              assignedTechnician: 'Sarah Wilson',
              technicianId: 'TECH-002',
              scheduledDate: '2024-02-21T09:00:00Z',
              actualStartDate: null,
              estimatedDuration: 6.0,
              actualDuration: null,
              description: 'Emergency repair - temperature sensor malfunction',
              tasks: [
                { task: 'Diagnose sensor issue', status: 'pending', duration: null },
                { task: 'Replace sensor', status: 'pending', duration: null },
                { task: 'Calibrate system', status: 'pending', duration: null },
                { task: 'Performance test', status: 'pending', duration: null }
              ],
              spareParts: [
                { partNumber: 'SP-015', partName: 'Temperature Sensor', quantityUsed: 1, cost: 320.00 }
              ],
              totalCost: 320.00,
              progress: 0.0
            }
          ],
          summary: {
            totalWorkOrders: 8,
            scheduled: 3,
            inProgress: 2,
            completed: 2,
            overdue: 1,
            averageCompletionTime: 4.2
          }
        },
        message: 'Maintenance work orders retrieved successfully'
      };
    } catch (error) {
      this.logger.error('Error getting maintenance work orders:', error);
      throw new HttpException('Failed to retrieve maintenance work orders', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put('work-orders/:id/start')
  @ApiOperation({ 
    summary: 'Start maintenance work order',
    description: 'Begin execution of a maintenance work order'
  })
  @ApiParam({ name: 'id', description: 'Work order UUID' })
  @ApiResponse({ status: 200, description: 'Maintenance work order started successfully' })
  @Roles('admin', 'manager', 'supervisor', 'maintenance_technician')
  async startMaintenanceWorkOrder(@Param('id') id: string, @Body() startData: any) {
    try {
      return {
        success: true,
        data: {
          workOrderId: id,
          status: 'in_progress',
          actualStartDate: new Date(),
          startedBy: startData.technicianId || 'current_user'
        },
        message: 'Maintenance work order started successfully'
      };
    } catch (error) {
      this.logger.error(`Error starting maintenance work order ${id}:`, error);
      throw new HttpException('Failed to start maintenance work order', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put('work-orders/:id/complete')
  @ApiOperation({ 
    summary: 'Complete maintenance work order',
    description: 'Mark maintenance work order as completed'
  })
  @ApiParam({ name: 'id', description: 'Work order UUID' })
  @ApiResponse({ status: 200, description: 'Maintenance work order completed successfully' })
  @Roles('admin', 'manager', 'supervisor', 'maintenance_technician')
  async completeMaintenanceWorkOrder(@Param('id') id: string, @Body() completionData: any) {
    try {
      return {
        success: true,
        data: {
          workOrderId: id,
          status: 'completed',
          actualEndDate: new Date(),
          actualDuration: completionData.actualDuration,
          totalCost: completionData.totalCost,
          completedBy: completionData.technicianId || 'current_user',
          notes: completionData.notes
        },
        message: 'Maintenance work order completed successfully'
      };
    } catch (error) {
      this.logger.error(`Error completing maintenance work order ${id}:`, error);
      throw new HttpException('Failed to complete maintenance work order', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // =================== ANALYTICS & REPORTS ===================

  @Get('analytics/overview')
  @ApiOperation({ 
    summary: 'Get maintenance analytics overview',
    description: 'Comprehensive maintenance KPIs and metrics'
  })
  @ApiQuery({ name: 'timeRange', required: false, enum: ['24h', '7d', '30d', '90d'] })
  @ApiResponse({ status: 200, description: 'Maintenance analytics retrieved successfully' })
  @Roles('admin', 'manager', 'supervisor', 'viewer')
  async getMaintenanceAnalytics(@Query('timeRange') timeRange?: string) {
    try {
      return {
        success: true,
        data: {
          overview: {
            totalEquipment: 25,
            operationalEquipment: 22,
            maintenanceEquipment: 2,
            breakdownEquipment: 1,
            overallAvailability: 95.5,
            mtbf: 580, // hours
            mttr: 3.8, // hours
            maintenanceCost: 125000,
            preventiveRatio: 82.5
          },
          kpis: {
            plannedMaintenanceCompliance: 94.2,
            maintenanceEfficiency: 89.7,
            spareParts_availability: 96.8,
            technicianUtilization: 78.5,
            energyEfficiencyImprovement: 12.3,
            safetyIncidents: 0
          },
          trends: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr'],
            availability: [94.2, 95.1, 95.8, 95.5],
            mtbf: [520, 545, 570, 580],
            mttr: [4.2, 4.0, 3.9, 3.8],
            cost: [28500, 31200, 29800, 35500]
          },
          costBreakdown: {
            labor: 45.2,
            spareParts: 38.5,
            external_services: 12.8,
            tools_equipment: 3.5
          },
          maintenanceTypes: {
            preventive: 65.8,
            predictive: 19.2,
            corrective: 12.5,
            emergency: 2.5
          },
          equipmentCriticality: {
            critical: { count: 5, availability: 98.2 },
            high: { count: 8, availability: 96.5 },
            medium: { count: 10, availability: 94.8 },
            low: { count: 2, availability: 92.1 }
          }
        },
        message: 'Maintenance analytics retrieved successfully'
      };
    } catch (error) {
      this.logger.error('Error getting maintenance analytics:', error);
      throw new HttpException('Failed to retrieve maintenance analytics', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // =================== PREDICTIVE MAINTENANCE ===================

  @Get('predictive/insights')
  @ApiOperation({ 
    summary: 'Get predictive maintenance insights',
    description: 'AI-powered predictive maintenance recommendations'
  })
  @ApiQuery({ name: 'equipmentId', required: false })
  @ApiResponse({ status: 200, description: 'Predictive insights retrieved successfully' })
  @Roles('admin', 'manager', 'supervisor', 'maintenance_technician', 'viewer')
  async getPredictiveInsights(@Query('equipmentId') equipmentId?: string) {
    try {
      return {
        success: true,
        data: {
          summary: {
            equipmentAnalyzed: 25,
            predictiveAlerts: 4,
            recommendedActions: 6,
            potentialSavings: 45000,
            riskPrevention: 3
          },
          insights: [
            {
              equipmentId: 'EQ-001',
              equipmentName: 'High Pressure Reactor',
              riskLevel: 'medium',
              confidence: 85.2,
              predictedFailureDate: '2024-04-15',
              failureMode: 'seal_degradation',
              remainingUsefulLife: 1680, // hours
              recommendation: 'Schedule seal replacement within 30 days',
              costImpact: {
                preventiveCost: 850,
                correctiveCost: 8500,
                potentialSavings: 7650
              },
              indicators: [
                { parameter: 'temperature', trend: 'increasing', deviation: 3.2 },
                { parameter: 'pressure_variation', trend: 'increasing', deviation: 2.8 },
                { parameter: 'vibration', trend: 'stable', deviation: 0.5 }
              ]
            },
            {
              equipmentId: 'EQ-002',
              equipmentName: 'Tablet Press Machine',
              riskLevel: 'high',
              confidence: 92.7,
              predictedFailureDate: '2024-03-05',
              failureMode: 'bearing_failure',
              remainingUsefulLife: 480, // hours
              recommendation: 'Immediate bearing inspection and replacement required',
              costImpact: {
                preventiveCost: 1200,
                correctiveCost: 15000,
                potentialSavings: 13800
              },
              indicators: [
                { parameter: 'vibration', trend: 'increasing', deviation: 8.5 },
                { parameter: 'temperature', trend: 'increasing', deviation: 5.2 },
                { parameter: 'noise_level', trend: 'increasing', deviation: 6.8 }
              ]
            }
          ],
          aiPredictions: {
            model: 'Random Forest v2.1',
            accuracy: 89.3,
            lastTraining: '2024-02-01',
            dataPoints: 156000,
            features: [
              'vibration_rms',
              'temperature_avg',
              'pressure_variance',
              'operational_hours',
              'load_factor'
            ]
          },
          recommendations: [
            {
              type: 'schedule_optimization',
              description: 'Optimize maintenance schedules based on actual usage patterns',
              impact: 'Reduce maintenance costs by 15%'
            },
            {
              type: 'spare_parts_optimization',
              description: 'Adjust spare parts inventory based on failure predictions',
              impact: 'Reduce inventory holding costs by 20%'
            }
          ]
        },
        message: 'Predictive maintenance insights retrieved successfully'
      };
    } catch (error) {
      this.logger.error('Error getting predictive insights:', error);
      throw new HttpException('Failed to retrieve predictive insights', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // =================== SPARE PARTS MANAGEMENT ===================

  @Get('spare-parts')
  @ApiOperation({ 
    summary: 'Get spare parts inventory',
    description: 'Retrieve spare parts inventory with stock levels and usage'
  })
  @ApiQuery({ name: 'equipmentId', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiResponse({ status: 200, description: 'Spare parts inventory retrieved successfully' })
  @Roles('admin', 'manager', 'supervisor', 'maintenance_technician', 'viewer')
  async getSparePartsInventory(
    @Query('equipmentId') equipmentId?: string,
    @Query('status') status?: string,
  ) {
    try {
      return {
        success: true,
        data: {
          summary: {
            totalParts: 156,
            inStock: 142,
            lowStock: 8,
            outOfStock: 6,
            totalValue: 125000,
            turnoverRate: 3.2
          },
          spareParts: [
            {
              id: 'SP-001',
              partNumber: 'HPR-SEAL-001',
              partName: 'High Pressure Reactor Seal',
              category: 'seals_gaskets',
              equipmentIds: ['EQ-001'],
              equipmentNames: ['High Pressure Reactor'],
              manufacturer: 'SealTech Industries',
              currentStock: 5,
              minStock: 2,
              maxStock: 10,
              reorderPoint: 3,
              unitCost: 450.00,
              totalValue: 2250.00,
              lastReceived: '2024-01-10',
              lastUsed: '2024-01-15',
              usageRate: 0.5, // per month
              expectedLifespan: 2160, // hours
              status: 'adequate',
              supplier: 'Industrial Supplies Co.',
              leadTime: 14 // days
            },
            {
              id: 'SP-002',
              partNumber: 'TP-BEARING-002',
              partName: 'Tablet Press Bearing Set',
              category: 'bearings',
              equipmentIds: ['EQ-002'],
              equipmentNames: ['Tablet Press Machine'],
              manufacturer: 'BearingCorp',
              currentStock: 1,
              minStock: 2,
              maxStock: 5,
              reorderPoint: 2,
              unitCost: 680.00,
              totalValue: 680.00,
              lastReceived: '2023-12-05',
              lastUsed: '2023-11-20',
              usageRate: 0.25, // per month
              expectedLifespan: 4320, // hours
              status: 'low_stock',
              supplier: 'Precision Parts Ltd.',
              leadTime: 21 // days
            }
          ],
          lowStockAlerts: [
            {
              partNumber: 'TP-BEARING-002',
              partName: 'Tablet Press Bearing Set',
              currentStock: 1,
              minStock: 2,
              daysUntilStockout: 45,
              recommendedOrderQuantity: 4
            }
          ],
          reorderRecommendations: [
            {
              partNumber: 'HPR-VALVE-003',
              partName: 'Pressure Relief Valve',
              currentStock: 0,
              recommendedQuantity: 3,
              urgency: 'high',
              estimatedCost: 840.00
            }
          ]
        },
        message: 'Spare parts inventory retrieved successfully'
      };
    } catch (error) {
      this.logger.error('Error getting spare parts inventory:', error);
      throw new HttpException('Failed to retrieve spare parts inventory', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
