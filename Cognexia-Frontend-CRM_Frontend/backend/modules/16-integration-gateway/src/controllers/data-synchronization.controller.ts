// Industry 5.0 ERP Backend - Data Synchronization Controller
// Managing data synchronization between internal and external systems

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpStatus,
  UseGuards,
  ValidationPipe,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DataSynchronizationService } from '../services/data-synchronization.service';
import { IntegrationSecurityGuard } from '../guards/integration-security.guard';

@ApiTags('Data Synchronization')
@Controller('api/sync')
@UseGuards(IntegrationSecurityGuard)
@ApiBearerAuth()
export class DataSynchronizationController {
  constructor(
    private readonly dataSyncService: DataSynchronizationService
  ) {}

  @Post('operations')
  @ApiOperation({ summary: 'Create sync operation' })
  async createSyncOperation(
    @Body(ValidationPipe) syncDto: any,
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      const operation = await this.dataSyncService.createSyncOperation(syncDto, req.user);
      res.status(HttpStatus.CREATED).json({
        success: true,
        data: operation,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  @Get('operations')
  @ApiOperation({ summary: 'Get all sync operations' })
  async getSyncOperations(
    @Query('status') status?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Res() res: Response
  ) {
    try {
      const operations = await this.dataSyncService.getSyncOperations({ status, page, limit });
      res.status(HttpStatus.OK).json({
        success: true,
        data: operations,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  @Post('operations/:id/start')
  @ApiOperation({ summary: 'Start sync operation' })
  async startSyncOperation(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      const result = await this.dataSyncService.startSync(id);
      res.status(HttpStatus.OK).json({
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }
}
