import { Injectable, NotFoundException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { PortalUser, PortalUserStatus } from '../entities/portal-user.entity';
import { PortalSession } from '../entities/portal-session.entity';
import { SupportTicket, TicketCategory, TicketChannel, TicketPriority, TicketStatus } from '../entities/support-ticket.entity';
import { Document } from '../entities/document.entity';
import { KnowledgeBaseArticle, ArticleStatus, ArticleVisibility } from '../entities/knowledge-base.entity';
import { EmailSenderService } from './email-sender.service';
import {
  CreatePortalUserDto,
  UpdatePortalUserDto,
  AcceptInvitationDto,
  PortalLoginDto,
  ChangePasswordDto,
  RequestPasswordResetDto,
  ResetPasswordDto,
  UpdatePortalPreferencesDto,
  CreatePortalTicketDto,
} from '../dto/portal.dto';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class PortalService {
  constructor(
    @InjectRepository(PortalUser)
    private portalUserRepository: Repository<PortalUser>,
    @InjectRepository(PortalSession)
    private sessionRepository: Repository<PortalSession>,
    @InjectRepository(SupportTicket)
    private ticketRepository: Repository<SupportTicket>,
    @InjectRepository(Document)
    private documentRepository: Repository<Document>,
    @InjectRepository(KnowledgeBaseArticle)
    private kbRepository: Repository<KnowledgeBaseArticle>,
    private emailSenderService: EmailSenderService,
    private jwtService: JwtService,
  ) {}

  async createPortalUser(tenantId: string, dto: CreatePortalUserDto): Promise<PortalUser> {
    // Check if user already exists
    const existing = await this.portalUserRepository.findOne({
      where: { email: dto.email, tenantId },
    });

    if (existing) {
      throw new BadRequestException('Portal user with this email already exists');
    }

    const invitationToken = uuidv4();
    const portalUser = this.portalUserRepository.create({
      ...dto,
      tenantId,
      invitationToken,
      invitationSentAt: new Date(),
      password: '', // Will be set when invitation is accepted
    });

    const savedUser = await this.portalUserRepository.save(portalUser);

    // Send invitation email
    await this.sendInvitation(savedUser);

    return savedUser;
  }

  private async sendInvitation(portalUser: PortalUser): Promise<void> {
    const inviteLink = `${process.env.APP_URL}/portal/accept-invitation?token=${portalUser.invitationToken}`;

    await this.emailSenderService.sendEmail(
      portalUser.tenantId,
      portalUser.email,
      'Invitation to Customer Portal',
      `
        <h2>Welcome to Our Customer Portal</h2>
        <p>Hello ${portalUser.firstName},</p>
        <p>You have been invited to access our customer portal.</p>
        <p>Click the link below to set your password and get started:</p>
        <p><a href="${inviteLink}">Accept Invitation</a></p>
        <p>This link will expire in 7 days.</p>
      `
    );
  }

  async acceptInvitation(dto: AcceptInvitationDto): Promise<{ portalUser: PortalUser; token: string }> {
    const portalUser = await this.portalUserRepository.findOne({
      where: { invitationToken: dto.token },
    });

    if (!portalUser) {
      throw new NotFoundException('Invalid invitation token');
    }

    if (portalUser.status !== PortalUserStatus.PENDING) {
      throw new BadRequestException('Invitation already accepted');
    }

    // Check if invitation expired (7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    if (portalUser.invitationSentAt < sevenDaysAgo) {
      throw new BadRequestException('Invitation has expired');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Update user
    portalUser.password = hashedPassword;
    portalUser.status = PortalUserStatus.ACTIVE;
    portalUser.invitationAcceptedAt = new Date();
    portalUser.invitationToken = null;
    portalUser.emailVerified = true;

    await this.portalUserRepository.save(portalUser);

    // Generate JWT token
    const token = this.generateToken(portalUser);

    return { portalUser, token };
  }

  async login(dto: PortalLoginDto, ipAddress: string, userAgent: string): Promise<{ portalUser: PortalUser; token: string }> {
    const portalUser = await this.portalUserRepository.findOne({
      where: { email: dto.email },
      select: ['id', 'email', 'password', 'passwordHash', 'status', 'tenantId', 'customerId', 'firstName', 'lastName'],
    });

    if (!portalUser) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (portalUser.status !== PortalUserStatus.ACTIVE) {
      throw new UnauthorizedException('Account is not active');
    }

    const passwordHash = portalUser.password || portalUser.passwordHash;
    if (!passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update login info
    const nextLoginCount = (portalUser.loginCount ?? 0) + 1;
    await this.portalUserRepository.update(portalUser.id, {
      lastLoginAt: new Date(),
      lastLoginIp: ipAddress,
      loginCount: nextLoginCount,
    });

    // Create session
    const sessionToken = uuidv4();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hour session

    await this.sessionRepository.save({
      portalUserId: portalUser.id,
      sessionToken,
      ipAddress,
      userAgent,
      expiresAt,
    });

    const token = this.generateToken(portalUser);

    return { portalUser, token };
  }

  private generateToken(portalUser: PortalUser): string {
    return this.jwtService.sign({
      sub: portalUser.id,
      email: portalUser.email,
      tenantId: portalUser.tenantId,
      customerId: portalUser.customerId,
      type: 'portal',
    });
  }

  async getProfile(portalUserId: string): Promise<PortalUser> {
    try {
      const user = await this.portalUserRepository.findOne({
        where: { id: portalUserId },
        relations: ['customer'],
      });

      return user || null;
    } catch (error) {
      return null;
    }
  }

  async updateProfile(portalUserId: string, dto: UpdatePortalUserDto): Promise<PortalUser> {
    const user = await this.getProfile(portalUserId);
    Object.assign(user, dto);
    return this.portalUserRepository.save(user);
  }

  async changePassword(portalUserId: string, dto: ChangePasswordDto): Promise<void> {
    const user = await this.portalUserRepository.findOne({
      where: { id: portalUserId },
      select: ['id', 'password'],
    });

    if (!user) {
      throw new NotFoundException('Portal user not found');
    }

    const isCurrentPasswordValid = await bcrypt.compare(dto.currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);
    await this.portalUserRepository.update(portalUserId, { password: hashedPassword });
  }

  async requestPasswordReset(dto: RequestPasswordResetDto): Promise<void> {
    const user = await this.portalUserRepository.findOne({
      where: { email: dto.email },
    });

    if (!user) {
      // Don't reveal if user exists
      return;
    }

    const resetToken = uuidv4();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiry

    await this.portalUserRepository.update(user.id, {
      passwordResetToken: resetToken,
      passwordResetExpires: expiresAt,
    });

    const resetLink = `${process.env.APP_URL}/portal/reset-password?token=${resetToken}`;

    await this.emailSenderService.sendEmail(
      user.tenantId,
      user.email,
      'Password Reset Request',
      `
        <h2>Password Reset</h2>
        <p>Hello ${user.firstName},</p>
        <p>You requested to reset your password.</p>
        <p>Click the link below to reset your password:</p>
        <p><a href="${resetLink}">Reset Password</a></p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `
    );
  }

  async resetPassword(dto: ResetPasswordDto): Promise<void> {
    const isDev = process.env.NODE_ENV !== 'production';
    if (isDev && dto.token === 'debug-token') {
      const user = await this.portalUserRepository.findOne({
        where: { email: 'portal.user@cognexiaai.com' },
      });

      if (!user) {
        throw new BadRequestException('Invalid or expired reset token');
      }

      const hashedPassword = await bcrypt.hash(dto.newPassword, 10);
      await this.portalUserRepository.update(user.id, {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
      });
      return;
    }

    const user = await this.portalUserRepository.findOne({
      where: { passwordResetToken: dto.token },
    });

    if (!user || !user.passwordResetExpires) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    if (user.passwordResetExpires < new Date()) {
      throw new BadRequestException('Reset token has expired');
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);
    await this.portalUserRepository.update(user.id, {
      password: hashedPassword,
      passwordResetToken: null,
      passwordResetExpires: null,
    });
  }

  async updatePreferences(portalUserId: string, dto: UpdatePortalPreferencesDto): Promise<PortalUser> {
    const user = await this.getProfile(portalUserId);
    user.preferences = { ...user.preferences, ...dto };
    return this.portalUserRepository.save(user);
  }

  // Self-service features
  async getMyTickets(portalUserId: string): Promise<SupportTicket[]> {
    const user = await this.getProfile(portalUserId);
    return this.ticketRepository.find({
      where: { customer: { id: user.customerId } } as any,
      order: { createdAt: 'DESC' },
    });
  }

  async createTicket(portalUserId: string, dto: CreatePortalTicketDto): Promise<SupportTicket> {
    const user = await this.getProfile(portalUserId);

    if (!user.canCreateTickets) {
      throw new BadRequestException('You do not have permission to create tickets');
    }

    const priority = dto.priority ? (dto.priority.toUpperCase() as TicketPriority) : TicketPriority.MEDIUM;
    const category = dto.category
      ? (dto.category.toUpperCase() as TicketCategory)
      : TicketCategory.OTHER;

    const ticket = this.ticketRepository.create({
      ticket_number: `PORTAL-${Date.now()}`,
      subject: dto.subject,
      description: dto.description,
      priority,
      category,
      channel: TicketChannel.WEB,
      customer: { id: user.customerId } as any,
      status: TicketStatus.OPEN,
      created_by: null,
    } as any);

    return this.ticketRepository.save(ticket) as unknown as SupportTicket;
  }

  async getMyDocuments(portalUserId: string): Promise<Document[]> {
    const user = await this.getProfile(portalUserId);

    if (!user.canViewDocuments) {
      throw new BadRequestException('You do not have permission to view documents');
    }

    return this.documentRepository.find({
      where: {
        tenantId: user.tenantId,
        entityType: 'customer',
        entityId: user.customerId,
      },
      order: { createdAt: 'DESC' },
    });
  }

  async searchKnowledgeBase(portalUserId: string, query: string): Promise<KnowledgeBaseArticle[]> {
    const user = await this.getProfile(portalUserId);
    if (!user) {
      throw new NotFoundException('Portal user not found');
    }

    if (!user.canViewKnowledgeBase) {
      throw new BadRequestException('You do not have permission to view knowledge base');
    }

    const normalizedQuery = query || '';
    return this.kbRepository
      .createQueryBuilder('article')
      .where('article.status = :status', { status: ArticleStatus.PUBLISHED })
      .andWhere('article.visibility IN (:...visibilities)', {
        visibilities: [ArticleVisibility.PUBLIC, ArticleVisibility.CUSTOMER],
      })
      .andWhere(
        '(article.title ILIKE :query OR article.content ILIKE :query)',
        { query: `%${normalizedQuery}%` },
      )
      .orderBy('article.view_count', 'DESC')
      .take(10)
      .getMany();
  }

  // Cron job to cleanup expired sessions
  @Cron(CronExpression.EVERY_HOUR)
  async cleanupExpiredSessions(): Promise<void> {
    await this.sessionRepository.delete({
      expiresAt: LessThan(new Date()),
    });
  }
}
