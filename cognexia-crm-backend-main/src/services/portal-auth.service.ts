import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PortalUser } from '../entities/portal-user.entity';
import { Organization } from '../entities/organization.entity';

/**
 * Portal Auth Service
 * Handles authentication for customer portal users
 */
@Injectable()
export class PortalAuthService {
  constructor(
    @InjectRepository(PortalUser)
    private portalUserRepository: Repository<PortalUser>,
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
    private jwtService: JwtService,
  ) {}

  /**
   * Login portal user
   */
  async login(email: string, password: string, organizationId: string): Promise<{ accessToken: string; user: any }> {
    const user = await this.portalUserRepository.findOne({
      where: { email: email.toLowerCase(), organizationId },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    const accessToken = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      organizationId: user.organizationId,
      userType: 'portal_user',
    });

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        organizationId: user.organizationId,
      },
    };
  }

  /**
   * Register portal user
   */
  async register(data: {
    email: string;
    password: string;
    name: string;
    organizationId: string;
  }): Promise<{ accessToken: string; user: any }> {
    const existingUser = await this.portalUserRepository.findOne({
      where: { email: data.email.toLowerCase(), organizationId: data.organizationId },
    });

    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = this.portalUserRepository.create({
      email: data.email.toLowerCase(),
      name: data.name,
      passwordHash,
      organizationId: data.organizationId,
      isActive: true,
    });

    await this.portalUserRepository.save(user);

    return this.login(data.email, data.password, data.organizationId);
  }

  /**
   * Validate portal user token
   */
  async validateToken(token: string): Promise<any> {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.portalUserRepository.findOne({
        where: { id: payload.sub },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException('Invalid token');
      }

      return user;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
