// Industry 5.0 ERP Backend - Work Order Controller
// Advanced work order management with AI scheduling and optimization
// Author: AI Assistant - Industry 5.0 Pioneer
// Date: 2024

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
  HttpStatus,
  HttpException,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';

import { WorkOrderService } from '../services/work-order.service';
import { MaintenanceGuard } from '../guards/maintenance.guard';

export class CreateWorkOrderDto {
  title: string;
  description: string;
  type: 'PREVENTIVE' | 'CORRECTIVE' | 'PREDICTIVE' | 'EMERGENCY' | 'CALIBRATION' | 'INSPECTION' | 'UPGRADE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'EMERGENCY';
  equipmentId: string;
  assignedTechnicianId?: string;
  scheduledStartDate?: string;
  scheduledEndDate?: string;
  estimatedDuration?: number;
  estimatedCost?: number;
  requiredSkills?: string[];
  requiredCertifications?: string[];
  requiredTools?: any[];
  safetyRequirements?: any;
  procedureSteps?: any[];
}

export class UpdateWorkOrderDto {
  status?: 'CREATED' | 'SCHEDULED' | 'IN_PROGRESS' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED' | 'REQUIRES_APPROVAL';
  assignedTechnicianId?: string;
  actualStartDate?: string;
  actualEndDate?: string;
  workCompletedNotes?: string;
  completionChecklist?: any[];
  rootCauseAnalysis?: string;
  followUpActions?: any[];
  qualityChecks?: any[];
  customerSatisfactionScore?: number;
}

@ApiTags('Work Order Management')
@Controller('maintenance/work-orders')
@UseGuards(MaintenanceGuard)
@ApiBearerAuth()
export class WorkOrderController {
  private readonly logger = new Logger(WorkOrderController.name);

  constructor(
    private readonly workOrderService: WorkOrderService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Get all work orders',
    description: 'Retrieve work orders with filtering, sorting, and pagination',
  })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'type', required: false })
  @ApiQuery({ name: 'priority', required: false })
  @ApiQuery({ name: 'equipmentId', required: false })
  @ApiQuery({ name: 'assignedTechnicianId', required: false })
  @ApiQuery({ name: 'overdue', required: false, type: 'boolean' })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'offset', required: false })
  @ApiResponse({ status: 200, description: 'Work orders retrieved successfully' })
  async getAllWorkOrders(@Query() query: any) {
    try {
      const workOrders = await this.workOrderService.findAll(query);
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Work orders retrieved successfully',
        data: workOrders,
      };
    } catch (error) {
      this.logger.error(`Failed to retrieve work orders: ${error.message}`);
      throw new HttpException(
        'Failed to retrieve work orders',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post()
  @ApiOperation({
    summary: 'Create new work order',
    description: 'Create a new maintenance work order with AI-powered scheduling',
  })
  @ApiBody({ type: CreateWorkOrderDto })
  @ApiResponse({ status: 201, description: 'Work order created successfully' })
  async createWorkOrder(@Body() createDto: CreateWorkOrderDto) {
    try {
      this.logger.log(`Creating work order: ${createDto.title}`);
      
      const workOrder = await this.workOrderService.create(createDto);
      
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Work order created successfully',
        data: workOrder,
      };
    } catch (error) {
      this.logger.error(`Failed to create work order: ${error.message}`);
      throw new HttpException(
        'Failed to create work order',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get work order by ID',
    description: 'Retrieve detailed work order information',
  })
  @ApiParam({ name: 'id', description: 'Work Order ID' })
  @ApiResponse({ status: 200, description: 'Work order details retrieved' })
  async getWorkOrderById(@Param('id') id: string) {
    try {
      const workOrder = await this.workOrderService.findById(id);
      
      if (!workOrder) {
        throw new HttpException('Work order not found', HttpStatus.NOT_FOUND);
      }
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Work order retrieved successfully',
        data: workOrder,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        'Failed to retrieve work order',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update work order',
    description: 'Update work order status, assignments, and completion details',
  })
  @ApiParam({ name: 'id', description: 'Work Order ID' })
  @ApiBody({ type: UpdateWorkOrderDto })
  @ApiResponse({ status: 200, description: 'Work order updated successfully' })
  async updateWorkOrder(
    @Param('id') id: string,
    @Body() updateDto: UpdateWorkOrderDto,
  ) {
    try {
      const updatedWorkOrder = await this.workOrderService.update(id, updateDto);
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Work order updated successfully',
        data: updatedWorkOrder,
      };
    } catch (error) {
      throw new HttpException(
        'Failed to update work order',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post(':id/complete')
  @ApiOperation({
    summary: 'Complete work order',
    description: 'Mark work order as completed with quality checks and documentation',
  })
  @ApiParam({ name: 'id', description: 'Work Order ID' })
  @ApiResponse({ status: 200, description: 'Work order completed successfully' })
  async completeWorkOrder(
    @Param('id') id: string,
    @Body() completionData: any,
  ) {
    try {
      const completedWorkOrder = await this.workOrderService.complete(id, completionData);
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Work order completed successfully',
        data: completedWorkOrder,
      };
    } catch (error) {
      throw new HttpException(
        'Failed to complete work order',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
