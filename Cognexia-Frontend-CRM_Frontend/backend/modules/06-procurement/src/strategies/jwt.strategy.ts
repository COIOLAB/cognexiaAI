import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

export interface JwtPayload {
  sub: string; // user id
  email: string;
  username: string;
  roles: string[];
  permissions: string[];
  department: string;
  organizationId: string;
  sessionId: string;
  iat: number;
  exp: number;
}

export interface ProcurementUser extends JwtPayload {
  id: string;
  isActive: boolean;
  lastLogin: Date;
  procurementAccess: {
    level: 'read' | 'write' | 'admin';
    maxOrderValue: number;
    approvalLevel: number;
    restrictedCategories: string[];
    allowedSuppliers: string[];
  };
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET', 'procurement_jwt_secret'),
    });
  }

  async validate(payload: JwtPayload): Promise<ProcurementUser> {
    if (!payload.sub || !payload.email) {
      throw new UnauthorizedException('Invalid token payload');
    }

    // In a real application, you would fetch user details from database
    // including procurement-specific permissions and settings
    const user: ProcurementUser = {
      ...payload,
      id: payload.sub,
      isActive: true,
      lastLogin: new Date(),
      procurementAccess: {
        level: this.determineProcurementLevel(payload.roles),
        maxOrderValue: this.getMaxOrderValue(payload.roles),
        approvalLevel: this.getApprovalLevel(payload.roles),
        restrictedCategories: this.getRestrictedCategories(payload.roles),
        allowedSuppliers: this.getAllowedSuppliers(payload.roles, payload.department),
      },
    };

    return user;
  }

  private determineProcurementLevel(roles: string[]): 'read' | 'write' | 'admin' {
    if (roles.includes('procurement_admin') || roles.includes('admin')) {
      return 'admin';
    }
    if (roles.includes('procurement_manager') || roles.includes('buyer')) {
      return 'write';
    }
    return 'read';
  }

  private getMaxOrderValue(roles: string[]): number {
    if (roles.includes('procurement_admin') || roles.includes('admin')) {
      return Number.MAX_SAFE_INTEGER;
    }
    if (roles.includes('procurement_manager')) {
      return 100000; // $100k
    }
    if (roles.includes('senior_buyer')) {
      return 50000; // $50k
    }
    if (roles.includes('buyer')) {
      return 10000; // $10k
    }
    return 1000; // $1k default
  }

  private getApprovalLevel(roles: string[]): number {
    if (roles.includes('procurement_admin') || roles.includes('admin')) {
      return 5; // Highest approval level
    }
    if (roles.includes('procurement_manager')) {
      return 4;
    }
    if (roles.includes('senior_buyer')) {
      return 3;
    }
    if (roles.includes('buyer')) {
      return 2;
    }
    return 1; // Basic level
  }

  private getRestrictedCategories(roles: string[]): string[] {
    const restrictions: string[] = [];

    if (!roles.includes('procurement_admin') && !roles.includes('admin')) {
      if (!roles.includes('it_procurement')) {
        restrictions.push('IT', 'Software', 'Hardware');
      }
      if (!roles.includes('facilities_procurement')) {
        restrictions.push('Facilities', 'Real Estate', 'Construction');
      }
      if (!roles.includes('capital_procurement')) {
        restrictions.push('Capital Equipment', 'Machinery', 'Vehicles');
      }
    }

    return restrictions;
  }

  private getAllowedSuppliers(roles: string[], department: string): string[] {
    // In a real implementation, this would be fetched from database
    // based on user's role and department restrictions
    if (roles.includes('procurement_admin') || roles.includes('admin')) {
      return []; // No restrictions for admins (empty array means all allowed)
    }

    // Department-specific supplier restrictions could be applied here
    return []; // Return empty for no restrictions, or specific supplier IDs for restrictions
  }
}
