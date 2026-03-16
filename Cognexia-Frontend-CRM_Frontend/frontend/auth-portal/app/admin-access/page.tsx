'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { Shield, Lock, AlertTriangle, Eye, EyeOff, Smartphone, Mail, QrCode, Key, Phone, Camera, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AuthService, type LoginCredentials } from '@/lib/auth-service';
import toast, { Toaster } from 'react-hot-toast';
import { Html5Qrcode } from 'html5-qrcode';
import { QRCodeCanvas } from 'qrcode.react';
import { MFAApi } from '@/lib/mfa-api';

const superAdminSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password is required'),
  totpCode: z.string().optional(),
  emailOtp: z.string().optional(),
});

type SuperAdminFormData = z.infer<typeof superAdminSchema>;
type AuthMethod = 'totp' | 'email' | 'mobile' | 'qr-scan';

export default function SuperAdminAccessPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState(0);
  const [clientIP, setClientIP] = useState<string>('');
  const [authMethod, setAuthMethod] = useState<AuthMethod>('totp');
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [mobileOtpSent, setMobileOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [step, setStep] = useState<'credentials' | 'verification'>('credentials');
  const [qrScannerActive, setQrScannerActive] = useState(false);
  const [qrData, setQrData] = useState<string>('');
  const qrScannerRef = useRef<Html5Qrcode | null>(null);
  const qrReaderRef = useRef<HTMLDivElement>(null);
  const [showTotpSetup, setShowTotpSetup] = useState(false);
  const [totpSetupData, setTotpSetupData] = useState<{ secret: string; qrCode: string } | null>(null);
  const [totpSetupStep, setTotpSetupStep] = useState<'qr' | 'verify'>('qr');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SuperAdminFormData>({
    resolver: zodResolver(superAdminSchema),
  });

  useEffect(() => {
    // Get client IP for logging (simplified - in production use proper IP detection)
    fetch('https://api.ipify.org?format=json')
      .then(res => res.json())
      .then(data => setClientIP(data.ip))
      .catch(() => setClientIP('unknown'));

    // Check for existing lockout
    const lockoutEnd = localStorage.getItem('admin_lockout');
    if (lockoutEnd) {
      const remaining = parseInt(lockoutEnd) - Date.now();
      if (remaining > 0) {
        setIsLocked(true);
        setLockoutTime(Math.ceil(remaining / 1000));
      } else {
        localStorage.removeItem('admin_lockout');
        localStorage.removeItem('admin_attempts');
      }
    }
  }, []);

  useEffect(() => {
    if (lockoutTime > 0) {
      const timer = setTimeout(() => {
        setLockoutTime(lockoutTime - 1);
        if (lockoutTime === 1) {
          setIsLocked(false);
          localStorage.removeItem('admin_lockout');
          localStorage.removeItem('admin_attempts');
          setAttemptCount(0);
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [lockoutTime]);

  useEffect(() => {
    if (otpTimer > 0) {
      const timer = setTimeout(() => {
        setOtpTimer(otpTimer - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [otpTimer]);

  const handleCredentialsSubmit = async (data: SuperAdminFormData) => {
    if (isLocked) {
      toast.error(`Access locked. Try again in ${lockoutTime} seconds`);
      return;
    }

    setIsLoading(true);
    try {
      // Verify credentials
      const expectedEmail = process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL || 'superadmin@cognexiaai.com';
      const expectedPassword = process.env.NEXT_PUBLIC_SUPER_ADMIN_PASSWORD || 'Akshita@19822';

      if (data.email !== expectedEmail || data.password !== expectedPassword) {
        throw new Error('Invalid credentials');
      }

      // Move to verification step
      setStep('verification');
      toast.success('Credentials verified. Please enter 2FA code.');

    } catch (error: any) {
      const newAttemptCount = attemptCount + 1;
      setAttemptCount(newAttemptCount);
      localStorage.setItem('admin_attempts', newAttemptCount.toString());

      console.warn('[SECURITY] Failed Super Admin access attempt', {
        email: data.email,
        attempt: newAttemptCount,
        timestamp: new Date().toISOString(),
        ip: clientIP,
        error: error.message,
      });

      if (newAttemptCount >= 3) {
        const lockoutDuration = Math.min(30 * Math.pow(2, newAttemptCount - 3), 3600);
        const lockoutEnd = Date.now() + (lockoutDuration * 1000);
        localStorage.setItem('admin_lockout', lockoutEnd.toString());
        setIsLocked(true);
        setLockoutTime(lockoutDuration);
        toast.error(`Too many failed attempts. Access locked for ${lockoutDuration} seconds`);
      } else {
        toast.error(error.message || 'Access denied');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificationSubmit = async (data: SuperAdminFormData) => {
    setIsLoading(true);
    try {
      let isValid = false;

      console.log('[MFA] Verifying with method:', authMethod);
      console.log('[MFA] Form data:', { totpCode: data.totpCode, emailOtp: data.emailOtp });

      if (authMethod === 'totp') {
        // Validate TOTP code
        if (!data.totpCode || data.totpCode.length !== 6 || !/^\d+$/.test(data.totpCode)) {
          throw new Error('Please enter a valid 6-digit code');
        }
        // Verify TOTP code via API
        console.log('[MFA] Verifying TOTP code...');
        const storedSecret = localStorage.getItem('totp_secret');
        const secret = storedSecret || process.env.NEXT_PUBLIC_TOTP_SECRET || 'JBSWY3DPEHPK3PXP';
        console.log('[MFA] Using secret:', secret ? 'Found' : 'Not found');
        const response = await MFAApi.verifyTOTP(data.totpCode, secret);
        console.log('[MFA] TOTP response:', response);
        isValid = response.success;
      } else if (authMethod === 'email') {
        // Validate email OTP
        if (!data.emailOtp || data.emailOtp.length !== 6 || !/^\d+$/.test(data.emailOtp)) {
          throw new Error('Please enter a valid 6-digit OTP');
        }
        // Verify email OTP via API
        console.log('[MFA] Verifying email OTP...');
        const email = process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL || 'superadmin@cognexiaai.com';
        const response = await MFAApi.verifyEmailOTP(email, data.emailOtp);
        console.log('[MFA] Email OTP response:', response);
        isValid = response.success;
      } else if (authMethod === 'mobile') {
        // Validate mobile OTP
        if (!data.emailOtp || data.emailOtp.length !== 6 || !/^\d+$/.test(data.emailOtp)) {
          throw new Error('Please enter a valid 6-digit SMS code');
        }
        // Verify mobile OTP via API
        console.log('[MFA] Verifying mobile OTP...');
        const mobile = process.env.NEXT_PUBLIC_SUPER_ADMIN_MOBILE || '+918850815294';
        console.log('[MFA] Mobile:', mobile);
        console.log('[MFA] Code entered:', data.emailOtp);
        console.log('[MFA] Code length:', data.emailOtp?.length);
        
        try {
          const response = await MFAApi.verifyMobileOTP(mobile, data.emailOtp);
          console.log('[MFA] Mobile OTP response:', response);
          isValid = response.success;
        } catch (error: any) {
          console.error('[MFA] Mobile OTP verification failed:', error.message);
          throw new Error(error.message || 'Mobile OTP verification failed');
        }
      } else if (authMethod === 'qr-scan') {
        // Verify QR code authentication
        const storedQrData = localStorage.getItem('admin_qr_data');
        const qrExpiry = localStorage.getItem('admin_qr_expiry');
        
        if (storedQrData && qrExpiry && Date.now() < parseInt(qrExpiry)) {
          // Verify QR data matches expected format
          isValid = storedQrData.includes('COGNEXIA') && storedQrData.includes('SUPERADMIN');
        } else {
          throw new Error('QR code expired or invalid.');
        }
      }

      if (!isValid) {
        throw new Error('Invalid verification code');
      }

      // Login to backend - use trimmed lowercase email so backend lookup matches
      const expectedEmail = (process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL || 'superadmin@cognexiaai.com').trim().toLowerCase();
      const expectedPassword = process.env.NEXT_PUBLIC_SUPER_ADMIN_PASSWORD || 'Akshita@19822';

      const authData = await AuthService.login({
        email: expectedEmail,
        password: expectedPassword,
      });

      // Backend returns 'SUPER_ADMIN' - check user type
      const userType = authData.user.userType as string;
      const isSuperAdmin = userType === 'SUPER_ADMIN' || userType === 'super_admin' || authData.user.roles?.includes('SUPER_ADMIN') || authData.user.roles?.includes('super_admin');
      if (!isSuperAdmin) {
        throw new Error('Unauthorized: Insufficient permissions');
      }

      localStorage.removeItem('admin_attempts');
      localStorage.removeItem('admin_email_otp');
      localStorage.removeItem('admin_email_otp_expiry');
      localStorage.removeItem('admin_mobile_otp');
      localStorage.removeItem('admin_mobile_otp_expiry');
      localStorage.removeItem('admin_qr_data');
      localStorage.removeItem('admin_qr_expiry');
      AuthService.storeAuth(authData);
      
      toast.success('Access granted. Redirecting to Super Admin Portal...');
      
      console.info('[SECURITY] Super Admin access granted', {
        email: authData.user.email,
        method: authMethod,
        timestamp: new Date().toISOString(),
        ip: clientIP,
      });

      setTimeout(() => {
        const SUPER_ADMIN_URL = process.env.NEXT_PUBLIC_SUPER_ADMIN_PORTAL_URL || 'http://localhost:3001';
        // Pass tokens via URL hash to avoid server-side exposure - redirect to dashboard
        const tokens = encodeURIComponent(JSON.stringify({
          accessToken: authData.accessToken,
          refreshToken: authData.refreshToken,
          user: authData.user
        }));
        const redirectUrl = `${SUPER_ADMIN_URL}/#auth=${tokens}`;
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/d1079146-7e27-4855-8d62-367cb374f03a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'admin-access:261',message:'2FA success, about to redirect',data:{superAdminUrl:SUPER_ADMIN_URL,redirectTarget:SUPER_ADMIN_URL+'/#'},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H1'})}).catch(()=>{});
        // #endregion
        window.location.href = redirectUrl;
      }, 500);

    } catch (error: any) {
      const msg = error.response?.data?.message || error.message || 'Verification failed';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const sendEmailOTP = async () => {
    setIsLoading(true);
    try {
      const email = process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL || 'superadmin@cognexiaai.com';
      
      // Call real API to send email OTP
      const response = await MFAApi.sendEmailOTP(email);

      setEmailOtpSent(true);
      setOtpTimer(response.expiresIn || 300); // 5 minutes

      // Show OTP in development mode
      if (response.devOTP) {
        console.info('[DEV] Email OTP:', response.devOTP, 'Valid for 5 minutes');
        toast.success(`✅ ${response.message}\nDev OTP: ${response.devOTP}`);
      } else {
        toast.success(`✅ ${response.message}\nCheck your email inbox!`);
      }

    } catch (error: any) {
      console.error('Email OTP error:', error);
      toast.error(error.message || 'Failed to send email OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const sendMobileOTP = async () => {
    setIsLoading(true);
    try {
      const mobile = process.env.NEXT_PUBLIC_SUPER_ADMIN_MOBILE || '+918850815294';
      console.log('[MFA] Sending OTP to mobile:', mobile);
      
      // Call real API to send SMS OTP
      const response = await MFAApi.sendMobileOTP(mobile);

      setMobileOtpSent(true);
      setOtpTimer(response.expiresIn || 300); // 5 minutes

      // Show OTP if returned (local/dev mode or Twilio fallback)
      if (response.devOTP) {
        console.info('[MFA] OTP Code:', response.devOTP, 'for', mobile);
        toast.success(`✅ OTP for ${mobile}\n\n🔐 Code: ${response.devOTP}\n\n(Enter this code below)`, { duration: 10000 });
      } else {
        toast.success(`✅ SMS sent to ${mobile}\n\nCheck your phone for the OTP code.`, { duration: 5000 });
      }

      // Log any Twilio error info
      if ((response as any).twilioError) {
        console.warn('[MFA] Twilio error (using fallback):', (response as any).twilioError);
      }

    } catch (error: any) {
      console.error('Mobile OTP error:', error);
      toast.error(error.message || 'Failed to send mobile OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const startQRScanner = async () => {
    try {
      setQrScannerActive(true);
      
      if (!qrScannerRef.current) {
        qrScannerRef.current = new Html5Qrcode('qr-reader');
      }

      await qrScannerRef.current.start(
        { facingMode: 'environment' }, // Use back camera
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        async (decodedText) => {
          // QR code successfully scanned
          console.info('[DEV] QR Code scanned:', decodedText);
          
          // Validate QR code format (should contain authentication data)
          if (decodedText.includes('COGNEXIA') || decodedText.includes('SUPERADMIN')) {
            const expiry = Date.now() + (2 * 60 * 1000); // 2 minutes validity
            localStorage.setItem('admin_qr_data', decodedText);
            localStorage.setItem('admin_qr_expiry', expiry.toString());
            
            setQrData(decodedText);
            await stopQRScanner();
            toast.success('QR code verified! Logging in...');
            
            // Auto-submit verification
            setTimeout(() => handleVerificationSubmit({ email: '', password: '' } as SuperAdminFormData), 500);
          } else {
            toast.error('Invalid QR code. Please scan the correct authentication QR.');
          }
        },
        (errorMessage) => {
          // QR code scanning error (ignore most errors as they're just "no code found")
        }
      );

      toast.success('QR scanner activated. Point camera at QR code.');
    } catch (error: any) {
      console.error('QR Scanner error:', error);
      toast.error('Failed to start camera. Please check permissions.');
      setQrScannerActive(false);
    }
  };

  const stopQRScanner = async () => {
    try {
      if (qrScannerRef.current && qrScannerRef.current.isScanning) {
        await qrScannerRef.current.stop();
      }
      setQrScannerActive(false);
    } catch (error) {
      console.error('Error stopping QR scanner:', error);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (qrScannerRef.current) {
        stopQRScanner();
      }
    };
  }, []);

  const onSubmit = step === 'credentials' ? handleCredentialsSubmit : handleVerificationSubmit;

  return (
    <>
      <Toaster position="top-center" />
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
        {/* Security warning background */}
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]"></div>
        
        <Card className="w-full max-w-md shadow-2xl border-2 border-red-900/50 relative z-10">
          <CardHeader className="space-y-4 text-center pb-4">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-red-600 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg animate-pulse">
              <Shield className="h-12 w-12 text-white" />
            </div>
            <div>
              <CardTitle className="text-3xl font-bold text-red-600">
                Restricted Access
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-2">
                Super Admin Portal
              </p>
            </div>
            <CardDescription className="text-base">
              <div className="flex items-center justify-center gap-2 text-orange-600">
                <AlertTriangle className="h-4 w-4" />
                <span>Authorized Personnel Only</span>
              </div>
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {isLocked ? (
              <div className="text-center py-8">
                <Lock className="h-16 w-16 text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-red-600 mb-2">Access Locked</h3>
                <p className="text-muted-foreground mb-4">
                  Too many failed attempts detected
                </p>
                <p className="text-2xl font-mono font-bold text-red-600">
                  {Math.floor(lockoutTime / 60)}:{(lockoutTime % 60).toString().padStart(2, '0')}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Your IP address has been logged
                </p>
              </div>
            ) : step === 'credentials' ? (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {attemptCount > 0 && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                    <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Failed attempts: {attemptCount}/3
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="superadmin@cognexiaai.com"
                    {...register('email')}
                    disabled={isLoading}
                    className="border-red-200 focus:border-red-500"
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••••••"
                      {...register('password')}
                      disabled={isLoading}
                      className="border-red-200 focus:border-red-500 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-500">{errors.password.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
                  disabled={isLoading}
                >
                  {isLoading ? 'Verifying...' : 'Continue to 2FA'}
                </Button>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 mb-4">
                  <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-2">
                    <Key className="h-4 w-4" />
                    Credentials verified. Complete 2FA to continue.
                  </p>
                </div>

                <Tabs value={authMethod} onValueChange={(v) => setAuthMethod(v as AuthMethod)}>
                  <TabsList className="grid w-full grid-cols-4 gap-1">
                    <TabsTrigger value="qr-scan" className="text-xs">
                      <Camera className="h-3 w-3 mr-1" />
                      QR Scan
                    </TabsTrigger>
                    <TabsTrigger value="totp" className="text-xs">
                      <Smartphone className="h-3 w-3 mr-1" />
                      Auth App
                    </TabsTrigger>
                    <TabsTrigger value="mobile" className="text-xs">
                      <Phone className="h-3 w-3 mr-1" />
                      Mobile
                    </TabsTrigger>
                    <TabsTrigger value="email" className="text-xs">
                      <Mail className="h-3 w-3 mr-1" />
                      Email
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="qr-scan" className="space-y-4">
                    <div className="text-center py-4">
                      <Camera className="h-12 w-12 text-green-600 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground mb-4">
                        Scan QR code for instant authentication
                      </p>
                    </div>

                    {!qrScannerActive ? (
                      <div className="space-y-4">
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                          <p className="text-sm text-blue-600 dark:text-blue-400 mb-3">
                            Scan the authentication QR code with your camera
                          </p>
                          <div className="flex justify-center mb-3">
                            <div className="bg-white p-4 rounded-lg shadow-md">
                              <QRCodeCanvas
                                value="COGNEXIA-SUPERADMIN-AUTH-TOKEN-SECURE"
                                size={200}
                                level="H"
                                includeMargin={true}
                              />
                            </div>
                          </div>
                          <p className="text-xs text-center text-muted-foreground">
                            Sample QR Code - Scan this for testing
                          </p>
                        </div>

                        <Button
                          type="button"
                          onClick={startQRScanner}
                          className="w-full"
                          disabled={isLoading}
                        >
                          <Camera className="h-4 w-4 mr-2" />
                          {isLoading ? 'Starting Camera...' : 'Start QR Scanner'}
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="relative bg-black rounded-lg overflow-hidden">
                          <div id="qr-reader" ref={qrReaderRef} style={{ width: '100%' }}></div>
                          <Button
                            type="button"
                            onClick={stopQRScanner}
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                          <p className="text-sm text-green-600 dark:text-green-400 text-center">
                            📷 Camera active - Point at QR code
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="text-xs text-center text-muted-foreground">
                      <p>Most secure & fastest authentication method</p>
                    </div>
                  </TabsContent>

                  <TabsContent value="totp" className="space-y-4">
                    <div className="text-center py-4">
                      <Smartphone className="h-12 w-12 text-blue-600 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        {showTotpSetup ? 'Setup Google Authenticator' : 'Enter code from your authenticator app'}
                      </p>
                    </div>

                    {/* TOTP Setup Dialog */}
                    {showTotpSetup && totpSetupData && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 space-y-4">
                        {totpSetupStep === 'qr' ? (
                          <>
                            <div className="space-y-3">
                              <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                                Step 1: Scan QR Code
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Open Google Authenticator (or any TOTP app) and scan this QR code:
                              </p>
                              <div className="flex justify-center bg-white p-4 rounded-lg">
                                <img src={totpSetupData.qrCode} alt="TOTP QR Code" className="w-48 h-48" />
                              </div>
                              <p className="text-xs text-center text-muted-foreground">
                                Or enter this secret manually:
                              </p>
                              <div className="bg-white dark:bg-gray-800 p-2 rounded border text-center">
                                <code className="text-xs font-mono break-all">{totpSetupData.secret}</code>
                              </div>
                            </div>
                            <Button
                              type="button"
                              onClick={() => setTotpSetupStep('verify')}
                              className="w-full"
                            >
                              I've Scanned the QR Code
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                setShowTotpSetup(false);
                                setTotpSetupData(null);
                                setTotpSetupStep('qr');
                              }}
                              className="w-full"
                            >
                              Cancel Setup
                            </Button>
                          </>
                        ) : (
                          <>
                            <div className="space-y-3">
                              <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                                Step 2: Verify Setup
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Enter the 6-digit code from your authenticator app to complete setup:
                              </p>
                            </div>
                            <form onSubmit={handleSubmit(async (data) => {
                              if (!data.totpCode) {
                                toast.error('Please enter the 6-digit code');
                                return;
                              }
                              setIsLoading(true);
                              try {
                                // Verify the code
                                const response = await MFAApi.verifyTOTP(data.totpCode, totpSetupData.secret);
                                if (response.success) {
                                  toast.success('✅ Google Authenticator setup complete!');
                                  // Save secret to localStorage for future use
                                  localStorage.setItem('totp_secret', totpSetupData.secret);
                                  setShowTotpSetup(false);
                                  setTotpSetupData(null);
                                  setTotpSetupStep('qr');
                                } else {
                                  toast.error('Invalid code. Please try again.');
                                }
                              } catch (error: any) {
                                toast.error(error.message || 'Verification failed');
                              } finally {
                                setIsLoading(false);
                              }
                            })} className="space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor="totpCode">6-Digit Code</Label>
                                <Input
                                  id="totpCode"
                                  type="text"
                                  placeholder="000000"
                                  maxLength={6}
                                  {...register('totpCode')}
                                  disabled={isLoading}
                                  className="font-mono text-center text-lg tracking-widest"
                                  autoComplete="off"
                                />
                              </div>
                              <Button
                                type="submit"
                                className="w-full"
                                disabled={isLoading}
                              >
                                {isLoading ? 'Verifying...' : 'Complete Setup'}
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => setTotpSetupStep('qr')}
                                className="w-full"
                              >
                                Back to QR Code
                              </Button>
                            </form>
                          </>
                        )}
                      </div>
                    )}

                    {/* Normal TOTP Login Form (when not in setup) */}
                    {!showTotpSetup && (
                      <>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="totpCode">6-Digit Code</Label>
                            <Input
                              id="totpCode"
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              placeholder="000000"
                              maxLength={6}
                              {...register('totpCode', {
                                required: 'TOTP code is required',
                                pattern: {
                                  value: /^\d{6}$/,
                                  message: 'Please enter a valid 6-digit code'
                                }
                              })}
                              disabled={isLoading}
                              className="font-mono text-center text-lg tracking-widest"
                              autoComplete="off"
                            />
                            {errors.totpCode && (
                              <p className="text-sm text-red-500">{errors.totpCode.message}</p>
                            )}
                          </div>

                          <Button
                            type="submit"
                            className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
                            disabled={isLoading}
                          >
                            {isLoading ? 'Verifying...' : 'Verify & Access'}
                          </Button>
                        </form>

                        <div className="text-center">
                          <Button
                            type="button"
                            variant="link"
                            onClick={async () => {
                              setIsLoading(true);
                              try {
                                const email = process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL || 'superadmin@cognexiaai.com';
                                const response = await MFAApi.setupTOTP(email);
                                setTotpSetupData({
                                  secret: response.secret,
                                  qrCode: response.qrCode,
                                });
                                setShowTotpSetup(true);
                                toast.success('Setup initiated. Scan QR code to continue.');
                              } catch (error: any) {
                                toast.error(error.message || 'Failed to initiate setup');
                              } finally {
                                setIsLoading(false);
                              }
                            }}
                            className="text-xs"
                            disabled={isLoading}
                          >
                            First time? Setup Google Authenticator
                          </Button>
                        </div>

                        <div className="text-xs text-center text-muted-foreground">
                          <p>Use Google Authenticator, Authy, or any TOTP app</p>
                        </div>
                      </>
                    )}
                  </TabsContent>

                  <TabsContent value="mobile" className="space-y-4">
                    <div className="text-center py-4">
                      <Phone className="h-12 w-12 text-green-600 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Get verification code via SMS
                      </p>
                    </div>

                    {!mobileOtpSent ? (
                      <div className="space-y-3">
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                          <p className="text-sm text-blue-600 dark:text-blue-400 text-center font-medium">
                            📱 OTP will be sent to: {process.env.NEXT_PUBLIC_SUPER_ADMIN_MOBILE || '+918850815294'}
                          </p>
                        </div>
                        <Button
                          type="button"
                          onClick={sendMobileOTP}
                          className="w-full bg-green-600 hover:bg-green-700 text-white"
                          disabled={isLoading}
                        >
                          <Phone className="h-4 w-4 mr-2" />
                          {isLoading ? 'Sending SMS...' : 'Send OTP to Mobile'}
                        </Button>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                          <p className="text-sm text-green-600 dark:text-green-400 text-center">
                            📱 SMS sent! Valid for {Math.floor(otpTimer / 60)}:{(otpTimer % 60).toString().padStart(2, '0')}
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="mobileOtp">6-Digit SMS Code</Label>
                          <Input
                            id="mobileOtp"
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            placeholder="000000"
                            maxLength={6}
                            {...register('emailOtp', {
                              required: 'SMS code is required',
                              pattern: {
                                value: /^\d{6}$/,
                                message: 'Please enter a valid 6-digit code'
                              }
                            })}
                            disabled={isLoading}
                            className="font-mono text-center text-lg tracking-widest"
                            autoComplete="off"
                          />
                          {errors.emailOtp && (
                            <p className="text-sm text-red-500">{errors.emailOtp.message}</p>
                          )}
                        </div>

                        <Button
                          type="submit"
                          className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
                          disabled={isLoading}
                        >
                          {isLoading ? 'Verifying...' : 'Verify & Access'}
                        </Button>

                        <Button
                          type="button"
                          onClick={sendMobileOTP}
                          variant="ghost"
                          className="w-full"
                          disabled={isLoading || otpTimer > 240}
                        >
                          Resend SMS OTP
                        </Button>
                      </form>
                    )}
                  </TabsContent>

                  <TabsContent value="email" className="space-y-4">
                    <div className="text-center py-4">
                      <Mail className="h-12 w-12 text-purple-600 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Get verification code via email
                      </p>
                    </div>

                    {!emailOtpSent ? (
                      <Button
                        type="button"
                        onClick={sendEmailOTP}
                        className="w-full"
                        variant="outline"
                        disabled={isLoading}
                      >
                        {isLoading ? 'Sending...' : 'Send OTP to Email'}
                      </Button>
                    ) : (
                      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                          <p className="text-sm text-blue-600 dark:text-blue-400 text-center">
                            OTP sent! Valid for {Math.floor(otpTimer / 60)}:{(otpTimer % 60).toString().padStart(2, '0')}
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="emailOtp">6-Digit OTP</Label>
                          <Input
                            id="emailOtp"
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            placeholder="000000"
                            maxLength={6}
                            {...register('emailOtp', {
                              required: 'Email OTP is required',
                              pattern: {
                                value: /^\d{6}$/,
                                message: 'Please enter a valid 6-digit code'
                              }
                            })}
                            disabled={isLoading}
                            className="font-mono text-center text-lg tracking-widest"
                            autoComplete="off"
                          />
                          {errors.emailOtp && (
                            <p className="text-sm text-red-500">{errors.emailOtp.message}</p>
                          )}
                        </div>

                        <Button
                          type="submit"
                          className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
                          disabled={isLoading}
                        >
                          {isLoading ? 'Verifying...' : 'Verify & Access'}
                        </Button>

                        <Button
                          type="button"
                          onClick={sendEmailOTP}
                          variant="ghost"
                          className="w-full"
                          disabled={isLoading || otpTimer > 240}
                        >
                          Resend OTP
                        </Button>
                      </form>
                    )}
                  </TabsContent>
                </Tabs>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => setStep('credentials')}
                >
                  Back to Login
                </Button>
              </div>
            )}

            <div className="mt-6 pt-6 border-t text-center">
              <p className="text-xs text-muted-foreground">
                This system is for authorized use only. All access attempts are logged and monitored.
              </p>
              <p className="text-xs text-red-600 mt-2 font-semibold">
                IP: {clientIP || 'Detecting...'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
