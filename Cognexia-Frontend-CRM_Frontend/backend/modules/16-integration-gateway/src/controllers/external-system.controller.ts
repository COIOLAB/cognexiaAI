// Industry 5.0 ERP Backend - External System Controller
// Managing external system integrations and connections

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
import { ExternalSystemService } from '../services/external-system.service';
import { IntegrationSecurityGuard } from '../guards/integration-security.guard';

@ApiTags('External Systems')
@Controller('api/external-systems')
@UseGuards(IntegrationSecurityGuard)
@ApiBearerAuth()
export class ExternalSystemController {
  constructor(
    private readonly externalSystemService: ExternalSystemService
  ) {}

  @Post()
  @ApiOperation({ summary: 'Register external system' })
  async registerExternalSystem(
    @Body(ValidationPipe) systemDto: any,
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      const system = await this.externalSystemService.registerSystem(systemDto, req.user);
      res.status(HttpStatus.CREATED).json({
        success: true,
        data: system,
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

  @Get()
  @ApiOperation({ summary: 'Get all external systems' })
  async getExternalSystems(
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Res() res: Response
  ) {
    try {
      const systems = await this.externalSystemService.getSystems({ status, type });
      res.status(HttpStatus.OK).json({
        success: true,
        data: systems,
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

  @Get(':id')
  @ApiOperation({ summary: 'Get external system by ID' })
  async getExternalSystem(
    @Param('id') id: string,
    @Res() res: Response
  ) {
    try {
      const system = await this.externalSystemService.getSystemById(id);
      if (!system) {
        return res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          message: 'External system not found',
          timestamp: new Date().toISOString(),
        });
      }
      res.status(HttpStatus.OK).json({
        success: true,
        data: system,
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

  @Put(':id')
  @ApiOperation({ summary: 'Update external system' })
  async updateExternalSystem(
    @Param('id') id: string,
    @Body(ValidationPipe) updateDto: any,
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      const system = await this.externalSystemService.updateSystem(id, updateDto, req.user);
      res.status(HttpStatus.OK).json({
        success: true,
        data: system,
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

  @Delete(':id')
  @ApiOperation({ summary: 'Delete external system' })
  async deleteExternalSystem(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      await this.externalSystemService.deleteSystem(id, req.user);
      res.status(HttpStatus.OK).json({
        success: true,
        message: 'External system deleted successfully',
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

  @Post(':id/test-connection')
  @ApiOperation({ summary: 'Test external system connection' })
  async testSystemConnection(
    @Param('id') id: string,
    @Res() res: Response
  ) {
    try {
      const result = await this.externalSystemService.testConnection(id);
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
