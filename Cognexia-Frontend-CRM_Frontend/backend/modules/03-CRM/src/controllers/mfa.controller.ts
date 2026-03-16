import { Controller, Post, Body, Get, Query, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { MFAService } from '../services/mfa.service';
import { EmailNotificationService } from '../services/email-notification.service';
import * as crypto from 'crypto';
import * as twilio from 'twilio';

interface SendOTPRequest {
  email?: string;
  phone?: string;
  method: 'email' | 'sms';
}

interface VerifyOTPRequest {
  email?: string;
  phone?: string;
  code: string;
  method: 'email' | 'sms' | 'totp';
  secret?: string;
}

interface SetupTOTPRequest {
  email: string;
}

// In-memory store for OTPs (in production, use Redis with TTL)
const otpStore = new Map<string, { code: string; expiry: number }>();

/** Normalize phone to a single key so send and verify always match (e.g. +918850815294 vs 918850815294) */
function normalizePhoneKey(phone: string | undefined): string {
  if (!phone || typeof phone !== 'string') return '';
  const digits = phone.replace(/\D/g, '');
  return digits.length ? `+${digits}` : phone.trim();
}

@ApiTags('MFA')
@Controller('mfa')
export class MFAController {
  constructor(
    private readonly mfaService: MFAService,
    private readonly emailService: EmailNotificationService,
  ) {}

  @Post('send-otp')
  @ApiOperation({ summary: 'Send OTP via email or SMS' })
  async sendOTP(@Body() body: SendOTPRequest) {
    const { email, phone, method } = body;

    if (method === 'email' && email) {
      // Generate 6-digit OTP for email
      const otp = crypto.randomInt(100000, 999999).toString();
      const expiry = Date.now() + 5 * 60 * 1000; // 5 minutes
      
      // Store OTP for email verification
      otpStore.set(email, { code: otp, expiry });

      try {
        // Send email OTP with correct parameters (to, subject, html)
        await this.emailService.sendEmail(
          email,
          'CognexiaAI - Your Verification Code',
          `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">CognexiaAI Super Admin Portal</h2>
            <p style="font-size: 16px;">Your verification code is:</p>
            <div style="background-color: #f3f4f6; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 20px 0;">
              ${otp}
            </div>
            <p style="color: #6b7280; font-size: 14px;">This code will expire in 5 minutes.</p>
            <p style="color: #6b7280; font-size: 14px;">If you didn't request this code, please ignore this email.</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 12px;">CognexiaAI ERP System - Secure Access</p>
          </div>
        `
        );

        console.log(`[EMAIL OTP] Sent code to ${email}`);
      } catch (err: any) {
        console.warn(`[EMAIL OTP] Send failed (${err?.message}), using dev fallback`);
      }

      // In dev (SMTP often not configured), return devOTP so user can complete flow
      const isDev = !process.env.SMTP_HOST || !process.env.SMTP_USER;
      return {
        success: true,
        message: isDev ? 'OTP generated (dev mode - check console or use below)' : 'OTP sent to email successfully',
        expiresIn: 300, // 5 minutes in seconds
        ...(isDev && { devOTP: otp }),
      };
    } else if (method === 'sms' && phone) {
      // Send SMS OTP using Twilio Verify API
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const verifySid = process.env.TWILIO_VERIFY_SERVICE_SID;

      console.log('[SMS SEND] Configuration check:');
      console.log('[SMS SEND] Account SID:', accountSid ? `${accountSid.substring(0, 8)}...` : 'NOT SET');
      console.log('[SMS SEND] Auth Token:', authToken ? 'SET (hidden)' : 'NOT SET');
      console.log('[SMS SEND] Verify SID:', verifySid ? `${verifySid.substring(0, 8)}...` : 'NOT SET');
      console.log('[SMS SEND] Target phone:', phone);

      // Use local OTP if Twilio not fully configured or explicitly disabled
      if (!accountSid || !authToken || !verifySid || process.env.TWILIO_SMS_USE_LOCAL === 'true') {
        const otp = crypto.randomInt(100000, 999999).toString();
        const expiry = Date.now() + 5 * 60 * 1000;
        const phoneKey = normalizePhoneKey(phone);
        otpStore.set(phoneKey, { code: otp, expiry });
        
        console.warn('[SMS] Twilio not configured, using local OTP mode');
        console.log(`[SMS LOCAL] OTP: ${otp} for ${phone} (key: ${phoneKey})`);
        return {
          success: true,
          message: `OTP generated for ${phone} (local mode - use code shown below)`,
          expiresIn: 300,
          devOTP: otp,
        };
      }

      try {
        // Initialize Twilio client
        const client = twilio(accountSid, authToken);

        console.log('[SMS SEND] Calling Twilio Verify API...');
        
        // Send verification using Twilio Verify API
        const verification = await client.verify.v2
          .services(verifySid)
          .verifications.create({
            to: phone,
            channel: 'sms',
          });

        console.log(`[SMS SEND] ✅ Twilio verification sent:`, {
          sid: verification.sid,
          status: verification.status,
          to: verification.to,
        });

        return {
          success: true,
          message: `SMS sent to ${phone}. Check your phone!`,
          expiresIn: 600, // Twilio default is 10 minutes
          verificationSid: verification.sid,
        };
      } catch (error: any) {
        console.error('[SMS SEND] ❌ Twilio error:', {
          message: error.message,
          code: error.code,
          status: error.status,
          moreInfo: error.moreInfo,
        });

        // Fallback to local OTP on Twilio error
        const otp = crypto.randomInt(100000, 999999).toString();
        const expiry = Date.now() + 5 * 60 * 1000;
        const phoneKey = normalizePhoneKey(phone);
        otpStore.set(phoneKey, { code: otp, expiry });
        
        console.log(`[SMS LOCAL FALLBACK] OTP: ${otp} for ${phone} (key: ${phoneKey})`);
        
        // Return with devOTP so user can still proceed
        return {
          success: true,
          message: `Twilio unavailable (${error.code || 'error'}). Use this code:`,
          expiresIn: 300,
          devOTP: otp,
          twilioError: error.message,
        };
      }
    }

    throw new BadRequestException('Invalid method');
  }

  @Post('verify-otp')
  @ApiOperation({ summary: 'Verify OTP code' })
  async verifyOTP(@Body() body: VerifyOTPRequest) {
    const { email, phone, code, method, secret } = body;

    if (method === 'totp' && secret) {
      // Verify TOTP (Google Authenticator)
      const isValid = await this.mfaService.verifyMFA('super-admin', code, secret);
      
      if (isValid) {
        return {
          success: true,
          message: 'TOTP code verified successfully',
        };
      } else {
        throw new BadRequestException('Invalid TOTP code');
      }
    }

    // SMS verification using Twilio Verify API
    if (method === 'sms' && phone) {
      console.log('[SMS VERIFY] Attempting to verify SMS OTP');
      console.log('[SMS VERIFY] Phone:', phone);
      console.log('[SMS VERIFY] Code:', code);
      console.log('[SMS VERIFY] Code length:', code?.length);
      
      try {
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        const verifySid = process.env.TWILIO_VERIFY_SERVICE_SID;
        
        console.log('[SMS VERIFY] Twilio configured:', !!accountSid && !!authToken && !!verifySid);

        if (!accountSid || !authToken || !verifySid || process.env.TWILIO_SMS_USE_LOCAL === 'true') {
          // Fallback to local verification (or when TWILIO_SMS_USE_LOCAL=true to bypass Twilio)
          console.warn('[SMS] Twilio not configured or TWILIO_SMS_USE_LOCAL=true, using local verification');
          const phoneKey = normalizePhoneKey(phone);
          const stored = otpStore.get(phoneKey) || otpStore.get(phone);
          if (!stored || Date.now() > stored.expiry) {
            throw new BadRequestException('OTP expired or not found');
          }
          if (stored.code !== code) {
            throw new BadRequestException('Invalid OTP code');
          }
          otpStore.delete(phoneKey);
          otpStore.delete(phone);
          return {
            success: true,
            message: 'OTP verified successfully (local)',
          };
        }

        // Verify using Twilio Verify API
        console.log('[SMS VERIFY] Calling Twilio Verify API...');
        const client = twilio(accountSid, authToken);
        const verificationCheck = await client.verify.v2
          .services(verifySid)
          .verificationChecks.create({
            to: phone,
            code: code,
          });

        console.log('[SMS VERIFY] Twilio response status:', verificationCheck.status);
        console.log('[SMS VERIFY] Twilio response:', JSON.stringify(verificationCheck, null, 2));

        if (verificationCheck.status === 'approved') {
          console.log(`[SMS VERIFY] ✅ Verification approved for ${phone}`);
          return {
            success: true,
            message: 'Mobile OTP verified successfully',
          };
        } else {
          console.log(`[SMS VERIFY] ❌ Verification failed with status: ${verificationCheck.status}`);
          throw new BadRequestException(`Invalid or expired OTP code (Status: ${verificationCheck.status})`);
        }
      } catch (error: any) {
        console.error('[SMS] Twilio verification error:', error.message, error.code);
        // Try local fallback (used when send fell back to dev mode) - try both raw and normalized phone
        const phoneKey = normalizePhoneKey(phone);
        const stored = otpStore.get(phoneKey) || otpStore.get(phone);
        if (stored && Date.now() <= stored.expiry && stored.code === code) {
          otpStore.delete(phoneKey);
          otpStore.delete(phone);
          console.log('[SMS VERIFY] ✅ Accepted via local fallback');
          return {
            success: true,
            message: 'OTP verified successfully (fallback)',
          };
        }
        // Twilio 20404 = resource not found - Verify Service SID invalid or service deleted
        const isTwilioNotFound = error.code === 20404 || (error.message && error.message.includes('was not found'));
        if (isTwilioNotFound) {
          throw new BadRequestException(
            'SMS verification service is not configured. Please click "Send OTP to Mobile" again to use local verification (OTP will be shown in the message).'
          );
        }
        throw new BadRequestException(error.message || 'Invalid OTP code');
      }
    }

    // Email verification (local)
    const key = email || phone;
    if (!key) {
      throw new BadRequestException('Email or phone is required');
    }

    const stored = otpStore.get(key);
    
    if (!stored) {
      throw new BadRequestException('No OTP found. Please request a new one.');
    }

    if (Date.now() > stored.expiry) {
      otpStore.delete(key);
      throw new BadRequestException('OTP expired. Please request a new one.');
    }

    if (stored.code !== code) {
      throw new BadRequestException('Invalid OTP code');
    }

    // OTP is valid, remove it
    otpStore.delete(key);

    return {
      success: true,
      message: 'OTP verified successfully',
    };
  }

  @Post('setup-totp')
  @ApiOperation({ summary: 'Setup TOTP (Google Authenticator)' })
  async setupTOTP(@Body() body: SetupTOTPRequest) {
    const { email } = body;

    // Generate TOTP secret and QR code (pass email for lookup, or 'super-admin' if not provided)
    const identifier = email || 'super-admin';
    const setup = await this.mfaService.setupMFA(identifier, 'TOTP');

    // In production, store the secret in database associated with the user
    
    return {
      success: true,
      secret: setup.secret,
      qrCode: setup.qr_code,
      backupCodes: setup.backup_codes,
      message: 'Scan the QR code with your authenticator app',
    };
  }

  @Get('generate-test-totp')
  @ApiOperation({ summary: 'Generate TOTP code for testing' })
  async generateTestTOTP(@Query('secret') secret: string) {
    if (!secret) {
      throw new BadRequestException('Secret is required');
    }

    const code = this.mfaService.generateTOTPCode(secret);
    
    return {
      success: true,
      code,
      message: 'Current TOTP code (valid for 30 seconds)',
    };
  }

  @Get('twilio-status')
  @ApiOperation({ summary: 'Check Twilio configuration status' })
  async twilioStatus() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const verifySid = process.env.TWILIO_VERIFY_SERVICE_SID;
    const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

    const config = {
      accountSid: accountSid ? `${accountSid.substring(0, 8)}...${accountSid.substring(accountSid.length - 4)}` : 'NOT SET',
      authToken: authToken ? 'SET (hidden)' : 'NOT SET',
      verifySid: verifySid ? `${verifySid.substring(0, 8)}...${verifySid.substring(verifySid.length - 4)}` : 'NOT SET',
      twilioPhone: twilioPhone || 'NOT SET',
      isConfigured: !!(accountSid && authToken && verifySid),
      useLocalFallback: process.env.TWILIO_SMS_USE_LOCAL === 'true',
    };

    // Try to validate credentials if configured
    if (config.isConfigured && !config.useLocalFallback) {
      try {
        const client = twilio(accountSid, authToken);
        // Try to fetch the Verify Service to validate credentials
        const service = await client.verify.v2.services(verifySid).fetch();
        return {
          ...config,
          status: 'OK',
          serviceName: service.friendlyName,
          message: 'Twilio is properly configured and credentials are valid',
        };
      } catch (error: any) {
        return {
          ...config,
          status: 'ERROR',
          errorCode: error.code,
          errorMessage: error.message,
          suggestion: error.code === 20404 
            ? 'Verify Service not found. Create one at https://console.twilio.com/us1/develop/verify/services'
            : error.code === 20003
            ? 'Authentication failed. Check your Account SID and Auth Token in Twilio Console'
            : 'Check Twilio Console for more details',
        };
      }
    }

    return {
      ...config,
      status: config.useLocalFallback ? 'LOCAL_MODE' : 'NOT_CONFIGURED',
      message: config.useLocalFallback 
        ? 'Using local OTP mode (TWILIO_SMS_USE_LOCAL=true)'
        : 'Twilio not fully configured. SMS will use local fallback.',
    };
  }

  @Get('cleanup-expired')
  @ApiOperation({ summary: 'Cleanup expired OTPs (cron job)' })
  async cleanupExpired() {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, value] of otpStore.entries()) {
      if (now > value.expiry) {
        otpStore.delete(key);
        cleaned++;
      }
    }

    return {
      success: true,
      cleaned,
      remaining: otpStore.size,
    };
  }
}
