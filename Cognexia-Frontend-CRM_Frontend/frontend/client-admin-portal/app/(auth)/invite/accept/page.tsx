'use client';

import { useState, useEffect, Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Brain, Loader2, CheckCircle, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { authApi } from '@/services/auth.api';
import toast, { Toaster } from 'react-hot-toast';

const acceptInvitationSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type AcceptInvitationFormData = z.infer<typeof acceptInvitationSchema>;

function AcceptInvitationForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const email = searchParams.get('email');
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AcceptInvitationFormData>({
    resolver: zodResolver(acceptInvitationSchema),
  });

  const onSubmit = async (data: AcceptInvitationFormData) => {
    if (!token) {
      toast.error('Invalid or missing invitation token');
      return;
    }

    setIsLoading(true);
    try {
      await authApi.acceptInvitation(token, data.password);
      setIsSuccess(true);
      toast.success('Invitation accepted successfully!');
      
      // Auto-redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to accept invitation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <Card className="w-full max-w-md shadow-xl border-red-100">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <ShieldCheck className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-red-600">Invalid Link</CardTitle>
          <CardDescription>
            This invitation link is invalid or has expired. Please contact your administrator.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/login">
            <Button variant="outline" className="w-full">Return to login</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Toaster position="top-center" />
      <Card className="w-full max-w-md shadow-2xl border-blue-50">
        <CardHeader className="space-y-4 text-center pb-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg transform transition-transform hover:scale-105">
            {isSuccess ? (
              <CheckCircle className="h-10 w-10 text-white" />
            ) : (
              <Brain className="h-10 w-10 text-white" />
            )}
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">
              {isSuccess ? 'Account Activated!' : 'Welcome to the Team'}
            </CardTitle>
            <CardDescription className="text-base mt-2">
              {isSuccess 
                ? 'Your account is now active and ready to use.'
                : 'Set your password to complete your account setup.'}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {isSuccess ? (
            <div className="space-y-6 text-center">
              <div className="bg-green-50 text-green-700 p-4 rounded-lg text-sm border border-green-100 animate-in fade-in slide-in-from-bottom-2">
                You will be redirected to the login page momentarily...
              </div>
              <Link href="/login">
                <Button className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 border-none h-11 text-lg font-semibold">
                  Go to Login Now
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {email && (
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={email}
                    disabled
                    className="h-11 border-blue-100 bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="password">Set Your Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="h-11 border-blue-100 focus:ring-blue-500"
                  {...register('password')}
                  disabled={isLoading}
                />
                {errors.password && (
                  <p className="text-xs font-medium text-red-500 mt-1">{errors.password.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  className="h-11 border-blue-100 focus:ring-blue-500"
                  {...register('confirmPassword')}
                  disabled={isLoading}
                />
                {errors.confirmPassword && (
                  <p className="text-xs font-medium text-red-500 mt-1">{errors.confirmPassword.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 h-11 text-lg font-semibold border-none mt-4 transition-all duration-200 active:scale-95"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Activating...
                  </>
                ) : (
                  'Complete Setup'
                )}
              </Button>
              
              <p className="text-center text-xs text-muted-foreground mt-4">
                By completing setup, you agree to our terms of service and privacy policy.
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </>
  );
}

export default function AcceptInvitationPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden relative">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-400 rounded-full blur-[120px]"></div>
      </div>
      
      <div className="z-10 w-full flex justify-center">
        <Suspense fallback={
          <Card className="w-full max-w-md shadow-xl p-8">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
              <p className="text-muted-foreground animate-pulse font-medium">Preparing your setup...</p>
            </div>
          </Card>
        }>
          <AcceptInvitationForm />
        </Suspense>
      </div>
    </div>
  );
}
