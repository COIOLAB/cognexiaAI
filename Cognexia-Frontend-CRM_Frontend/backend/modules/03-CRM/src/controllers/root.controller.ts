import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Root')
@Controller()
export class RootController {
  @Get()
  @ApiOperation({ summary: 'API root' })
  @ApiResponse({ status: 200, description: 'API is running' })
  getRoot() {
    return {
      status: 'ok',
      message: 'CRM API is running',
      docs: '/api/v1/api/docs',
    };
  }
}
