'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Brain } from 'lucide-react';
import Image from 'next/image';

const CLIENT_PORTAL_URL = process.env.NEXT_PUBLIC_CLIENT_ADMIN_PORTAL_URL || process.env.NEXT_PUBLIC_CLIENT_PORTAL_URL || 'http://localhost:3002';

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-28">
          {/* Logo */}
          <Link href="/" className="flex items-center hover:opacity-90 transition">
            <img src="/cognexiaai-logo.png" alt="CognexiaAI Logo" className="h-24 w-auto" />
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/products" className="text-sm font-medium hover:text-blue-600 transition">
              Products
            </Link>
            <Link href="/features" className="text-sm font-medium hover:text-blue-600 transition">
              Features
            </Link>
            <Link href="/pricing" className="text-sm font-medium hover:text-blue-600 transition">
              Pricing
            </Link>
            <Link href="/about" className="text-sm font-medium hover:text-blue-600 transition">
              About
            </Link>
            <Link href="/careers" className="text-sm font-medium hover:text-blue-600 transition">
              Careers
            </Link>
            <Link href="/contact" className="text-sm font-medium hover:text-blue-600 transition">
              Contact
            </Link>
            <Link href="/login" className="text-sm font-medium text-blue-600 hover:text-blue-700 transition">
              Try Demo
            </Link>
          </div>

          {/* Auth Buttons - single login/register on auth-portal, then redirect by role */}
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="font-medium">
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
