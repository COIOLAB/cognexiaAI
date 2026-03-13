import { Controller, Get } from '@nestjs/common';

/**
 * Health controller for Railway/container healthchecks.
 * These routes are excluded from the global /api/v1 prefix.
 */
@Controller()
export class HealthController {
  @Get()
  getRoot() {
    return { status: 'ok', service: 'crm-backend' };
  }

  @Get('health')
  getHealth() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
