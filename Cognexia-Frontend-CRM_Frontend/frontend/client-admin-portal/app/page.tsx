'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function HomePage() {
  const { demoLogin, isDemoLoading } = useAuth();

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-2 text-sm font-semibold text-white shadow-lg">
              <Sparkles className="h-4 w-4" />
              CMMI Level 5 Certified · ISO 27001 · SOC 2 Type II
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Experience the full CognexiaAI CRM in minutes.
            </h1>
            <p className="text-lg text-muted-foreground">
              Launch a ready-to-explore demo organization with data across sales, marketing,
              support, and analytics. No setup required.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button 
                onClick={() => demoLogin()} 
                disabled={isDemoLoading}
                className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-lg px-8 py-6 shadow-xl"
                size="lg"
              >
                Try Demo
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" asChild size="lg" className="text-lg px-8 py-6">
                <Link href="/login">Sign in</Link>
              </Button>
              <Button variant="ghost" asChild size="lg" className="text-lg px-8 py-6">
                <Link href="/register">Create account</Link>
              </Button>
            </div>
          </div>
          <div className="rounded-2xl border-2 border-blue-200 dark:border-blue-800 bg-white dark:bg-gray-800 p-8 shadow-2xl">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">What you can explore</h2>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Pipeline stages, revenue forecasts, and opportunity health.</li>
                <li>Campaign ROI dashboards with real marketing performance.</li>
                <li>Support SLAs, ticket distribution, and customer sentiment.</li>
                <li>Product catalog, pricing, contracts, and key reports.</li>
              </ul>
              <div className="rounded-xl border-2 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 p-4 text-sm font-medium">
                <p className="text-green-800 dark:text-green-200">✓ Enterprise Demo Environment</p>
                <p className="text-green-700 dark:text-green-300 mt-1">Demo data is shared across all users and refreshed on demand to keep
                the narrative consistent for client presentations.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <Footer />
    </>
  );
}
