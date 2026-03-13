// Industry 5.0 ERP Backend - API Integration Controller
// Managing external API connections, authentication, and data exchange
// Author: AI Assistant - Industry 5.0 Pioneer

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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { APIConnectionService } from '../services/api-connection.service';
import { IntegrationSecurityGuard } from '../guards/integration-security.guard';
import { APIAuthenticationGuard } from '../guards/api-authentication.guard';
import { RateLimitGuard } from '../guards/rate-limit.guard';

@ApiTags('API Integration')
@Controller('api/integration')
@UseGuards(IntegrationSecurityGuard, APIAuthenticationGuard, RateLimitGuard)
@ApiBearerAuth()
export class APIIntegrationController {
  constructor(
    private readonly apiConnectionService: APIConnectionService
  ) {}

  @Post('connections')
  @ApiOperation({ summary: 'Create new API connection' })
  @ApiResponse({ status: 201, description: 'API connection created successfully' })
  async createAPIConnection(
    @Body(ValidationPipe) createConnectionDto: any,
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      const connection = await this.apiConnectionService.createConnection(
        createConnectionDto,
        req.user
      );
      
      res.status(HttpStatus.CREATED).json({
        success: true,
        message: 'API connection created successfully',
        data: connection,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  @Get('connections')
  @ApiOperation({ summary: 'Get all API connections' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'protocol', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getAPIConnections(
    @Query('status') status?: string,
    @Query('protocol') protocol?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      const connections = await this.apiConnectionService.getConnections({
        status,
        protocol,
        page,
        limit,
        userId: req.user?.id,
      });
      
      res.status(HttpStatus.OK).json({
        success: true,
        data: connections,
        pagination: {
          page,
          limit,
          total: connections.length,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  @Get('connections/:id')
  @ApiOperation({ summary: 'Get API connection by ID' })
  async getAPIConnection(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      const connection = await this.apiConnectionService.getConnectionById(id);
      
      if (!connection) {
        return res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          message: 'API connection not found',
          timestamp: new Date().toISOString(),
        });
      }
      
      res.status(HttpStatus.OK).json({
        success: true,
        data: connection,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  @Put('connections/:id')
  @ApiOperation({ summary: 'Update API connection' })
  async updateAPIConnection(
    @Param('id') id: string,
    @Body(ValidationPipe) updateConnectionDto: any,
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      const connection = await this.apiConnectionService.updateConnection(
        id,
        updateConnectionDto,
        req.user
      );
      
      res.status(HttpStatus.OK).json({
        success: true,
        message: 'API connection updated successfully',
        data: connection,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  @Delete('connections/:id')
  @ApiOperation({ summary: 'Delete API connection' })
  async deleteAPIConnection(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      await this.apiConnectionService.deleteConnection(id, req.user);
      
      res.status(HttpStatus.OK).json({
        success: true,
        message: 'API connection deleted successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  @Post('connections/:id/test')
  @ApiOperation({ summary: 'Test API connection' })
  async testAPIConnection(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      const result = await this.apiConnectionService.testConnection(id);
      
      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Connection test completed',
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  @Post('connections/:id/execute')
  @ApiOperation({ summary: 'Execute API request through connection' })
  async executeAPIRequest(
    @Param('id') id: string,
    @Body(ValidationPipe) requestDto: any,
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      const result = await this.apiConnectionService.executeRequest(id, requestDto);
      
      res.status(HttpStatus.OK).json({
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  @Get('connections/:id/logs')
  @ApiOperation({ summary: 'Get API connection logs' })
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  @ApiQuery({ name: 'level', required: false })
  async getConnectionLogs(
    @Param('id') id: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('level') level?: string,
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      const logs = await this.apiConnectionService.getConnectionLogs(id, {
        from: from ? new Date(from) : undefined,
        to: to ? new Date(to) : undefined,
        level,
      });
      
      res.status(HttpStatus.OK).json({
        success: true,
        data: logs,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }
}
