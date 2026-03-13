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

import { RobotFleetService } from '../services/robot-fleet.service';
import { RobotAuthGuard } from '../guards/robot-auth.guard';
import { RobotRoleGuard } from '../guards/robot-role.guard';

@ApiTags('Robot Fleet Management')
@Controller('robotics/fleet')
@UseGuards(RobotAuthGuard, RobotRoleGuard)
@ApiBearerAuth()
export class RobotFleetController {
  private readonly logger = new Logger(RobotFleetController.name);

  constructor(
    private readonly fleetService: RobotFleetService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Get all robot fleets',
    description: 'Retrieve all robot fleets with optional filtering',
  })
  @ApiQuery({ name: 'facilityId', required: false })
  @ApiQuery({ name: 'fleetType', required: false })
  @ApiQuery({ name: 'status', required: false })
  async getAllFleets(
    @Query('facilityId') facilityId?: string,
    @Query('fleetType') fleetType?: string,
    @Query('status') status?: string,
  ) {
    try {
      const fleets = await this.fleetService.findAll({
        facilityId,
        fleetType,
        status,
      });

      return {
        statusCode: HttpStatus.OK,
        message: 'Robot fleets retrieved successfully',
        data: fleets,
      };
    } catch (error) {
      this.logger.error(
        `Failed to retrieve robot fleets: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new HttpException(
        'Failed to retrieve robot fleets',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get fleet by ID',
    description: 'Retrieve detailed fleet information including all robots and tasks',
  })
  @ApiParam({ name: 'id', description: 'Fleet ID' })
  async getFleetById(@Param('id') id: string) {
    try {
      const fleet = await this.fleetService.findById(id);

      return {
        statusCode: HttpStatus.OK,
        message: 'Fleet details retrieved successfully',
        data: fleet,
      };
    } catch (error) {
      this.logger.error(
        `Failed to retrieve fleet details: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to retrieve fleet details',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post()
  @ApiOperation({
    summary: 'Create new fleet',
    description: 'Create a new robot fleet',
  })
  @ApiBody({ type: Object })
  async createFleet(@Body() createFleetDto: any) {
    try {
      const fleet = await this.fleetService.create(createFleetDto);

      return {
        statusCode: HttpStatus.CREATED,
        message: 'Fleet created successfully',
        data: fleet,
      };
    } catch (error) {
      this.logger.error(
        `Failed to create fleet: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new HttpException(
        'Failed to create fleet',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update fleet',
    description: 'Update fleet configuration and settings',
  })
  @ApiParam({ name: 'id', description: 'Fleet ID' })
  @ApiBody({ type: Object })
  async updateFleet(
    @Param('id') id: string,
    @Body() updateFleetDto: any,
  ) {
    try {
      const fleet = await this.fleetService.update(id, updateFleetDto);

      return {
        statusCode: HttpStatus.OK,
        message: 'Fleet updated successfully',
        data: fleet,
      };
    } catch (error) {
      this.logger.error(
        `Failed to update fleet: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new HttpException(
        'Failed to update fleet',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete fleet',
    description: 'Delete a robot fleet',
  })
  @ApiParam({ name: 'id', description: 'Fleet ID' })
  async deleteFleet(@Param('id') id: string) {
    try {
      await this.fleetService.delete(id);

      return {
        statusCode: HttpStatus.OK,
        message: 'Fleet deleted successfully',
      };
    } catch (error) {
      this.logger.error(
        `Failed to delete fleet: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new HttpException(
        'Failed to delete fleet',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id/status')
  @ApiOperation({
    summary: 'Get fleet status',
    description: 'Get real-time status of all robots in the fleet',
  })
  @ApiParam({ name: 'id', description: 'Fleet ID' })
  async getFleetStatus(@Param('id') id: string) {
    try {
      const status = await this.fleetService.getFleetStatus(id);

      return {
        statusCode: HttpStatus.OK,
        message: 'Fleet status retrieved successfully',
        data: status,
      };
    } catch (error) {
      this.logger.error(
        `Failed to retrieve fleet status: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new HttpException(
        'Failed to retrieve fleet status',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post(':id/assign-task')
  @ApiOperation({
    summary: 'Assign task to fleet',
    description: 'Assign a task to be executed by the fleet',
  })
  @ApiParam({ name: 'id', description: 'Fleet ID' })
  @ApiBody({ type: Object })
  async assignTask(
    @Param('id') id: string,
    @Body() taskDto: any,
  ) {
    try {
      const task = await this.fleetService.assignTask(id, taskDto);

      return {
        statusCode: HttpStatus.OK,
        message: 'Task assigned successfully',
        data: task,
      };
    } catch (error) {
      this.logger.error(
        `Failed to assign task: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new HttpException(
        'Failed to assign task',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id/performance')
  @ApiOperation({
    summary: 'Get fleet performance metrics',
    description: 'Get performance metrics and analytics for the fleet',
  })
  @ApiParam({ name: 'id', description: 'Fleet ID' })
  @ApiQuery({ name: 'period', required: false, description: 'Time period for metrics (1h, 24h, 7d, 30d)' })
  async getFleetPerformance(
    @Param('id') id: string,
    @Query('period') period?: string,
  ) {
    try {
      const metrics = await this.fleetService.getPerformanceMetrics(id, period);

      return {
        statusCode: HttpStatus.OK,
        message: 'Fleet performance metrics retrieved successfully',
        data: metrics,
      };
    } catch (error) {
      this.logger.error(
        `Failed to retrieve fleet performance metrics: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new HttpException(
        'Failed to retrieve fleet performance metrics',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
