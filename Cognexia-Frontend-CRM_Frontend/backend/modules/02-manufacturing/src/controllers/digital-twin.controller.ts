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
  Sse,
  MessageEvent,
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
import { Observable } from 'rxjs';
import { JwtAuthGuard } from '../../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../auth/guards/roles.guard';
import { Roles } from '../../../../auth/decorators/roles.decorator';
import { LoggingInterceptor } from '../../../common/interceptors/logging.interceptor';
import { TransformInterceptor } from '../../../common/interceptors/transform.interceptor';
import { DigitalTwinService } from '../services/digital-twin.service';
import { CreateDigitalTwinDto } from '../dto/create-digital-twin.dto';
import { UpdateDigitalTwinDto } from '../dto/update-digital-twin.dto';
import { DigitalTwinResponseDto } from '../dto/digital-twin-response.dto';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { ApiPaginatedResponse } from '../../../common/decorators/api-paginated-response.decorator';

@ApiTags('Digital Twins')
@Controller('manufacturing/digital-twins')
@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(LoggingInterceptor, TransformInterceptor)
@ApiBearerAuth()
export class DigitalTwinController {
  private readonly logger = new Logger(DigitalTwinController.name);

  constructor(private readonly digitalTwinService: DigitalTwinService) {}

  @Post()
  @Roles('admin', 'manufacturing_manager', 'digital_twin_engineer')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new digital twin',
    description: 'Creates a new digital twin with advanced simulation capabilities',
  })
  @ApiBody({ type: CreateDigitalTwinDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Digital twin created successfully',
    type: DigitalTwinResponseDto,
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Digital twin code already exists' })
  async create(
    @Body(ValidationPipe) createDigitalTwinDto: CreateDigitalTwinDto,
  ): Promise<DigitalTwinResponseDto> {
    this.logger.log(`Creating digital twin: ${createDigitalTwinDto.twinCode}`);
    return await this.digitalTwinService.create(createDigitalTwinDto);
  }

  @Get()
  @Roles('admin', 'manufacturing_manager', 'digital_twin_engineer', 'production_planner', 'operator')
  @ApiOperation({
    summary: 'Get all digital twins',
    description: 'Retrieves a paginated list of digital twins with optional filtering',
  })
  @ApiPaginatedResponse(DigitalTwinResponseDto)
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search term' })
  @ApiQuery({ name: 'status', required: false, type: String, description: 'Filter by status' })
  @ApiQuery({ name: 'type', required: false, type: String, description: 'Filter by twin type' })
  async findAll(
    @Query() paginationDto: PaginationDto,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('type') type?: string,
  ): Promise<{ data: DigitalTwinResponseDto[]; total: number; page: number; limit: number }> {
    this.logger.log('Retrieving digital twins list');
    return await this.digitalTwinService.findAll(paginationDto, { search, status, type });
  }

  @Get(':id')
  @Roles('admin', 'manufacturing_manager', 'digital_twin_engineer', 'production_planner', 'operator')
  @ApiOperation({
    summary: 'Get digital twin by ID',
    description: 'Retrieves detailed information about a specific digital twin',
  })
  @ApiParam({ name: 'id', description: 'Digital twin ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Digital twin details retrieved successfully',
    type: DigitalTwinResponseDto,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Digital twin not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<DigitalTwinResponseDto> {
    this.logger.log(`Retrieving digital twin: ${id}`);
    return await this.digitalTwinService.findOne(id);
  }

  @Put(':id')
  @Roles('admin', 'manufacturing_manager', 'digital_twin_engineer')
  @ApiOperation({
    summary: 'Update digital twin',
    description: 'Updates an existing digital twin configuration',
  })
  @ApiParam({ name: 'id', description: 'Digital twin ID' })
  @ApiBody({ type: UpdateDigitalTwinDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Digital twin updated successfully',
    type: DigitalTwinResponseDto,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Digital twin not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateDigitalTwinDto: UpdateDigitalTwinDto,
  ): Promise<DigitalTwinResponseDto> {
    this.logger.log(`Updating digital twin: ${id}`);
    return await this.digitalTwinService.update(id, updateDigitalTwinDto);
  }

  @Delete(':id')
  @Roles('admin', 'manufacturing_manager')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete digital twin',
    description: 'Deletes a digital twin (soft delete)',
  })
  @ApiParam({ name: 'id', description: 'Digital twin ID' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Digital twin deleted successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Digital twin not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    this.logger.log(`Deleting digital twin: ${id}`);
    await this.digitalTwinService.remove(id);
  }

  @Post(':id/start-simulation')
  @Roles('admin', 'manufacturing_manager', 'digital_twin_engineer', 'production_planner')
  @ApiOperation({
    summary: 'Start digital twin simulation',
    description: 'Initiates real-time simulation for the digital twin',
  })
  @ApiParam({ name: 'id', description: 'Digital twin ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Simulation started successfully' })
  async startSimulation(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() simulationParams?: any,
  ): Promise<any> {
    this.logger.log(`Starting simulation for digital twin: ${id}`);
    return await this.digitalTwinService.startSimulation(id, simulationParams);
  }

  @Post(':id/stop-simulation')
  @Roles('admin', 'manufacturing_manager', 'digital_twin_engineer', 'production_planner')
  @ApiOperation({
    summary: 'Stop digital twin simulation',
    description: 'Stops the running simulation for the digital twin',
  })
  @ApiParam({ name: 'id', description: 'Digital twin ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Simulation stopped successfully' })
  async stopSimulation(@Param('id', ParseUUIDPipe) id: string): Promise<any> {
    this.logger.log(`Stopping simulation for digital twin: ${id}`);
    return await this.digitalTwinService.stopSimulation(id);
  }

  @Post(':id/synchronize')
  @Roles('admin', 'manufacturing_manager', 'digital_twin_engineer')
  @ApiOperation({
    summary: 'Synchronize with physical asset',
    description: 'Synchronizes the digital twin with its physical counterpart',
  })
  @ApiParam({ name: 'id', description: 'Digital twin ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Synchronization completed successfully' })
  async synchronize(@Param('id', ParseUUIDPipe) id: string): Promise<any> {
    this.logger.log(`Synchronizing digital twin: ${id}`);
    return await this.digitalTwinService.synchronize(id);
  }

  @Get(':id/real-time-data')
  @Sse('digital-twin-data')
  @Roles('admin', 'manufacturing_manager', 'digital_twin_engineer', 'production_planner', 'operator')
  @ApiOperation({
    summary: 'Get real-time digital twin data',
    description: 'Returns real-time data stream from the digital twin',
  })
  @ApiParam({ name: 'id', description: 'Digital twin ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Real-time data stream' })
  getRealTimeData(@Param('id', ParseUUIDPipe) id: string): Observable<MessageEvent> {
    this.logger.log(`Starting real-time data stream for digital twin: ${id}`);
    return this.digitalTwinService.getRealTimeDataStream(id);
  }

  @Post(':id/predict')
  @Roles('admin', 'manufacturing_manager', 'digital_twin_engineer', 'production_planner')
  @ApiOperation({
    summary: 'Run predictive analysis',
    description: 'Executes predictive analysis using AI models on the digital twin',
  })
  @ApiParam({ name: 'id', description: 'Digital twin ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Prediction analysis completed' })
  async runPrediction(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() predictionParams: any,
  ): Promise<any> {
    this.logger.log(`Running prediction for digital twin: ${id}`);
    return await this.digitalTwinService.runPrediction(id, predictionParams);
  }

  @Post(':id/optimize')
  @Roles('admin', 'manufacturing_manager', 'digital_twin_engineer', 'production_planner')
  @ApiOperation({
    summary: 'Run optimization analysis',
    description: 'Executes optimization algorithms on the digital twin',
  })
  @ApiParam({ name: 'id', description: 'Digital twin ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Optimization analysis completed' })
  async runOptimization(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() optimizationParams: any,
  ): Promise<any> {
    this.logger.log(`Running optimization for digital twin: ${id}`);
    return await this.digitalTwinService.runOptimization(id, optimizationParams);
  }

  @Get(':id/analytics')
  @Roles('admin', 'manufacturing_manager', 'digital_twin_engineer', 'production_planner')
  @ApiOperation({
    summary: 'Get digital twin analytics',
    description: 'Retrieves comprehensive analytics and performance metrics',
  })
  @ApiParam({ name: 'id', description: 'Digital twin ID' })
  @ApiQuery({ name: 'period', required: false, type: String, description: 'Time period (daily, weekly, monthly)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Analytics retrieved successfully' })
  async getAnalytics(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('period') period: string = 'weekly',
  ): Promise<any> {
    this.logger.log(`Retrieving analytics for digital twin: ${id}`);
    return await this.digitalTwinService.getAnalytics(id, period);
  }

  @Post(':id/enable-quantum')
  @Roles('admin', 'manufacturing_manager', 'digital_twin_engineer')
  @ApiOperation({
    summary: 'Enable quantum computing',
    description: 'Enables quantum computing capabilities for advanced simulations',
  })
  @ApiParam({ name: 'id', description: 'Digital twin ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Quantum computing enabled successfully' })
  async enableQuantumComputing(@Param('id', ParseUUIDPipe) id: string): Promise<any> {
    this.logger.log(`Enabling quantum computing for digital twin: ${id}`);
    return await this.digitalTwinService.enableQuantumComputing(id);
  }

  @Post(':id/enable-blockchain')
  @Roles('admin', 'manufacturing_manager', 'digital_twin_engineer')
  @ApiOperation({
    summary: 'Enable blockchain integration',
    description: 'Enables blockchain for secure data integrity and traceability',
  })
  @ApiParam({ name: 'id', description: 'Digital twin ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Blockchain enabled successfully' })
  async enableBlockchain(@Param('id', ParseUUIDPipe) id: string): Promise<any> {
    this.logger.log(`Enabling blockchain for digital twin: ${id}`);
    return await this.digitalTwinService.enableBlockchain(id);
  }

  @Get(':id/health-status')
  @Roles('admin', 'manufacturing_manager', 'digital_twin_engineer', 'production_planner', 'operator')
  @ApiOperation({
    summary: 'Get digital twin health status',
    description: 'Retrieves current health and status information',
  })
  @ApiParam({ name: 'id', description: 'Digital twin ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Health status retrieved successfully' })
  async getHealthStatus(@Param('id', ParseUUIDPipe) id: string): Promise<any> {
    this.logger.log(`Retrieving health status for digital twin: ${id}`);
    return await this.digitalTwinService.getHealthStatus(id);
  }

  @Post(':id/scenario-analysis')
  @Roles('admin', 'manufacturing_manager', 'digital_twin_engineer', 'production_planner')
  @ApiOperation({
    summary: 'Run scenario analysis',
    description: 'Executes what-if scenario analysis on the digital twin',
  })
  @ApiParam({ name: 'id', description: 'Digital twin ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Scenario analysis completed' })
  async runScenarioAnalysis(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() scenarioParams: any,
  ): Promise<any> {
    this.logger.log(`Running scenario analysis for digital twin: ${id}`);
    return await this.digitalTwinService.runScenarioAnalysis(id, scenarioParams);
  }

  @Get(':id/digital-thread')
  @Roles('admin', 'manufacturing_manager', 'digital_twin_engineer', 'production_planner')
  @ApiOperation({
    summary: 'Get digital thread information',
    description: 'Retrieves digital thread data and lifecycle information',
  })
  @ApiParam({ name: 'id', description: 'Digital twin ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Digital thread data retrieved successfully' })
  async getDigitalThread(@Param('id', ParseUUIDPipe) id: string): Promise<any> {
    this.logger.log(`Retrieving digital thread for digital twin: ${id}`);
    return await this.digitalTwinService.getDigitalThread(id);
  }

  @Post(':id/security-validation')
  @Roles('admin', 'manufacturing_manager', 'digital_twin_engineer', 'security_analyst')
  @ApiOperation({
    summary: 'Run security validation',
    description: 'Performs comprehensive security validation on the digital twin',
  })
  @ApiParam({ name: 'id', description: 'Digital twin ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Security validation completed' })
  async runSecurityValidation(@Param('id', ParseUUIDPipe) id: string): Promise<any> {
    this.logger.log(`Running security validation for digital twin: ${id}`);
    return await this.digitalTwinService.runSecurityValidation(id);
  }

  @Post(':id/generate-report')
  @Roles('admin', 'manufacturing_manager', 'digital_twin_engineer', 'production_planner')
  @ApiOperation({
    summary: 'Generate comprehensive report',
    description: 'Generates a detailed report on digital twin performance and insights',
  })
  @ApiParam({ name: 'id', description: 'Digital twin ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Report generated successfully' })
  async generateReport(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() reportParams: any,
  ): Promise<any> {
    this.logger.log(`Generating report for digital twin: ${id}`);
    return await this.digitalTwinService.generateReport(id, reportParams);
  }

  @Post(':id/clone')
  @Roles('admin', 'manufacturing_manager', 'digital_twin_engineer')
  @ApiOperation({
    summary: 'Clone digital twin',
    description: 'Creates a copy of an existing digital twin with new configuration',
  })
  @ApiParam({ name: 'id', description: 'Source digital twin ID' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Digital twin cloned successfully',
    type: DigitalTwinResponseDto,
  })
  async clone(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() cloneData: { newCode: string; newName: string },
  ): Promise<DigitalTwinResponseDto> {
    this.logger.log(`Cloning digital twin: ${id}`);
    return await this.digitalTwinService.clone(id, cloneData);
  }

  @Get(':id/performance-metrics')
  @Roles('admin', 'manufacturing_manager', 'digital_twin_engineer', 'production_planner')
  @ApiOperation({
    summary: 'Get performance metrics',
    description: 'Retrieves detailed performance metrics and KPIs',
  })
  @ApiParam({ name: 'id', description: 'Digital twin ID' })
  @ApiQuery({ name: 'startDate', required: false, type: String, description: 'Start date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: 'End date (YYYY-MM-DD)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Performance metrics retrieved successfully' })
  async getPerformanceMetrics(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<any> {
    this.logger.log(`Retrieving performance metrics for digital twin: ${id}`);
    return await this.digitalTwinService.getPerformanceMetrics(id, startDate, endDate);
  }

  @Post(':id/update-model')
  @Roles('admin', 'manufacturing_manager', 'digital_twin_engineer')
  @ApiOperation({
    summary: 'Update digital model',
    description: 'Updates the digital model with new parameters or configurations',
  })
  @ApiParam({ name: 'id', description: 'Digital twin ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Digital model updated successfully' })
  async updateDigitalModel(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() modelData: any,
  ): Promise<any> {
    this.logger.log(`Updating digital model for digital twin: ${id}`);
    return await this.digitalTwinService.updateDigitalModel(id, modelData);
  }
}
