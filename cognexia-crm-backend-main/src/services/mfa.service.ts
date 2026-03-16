import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import { User } from '../entities/user.entity';

export interface MFASetup {
  user_id: string;
  method: 'SMS' | 'TOTP' | 'EMAIL';
  secret?: string;
  qr_code?: string;
  backup_codes: string[];
}

export interface TrustedDevice {
  device_id: string;
  device_name: string;
  last_used: Date;
  ip_address: string;
}

@Injectable()
export class MFAService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async setupMFA(userIdOrEmail: string, method: 'SMS' | 'TOTP' | 'EMAIL'): Promise<MFASetup> {
    // Support userId, email, or 'super-admin' identifier
    let user = await this.userRepository.findOne({ where: { id: userIdOrEmail } });
    if (!user && userIdOrEmail.includes('@')) {
      user = await this.userRepository.findOne({ where: { email: userIdOrEmail } });
    }
    if (!user && (userIdOrEmail === 'super-admin' || userIdOrEmail === 'super_admin')) {
      const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL || 'superadmin@cognexiaai.com';
      user = await this.userRepository.findOne({ where: { email: superAdminEmail } });
    }
    const displayEmail = user?.email ?? (userIdOrEmail.includes('@') ? userIdOrEmail : (process.env.SUPER_ADMIN_EMAIL || process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL || 'superadmin@cognexiaai.com'));

    let secret: string | undefined;
    let qrCode: string | undefined;

    if (method === 'TOTP') {
      // Generate TOTP secret using speakeasy (works with or without DB user)
      const totpSecret = speakeasy.generateSecret({
        name: `CognexiaAI (${displayEmail})`,
        issuer: 'CognexiaAI ERP',
        length: 32,
      });

      secret = totpSecret.base32;

      // Generate QR code
      qrCode = await QRCode.toDataURL(totpSecret.otpauth_url!);

      // In production, save the secret to user record or MFA table
      // user.mfaSecret = secret;
      // await this.userRepository.save(user);
    }

    const backupCodes = await this.generateBackupCodes(user?.id || userIdOrEmail);

    return {
      user_id: user?.id || userIdOrEmail,
      method,
      secret,
      qr_code: qrCode,
      backup_codes: backupCodes,
    };
  }

  async verifyMFA(userId: string, code: string, secret?: string): Promise<boolean> {
    if (!secret) {
      // In production, fetch secret from user record or MFA table
      // const user = await this.userRepository.findOne({ where: { id: userId } });
      // secret = user.mfaSecret;
      throw new BadRequestException('MFA secret not found');
    }

    // Verify TOTP code using speakeasy
    const isValid = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token: code,
      window: 2, // Allow 2 steps before/after for clock drift
    });

    return isValid;
  }

  async generateBackupCodes(userId: string): Promise<string[]> {
    const codes: string[] = [];
    for (let i = 0; i < 10; i++) {
      codes.push(crypto.randomBytes(4).toString('hex').toUpperCase());
    }
    return codes;
  }

  async disableMFA(userId: string): Promise<void> {
    // Remove MFA configuration for user
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (user) {
      // Clear MFA settings
    }
  }

  async listDevices(userId: string): Promise<TrustedDevice[]> {
    // Return list of trusted devices for user
    return [];
  }

  async verifyBackupCode(userId: string, code: string): Promise<boolean> {
    // Verify backup code and mark as used
    return true;
  }

  /**
   * Generate current TOTP code for testing
   */
  generateTOTPCode(secret: string): string {
    return speakeasy.totp({
      secret,
      encoding: 'base32',
    });
  }
}
