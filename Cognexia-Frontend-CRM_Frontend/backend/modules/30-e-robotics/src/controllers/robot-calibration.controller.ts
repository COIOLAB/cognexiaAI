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

import { RobotCalibrationService } from '../services/robot-calibration.service';
import { RobotAuthGuard } from '../guards/robot-auth.guard';
import { RobotRoleGuard } from '../guards/robot-role.guard';

@ApiTags('Robot Calibration')
@Controller('robotics/calibration')
@UseGuards(RobotAuthGuard, RobotRoleGuard)
@ApiBearerAuth()
export class RobotCalibrationController {
  private readonly logger = new Logger(RobotCalibrationController.name);

  constructor(
    private readonly calibrationService: RobotCalibrationService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Get calibration history',
    description: 'Retrieve calibration history for robots',
  })
  @ApiQuery({ name: 'robotId', required: false })
  @ApiQuery({ name: 'status', required: false })
  async getCalibrationHistory(
    @Query('robotId') robotId?: string,
    @Query('status') status?: string,
  ) {
    try {
      const history = await this.calibrationService.getHistory({
        robotId,
        status,
      });

      return {
        statusCode: HttpStatus.OK,
        message: 'Calibration history retrieved successfully',
        data: history,
      };
    } catch (error) {
      this.logger.error(
        `Failed to retrieve calibration history: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new HttpException(
        'Failed to retrieve calibration history',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('schedule')
  @ApiOperation({
    summary: 'Schedule calibration',
    description: 'Schedule a new calibration for a robot',
  })
  @ApiBody({ type: Object })
  async scheduleCalibration(@Body() calibrationDto: any) {
    try {
      const calibration = await this.calibrationService.schedule(calibrationDto);

      return {
        statusCode: HttpStatus.CREATED,
        message: 'Calibration scheduled successfully',
        data: calibration,
      };
    } catch (error) {
      this.logger.error(
        `Failed to schedule calibration: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new HttpException(
        'Failed to schedule calibration',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post(':id/start')
  @ApiOperation({
    summary: 'Start calibration',
    description: 'Start a scheduled calibration process',
  })
  @ApiParam({ name: 'id', description: 'Calibration ID' })
  async startCalibration(@Param('id') id: string) {
    try {
      const calibration = await this.calibrationService.start(id);

      return {
        statusCode: HttpStatus.OK,
        message: 'Calibration started successfully',
        data: calibration,
      };
    } catch (error) {
      this.logger.error(
        `Failed to start calibration: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new HttpException(
        'Failed to start calibration',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id/status')
  @ApiOperation({
    summary: 'Update calibration status',
    description: 'Update the status of a calibration process',
  })
  @ApiParam({ name: 'id', description: 'Calibration ID' })
  @ApiBody({ type: Object })
  async updateCalibrationStatus(
    @Param('id') id: string,
    @Body() statusUpdate: any,
  ) {
    try {
      const calibration = await this.calibrationService.updateStatus(id, statusUpdate);

      return {
        statusCode: HttpStatus.OK,
        message: 'Calibration status updated successfully',
        data: calibration,
      };
    } catch (error) {
      this.logger.error(
        `Failed to update calibration status: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new HttpException(
        'Failed to update calibration status',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id/results')
  @ApiOperation({
    summary: 'Get calibration results',
    description: 'Retrieve results and metrics from a calibration process',
  })
  @ApiParam({ name: 'id', description: 'Calibration ID' })
  async getCalibrationResults(@Param('id') id: string) {
    try {
      const results = await this.calibrationService.getResults(id);

      return {
        statusCode: HttpStatus.OK,
        message: 'Calibration results retrieved successfully',
        data: results,
      };
    } catch (error) {
      this.logger.error(
        `Failed to retrieve calibration results: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new HttpException(
        'Failed to retrieve calibration results',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post(':id/verify')
  @ApiOperation({
    summary: 'Verify calibration',
    description: 'Verify the results of a completed calibration',
  })
  @ApiParam({ name: 'id', description: 'Calibration ID' })
  async verifyCalibration(@Param('id') id: string) {
    try {
      const verification = await this.calibrationService.verify(id);

      return {
        statusCode: HttpStatus.OK,
        message: 'Calibration verification completed successfully',
        data: verification,
      };
    } catch (error) {
      this.logger.error(
        `Failed to verify calibration: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new HttpException(
        'Failed to verify calibration',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post(':id/apply')
  @ApiOperation({
    summary: 'Apply calibration',
    description: 'Apply verified calibration results to the robot',
  })
  @ApiParam({ name: 'id', description: 'Calibration ID' })
  async applyCalibration(@Param('id') id: string) {
    try {
      const result = await this.calibrationService.apply(id);

      return {
        statusCode: HttpStatus.OK,
        message: 'Calibration applied successfully',
        data: result,
      };
    } catch (error) {
      this.logger.error(
        `Failed to apply calibration: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new HttpException(
        'Failed to apply calibration',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
