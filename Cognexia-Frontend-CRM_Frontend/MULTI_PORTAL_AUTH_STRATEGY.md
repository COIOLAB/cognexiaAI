# Multi-Portal Authentication Strategy
## CognexiaAI ERP - Unified Auth Architecture

---

## 🎯 Current State Analysis

### Backend (Single Source of Truth)
✅ **Location**: `backend/modules/03-CRM/src/controllers/auth.controller.ts`
- Single unified auth endpoint: `/auth/login` and `/auth/register`
- JWT-based authentication with access + refresh tokens
- User entity has `userType` field (SUPER_ADMIN, ORG_ADMIN, USER, etc.)
- Organization-aware authentication
- Role-based permissions system

### Frontend Portals

#### 1. Client Admin Portal (Port 3002)
- **Path**: `frontend/client-admin-portal`
- **Current Auth**: ✅ Already implements role-based routing
- **Logic**: 
  - If `userType === 'SUPER_ADMIN'` → redirects to `http://localhost:3001`
  - Otherwise → stays in client portal at `/dashboard`
- **Auth Store**: Uses Zustand (`stores/auth-store.ts`)

#### 2. Super Admin Portal (Port 3001)
- **Path**: `frontend/super-admin-portal`
- **Current Auth**: ⚠️ Separate login, no role detection
- **Issue**: Doesn't redirect client users away
- **Auth Store**: Uses Zustand (`stores/auth-store.ts`)

---

## 🏗️ Recommended Architecture

### Option 1: **Unified Login Portal** (RECOMMENDED ⭐)

Create a single authentication entry point that intelligently routes users.

#### Architecture Flow:
```
User visits ANY portal
    ↓
Redirects to AUTH PORTAL (port 3000)
    ↓
User enters credentials
    ↓
Backend validates → Returns user with userType
    ↓
Auth Portal routes based on userType:
    • SUPER_ADMIN → http://localhost:3001 (super-admin-portal)
    • ORG_ADMIN/USER → http://localhost:3002 (client-admin-portal)
    ↓
User lands on correct portal with valid session
```

#### Implementation Steps:

**1. Create Auth Portal (NEW)**
```bash
# Location: frontend/auth-portal
npx create-next-app@latest auth-portal --typescript --tailwind --app
cd auth-portal
npm install @tanstack/react-query axios zod react-hook-form zustand
```

**2. Implement Smart Login Component**
```typescript
// auth-portal/app/login/page.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';
import { useState } from 'react';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export default function UnifiedLoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:3000/api/auth/login', data);
      const { user, accessToken, refreshToken } = response.data;

      // Store tokens
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));

      // Route based on user type
      if (user.userType === 'SUPER_ADMIN' || user.roles?.includes('SUPER_ADMIN')) {
        window.location.href = 'http://localhost:3001/dashboard';
      } else {
        window.location.href = 'http://localhost:3002/dashboard';
      }
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md space-y-4">
        <h1 className="text-3xl font-bold text-center">CognexiaAI ERP</h1>
        <input {...register('email')} type="email" placeholder="Email" className="w-full p-2 border" />
        {errors.email && <p className="text-red-500">{errors.email.message}</p>}
        
        <input {...register('password')} type="password" placeholder="Password" className="w-full p-2 border" />
        {errors.password && <p className="text-red-500">{errors.password.message}</p>}
        
        <button type="submit" disabled={isLoading} className="w-full p-2 bg-blue-600 text-white">
          {isLoading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}
```

**3. Update Client Portal** (client-admin-portal)
```typescript
// middleware.ts - Add auth guard
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('accessToken');
  const user = request.cookies.get('user');

  // If no token, redirect to auth portal
  if (!token) {
    return NextResponse.redirect('http://localhost:3000/login');
  }

  // If super admin trying to access client portal, redirect
  if (user) {
    const userData = JSON.parse(user.value);
    if (userData.userType === 'SUPER_ADMIN') {
      return NextResponse.redirect('http://localhost:3001/dashboard');
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/dashboard/:path*',
};
```

**4. Update Super Admin Portal**
```typescript
// middleware.ts - Add auth guard
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('accessToken');
  const user = request.cookies.get('user');

  // If no token, redirect to auth portal
  if (!token) {
    return NextResponse.redirect('http://localhost:3000/login');
  }

  // If NOT super admin, redirect to client portal
  if (user) {
    const userData = JSON.parse(user.value);
    if (userData.userType !== 'SUPER_ADMIN' && !userData.roles?.includes('SUPER_ADMIN')) {
      return NextResponse.redirect('http://localhost:3002/dashboard');
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/dashboard/:path*',
};
```

**5. Environment Configuration**

```bash
# .env.local for all portals
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_AUTH_PORTAL_URL=http://localhost:3000
NEXT_PUBLIC_CLIENT_PORTAL_URL=http://localhost:3002
NEXT_PUBLIC_SUPER_ADMIN_PORTAL_URL=http://localhost:3001
```

---

### Option 2: **Shared Login Component** (Alternative)

Keep existing portals but share authentication logic.

#### Implementation:

**1. Create Shared Auth Package**
```bash
# Location: frontend/shared/auth-lib
mkdir -p shared/auth-lib
cd shared/auth-lib
npm init -y
```

**2. Shared Auth Logic**
```typescript
// shared/auth-lib/src/auth.service.ts
import axios from 'axios';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    userType: 'SUPER_ADMIN' | 'ORG_ADMIN' | 'USER';
    organizationId?: string;
    roles?: string[];
  };
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, credentials);
    return response.data;
  }

  static async register(data: any): Promise<AuthResponse> {
    const response = await axios.post(`${API_BASE_URL}/auth/register`, data);
    return response.data;
  }

  static storeAuth(authData: AuthResponse): void {
    localStorage.setItem('accessToken', authData.accessToken);
    localStorage.setItem('refreshToken', authData.refreshToken);
    localStorage.setItem('user', JSON.stringify(authData.user));
  }

  static clearAuth(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }

  static redirectBasedOnRole(user: AuthResponse['user']): void {
    const isSuperAdmin = user.userType === 'SUPER_ADMIN' || user.roles?.includes('SUPER_ADMIN');
    
    if (isSuperAdmin) {
      window.location.href = process.env.NEXT_PUBLIC_SUPER_ADMIN_PORTAL_URL || 'http://localhost:3001/dashboard';
    } else {
      window.location.href = process.env.NEXT_PUBLIC_CLIENT_PORTAL_URL || 'http://localhost:3002/dashboard';
    }
  }
}
```

**3. Install Shared Package in Both Portals**
```json
// package.json in both portals
{
  "dependencies": {
    "@cognexiaai/auth-lib": "file:../../shared/auth-lib"
  }
}
```

**4. Update Login Pages to Use Shared Service**
```typescript
// Both portals use the same logic
import { AuthService } from '@cognexiaai/auth-lib';

const onSubmit = async (data: LoginCredentials) => {
  try {
    const authData = await AuthService.login(data);
    AuthService.storeAuth(authData);
    AuthService.redirectBasedOnRole(authData.user);
  } catch (error) {
    console.error('Login failed:', error);
  }
};
```

---

### Option 3: **Current Setup with Improvements** (Minimal Changes)

Keep existing login pages but add cross-portal validation.

#### Changes Needed:

**1. Client Portal (`client-admin-portal`)** ✅ Already done!
- Your current implementation is good
- Just needs middleware guard (see below)

**2. Super Admin Portal (`super-admin-portal`)** - Needs update
```typescript
// src/hooks/use-auth.ts - Update useLogin
export const useLogin = () => {
  const router = useRouter();
  
  return useMutation({
    mutationFn: async (data: LoginRequest) => {
      const response = await apiClient.post<LoginResponse>('/auth/login', data);
      return response.data;
    },
    onSuccess: (data) => {
      const { user, accessToken, refreshToken } = data;
      
      // Check if user should be here
      const isSuperAdmin = user.userType === 'SUPER_ADMIN' || user.roles?.includes('SUPER_ADMIN');
      
      if (!isSuperAdmin) {
        // User is not super admin, redirect to client portal
        toast.error('Access denied. Redirecting to client portal...');
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        window.location.href = 'http://localhost:3002/dashboard';
        return;
      }
      
      // Super admin - proceed normally
      useAuthStore.getState().login(user, accessToken, refreshToken);
      toast.success('Login successful!');
      router.push('/dashboard');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Login failed');
    },
  });
};
```

**3. Add Middleware Guards to Both Portals**

Client Portal Middleware:
```typescript
// frontend/client-admin-portal/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check if user is trying to access protected routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    const accessToken = request.cookies.get('accessToken');
    
    if (!accessToken) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
```

Super Admin Portal Middleware:
```typescript
// frontend/super-admin-portal/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check if user is trying to access protected routes
  if (request.nextUrl.pathname.startsWith('/dashboard') || 
      request.nextUrl.pathname === '/') {
    const accessToken = request.cookies.get('accessToken');
    
    if (!accessToken) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/dashboard/:path*'],
};
```

---

## 🔐 Security Recommendations

### 1. **Cookie-Based Token Storage** (More Secure)
Instead of localStorage, use httpOnly cookies:

```typescript
// Backend - Set cookies on login
@Post('login')
async login(@Body() loginDto: LoginDto, @Res() response: Response) {
  const result = await this.authService.login(loginDto);
  
  // Set httpOnly cookies
  response.cookie('accessToken', result.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 15 * 60 * 1000, // 15 minutes
  });
  
  response.cookie('refreshToken', result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
  
  return response.json(result);
}
```

### 2. **CORS Configuration**
```typescript
// Backend - main.ts
app.enableCors({
  origin: [
    'http://localhost:3000', // auth portal
    'http://localhost:3001', // super admin portal
    'http://localhost:3002', // client portal
  ],
  credentials: true,
});
```

### 3. **Token Refresh Strategy**
```typescript
// Shared utility - token-refresh.ts
import axios from 'axios';

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Wait for refresh to complete
        return new Promise((resolve) => {
          refreshSubscribers.push((token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(axios(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post('/auth/refresh', { refreshToken });
        const { accessToken } = response.data;

        localStorage.setItem('accessToken', accessToken);
        
        // Notify all waiting requests
        refreshSubscribers.forEach((callback) => callback(accessToken));
        refreshSubscribers = [];
        
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return axios(originalRequest);
      } catch (refreshError) {
        // Refresh failed - logout
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
```

---

## 📋 Implementation Checklist

### Phase 1: Quick Win (Option 3)
- [ ] Update super admin portal login to check userType
- [ ] Add middleware guards to both portals
- [ ] Test cross-portal login scenarios
- [ ] Add proper error messages

### Phase 2: Enhanced Security
- [ ] Move to httpOnly cookies
- [ ] Implement token refresh interceptor
- [ ] Add CSRF protection
- [ ] Configure CORS properly

### Phase 3: Unified Auth (Option 1)
- [ ] Create auth portal (port 3000)
- [ ] Build unified login/register pages
- [ ] Update both portals to redirect to auth portal
- [ ] Test all user flows

---

## 🎯 My Recommendation

**Start with Option 3** (minimal changes) to get it working immediately:

1. ✅ Client portal already works perfectly
2. Update super admin portal login (5 minutes)
3. Add middleware to both portals (10 minutes)
4. Test thoroughly

**Then migrate to Option 1** (unified auth portal) for production:
- Better user experience
- Single source of truth for auth UI
- Easier to maintain
- Better security (one place to secure)

---

## 🚀 Quick Start Script

```bash
# 1. Update Super Admin Portal
cd frontend/super-admin-portal/src/hooks
# Edit use-auth.ts with the code above

# 2. Add middleware to Client Portal
cd ../../client-admin-portal
# Create middleware.ts with the code above

# 3. Add middleware to Super Admin Portal
cd ../super-admin-portal
# Create middleware.ts with the code above

# 4. Test
# Login as super admin → should go to localhost:3001
# Login as regular user → should go to localhost:3002
```

---

## 📞 Support

Contact: support@cognexiaai.com

This is your comprehensive authentication strategy! Which option would you like to implement?
