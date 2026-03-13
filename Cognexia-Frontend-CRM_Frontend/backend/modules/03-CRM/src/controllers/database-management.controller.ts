import { Controller, Get, Post, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RBACGuard } from '../guards/rbac.guard';
import { Roles } from '../decorators/roles.decorator';
import { DatabaseManagementService } from '../services/database-management.service';
import { ExecuteQueryDto } from '../dto/database-management.dto';

@ApiTags('Database Management')
@Controller('db-console')
// @UseGuards(JwtAuthGuard, RBACGuard)
@ApiBearerAuth()
export class DatabaseManagementController {
  constructor(private readonly service: DatabaseManagementService) {}

  @Post('execute')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Execute SQL query' })
  async executeQuery(@Body() dto: ExecuteQueryDto, @Request() req: any) {
    return await this.service.executeQuery(dto, req.user.id);
  }

  @Get('history')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Get query history' })
  async getQueryHistory(@Query('userId') userId?: string) {
    return await this.service.getQueryHistory(userId);
  }

  @Post('validate')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Validate query' })
  async validateQuery(@Body('query') query: string) {
    return await this.service.validateQuery(query);
  }

  @Get('schema/:tableName')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Get table schema' })
  async getTableSchema(@Param('tableName') tableName: string) {
    return await this.service.getTableSchema(tableName);
  }
}
