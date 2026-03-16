import { Controller, Get, Post, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RBACGuard } from '../guards/rbac.guard';
import { Roles } from '../decorators/roles.decorator';
import { DisasterRecoveryService } from '../services/disaster-recovery.service';
import { CreateBackupDto } from '../dto/database-management.dto';

@ApiTags('Disaster Recovery')
@Controller('disaster-recovery')
// @UseGuards(JwtAuthGuard, RBACGuard)
@ApiBearerAuth()
export class DisasterRecoveryController {
  constructor(private readonly service: DisasterRecoveryService) {}

  @Post('backup')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Create backup' })
  async createBackup(@Body() dto: CreateBackupDto, @Request() req: any) {
    return await this.service.createBackup(dto, req.user.id);
  }

  @Get('backups')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Get backup history' })
  async getBackupHistory() {
    return await this.service.getBackupHistory();
  }

  @Post('verify/:backupId')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Verify backup integrity' })
  async verifyBackup(@Param('backupId') backupId: string) {
    return await this.service.verifyBackup(backupId);
  }

  @Post('restore/:backupId')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Restore from backup' })
  async restoreBackup(@Param('backupId') backupId: string) {
    return await this.service.restoreBackup(backupId);
  }

  @Get('stats')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Get backup statistics' })
  async getStats() {
    return await this.service.getStats();
  }
}
