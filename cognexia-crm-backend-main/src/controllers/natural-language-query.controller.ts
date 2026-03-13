import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RBACGuard } from '../guards/rbac.guard';
import { Roles } from '../decorators/roles.decorator';
import { NaturalLanguageQueryService } from '../services/natural-language-query.service';
import { NaturalLanguageQueryDto } from '../dto/database-management.dto';

@ApiTags('Natural Language Query')
@Controller('nl-query')
// @UseGuards(JwtAuthGuard, RBACGuard)
@ApiBearerAuth()
export class NaturalLanguageQueryController {
  constructor(private readonly service: NaturalLanguageQueryService) {}

  @Post('execute')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Execute natural language query' })
  async executeQuery(@Body() dto: NaturalLanguageQueryDto, @Request() req: any) {
    return await this.service.executeQuery(dto, req.user.id);
  }

  @Get('history')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Get query history' })
  async getQueryHistory(@Request() req: any) {
    return await this.service.getQueryHistory(req.user.id);
  }

  @Get('suggestions')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Get suggested queries' })
  async getSuggestedQueries() {
    return await this.service.getSuggestedQueries();
  }
}
