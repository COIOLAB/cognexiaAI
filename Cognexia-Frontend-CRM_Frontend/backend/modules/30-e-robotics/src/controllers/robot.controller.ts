import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus,
  HttpCode,
  ParseUUIDPipe,
  ValidationPipe,
  UsePipes,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
  Logger
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiProduces
} from '@nestjs/swagger';
import { RobotService } from '../services/robot.service';
import { RobotAuthGuard } from '../guards/robot-auth.guard';
import { RobotRoleGuard } from '../guards/robot-role.guard';
import { RobotSafetyGuard } from '../guards/robot-safety.guard';
import {
  CreateRobotDto,
  UpdateRobotDto,
  RobotQueryDto,
  RobotResponseDto,
  RobotListResponseDto,
  RobotStatusUpdateDto,
  RobotPositionUpdateDto,
  RobotPerformanceUpdateDto,
  RobotErrorReportDto,
  RobotMaintenanceScheduleDto,
  RobotDiagnosticsDto,
  RobotCalibrationDto
} from '../dto/robot.dto';
import { Robot, RobotStatus } from '../entities/robot.entity';

@ApiTags('Robots')
@ApiBearerAuth()
@Controller('robots')
@UseGuards(RobotAuthGuard, RobotRoleGuard)
export class RobotController {
  private readonly logger = new Logger(RobotController.name);

  constructor(private readonly robotService: RobotService) {}

  // CRUD Operations
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new robot',
    description: 'Register a new robot in the system with comprehensive configuration'
  })
  @ApiBody({ type: CreateRobotDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Robot successfully created',
    type: RobotResponseDto
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid robot data'
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Robot with serial number already exists'
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async createRobot(@Body() createRobotDto: CreateRobotDto): Promise<RobotResponseDto> {
    try {
      this.logger.log(`Creating robot: ${createRobotDto.name} (${createRobotDto.serialNumber})`);
      const robot = await this.robotService.create(createRobotDto);
      this.logger.log(`Robot created successfully: ${robot.id}`);
      return this.mapToResponseDto(robot);
    } catch (error) {
      this.logger.error(`Failed to create robot: ${error.message}`, error.stack);
      if (error.code === '23505') { // Unique constraint violation
        throw new BadRequestException(`Robot with serial number ${createRobotDto.serialNumber} already exists`);
      }
      throw new InternalServerErrorException('Failed to create robot');
    }
  }

  @Get()
  @ApiOperation({
    summary: 'Get all robots',
    description: 'Retrieve all robots with filtering, sorting, and pagination'
  })
  @ApiQuery({ type: RobotQueryDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of robots retrieved successfully',
    type: RobotListResponseDto
  })
  async findAll(@Query() query: RobotQueryDto): Promise<RobotListResponseDto> {
    try {
      this.logger.log('Retrieving robots list');
      const result = await this.robotService.findAll(query);
      return {
        robots: result.data.map(robot => this.mapToResponseDto(robot)),
        total: result.total,
        page: query.page || 1,
        limit: query.limit || 10,
        totalPages: Math.ceil(result.total / (query.limit || 10))
      };
    } catch (error) {
      this.logger.error(`Failed to retrieve robots: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to retrieve robots');
    }
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get robot by ID',
    description: 'Retrieve detailed information about a specific robot'
  })
  @ApiParam({
    name: 'id',
    description: 'Robot ID',
    type: 'string',
    format: 'uuid'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Robot retrieved successfully',
    type: RobotResponseDto
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Robot not found'
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<RobotResponseDto> {
    try {
      this.logger.log(`Retrieving robot: ${id}`);
      const robot = await this.robotService.findOne(id);
      if (!robot) {
        throw new NotFoundException(`Robot with ID ${id} not found`);
      }
      return this.mapToResponseDto(robot);
    } catch (error) {
      this.logger.error(`Failed to retrieve robot ${id}: ${error.message}`, error.stack);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to retrieve robot');
    }
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update robot',
    description: 'Update robot configuration and properties'
  })
  @ApiParam({
    name: 'id',
    description: 'Robot ID',
    type: 'string',
    format: 'uuid'
  })
  @ApiBody({ type: UpdateRobotDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Robot updated successfully',
    type: RobotResponseDto
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Robot not found'
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateRobotDto: UpdateRobotDto
  ): Promise<RobotResponseDto> {
    try {
      this.logger.log(`Updating robot: ${id}`);
      const robot = await this.robotService.update(id, updateRobotDto);
      if (!robot) {
        throw new NotFoundException(`Robot with ID ${id} not found`);
      }
      this.logger.log(`Robot updated successfully: ${id}`);
      return this.mapToResponseDto(robot);
    } catch (error) {
      this.logger.error(`Failed to update robot ${id}: ${error.message}`, error.stack);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update robot');
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete robot',
    description: 'Remove a robot from the system'
  })
  @ApiParam({
    name: 'id',
    description: 'Robot ID',
    type: 'string',
    format: 'uuid'
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Robot deleted successfully'
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Robot not found'
  })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    try {
      this.logger.log(`Deleting robot: ${id}`);
      const success = await this.robotService.remove(id);
      if (!success) {
        throw new NotFoundException(`Robot with ID ${id} not found`);
      }
      this.logger.log(`Robot deleted successfully: ${id}`);
    } catch (error) {
      this.logger.error(`Failed to delete robot ${id}: ${error.message}`, error.stack);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete robot');
    }
  }

  // Status Operations
  @Patch(':id/status')
  @UseGuards(RobotSafetyGuard)
  @ApiOperation({
    summary: 'Update robot status',
    description: 'Change the operational status of a robot'
  })
  @ApiParam({
    name: 'id',
    description: 'Robot ID',
    type: 'string',
    format: 'uuid'
  })
  @ApiBody({ type: RobotStatusUpdateDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Robot status updated successfully',
    type: RobotResponseDto
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Robot not found'
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Status change not allowed due to safety constraints'
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() statusUpdate: RobotStatusUpdateDto
  ): Promise<RobotResponseDto> {
    try {
      this.logger.log(`Updating status for robot ${id} to ${statusUpdate.status}`);
      const robot = await this.robotService.updateStatus(id, statusUpdate.status, statusUpdate.reason);
      if (!robot) {
        throw new NotFoundException(`Robot with ID ${id} not found`);
      }
      this.logger.log(`Robot status updated successfully: ${id}`);
      return this.mapToResponseDto(robot);
    } catch (error) {
      this.logger.error(`Failed to update robot status ${id}: ${error.message}`, error.stack);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update robot status');
    }
  }

  @Post(':id/emergency-stop')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Emergency stop robot',
    description: 'Immediately stop a robot and set emergency stop status'
  })
  @ApiParam({
    name: 'id',
    description: 'Robot ID',
    type: 'string',
    format: 'uuid'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Emergency stop activated successfully',
    type: RobotResponseDto
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Robot not found'
  })
  async emergencyStop(@Param('id', ParseUUIDPipe) id: string): Promise<RobotResponseDto> {
    try {
      this.logger.warn(`Emergency stop activated for robot: ${id}`);
      const robot = await this.robotService.emergencyStop(id);
      if (!robot) {
        throw new NotFoundException(`Robot with ID ${id} not found`);
      }
      this.logger.warn(`Emergency stop completed for robot: ${id}`);
      return this.mapToResponseDto(robot);
    } catch (error) {
      this.logger.error(`Failed to execute emergency stop for robot ${id}: ${error.message}`, error.stack);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to execute emergency stop');
    }
  }

  @Post(':id/reset')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reset robot',
    description: 'Reset robot to idle state and clear errors'
  })
  @ApiParam({
    name: 'id',
    description: 'Robot ID',
    type: 'string',
    format: 'uuid'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Robot reset successfully',
    type: RobotResponseDto
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Robot not found'
  })
  async reset(@Param('id', ParseUUIDPipe) id: string): Promise<RobotResponseDto> {
    try {
      this.logger.log(`Resetting robot: ${id}`);
      const robot = await this.robotService.reset(id);
      if (!robot) {
        throw new NotFoundException(`Robot with ID ${id} not found`);
      }
      this.logger.log(`Robot reset successfully: ${id}`);
      return this.mapToResponseDto(robot);
    } catch (error) {
      this.logger.error(`Failed to reset robot ${id}: ${error.message}`, error.stack);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to reset robot');
    }
  }

  // Position and Movement Operations
  @Patch(':id/position')
  @ApiOperation({
    summary: 'Update robot position',
    description: 'Update the current position and joint states of a robot'
  })
  @ApiParam({
    name: 'id',
    description: 'Robot ID',
    type: 'string',
    format: 'uuid'
  })
  @ApiBody({ type: RobotPositionUpdateDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Robot position updated successfully',
    type: RobotResponseDto
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Robot not found'
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async updatePosition(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() positionUpdate: RobotPositionUpdateDto
  ): Promise<RobotResponseDto> {
    try {
      this.logger.log(`Updating position for robot: ${id}`);
      const robot = await this.robotService.updatePosition(id, positionUpdate);
      if (!robot) {
        throw new NotFoundException(`Robot with ID ${id} not found`);
      }
      return this.mapToResponseDto(robot);
    } catch (error) {
      this.logger.error(`Failed to update robot position ${id}: ${error.message}`, error.stack);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update robot position');
    }
  }

  @Post(':id/move-to-home')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RobotSafetyGuard)
  @ApiOperation({
    summary: 'Move robot to home position',
    description: 'Command robot to move to its predefined home position'
  })
  @ApiParam({
    name: 'id',
    description: 'Robot ID',
    type: 'string',
    format: 'uuid'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Robot moving to home position',
    type: RobotResponseDto
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Robot not found'
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Robot is not operational or home position not defined'
  })
  async moveToHome(@Param('id', ParseUUIDPipe) id: string): Promise<RobotResponseDto> {
    try {
      this.logger.log(`Moving robot to home position: ${id}`);
      const robot = await this.robotService.moveToHome(id);
      if (!robot) {
        throw new NotFoundException(`Robot with ID ${id} not found`);
      }
      return this.mapToResponseDto(robot);
    } catch (error) {
      this.logger.error(`Failed to move robot to home ${id}: ${error.message}`, error.stack);
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error.message.includes('not operational') || error.message.includes('home position')) {
        throw new BadRequestException(error.message);
      }
      throw new InternalServerErrorException('Failed to move robot to home position');
    }
  }

  // Performance and Monitoring
  @Patch(':id/performance')
  @ApiOperation({
    summary: 'Update robot performance metrics',
    description: 'Update performance data and utilization metrics for a robot'
  })
  @ApiParam({
    name: 'id',
    description: 'Robot ID',
    type: 'string',
    format: 'uuid'
  })
  @ApiBody({ type: RobotPerformanceUpdateDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Robot performance updated successfully',
    type: RobotResponseDto
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Robot not found'
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async updatePerformance(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() performanceUpdate: RobotPerformanceUpdateDto
  ): Promise<RobotResponseDto> {
    try {
      this.logger.log(`Updating performance for robot: ${id}`);
      const robot = await this.robotService.updatePerformance(id, performanceUpdate);
      if (!robot) {
        throw new NotFoundException(`Robot with ID ${id} not found`);
      }
      return this.mapToResponseDto(robot);
    } catch (error) {
      this.logger.error(`Failed to update robot performance ${id}: ${error.message}`, error.stack);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update robot performance');
    }
  }

  @Get(':id/diagnostics')
  @ApiOperation({
    summary: 'Get robot diagnostics',
    description: 'Retrieve detailed diagnostic information for a robot'
  })
  @ApiParam({
    name: 'id',
    description: 'Robot ID',
    type: 'string',
    format: 'uuid'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Robot diagnostics retrieved successfully'
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Robot not found'
  })
  async getDiagnostics(@Param('id', ParseUUIDPipe) id: string) {
    try {
      this.logger.log(`Retrieving diagnostics for robot: ${id}`);
      const diagnostics = await this.robotService.getDiagnostics(id);
      if (!diagnostics) {
        throw new NotFoundException(`Robot with ID ${id} not found`);
      }
      return diagnostics;
    } catch (error) {
      this.logger.error(`Failed to retrieve robot diagnostics ${id}: ${error.message}`, error.stack);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to retrieve robot diagnostics');
    }
  }

  @Patch(':id/diagnostics')
  @ApiOperation({
    summary: 'Update robot diagnostics',
    description: 'Update diagnostic data for a robot'
  })
  @ApiParam({
    name: 'id',
    description: 'Robot ID',
    type: 'string',
    format: 'uuid'
  })
  @ApiBody({ type: RobotDiagnosticsDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Robot diagnostics updated successfully',
    type: RobotResponseDto
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Robot not found'
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateDiagnostics(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() diagnosticsUpdate: RobotDiagnosticsDto
  ): Promise<RobotResponseDto> {
    try {
      this.logger.log(`Updating diagnostics for robot: ${id}`);
      const robot = await this.robotService.updateDiagnostics(id, diagnosticsUpdate);
      if (!robot) {
        throw new NotFoundException(`Robot with ID ${id} not found`);
      }
      return this.mapToResponseDto(robot);
    } catch (error) {
      this.logger.error(`Failed to update robot diagnostics ${id}: ${error.message}`, error.stack);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update robot diagnostics');
    }
  }

  // Error Handling
  @Post(':id/error')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Report robot error',
    description: 'Report an error condition for a robot'
  })
  @ApiParam({
    name: 'id',
    description: 'Robot ID',
    type: 'string',
    format: 'uuid'
  })
  @ApiBody({ type: RobotErrorReportDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Error reported successfully',
    type: RobotResponseDto
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Robot not found'
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async reportError(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() errorReport: RobotErrorReportDto
  ): Promise<RobotResponseDto> {
    try {
      this.logger.warn(`Error reported for robot ${id}: ${errorReport.error.message}`);
      const robot = await this.robotService.reportError(id, errorReport.error);
      if (!robot) {
        throw new NotFoundException(`Robot with ID ${id} not found`);
      }
      return this.mapToResponseDto(robot);
    } catch (error) {
      this.logger.error(`Failed to report robot error ${id}: ${error.message}`, error.stack);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to report robot error');
    }
  }

  @Delete(':id/error')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Clear robot error',
    description: 'Clear the current error state of a robot'
  })
  @ApiParam({
    name: 'id',
    description: 'Robot ID',
    type: 'string',
    format: 'uuid'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Error cleared successfully',
    type: RobotResponseDto
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Robot not found'
  })
  async clearError(@Param('id', ParseUUIDPipe) id: string): Promise<RobotResponseDto> {
    try {
      this.logger.log(`Clearing error for robot: ${id}`);
      const robot = await this.robotService.clearError(id);
      if (!robot) {
        throw new NotFoundException(`Robot with ID ${id} not found`);
      }
      this.logger.log(`Error cleared for robot: ${id}`);
      return this.mapToResponseDto(robot);
    } catch (error) {
      this.logger.error(`Failed to clear robot error ${id}: ${error.message}`, error.stack);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to clear robot error');
    }
  }

  // Maintenance Operations
  @Patch(':id/maintenance/schedule')
  @ApiOperation({
    summary: 'Schedule robot maintenance',
    description: 'Schedule the next maintenance for a robot'
  })
  @ApiParam({
    name: 'id',
    description: 'Robot ID',
    type: 'string',
    format: 'uuid'
  })
  @ApiBody({ type: RobotMaintenanceScheduleDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Maintenance scheduled successfully',
    type: RobotResponseDto
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Robot not found'
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async scheduleMaintenance(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() maintenanceSchedule: RobotMaintenanceScheduleDto
  ): Promise<RobotResponseDto> {
    try {
      this.logger.log(`Scheduling maintenance for robot ${id} on ${maintenanceSchedule.nextMaintenanceDate}`);
      const robot = await this.robotService.scheduleMaintenance(id, maintenanceSchedule);
      if (!robot) {
        throw new NotFoundException(`Robot with ID ${id} not found`);
      }
      return this.mapToResponseDto(robot);
    } catch (error) {
      this.logger.error(`Failed to schedule maintenance for robot ${id}: ${error.message}`, error.stack);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to schedule maintenance');
    }
  }

  @Post(':id/maintenance/complete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Complete robot maintenance',
    description: 'Mark maintenance as completed for a robot'
  })
  @ApiParam({
    name: 'id',
    description: 'Robot ID',
    type: 'string',
    format: 'uuid'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Maintenance completed successfully',
    type: RobotResponseDto
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Robot not found'
  })
  async completeMaintenance(@Param('id', ParseUUIDPipe) id: string): Promise<RobotResponseDto> {
    try {
      this.logger.log(`Completing maintenance for robot: ${id}`);
      const robot = await this.robotService.completeMaintenance(id);
      if (!robot) {
        throw new NotFoundException(`Robot with ID ${id} not found`);
      }
      this.logger.log(`Maintenance completed for robot: ${id}`);
      return this.mapToResponseDto(robot);
    } catch (error) {
      this.logger.error(`Failed to complete maintenance for robot ${id}: ${error.message}`, error.stack);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to complete maintenance');
    }
  }

  // Calibration Operations
  @Post(':id/calibration')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Start robot calibration',
    description: 'Begin calibration process for a robot'
  })
  @ApiParam({
    name: 'id',
    description: 'Robot ID',
    type: 'string',
    format: 'uuid'
  })
  @ApiBody({ type: RobotCalibrationDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Calibration started successfully',
    type: RobotResponseDto
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Robot not found'
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async startCalibration(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() calibrationDto: RobotCalibrationDto
  ): Promise<RobotResponseDto> {
    try {
      this.logger.log(`Starting calibration for robot: ${id}`);
      const robot = await this.robotService.startCalibration(id, calibrationDto);
      if (!robot) {
        throw new NotFoundException(`Robot with ID ${id} not found`);
      }
      return this.mapToResponseDto(robot);
    } catch (error) {
      this.logger.error(`Failed to start calibration for robot ${id}: ${error.message}`, error.stack);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to start calibration');
    }
  }

  // Connection Operations
  @Post(':id/connect')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Connect to robot',
    description: 'Establish connection with a robot'
  })
  @ApiParam({
    name: 'id',
    description: 'Robot ID',
    type: 'string',
    format: 'uuid'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Connection established successfully',
    type: RobotResponseDto
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Robot not found'
  })
  async connect(@Param('id', ParseUUIDPipe) id: string): Promise<RobotResponseDto> {
    try {
      this.logger.log(`Connecting to robot: ${id}`);
      const robot = await this.robotService.connect(id);
      if (!robot) {
        throw new NotFoundException(`Robot with ID ${id} not found`);
      }
      this.logger.log(`Connected to robot: ${id}`);
      return this.mapToResponseDto(robot);
    } catch (error) {
      this.logger.error(`Failed to connect to robot ${id}: ${error.message}`, error.stack);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to connect to robot');
    }
  }

  @Post(':id/disconnect')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Disconnect from robot',
    description: 'Disconnect from a robot'
  })
  @ApiParam({
    name: 'id',
    description: 'Robot ID',
    type: 'string',
    format: 'uuid'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Disconnected successfully',
    type: RobotResponseDto
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Robot not found'
  })
  async disconnect(@Param('id', ParseUUIDPipe) id: string): Promise<RobotResponseDto> {
    try {
      this.logger.log(`Disconnecting from robot: ${id}`);
      const robot = await this.robotService.disconnect(id);
      if (!robot) {
        throw new NotFoundException(`Robot with ID ${id} not found`);
      }
      this.logger.log(`Disconnected from robot: ${id}`);
      return this.mapToResponseDto(robot);
    } catch (error) {
      this.logger.error(`Failed to disconnect from robot ${id}: ${error.message}`, error.stack);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to disconnect from robot');
    }
  }

  // Statistics and Analytics
  @Get('statistics/overview')
  @ApiOperation({
    summary: 'Get robots statistics',
    description: 'Get overall statistics and metrics for all robots'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Statistics retrieved successfully'
  })
  async getStatistics() {
    try {
      this.logger.log('Retrieving robot statistics');
      return await this.robotService.getStatistics();
    } catch (error) {
      this.logger.error(`Failed to retrieve robot statistics: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to retrieve statistics');
    }
  }

  @Get('health/check')
  @ApiOperation({
    summary: 'Health check for all robots',
    description: 'Get health status for all robots'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Health check completed'
  })
  async healthCheck() {
    try {
      this.logger.log('Performing robot health check');
      return await this.robotService.performHealthCheck();
    } catch (error) {
      this.logger.error(`Failed to perform health check: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to perform health check');
    }
  }

  // Helper method to map entity to response DTO
  private mapToResponseDto(robot: Robot): RobotResponseDto {
    return {
      id: robot.id,
      serialNumber: robot.serialNumber,
      name: robot.name,
      description: robot.description,
      manufacturer: robot.manufacturer,
      model: robot.model,
      version: robot.version,
      type: robot.type,
      status: robot.status,
      capabilities: robot.capabilities,
      currentPosition: robot.currentPosition,
      isConnected: robot.isConnected,
      totalOperatingHours: robot.totalOperatingHours,
      totalCycles: robot.totalCycles,
      currentUtilization: robot.currentUtilization,
      createdAt: robot.createdAt,
      updatedAt: robot.updatedAt
    };
  }
}
