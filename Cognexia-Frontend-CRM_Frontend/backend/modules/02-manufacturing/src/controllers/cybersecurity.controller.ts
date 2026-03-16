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
import { RolesGuard } from '../../../../auth/guards/roles.guard';
import { Roles } from '../../../../auth/decorators/roles.decorator';
import { LoggingInterceptor } from '../../../common/interceptors/logging.interceptor';
import { TransformInterceptor } from '../../../common/interceptors/transform.interceptor';
import { CybersecurityService } from '../services/cybersecurity.service';
import { CreateCybersecurityDto } from '../dto/create-cybersecurity.dto';
import { UpdateCybersecurityDto } from '../dto/update-cybersecurity.dto';
import { CybersecurityResponseDto } from '../dto/cybersecurity-response.dto';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { ApiPaginatedResponse } from '../../../common/decorators/api-paginated-response.decorator';

@ApiTags('Cybersecurity')
@Controller('manufacturing/cybersecurity')
@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(LoggingInterceptor, TransformInterceptor)
@ApiBearerAuth()
export class CybersecurityController {
  private readonly logger = new Logger(CybersecurityController.name);

  constructor(private readonly cybersecurityService: CybersecurityService) {}

  @Post()
  @Roles('admin', 'security_analyst', 'cybersecurity_manager')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new cybersecurity configuration',
    description: 'Creates a new cybersecurity setup with advanced Industry 5.0 security features',
  })
  @ApiBody({ type: CreateCybersecurityDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Cybersecurity configuration created successfully',
    type: CybersecurityResponseDto,
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Security code already exists' })
  async create(
    @Body(ValidationPipe) createCybersecurityDto: CreateCybersecurityDto,
  ): Promise<CybersecurityResponseDto> {
    this.logger.log(`Creating cybersecurity configuration: ${createCybersecurityDto.securityCode}`);
    return await this.cybersecurityService.create(createCybersecurityDto);
  }

  @Get()
  @Roles('admin', 'security_analyst', 'cybersecurity_manager', 'manufacturing_manager')
  @ApiOperation({
    summary: 'Get all cybersecurity configurations',
    description: 'Retrieves a paginated list of cybersecurity configurations with optional filtering',
  })
  @ApiPaginatedResponse(CybersecurityResponseDto)
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search term' })
  @ApiQuery({ name: 'securityLevel', required: false, type: String, description: 'Filter by security level' })
  @ApiQuery({ name: 'threatLevel', required: false, type: String, description: 'Filter by threat level' })
  @ApiQuery({ name: 'complianceFramework', required: false, type: String, description: 'Filter by compliance framework' })
  async findAll(
    @Query() paginationDto: PaginationDto,
    @Query('search') search?: string,
    @Query('securityLevel') securityLevel?: string,
    @Query('threatLevel') threatLevel?: string,
    @Query('complianceFramework') complianceFramework?: string,
  ): Promise<{ data: CybersecurityResponseDto[]; total: number; page: number; limit: number }> {
    this.logger.log('Retrieving cybersecurity configurations list');
    return await this.cybersecurityService.findAll(paginationDto, { 
      search, 
      securityLevel, 
      threatLevel, 
      complianceFramework 
    });
  }

  @Get(':id')
  @Roles('admin', 'security_analyst', 'cybersecurity_manager', 'manufacturing_manager')
  @ApiOperation({
    summary: 'Get cybersecurity configuration by ID',
    description: 'Retrieves detailed information about a specific cybersecurity configuration',
  })
  @ApiParam({ name: 'id', description: 'Cybersecurity configuration ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cybersecurity configuration details retrieved successfully',
    type: CybersecurityResponseDto,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Cybersecurity configuration not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<CybersecurityResponseDto> {
    this.logger.log(`Retrieving cybersecurity configuration: ${id}`);
    return await this.cybersecurityService.findOne(id);
  }

  @Put(':id')
  @Roles('admin', 'security_analyst', 'cybersecurity_manager')
  @ApiOperation({
    summary: 'Update cybersecurity configuration',
    description: 'Updates an existing cybersecurity configuration',
  })
  @ApiParam({ name: 'id', description: 'Cybersecurity configuration ID' })
  @ApiBody({ type: UpdateCybersecurityDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cybersecurity configuration updated successfully',
    type: CybersecurityResponseDto,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Cybersecurity configuration not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateCybersecurityDto: UpdateCybersecurityDto,
  ): Promise<CybersecurityResponseDto> {
    this.logger.log(`Updating cybersecurity configuration: ${id}`);
    return await this.cybersecurityService.update(id, updateCybersecurityDto);
  }

  @Delete(':id')
  @Roles('admin', 'cybersecurity_manager')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete cybersecurity configuration',
    description: 'Deletes a cybersecurity configuration (soft delete)',
  })
  @ApiParam({ name: 'id', description: 'Cybersecurity configuration ID' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Cybersecurity configuration deleted successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Cybersecurity configuration not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    this.logger.log(`Deleting cybersecurity configuration: ${id}`);
    await this.cybersecurityService.remove(id);
  }

  @Get(':id/security-score')
  @Roles('admin', 'security_analyst', 'cybersecurity_manager', 'manufacturing_manager')
  @ApiOperation({
    summary: 'Get security score',
    description: 'Retrieves the overall security score and assessment',
  })
  @ApiParam({ name: 'id', description: 'Cybersecurity configuration ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Security score retrieved successfully' })
  async getSecurityScore(@Param('id', ParseUUIDPipe) id: string): Promise<any> {
    this.logger.log(`Retrieving security score for: ${id}`);
    return await this.cybersecurityService.getSecurityScore(id);
  }

  @Post(':id/detect-threat')
  @Roles('admin', 'security_analyst', 'cybersecurity_manager')
  @ApiOperation({
    summary: 'Detect and report threat',
    description: 'Detects and processes a new security threat',
  })
  @ApiParam({ name: 'id', description: 'Cybersecurity configuration ID' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Threat detected and processed successfully' })
  async detectThreat(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() threatData: any,
  ): Promise<any> {
    this.logger.log(`Detecting threat for cybersecurity configuration: ${id}`);
    return await this.cybersecurityService.detectThreat(id, threatData);
  }

  @Post(':id/create-incident')
  @Roles('admin', 'security_analyst', 'cybersecurity_manager')
  @ApiOperation({
    summary: 'Create security incident',
    description: 'Creates a new security incident for investigation',
  })
  @ApiParam({ name: 'id', description: 'Cybersecurity configuration ID' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Security incident created successfully' })
  async createIncident(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() incidentData: any,
  ): Promise<any> {
    this.logger.log(`Creating security incident for: ${id}`);
    return await this.cybersecurityService.createIncident(id, incidentData);
  }

  @Post(':id/respond-incident/:incidentId')
  @Roles('admin', 'security_analyst', 'cybersecurity_manager')
  @ApiOperation({
    summary: 'Respond to security incident',
    description: 'Processes a response action for a specific security incident',
  })
  @ApiParam({ name: 'id', description: 'Cybersecurity configuration ID' })
  @ApiParam({ name: 'incidentId', description: 'Security incident ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Incident response processed successfully' })
  async respondToIncident(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('incidentId') incidentId: string,
    @Body() responseAction: any,
  ): Promise<any> {
    this.logger.log(`Responding to incident ${incidentId} for cybersecurity configuration: ${id}`);
    return await this.cybersecurityService.respondToIncident(id, incidentId, responseAction);
  }

  @Post(':id/vulnerability-assessment')
  @Roles('admin', 'security_analyst', 'cybersecurity_manager')
  @ApiOperation({
    summary: 'Run vulnerability assessment',
    description: 'Executes a comprehensive vulnerability assessment',
  })
  @ApiParam({ name: 'id', description: 'Cybersecurity configuration ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Vulnerability assessment completed successfully' })
  async runVulnerabilityAssessment(@Param('id', ParseUUIDPipe) id: string): Promise<any> {
    this.logger.log(`Running vulnerability assessment for: ${id}`);
    return await this.cybersecurityService.runVulnerabilityAssessment(id);
  }

  @Post(':id/enable-quantum-security')
  @Roles('admin', 'cybersecurity_manager')
  @ApiOperation({
    summary: 'Enable quantum security',
    description: 'Enables advanced quantum security features',
  })
  @ApiParam({ name: 'id', description: 'Cybersecurity configuration ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Quantum security enabled successfully' })
  async enableQuantumSecurity(@Param('id', ParseUUIDPipe) id: string): Promise<any> {
    this.logger.log(`Enabling quantum security for: ${id}`);
    return await this.cybersecurityService.enableQuantumSecurity(id);
  }

  @Post(':id/enable-blockchain-security')
  @Roles('admin', 'cybersecurity_manager')
  @ApiOperation({
    summary: 'Enable blockchain security',
    description: 'Enables blockchain-based security features',
  })
  @ApiParam({ name: 'id', description: 'Cybersecurity configuration ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Blockchain security enabled successfully' })
  async enableBlockchainSecurity(@Param('id', ParseUUIDPipe) id: string): Promise<any> {
    this.logger.log(`Enabling blockchain security for: ${id}`);
    return await this.cybersecurityService.enableBlockchainSecurity(id);
  }

  @Post(':id/security-training')
  @Roles('admin', 'security_analyst', 'cybersecurity_manager')
  @ApiOperation({
    summary: 'Conduct security training',
    description: 'Initiates security awareness training programs',
  })
  @ApiParam({ name: 'id', description: 'Cybersecurity configuration ID' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Security training initiated successfully' })
  async conductSecurityTraining(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() trainingData: { trainingType: string; participants: string[] },
  ): Promise<any> {
    this.logger.log(`Conducting security training for: ${id}`);
    return await this.cybersecurityService.conductSecurityTraining(
      id,
      trainingData.trainingType,
      trainingData.participants
    );
  }

  @Get(':id/compliance-score')
  @Roles('admin', 'security_analyst', 'cybersecurity_manager', 'compliance_officer')
  @ApiOperation({
    summary: 'Get compliance score',
    description: 'Retrieves the current compliance score and status',
  })
  @ApiParam({ name: 'id', description: 'Cybersecurity configuration ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Compliance score retrieved successfully' })
  async getComplianceScore(@Param('id', ParseUUIDPipe) id: string): Promise<any> {
    this.logger.log(`Retrieving compliance score for: ${id}`);
    return await this.cybersecurityService.getComplianceScore(id);
  }

  @Get(':id/security-report')
  @Roles('admin', 'security_analyst', 'cybersecurity_manager', 'manufacturing_manager')
  @ApiOperation({
    summary: 'Generate security report',
    description: 'Generates a comprehensive security status report',
  })
  @ApiParam({ name: 'id', description: 'Cybersecurity configuration ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Security report generated successfully' })
  async generateSecurityReport(@Param('id', ParseUUIDPipe) id: string): Promise<any> {
    this.logger.log(`Generating security report for: ${id}`);
    return await this.cybersecurityService.generateSecurityReport(id);
  }

  @Post(':id/audit-security')
  @Roles('admin', 'security_analyst', 'cybersecurity_manager', 'auditor')
  @ApiOperation({
    summary: 'Conduct security audit',
    description: 'Performs a comprehensive security audit',
  })
  @ApiParam({ name: 'id', description: 'Cybersecurity configuration ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Security audit completed successfully' })
  async auditSecurity(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() auditData: { auditorId: string },
  ): Promise<any> {
    this.logger.log(`Conducting security audit for: ${id}`);
    return await this.cybersecurityService.auditSecurity(id, auditData.auditorId);
  }

  @Put(':id/update-metrics')
  @Roles('admin', 'security_analyst', 'cybersecurity_manager')
  @ApiOperation({
    summary: 'Update security metrics',
    description: 'Updates security metrics and KPIs',
  })
  @ApiParam({ name: 'id', description: 'Cybersecurity configuration ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Security metrics updated successfully' })
  async updateSecurityMetrics(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() metricsData: any,
  ): Promise<any> {
    this.logger.log(`Updating security metrics for: ${id}`);
    return await this.cybersecurityService.updateSecurityMetrics(id, metricsData);
  }

  @Get(':id/active-threats')
  @Roles('admin', 'security_analyst', 'cybersecurity_manager')
  @ApiOperation({
    summary: 'Get active threats',
    description: 'Retrieves current active threats and incidents',
  })
  @ApiParam({ name: 'id', description: 'Cybersecurity configuration ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Active threats retrieved successfully' })
  async getActiveThreats(@Param('id', ParseUUIDPipe) id: string): Promise<any> {
    this.logger.log(`Retrieving active threats for: ${id}`);
    return await this.cybersecurityService.getActiveThreats(id);
  }

  @Get(':id/security-analytics')
  @Roles('admin', 'security_analyst', 'cybersecurity_manager', 'manufacturing_manager')
  @ApiOperation({
    summary: 'Get security analytics',
    description: 'Retrieves detailed security analytics and insights',
  })
  @ApiParam({ name: 'id', description: 'Cybersecurity configuration ID' })
  @ApiQuery({ name: 'period', required: false, type: String, description: 'Time period (daily, weekly, monthly)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Security analytics retrieved successfully' })
  async getSecurityAnalytics(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('period') period: string = 'weekly',
  ): Promise<any> {
    this.logger.log(`Retrieving security analytics for: ${id}`);
    return await this.cybersecurityService.getSecurityAnalytics(id, period);
  }

  @Post(':id/emergency-response')
  @Roles('admin', 'security_analyst', 'cybersecurity_manager')
  @ApiOperation({
    summary: 'Initiate emergency response',
    description: 'Activates emergency security response procedures',
  })
  @ApiParam({ name: 'id', description: 'Cybersecurity configuration ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Emergency response initiated successfully' })
  async initiateEmergencyResponse(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() emergencyData: any,
  ): Promise<any> {
    this.logger.log(`Initiating emergency response for: ${id}`);
    return await this.cybersecurityService.initiateEmergencyResponse(id, emergencyData);
  }

  @Post(':id/clone')
  @Roles('admin', 'cybersecurity_manager')
  @ApiOperation({
    summary: 'Clone cybersecurity configuration',
    description: 'Creates a copy of an existing cybersecurity configuration',
  })
  @ApiParam({ name: 'id', description: 'Source cybersecurity configuration ID' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Cybersecurity configuration cloned successfully',
    type: CybersecurityResponseDto,
  })
  async clone(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() cloneData: { newSecurityCode: string; newSecurityName: string },
  ): Promise<CybersecurityResponseDto> {
    this.logger.log(`Cloning cybersecurity configuration: ${id}`);
    return await this.cybersecurityService.clone(id, cloneData);
  }

  @Get(':id/risk-assessment')
  @Roles('admin', 'security_analyst', 'cybersecurity_manager', 'risk_manager')
  @ApiOperation({
    summary: 'Get risk assessment',
    description: 'Retrieves comprehensive risk assessment and mitigation strategies',
  })
  @ApiParam({ name: 'id', description: 'Cybersecurity configuration ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Risk assessment retrieved successfully' })
  async getRiskAssessment(@Param('id', ParseUUIDPipe) id: string): Promise<any> {
    this.logger.log(`Retrieving risk assessment for: ${id}`);
    return await this.cybersecurityService.getRiskAssessment(id);
  }

  @Get(':id/security-culture')
  @Roles('admin', 'security_analyst', 'cybersecurity_manager', 'hr_manager')
  @ApiOperation({
    summary: 'Get security culture metrics',
    description: 'Retrieves security culture awareness and engagement metrics',
  })
  @ApiParam({ name: 'id', description: 'Cybersecurity configuration ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Security culture metrics retrieved successfully' })
  async getSecurityCulture(@Param('id', ParseUUIDPipe) id: string): Promise<any> {
    this.logger.log(`Retrieving security culture metrics for: ${id}`);
    return await this.cybersecurityService.getSecurityCulture(id);
  }
}
