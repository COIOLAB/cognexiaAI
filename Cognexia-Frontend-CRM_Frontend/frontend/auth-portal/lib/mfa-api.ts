const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003/api/v1';

export interface SendOTPResponse {
  success: boolean;
  message: string;
  expiresIn: number;
  devOTP?: string; // Only in development
}

export interface VerifyOTPResponse {
  success: boolean;
  message: string;
}

export interface SetupTOTPResponse {
  success: boolean;
  secret: string;
  qrCode: string; // Base64 data URL
  backupCodes: string[];
  message: string;
}

export class MFAApi {
  /**
   * Send OTP via Email
   */
  static async sendEmailOTP(email: string): Promise<SendOTPResponse> {
    try {
      const response = await fetch(`${API_URL}/mfa/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          method: 'email',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to send email OTP');
      }

      return await response.json();
    } catch (error: any) {
      console.error('[MFA API] Email OTP error:', error);
      throw error;
    }
  }

  /**
   * Send OTP via SMS
   */
  static async sendMobileOTP(phone: string): Promise<SendOTPResponse> {
    try {
      const response = await fetch(`${API_URL}/mfa/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone,
          method: 'sms',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to send mobile OTP');
      }

      return await response.json();
    } catch (error: any) {
      console.error('[MFA API] Mobile OTP error:', error);
      throw error;
    }
  }

  /**
   * Verify Email OTP
   */
  static async verifyEmailOTP(email: string, code: string): Promise<VerifyOTPResponse> {
    try {
      const response = await fetch(`${API_URL}/mfa/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          code,
          method: 'email',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Invalid OTP');
      }

      return await response.json();
    } catch (error: any) {
      console.error('[MFA API] Email verification error:', error);
      throw error;
    }
  }

  /**
   * Verify Mobile OTP
   */
  static async verifyMobileOTP(phone: string, code: string): Promise<VerifyOTPResponse> {
    try {
      const response = await fetch(`${API_URL}/mfa/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone,
          code,
          method: 'sms',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Invalid OTP');
      }

      return await response.json();
    } catch (error: any) {
      console.error('[MFA API] Mobile verification error:', error);
      throw error;
    }
  }

  /**
   * Verify TOTP (Google Authenticator)
   */
  static async verifyTOTP(code: string, secret: string): Promise<VerifyOTPResponse> {
    try {
      const response = await fetch(`${API_URL}/mfa/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          secret,
          method: 'totp',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Invalid TOTP code');
      }

      return await response.json();
    } catch (error: any) {
      console.error('[MFA API] TOTP verification error:', error);
      throw error;
    }
  }

  /**
   * Setup TOTP (Google Authenticator) - Get QR Code
   */
  static async setupTOTP(email: string): Promise<SetupTOTPResponse> {
    try {
      const response = await fetch(`${API_URL}/mfa/setup-totp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to setup TOTP');
      }

      return await response.json();
    } catch (error: any) {
      console.error('[MFA API] TOTP setup error:', error);
      throw error;
    }
  }

  /**
   * Generate test TOTP code (for testing only)
   */
  static async generateTestTOTP(secret: string): Promise<{ success: boolean; code: string; message: string }> {
    try {
      const response = await fetch(`${API_URL}/mfa/generate-test-totp?secret=${encodeURIComponent(secret)}`, {
        method: 'GET',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to generate test TOTP');
      }

      return await response.json();
    } catch (error: any) {
      console.error('[MFA API] Test TOTP error:', error);
      throw error;
    }
  }
}
