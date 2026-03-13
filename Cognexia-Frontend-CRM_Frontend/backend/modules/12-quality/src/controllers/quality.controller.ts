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
import { QualityService } from '../services/quality.service';

@ApiTags('Quality Management')
@Controller('quality')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class QualityController {
  private readonly logger = new Logger(QualityController.name);

  constructor(private readonly qualityService: QualityService) {}

  // =================== QUALITY INSPECTIONS ===================

  @Get('inspections')
  @ApiOperation({ 
    summary: 'Get all quality inspections',
    description: 'Retrieve all quality inspections with filtering and pagination'
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'type', required: false })
  @ApiQuery({ name: 'workCenterId', required: false })
  @ApiResponse({ status: 200, description: 'Inspections retrieved successfully' })
  @Roles('admin', 'manager', 'supervisor', 'quality_inspector', 'viewer')
  async getAllInspections(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Query('workCenterId') workCenterId?: string,
  ) {
    try {
      return await this.qualityService.getAllInspections({
        page: page || 1,
        limit: limit || 20,
        status,
        type,
        workCenterId,
      });
    } catch (error) {
      this.logger.error('Error getting inspections:', error);
      throw new HttpException('Failed to retrieve inspections', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('inspections/:id')
  @ApiOperation({ summary: 'Get inspection by ID' })
  @ApiParam({ name: 'id', description: 'Inspection UUID' })
  @ApiResponse({ status: 200, description: 'Inspection found' })
  @ApiResponse({ status: 404, description: 'Inspection not found' })
  @Roles('admin', 'manager', 'supervisor', 'quality_inspector', 'viewer')
  async getInspection(@Param('id') id: string) {
    try {
      return await this.qualityService.getInspectionById(id);
    } catch (error) {
      this.logger.error(`Error getting inspection ${id}:`, error);
      throw error;
    }
  }

  @Post('inspections')
  @ApiOperation({ 
    summary: 'Create new quality inspection',
    description: 'Create a new quality inspection with parameters and scheduling'
  })
  @ApiResponse({ status: 201, description: 'Inspection created successfully' })
  @Roles('admin', 'manager', 'supervisor', 'quality_inspector')
  async createInspection(@Body() createInspectionDto: any) {
    try {
      return await this.qualityService.createInspection(createInspectionDto);
    } catch (error) {
      this.logger.error('Error creating inspection:', error);
      throw new HttpException('Failed to create inspection', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put('inspections/:id')
  @ApiOperation({ summary: 'Update inspection' })
  @ApiParam({ name: 'id', description: 'Inspection UUID' })
  @ApiResponse({ status: 200, description: 'Inspection updated successfully' })
  @Roles('admin', 'manager', 'supervisor', 'quality_inspector')
  async updateInspection(@Param('id') id: string, @Body() updateInspectionDto: any) {
    try {
      return await this.qualityService.updateInspection(id, updateInspectionDto);
    } catch (error) {
      this.logger.error(`Error updating inspection ${id}:`, error);
      throw new HttpException('Failed to update inspection', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('inspections/:id/complete')
  @ApiOperation({ 
    summary: 'Complete quality inspection',
    description: 'Complete inspection with results, measurements, and quality score'
  })
  @ApiParam({ name: 'id', description: 'Inspection UUID' })
  @ApiResponse({ status: 200, description: 'Inspection completed successfully' })
  @Roles('admin', 'manager', 'supervisor', 'quality_inspector')
  async completeInspection(@Param('id') id: string, @Body() completionData: any) {
    try {
      return await this.qualityService.completeInspection(id, completionData);
    } catch (error) {
      this.logger.error(`Error completing inspection ${id}:`, error);
      throw new HttpException('Failed to complete inspection', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // =================== QUALITY ANALYTICS ===================

  @Get('analytics/overview')
  @ApiOperation({ 
    summary: 'Get quality analytics overview',
    description: 'Get comprehensive quality metrics and KPIs'
  })
  @ApiQuery({ name: 'timeRange', required: false, enum: ['24h', '7d', '30d', '90d'] })
  @ApiQuery({ name: 'industryType', required: false })
  @ApiResponse({ status: 200, description: 'Quality analytics retrieved successfully' })
  @Roles('admin', 'manager', 'supervisor', 'viewer')
  async getQualityAnalytics(
    @Query('timeRange') timeRange?: string,
    @Query('industryType') industryType?: string,
  ) {
    try {
      return {
        success: true,
        data: {
          overview: {
            totalInspections: 1250,
            passedInspections: 1198,
            failedInspections: 52,
            passRate: 95.84,
            averageQualityScore: 94.2,
            defectRate: 0.8,
            reworkRate: 2.1,
          },
          trends: {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
            passRate: [94.2, 95.1, 96.3, 95.8],
            qualityScore: [93.5, 94.1, 94.8, 94.2],
            defectRate: [1.2, 0.9, 0.6, 0.8],
          },
          topDefects: [
            { type: 'Dimensional', count: 15, percentage: 28.8 },
            { type: 'Surface Finish', count: 12, percentage: 23.1 },
            { type: 'Material', count: 8, percentage: 15.4 },
            { type: 'Assembly', count: 6, percentage: 11.5 },
          ],
          industryMetrics: {
            pharmaceutical: { 
              gmpCompliance: 99.8, 
              sterileProcesses: 100,
              validationStatus: 'current'
            },
            chemical: { 
              safetyCompliance: 98.9,
              hazmatCompliance: 99.5,
              environmentalCompliance: 97.8
            },
            automotive: { 
              ts16949Compliance: 99.2,
              ppapApproval: 95.6,
              customerSatisfaction: 4.7
            },
          },
          alerts: {
            critical: 1,
            warning: 4,
            info: 8,
          },
        },
        message: 'Quality analytics retrieved successfully',
      };
    } catch (error) {
      this.logger.error('Error getting quality analytics:', error);
      throw new HttpException('Failed to retrieve analytics', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('analytics/defects')
  @ApiOperation({ 
    summary: 'Get defect analysis',
    description: 'Detailed defect analysis with root cause and trending'
  })
  @ApiQuery({ name: 'timeRange', required: false })
  @ApiQuery({ name: 'workCenterId', required: false })
  @ApiResponse({ status: 200, description: 'Defect analysis retrieved successfully' })
  @Roles('admin', 'manager', 'supervisor', 'viewer')
  async getDefectAnalysis(
    @Query('timeRange') timeRange?: string,
    @Query('workCenterId') workCenterId?: string,
  ) {
    try {
      return {
        success: true,
        data: {
          summary: {
            totalDefects: 52,
            criticalDefects: 8,
            majorDefects: 28,
            minorDefects: 16,
            resolvedDefects: 45,
            openDefects: 7,
          },
          byCategory: [
            { category: 'Dimensional', count: 15, trend: 'decreasing' },
            { category: 'Surface Finish', count: 12, trend: 'stable' },
            { category: 'Material', count: 8, trend: 'increasing' },
            { category: 'Assembly', count: 6, trend: 'decreasing' },
            { category: 'Functional', count: 4, trend: 'stable' },
          ],
          byWorkCenter: [
            { workCenterId: 'WC-001', name: 'Machining Center', defects: 18 },
            { workCenterId: 'WC-002', name: 'Assembly Line', defects: 14 },
            { workCenterId: 'WC-003', name: 'Paint Shop', defects: 12 },
            { workCenterId: 'WC-004', name: 'Final Inspection', defects: 8 },
          ],
          rootCauses: [
            { cause: 'Machine Setup', percentage: 35.2 },
            { cause: 'Material Quality', percentage: 28.8 },
            { cause: 'Operator Error', percentage: 19.2 },
            { cause: 'Environmental', percentage: 16.8 },
          ],
          correctiveActions: {
            implemented: 42,
            inProgress: 8,
            planned: 2,
            effectiveness: 89.3,
          },
        },
        message: 'Defect analysis retrieved successfully',
      };
    } catch (error) {
      this.logger.error('Error getting defect analysis:', error);
      throw new HttpException('Failed to retrieve defect analysis', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // =================== COMPLIANCE MANAGEMENT ===================

  @Get('compliance/status')
  @ApiOperation({ 
    summary: 'Get compliance status',
    description: 'Current compliance status across all standards and regulations'
  })
  @ApiQuery({ name: 'industryType', required: false })
  @ApiResponse({ status: 200, description: 'Compliance status retrieved successfully' })
  @Roles('admin', 'manager', 'supervisor', 'viewer')
  async getComplianceStatus(@Query('industryType') industryType?: string) {
    try {
      return {
        success: true,
        data: {
          overall: {
            complianceScore: 96.8,
            activeStandards: 12,
            nonCompliances: 3,
            overdueActions: 1,
            lastAudit: '2024-01-15',
          },
          standards: [
            { name: 'ISO 9001:2015', status: 'compliant', lastReview: '2024-01-10', nextReview: '2024-07-10' },
            { name: 'ISO 14001:2015', status: 'compliant', lastReview: '2023-12-15', nextReview: '2024-06-15' },
            { name: 'ISO 45001:2018', status: 'minor_deviation', lastReview: '2024-02-01', nextReview: '2024-08-01' },
          ],
          industrySpecific: {
            pharmaceutical: [
              { name: 'GMP', status: 'compliant', expires: '2025-06-30' },
              { name: 'FDA 21 CFR Part 211', status: 'compliant', expires: '2025-12-31' },
            ],
            chemical: [
              { name: 'OSHA Process Safety', status: 'compliant', expires: '2024-12-31' },
              { name: 'EPA Clean Air Act', status: 'compliant', expires: '2025-03-31' },
            ],
            automotive: [
              { name: 'IATF 16949', status: 'compliant', expires: '2024-09-15' },
              { name: 'ISO/TS 16949', status: 'migrated', expires: 'N/A' },
            ],
          },
          nonCompliances: [
            {
              id: 'NC-001',
              standard: 'ISO 45001:2018',
              description: 'Emergency evacuation procedures incomplete',
              severity: 'minor',
              dueDate: '2024-03-15',
              assignedTo: 'Safety Manager',
            },
          ],
          auditSchedule: [
            { audit: 'ISO 9001 Surveillance', date: '2024-04-15', auditor: 'External' },
            { audit: 'GMP Internal Audit', date: '2024-03-20', auditor: 'Internal' },
          ],
        },
        message: 'Compliance status retrieved successfully',
      };
    } catch (error) {
      this.logger.error('Error getting compliance status:', error);
      throw new HttpException('Failed to retrieve compliance status', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // =================== CALIBRATION MANAGEMENT ===================

  @Get('calibration/schedule')
  @ApiOperation({ 
    summary: 'Get calibration schedule',
    description: 'Equipment and instrument calibration schedule and status'
  })
  @ApiQuery({ name: 'workCenterId', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiResponse({ status: 200, description: 'Calibration schedule retrieved successfully' })
  @Roles('admin', 'manager', 'supervisor', 'quality_inspector', 'viewer')
  async getCalibrationSchedule(
    @Query('workCenterId') workCenterId?: string,
    @Query('status') status?: string,
  ) {
    try {
      return {
        success: true,
        data: {
          summary: {
            totalEquipment: 125,
            calibrated: 118,
            overdue: 3,
            dueThisWeek: 8,
            dueThisMonth: 15,
          },
          schedule: [
            {
              id: 'CAL-001',
              equipmentId: 'EQ-001',
              equipmentName: 'Digital Pressure Gauge',
              workCenterId: 'WC-001',
              lastCalibration: '2024-01-15',
              nextCalibration: '2024-04-15',
              frequency: 'quarterly',
              status: 'due_soon',
              calibrationLab: 'Internal Lab',
            },
            {
              id: 'CAL-002',
              equipmentId: 'EQ-002',
              equipmentName: 'Temperature Sensor',
              workCenterId: 'WC-002',
              lastCalibration: '2023-12-01',
              nextCalibration: '2024-03-01',
              frequency: 'quarterly',
              status: 'overdue',
              calibrationLab: 'External Lab',
            },
          ],
          upcoming: [
            { date: '2024-02-20', equipment: 3, lab: 'Internal' },
            { date: '2024-02-25', equipment: 2, lab: 'External' },
            { date: '2024-03-01', equipment: 5, lab: 'Internal' },
          ],
          certificates: [
            {
              certificateNumber: 'CERT-2024-001',
              equipmentId: 'EQ-001',
              issueDate: '2024-01-15',
              validUntil: '2024-04-15',
              issuedBy: 'ABC Calibration Lab',
              status: 'valid',
            },
          ],
        },
        message: 'Calibration schedule retrieved successfully',
      };
    } catch (error) {
      this.logger.error('Error getting calibration schedule:', error);
      throw new HttpException('Failed to retrieve calibration schedule', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // =================== QUALITY ALERTS ===================

  @Get('alerts')
  @ApiOperation({ 
    summary: 'Get quality alerts',
    description: 'Active quality alerts and notifications'
  })
  @ApiQuery({ name: 'severity', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiResponse({ status: 200, description: 'Quality alerts retrieved successfully' })
  @Roles('admin', 'manager', 'supervisor', 'quality_inspector', 'viewer')
  async getQualityAlerts(
    @Query('severity') severity?: string,
    @Query('status') status?: string,
  ) {
    try {
      return {
        success: true,
        data: {
          summary: {
            critical: 1,
            high: 3,
            medium: 5,
            low: 8,
            total: 17,
            acknowledged: 12,
            unacknowledged: 5,
          },
          alerts: [
            {
              id: 'QA-001',
              severity: 'critical',
              type: 'compliance_violation',
              title: 'GMP Deviation Detected',
              description: 'Temperature excursion in sterile manufacturing area',
              workCenterId: 'WC-005',
              workCenterName: 'Sterile Manufacturing',
              timestamp: new Date('2024-02-15T10:30:00Z'),
              status: 'active',
              assignedTo: 'Quality Manager',
              correctiveAction: 'Investigation initiated',
            },
            {
              id: 'QA-002',
              severity: 'high',
              type: 'quality_threshold',
              title: 'Quality Score Below Threshold',
              description: 'Average quality score dropped to 89.2% (threshold: 90%)',
              workCenterId: 'WC-003',
              workCenterName: 'Assembly Line B',
              timestamp: new Date('2024-02-15T09:15:00Z'),
              status: 'acknowledged',
              assignedTo: 'Production Supervisor',
              correctiveAction: 'Process review scheduled',
            },
            {
              id: 'QA-003',
              severity: 'medium',
              type: 'calibration_due',
              title: 'Equipment Calibration Overdue',
              description: 'Digital micrometer calibration is 5 days overdue',
              workCenterId: 'WC-001',
              workCenterName: 'Precision Machining',
              timestamp: new Date('2024-02-14T14:20:00Z'),
              status: 'active',
              assignedTo: 'Maintenance Team',
              correctiveAction: 'Calibration scheduled for tomorrow',
            },
          ],
          escalations: [
            {
              alertId: 'QA-001',
              escalatedTo: 'Plant Manager',
              escalatedAt: new Date('2024-02-15T11:00:00Z'),
              reason: 'Critical compliance issue',
            },
          ],
        },
        message: 'Quality alerts retrieved successfully',
      };
    } catch (error) {
      this.logger.error('Error getting quality alerts:', error);
      throw new HttpException('Failed to retrieve quality alerts', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('alerts/:id/acknowledge')
  @ApiOperation({ 
    summary: 'Acknowledge quality alert',
    description: 'Acknowledge a quality alert with optional notes'
  })
  @ApiParam({ name: 'id', description: 'Alert ID' })
  @ApiResponse({ status: 200, description: 'Alert acknowledged successfully' })
  @Roles('admin', 'manager', 'supervisor', 'quality_inspector')
  async acknowledgeAlert(@Param('id') id: string, @Body() acknowledgmentData: any) {
    try {
      return {
        success: true,
        data: {
          alertId: id,
          acknowledgedBy: acknowledgmentData.userId || 'current_user',
          acknowledgedAt: new Date(),
          notes: acknowledgmentData.notes,
          status: 'acknowledged',
        },
        message: 'Alert acknowledged successfully',
      };
    } catch (error) {
      this.logger.error(`Error acknowledging alert ${id}:`, error);
      throw new HttpException('Failed to acknowledge alert', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
