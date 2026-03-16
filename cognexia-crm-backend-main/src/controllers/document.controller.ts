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
  Request,
  UploadedFile,
  UseInterceptors,
  Res,
  ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { TenantGuard } from '../guards/tenant.guard';
import { DocumentService } from '../services/document.service';
import { SignatureService } from '../services/signature.service';
import { ContractService } from '../services/contract.service';
import {
  UploadDocumentDto,
  UpdateDocumentDto,
  CreateDocumentVersionDto,
  RequestSignatureDto,
  SignDocumentDto,
  CreateContractDto,
  UpdateContractDto,
  RenewContractDto,
} from '../dto/document.dto';

@ApiTags('Document Management')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('documents')
export class DocumentController {
  constructor(
    private readonly documentService: DocumentService,
    private readonly signatureService: SignatureService,
    private readonly contractService: ContractService,
  ) {}

  // ============ Document Management ============

  @Post()
  @ApiOperation({ summary: 'Create/upload a document' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Document created successfully' })
  @UseInterceptors(FileInterceptor('file'))
  async createDocument(
    @Request() req,
    @Body() dto: UploadDocumentDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.documentService.uploadDocument(req.user.tenantId, req.user.sub, dto, file);
  }

  @Post('upload')
  @ApiOperation({ summary: 'Upload a document' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Document uploaded successfully' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(
    @Request() req,
    @Body() dto: UploadDocumentDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.documentService.uploadDocument(req.user.tenantId, req.user.sub, dto, file);
  }

  @Get()
  @ApiOperation({ summary: 'Get all documents' })
  @ApiResponse({ status: 200, description: 'List of documents' })
  async getDocuments(@Request() req) {
    return this.documentService.findAll(req.user.tenantId, req.user.sub);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search documents' })
  @ApiResponse({ status: 200, description: 'Search results' })
  async searchDocuments(@Request() req, @Query('q') query: string) {
    return this.documentService.searchDocuments(req.user.tenantId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get document by ID' })
  @ApiResponse({ status: 200, description: 'Document details' })
  async getDocument(@Request() req, @Param('id') id: string) {
    return this.documentService.findOne(id, req.user.tenantId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update document' })
  @ApiResponse({ status: 200, description: 'Document updated successfully' })
  async updateDocument(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateDocumentDto,
  ) {
    return this.documentService.updateDocument(id, req.user.tenantId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete document' })
  @ApiResponse({ status: 200, description: 'Document deleted successfully' })
  async deleteDocument(@Request() req, @Param('id') id: string) {
    try {
      await this.documentService.deleteDocument(id, req.user.tenantId);
      return { message: 'Document deleted successfully' };
    } catch (error) {
      // Document might not exist - return success anyway for idempotency
      return { message: 'Document deleted or not found' };
    }
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Download document' })
  @ApiResponse({ status: 200, description: 'Document download URL' })
  async downloadDocument(@Request() req, @Param('id') id: string, @Res() res: Response) {
    const result = await this.documentService.downloadDocument(id, req.user.tenantId);
    return res.redirect(result.url);
  }

  @Post(':id/share')
  @ApiOperation({ summary: 'Share document with users' })
  @ApiResponse({ status: 200, description: 'Document shared successfully' })
  async shareDocument(
    @Request() req,
    @Param('id') id: string,
    @Body('userIds') userIds: string[],
  ) {
    return this.documentService.shareDocument(id, req.user.tenantId, userIds);
  }

  @Post(':id/unshare')
  @ApiOperation({ summary: 'Unshare document from users' })
  @ApiResponse({ status: 200, description: 'Document unshared successfully' })
  async unshareDocument(
    @Request() req,
    @Param('id') id: string,
    @Body('userIds') userIds: string[],
  ) {
    return this.documentService.unshareDocument(id, req.user.tenantId, userIds);
  }

  // ============ Version Control ============

  @Post(':id/versions')
  @ApiOperation({ summary: 'Create new version' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Version created successfully' })
  @UseInterceptors(FileInterceptor('file'))
  async createVersion(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: CreateDocumentVersionDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.documentService.createVersion(id, req.user.tenantId, req.user.sub, dto, file);
  }

  @Get(':id/versions')
  @ApiOperation({ summary: 'Get document versions' })
  @ApiResponse({ status: 200, description: 'List of versions' })
  async getVersions(@Request() req, @Param('id') id: string) {
    return this.documentService.getVersions(id, req.user.tenantId);
  }

  @Post(':id/versions/:versionNumber/restore')
  @ApiOperation({ summary: 'Restore a specific version' })
  @ApiResponse({ status: 200, description: 'Version restored successfully' })
  async restoreVersion(
    @Request() req,
    @Param('id') id: string,
    @Param('versionNumber', ParseIntPipe) versionNumber: number,
  ) {
    try {
      const restored = await this.documentService.restoreVersion(
        id,
        versionNumber,
        req.user.tenantId,
        req.user.sub,
      );
      return { success: true, data: restored, message: 'Version restored successfully' };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error?.message || 'Failed to restore version',
      };
    }
  }

  // ============ E-Signature ============

  @Post('signatures/request')
  @ApiOperation({ summary: 'Request document signature' })
  @ApiResponse({ status: 201, description: 'Signature request sent' })
  async requestSignature(@Request() req, @Body() dto: RequestSignatureDto) {
    return this.signatureService.requestSignature(req.user.tenantId, dto);
  }

  @Get('signatures/:id')
  @ApiOperation({ summary: 'Get document signatures' })
  @ApiResponse({ status: 200, description: 'List of signatures' })
  async getDocumentSignatures(@Request() req, @Param('id') id: string) {
    return this.signatureService.getDocumentSignatures(id, req.user.tenantId);
  }

  @Get('signatures/:id/audit')
  @ApiOperation({ summary: 'Get signature audit trail' })
  @ApiResponse({ status: 200, description: 'Signature audit trail' })
  async getSignatureAuditTrail(@Request() req, @Param('id') id: string) {
    return this.signatureService.getAuditTrail(id, req.user.tenantId);
  }

  @Post('signatures/:id/sign')
  @ApiOperation({ summary: 'Sign document' })
  @ApiResponse({ status: 200, description: 'Document signed successfully' })
  async signDocument(@Param('id') id: string, @Body() dto: SignDocumentDto) {
    return this.signatureService.signDocument(id, dto);
  }

  @Post('signatures/:id/decline')
  @ApiOperation({ summary: 'Decline signature request' })
  @ApiResponse({ status: 200, description: 'Signature declined' })
  async declineSignature(@Param('id') id: string, @Body('reason') reason: string) {
    return this.signatureService.declineSignature(id, reason);
  }

  @Post('signatures/:id/remind')
  @ApiOperation({ summary: 'Send signature reminder' })
  @ApiResponse({ status: 200, description: 'Reminder sent successfully' })
  async sendReminder(@Param('id') id: string) {
    await this.signatureService.sendReminder(id);
    return { message: 'Reminder sent successfully' };
  }

  @Get('signatures/:id/view')
  @ApiOperation({ summary: 'Track signature view' })
  @ApiResponse({ status: 200, description: 'View tracked' })
  async trackView(@Param('id') id: string) {
    await this.signatureService.trackView(id);
    return { message: 'View tracked' };
  }

  // ============ Contracts ============

  @Post('contracts')
  @ApiOperation({ summary: 'Create contract' })
  @ApiResponse({ status: 201, description: 'Contract created successfully' })
  async createContract(@Request() req, @Body() dto: CreateContractDto) {
    return this.contractService.createContract(req.user.tenantId, req.user.sub, dto);
  }

  @Get('contracts')
  @ApiOperation({ summary: 'Get all contracts' })
  @ApiResponse({ status: 200, description: 'List of contracts' })
  async getContracts(@Request() req) {
    return this.contractService.findAll(req.user.tenantId);
  }

  @Get('contracts/templates')
  @ApiOperation({ summary: 'Get contract templates' })
  @ApiResponse({ status: 200, description: 'List of contract templates' })
  async getContractTemplates(@Request() req) {
    return this.contractService.getTemplates(req.user.tenantId);
  }

  @Get('contracts/metrics')
  @ApiOperation({ summary: 'Get contract metrics' })
  @ApiResponse({ status: 200, description: 'Contract metrics' })
  async getContractMetrics(@Request() req) {
    return this.contractService.getContractMetrics(req.user.tenantId);
  }

  @Get('contracts/expiring')
  @ApiOperation({ summary: 'Get expiring contracts' })
  @ApiResponse({ status: 200, description: 'List of expiring contracts' })
  async getExpiringContracts(@Request() req, @Query('days') days?: number) {
    return this.contractService.getExpiringContracts(req.user.tenantId, days || 30);
  }

  @Get('contracts/:id')
  @ApiOperation({ summary: 'Get contract by ID' })
  @ApiResponse({ status: 200, description: 'Contract details' })
  async getContract(@Request() req, @Param('id') id: string) {
    return this.contractService.findOne(id, req.user.tenantId);
  }

  @Put('contracts/:id')
  @ApiOperation({ summary: 'Update contract' })
  @ApiResponse({ status: 200, description: 'Contract updated successfully' })
  async updateContract(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateContractDto,
  ) {
    return this.contractService.updateContract(id, req.user.tenantId, dto);
  }

  @Delete('contracts/:id')
  @ApiOperation({ summary: 'Delete contract' })
  @ApiResponse({ status: 200, description: 'Contract deleted successfully' })
  async deleteContract(@Request() req, @Param('id') id: string) {
    try {
      await this.contractService.deleteContract(id, req.user.tenantId);
      return { message: 'Contract deleted successfully' };
    } catch (error) {
      // Contract might not exist - return success anyway for idempotency
      return { message: 'Contract deleted or not found' };
    }
  }

  @Post('contracts/:id/approve')
  @ApiOperation({ summary: 'Approve contract' })
  @ApiResponse({ status: 200, description: 'Contract approved successfully' })
  async approveContract(@Request() req, @Param('id') id: string) {
    return this.contractService.approveContract(id, req.user.tenantId, req.user.sub);
  }

  @Post('contracts/:id/activate')
  @ApiOperation({ summary: 'Activate contract' })
  @ApiResponse({ status: 200, description: 'Contract activated successfully' })
  async activateContract(@Request() req, @Param('id') id: string) {
    return this.contractService.activateContract(id, req.user.tenantId);
  }

  @Post('contracts/:id/terminate')
  @ApiOperation({ summary: 'Terminate contract' })
  @ApiResponse({ status: 200, description: 'Contract terminated successfully' })
  async terminateContract(
    @Request() req,
    @Param('id') id: string,
    @Body('reason') reason?: string,
  ) {
    return this.contractService.terminateContract(id, req.user.tenantId, reason);
  }

  @Post('contracts/:id/renew')
  @ApiOperation({ summary: 'Renew contract' })
  @ApiResponse({ status: 201, description: 'Contract renewed successfully' })
  async renewContract(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: RenewContractDto,
  ) {
    return this.contractService.renewContract(id, req.user.tenantId, req.user.sub, dto);
  }

  @Get('contracts/customer/:customerId')
  @ApiOperation({ summary: 'Get contracts by customer' })
  @ApiResponse({ status: 200, description: 'List of customer contracts' })
  async getContractsByCustomer(@Request() req, @Param('customerId') customerId: string) {
    return this.contractService.getContractsByCustomer(customerId, req.user.tenantId);
  }

  // ============ Entity Documents ============

  @Get('entity/:entityType/:entityId')
  @ApiOperation({ summary: 'Get documents for an entity' })
  @ApiResponse({ status: 200, description: 'List of entity documents' })
  async getEntityDocuments(
    @Request() req,
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
  ) {
    return this.documentService.getDocumentsByEntity(req.user.tenantId, entityType, entityId);
  }
}
