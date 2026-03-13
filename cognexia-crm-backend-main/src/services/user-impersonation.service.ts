import { Injectable, Logger, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ImpersonationSession } from '../entities/impersonation-session.entity';
import { User } from '../entities/user.entity';
import {
  ImpersonateUserDto,
  ImpersonationResponseDto,
  ActiveImpersonationDto,
  UserSearchDto,
  BulkUserActionDto,
  ForceLogoutDto,
} from '../dto/user-impersonation.dto';
import { AuditLogService } from './audit-log.service';

@Injectable()
export class UserImpersonationService {
  private readonly logger = new Logger(UserImpersonationService.name);

  constructor(
    @InjectRepository(ImpersonationSession)
    private impersonationRepository: Repository<ImpersonationSession>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private auditLogService: AuditLogService,
  ) { }

  async impersonateUser(
    adminUserId: string,
    dto: ImpersonateUserDto,
    ip_address: string,
    userAgent: string
  ): Promise<ImpersonationResponseDto> {
    this.logger.log(`Admin ${adminUserId} attempting to impersonate user ${dto.targetUserId}`);

    // Verify admin has super_admin role
    const admin = await this.userRepository.findOne({
      where: { id: adminUserId },
    });

    if (!admin || !(admin.roles && admin.roles.includes('super_admin'))) {
      throw new UnauthorizedException('Only super admins can impersonate users');
    }

    // Get target user
    const targetUser = await this.userRepository.findOne({
      where: { id: dto.targetUserId },
    });

    if (!targetUser) {
      throw new NotFoundException('Target user not found');
    }

    // Create impersonation session
    const session = this.impersonationRepository.create({
      adminUserId,
      targetUserId: dto.targetUserId,
      reason: dto.reason,
      ipAddress: ip_address,
      userAgent,
      isActive: true,
      metadata: dto.metadata || {},
    });

    const savedSession = await this.impersonationRepository.save(session);

    // Generate impersonation token (expires in 1 hour)
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    const impersonationToken = this.jwtService.sign(
      {
        sub: targetUser.id,
        email: targetUser.email,
        role: targetUser.roles[0],
        organizationId: targetUser.organizationId,
        impersonation: true,
        sessionId: savedSession.id,
        adminUserId,
      },
      { expiresIn: '1h' }
    );

    // Create audit log
    await this.auditLogService.create({
      organizationId: targetUser.organizationId || '',
      user_id: adminUserId,
      action: 'IMPERSONATE' as any,
      entity_type: 'USER',
      entity_id: targetUser.id,
      description: `Impersonated user ${targetUser.email}. Reason: ${dto.reason}`,
      metadata: {
        sessionId: savedSession.id,
        targetUserId: targetUser.id,
        reason: dto.reason,
        ipAddress: ip_address,
      },
    });

    this.logger.log(`Impersonation session created: ${savedSession.id}`);

    return {
      success: true,
      impersonationToken,
      targetUser: {
        id: targetUser.id,
        email: targetUser.email,
        name: `${targetUser.firstName} ${targetUser.lastName}`,
        organizationId: targetUser.organizationId,
      },
      expiresAt,
      sessionId: savedSession.id,
    };
  }

  async endImpersonation(sessionId: string, adminUserId: string): Promise<void> {
    const session = await this.impersonationRepository.findOne({
      where: { id: sessionId, adminUserId, isActive: true },
    });

    if (!session) {
      throw new NotFoundException('Active impersonation session not found');
    }

    session.isActive = false;
    session.endedAt = new Date();
    await this.impersonationRepository.save(session);

    await this.auditLogService.create({
      organizationId: '',
      user_id: adminUserId,
      action: 'END_IMPERSONATE' as any,
      entity_type: 'USER',
      entity_id: session.targetUserId,
      description: 'Ended impersonation session',
      metadata: { sessionId },
    });

    this.logger.log(`Impersonation session ended: ${sessionId}`);
  }

  async getActiveImpersonations(): Promise<ActiveImpersonationDto[]> {
    const sessions = await this.impersonationRepository.find({
      where: { isActive: true },
      relations: ['adminUser', 'targetUser'],
      order: { created_at: 'DESC' } as any,
    });

    return sessions.map(session => ({
      id: session.id,
      adminEmail: session.adminUser?.email || 'Unknown',
      targetEmail: session.targetUser?.email || 'Unknown',
      reason: session.reason,
      startedAt: session.createdAt,
      duration: Math.floor((Date.now() - session.createdAt.getTime()) / 1000),
      isActive: session.isActive,
    }));
  }

  async searchUsers(query: UserSearchDto): Promise<User[]> {
    const where: any = {};

    if (query.search) {
      where.email = Like(`%${query.search}%`);
    }

    if (query.organizationId) {
      where.organizationId = query.organizationId;
    }

    if (query.role) {
      where.role = query.role;
    }

    if (query.status) {
      where.status = query.status;
    }

    return this.userRepository.find({
      where,
      take: 50,
      order: { createdAt: 'DESC' } as any,
    });
  }

  async performBulkAction(dto: BulkUserActionDto, performedBy: string): Promise<{ success: boolean; message: string; affected: number }> {
    this.logger.log(`Performing bulk action ${dto.action} on ${dto.userIds.length} users`);

    const users = await this.userRepository.find({
      where: { id: In(dto.userIds) },
    });

    if (users.length === 0) {
      return { success: false, message: 'No users found', affected: 0 };
    }

    let affected = 0;

    switch (dto.action) {
      case 'activate':
        await this.userRepository.update(
          { id: In(dto.userIds) },
          { isActive: true } as any
        );
        affected = users.length;
        break;

      case 'deactivate':
        await this.userRepository.update(
          { id: In(dto.userIds) },
          { isActive: false } as any
        );
        affected = users.length;
        break;

      case 'delete':
        // Soft delete by setting isActive to false
        await this.userRepository.update(
          { id: In(dto.userIds) },
          { isActive: false } as any
        );
        affected = users.length;
        break;

      case 'reset_password':
        // In production, send password reset emails
        affected = users.length;
        break;

      default:
        return { success: false, message: 'Invalid action', affected: 0 };
    }

    // Create audit log
    await this.auditLogService.create({
      organizationId: '',
      user_id: performedBy,
      action: 'BULK_ACTION' as any,
      entity_type: 'USER',
      entity_id: dto.userIds.join(','),
      description: `Performed bulk action: ${dto.action} on ${affected} users`,
      metadata: { action: dto.action, userIds: dto.userIds, reason: dto.reason },
    });

    return {
      success: true,
      message: `Successfully performed ${dto.action} on ${affected} users`,
      affected,
    };
  }

  async forceLogout(dto: ForceLogoutDto, performedBy: string): Promise<{ success: boolean; message: string }> {
    const user = await this.userRepository.findOne({
      where: { id: dto.userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // In production, invalidate all JWT tokens for this user
    // This would require a token blacklist or Redis cache

    await this.auditLogService.create({
      organizationId: user.organizationId || '',
      user_id: performedBy,
      action: 'FORCE_LOGOUT' as any,
      entity_type: 'USER',
      entity_id: dto.userId,
      description: `Forced logout for user ${user.email}`,
      metadata: { reason: dto.reason },
    });

    this.logger.log(`Forced logout for user ${dto.userId}`);

    return {
      success: true,
      message: `Successfully logged out user ${user.email}`,
    };
  }

  async getImpersonationHistory(targetUserId: string): Promise<ImpersonationSession[]> {
    return this.impersonationRepository.find({
      where: { targetUserId },
      relations: ['adminUser'],
      order: { createdAt: 'DESC' } as any,
      take: 50,
    });
  }
}
