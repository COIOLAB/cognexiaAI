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
  UseInterceptors,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  ValidationPipe,
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
import { JwtAuthGuard } from '../../../../auth/guards/jwt-auth.guard';
import { RolesGuard, Role } from '../../../../auth/guards/roles.guard';
import { Roles } from '../../../../auth/decorators/roles.decorator';
import { LoggingInterceptor } from '../../../common/interceptors/logging.interceptor';
import { TransformInterceptor } from '../../../common/interceptors/transform.interceptor';
import { WorkCenterService } from '../services/work-center.service';
import { CreateWorkCenterDto } from '../dto/create-work-center.dto';
import { UpdateWorkCenterDto } from '../dto/update-work-center.dto';
import { WorkCenterResponseDto } from '../dto/work-center-response.dto';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { ApiPaginatedResponse } from '../../../common/decorators/api-paginated-response.decorator';

@ApiTags('Work Centers')
@Controller('manufacturing/work-centers')
@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(LoggingInterceptor, TransformInterceptor)
@ApiBearerAuth()
export class WorkCenterController {
  private readonly logger = new Logger(WorkCenterController.name);

  constructor(private readonly workCenterService: WorkCenterService) {}

  @Post()
  @Roles(Role.ADMIN, Role.MANUFACTURING_MANAGER, Role.PRODUCTION_PLANNER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new work center',
    description: 'Creates a new work center with specified configuration and capabilities',
  })
  @ApiBody({ type: CreateWorkCenterDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Work center created successfully',
    type: WorkCenterResponseDto,
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Work center code already exists' })
  async create(
    @Body(ValidationPipe) createWorkCenterDto: CreateWorkCenterDto,
  ): Promise<WorkCenterResponseDto> {
    this.logger.log(`Creating work center: ${createWorkCenterDto.code}`);
    return await this.workCenterService.create(createWorkCenterDto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.MANUFACTURING_MANAGER, Role.PRODUCTION_PLANNER, Role.OPERATOR, Role.QUALITY_INSPECTOR)
  @ApiOperation({
    summary: 'Get all work centers',
    description: 'Retrieves a paginated list of work centers with optional filtering',
  })
  @ApiPaginatedResponse(WorkCenterResponseDto)
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search term' })
  @ApiQuery({ name: 'status', required: false, type: String, description: 'Filter by status' })
  @ApiQuery({ name: 'type', required: false, type: String, description: 'Filter by type' })
  async findAll(
    @Query() paginationDto: PaginationDto,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('type') type?: string,
  ): Promise<{ data: WorkCenterResponseDto[]; total: number; page: number; limit: number }> {
    this.logger.log('Retrieving work centers list');
    return await this.workCenterService.findAll(paginationDto, { search, status, type });
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.MANUFACTURING_MANAGER, Role.PRODUCTION_PLANNER, Role.OPERATOR, Role.QUALITY_INSPECTOR)
  @ApiOperation({
    summary: 'Get work center by ID',
    description: 'Retrieves detailed information about a specific work center',
  })
  @ApiParam({ name: 'id', description: 'Work center ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Work center details retrieved successfully',
    type: WorkCenterResponseDto,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Work center not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<WorkCenterResponseDto> {
    this.logger.log(`Retrieving work center: ${id}`);
    return await this.workCenterService.findOne(id);
  }

  @Get('code/:code')
  @Roles(Role.ADMIN, Role.MANUFACTURING_MANAGER, Role.PRODUCTION_PLANNER, Role.OPERATOR, Role.QUALITY_INSPECTOR)
  @ApiOperation({
    summary: 'Get work center by code',
    description: 'Retrieves work center information by its unique code',
  })
  @ApiParam({ name: 'code', description: 'Work center code' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Work center details retrieved successfully',
    type: WorkCenterResponseDto,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Work center not found' })
  async findByCode(@Param('code') code: string): Promise<WorkCenterResponseDto> {
    this.logger.log(`Retrieving work center by code: ${code}`);
    return await this.workCenterService.findByCode(code);
  }

  @Put(':id')
  @Roles(Role.ADMIN, Role.MANUFACTURING_MANAGER, Role.PRODUCTION_PLANNER)
  @ApiOperation({
    summary: 'Update work center',
    description: 'Updates an existing work center with new information',
  })
  @ApiParam({ name: 'id', description: 'Work center ID' })
  @ApiBody({ type: UpdateWorkCenterDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Work center updated successfully',
    type: WorkCenterResponseDto,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Work center not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateWorkCenterDto: UpdateWorkCenterDto,
  ): Promise<WorkCenterResponseDto> {
    this.logger.log(`Updating work center: ${id}`);
    return await this.workCenterService.update(id, updateWorkCenterDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.MANUFACTURING_MANAGER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete work center',
    description: 'Deletes a work center (soft delete)',
  })
  @ApiParam({ name: 'id', description: 'Work center ID' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Work center deleted successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Work center not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    this.logger.log(`Deleting work center: ${id}`);
    await this.workCenterService.remove(id);
  }

  @Post(':id/activate')
  @Roles(Role.ADMIN, Role.MANUFACTURING_MANAGER, Role.PRODUCTION_PLANNER)
  @ApiOperation({
    summary: 'Activate work center',
    description: 'Activates a work center for production use',
  })
  @ApiParam({ name: 'id', description: 'Work center ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Work center activated successfully',
    type: WorkCenterResponseDto,
  })
  async activate(@Param('id', ParseUUIDPipe) id: string): Promise<WorkCenterResponseDto> {
    this.logger.log(`Activating work center: ${id}`);
    return await this.workCenterService.activate(id);
  }

  @Post(':id/deactivate')
  @Roles(Role.ADMIN, Role.MANUFACTURING_MANAGER, Role.PRODUCTION_PLANNER)
  @ApiOperation({
    summary: 'Deactivate work center',
    description: 'Deactivates a work center to prevent new production assignments',
  })
  @ApiParam({ name: 'id', description: 'Work center ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Work center deactivated successfully',
    type: WorkCenterResponseDto,
  })
  async deactivate(@Param('id', ParseUUIDPipe) id: string): Promise<WorkCenterResponseDto> {
    this.logger.log(`Deactivating work center: ${id}`);
    return await this.workCenterService.deactivate(id);
  }

  @Get(':id/capacity')
  @Roles(Role.ADMIN, Role.MANUFACTURING_MANAGER, Role.PRODUCTION_PLANNER, Role.OPERATOR)
  @ApiOperation({
    summary: 'Get work center capacity',
    description: 'Retrieves current capacity information and utilization metrics',
  })
  @ApiParam({ name: 'id', description: 'Work center ID' })
  @ApiQuery({ name: 'date', required: false, type: String, description: 'Specific date (YYYY-MM-DD)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Capacity information retrieved successfully' })
  async getCapacity(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('date') date?: string,
  ): Promise<any> {
    this.logger.log(`Retrieving capacity for work center: ${id}`);
    return await this.workCenterService.getCapacity(id, date);
  }

  @Get(':id/efficiency')
  @Roles(Role.ADMIN, Role.MANUFACTURING_MANAGER, Role.PRODUCTION_PLANNER)
  @ApiOperation({
    summary: 'Get work center efficiency metrics',
    description: 'Retrieves efficiency and performance metrics for the work center',
  })
  @ApiParam({ name: 'id', description: 'Work center ID' })
  @ApiQuery({ name: 'startDate', required: false, type: String, description: 'Start date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: 'End date (YYYY-MM-DD)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Efficiency metrics retrieved successfully' })
  async getEfficiency(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<any> {
    this.logger.log(`Retrieving efficiency metrics for work center: ${id}`);
    return await this.workCenterService.getEfficiency(id, startDate, endDate);
  }

  @Get(':id/schedule')
  @Roles(Role.ADMIN, Role.MANUFACTURING_MANAGER, Role.PRODUCTION_PLANNER, Role.OPERATOR)
  @ApiOperation({
    summary: 'Get work center schedule',
    description: 'Retrieves current and upcoming work orders scheduled for the work center',
  })
  @ApiParam({ name: 'id', description: 'Work center ID' })
  @ApiQuery({ name: 'days', required: false, type: Number, description: 'Number of days to look ahead' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Schedule retrieved successfully' })
  async getSchedule(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('days') days: number = 7,
  ): Promise<any> {
    this.logger.log(`Retrieving schedule for work center: ${id}`);
    return await this.workCenterService.getSchedule(id, days);
  }

  @Post(':id/maintenance')
  @Roles(Role.ADMIN, Role.MANUFACTURING_MANAGER, Role.MAINTENANCE_TECHNICIAN)
  @ApiOperation({
    summary: 'Schedule maintenance',
    description: 'Schedules maintenance activities for the work center',
  })
  @ApiParam({ name: 'id', description: 'Work center ID' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Maintenance scheduled successfully' })
  async scheduleMaintenance(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() maintenanceData: any,
  ): Promise<any> {
    this.logger.log(`Scheduling maintenance for work center: ${id}`);
    return await this.workCenterService.scheduleMaintenance(id, maintenanceData);
  }

  @Get(':id/quality-metrics')
  @Roles(Role.ADMIN, Role.MANUFACTURING_MANAGER, Role.QUALITY_INSPECTOR, Role.PRODUCTION_PLANNER)
  @ApiOperation({
    summary: 'Get quality metrics',
    description: 'Retrieves quality performance metrics for the work center',
  })
  @ApiParam({ name: 'id', description: 'Work center ID' })
  @ApiQuery({ name: 'period', required: false, type: String, description: 'Time period (daily, weekly, monthly)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Quality metrics retrieved successfully' })
  async getQualityMetrics(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('period') period: string = 'weekly',
  ): Promise<any> {
    this.logger.log(`Retrieving quality metrics for work center: ${id}`);
    return await this.workCenterService.getQualityMetrics(id, period);
  }

  @Post(':id/emergency-stop')
  @Roles(Role.ADMIN, Role.MANUFACTURING_MANAGER, Role.OPERATOR, Role.SAFETY_SUPERVISOR)
  @ApiOperation({
    summary: 'Emergency stop',
    description: 'Initiates emergency stop procedures for the work center',
  })
  @ApiParam({ name: 'id', description: 'Work center ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Emergency stop initiated successfully' })
  async emergencyStop(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() stopData: any,
  ): Promise<any> {
    this.logger.log(`Emergency stop initiated for work center: ${id}`);
    return await this.workCenterService.emergencyStop(id, stopData);
  }

  @Post(':id/clone')
  @Roles(Role.ADMIN, Role.MANUFACTURING_MANAGER)
  @ApiOperation({
    summary: 'Clone work center',
    description: 'Creates a copy of an existing work center with new code',
  })
  @ApiParam({ name: 'id', description: 'Source work center ID' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Work center cloned successfully',
    type: WorkCenterResponseDto,
  })
  async clone(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() cloneData: { newCode: string; newName: string },
  ): Promise<WorkCenterResponseDto> {
    this.logger.log(`Cloning work center: ${id}`);
    return await this.workCenterService.clone(id, cloneData);
  }
}
