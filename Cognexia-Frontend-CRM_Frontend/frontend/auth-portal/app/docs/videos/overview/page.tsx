'use client';

import Link from 'next/link';
import { ArrowLeft, Video, Play } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function VideoOverviewPage() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-12 max-w-5xl">
          <div className="mb-8">
            <Link href="/documentation" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Documentation
            </Link>
            <div className="text-sm text-muted-foreground">
              Documentation / Video Tutorials / Platform Overview
            </div>
          </div>

          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Platform Overview Video</h1>
            <p className="text-xl text-muted-foreground">
              15-minute walkthrough of CognexiaAI ERP features
            </p>
          </div>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            
            <section className="bg-gradient-to-br from-red-600 to-pink-600 rounded-2xl p-8 text-white mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Video className="h-8 w-8" />
                <h2 className="text-3xl font-bold m-0">Video Tutorials</h2>
              </div>
              <p className="text-lg text-red-100 m-0">
                Learn by watching step-by-step video guides
              </p>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
              <div className="aspect-video bg-slate-900 rounded-xl flex items-center justify-center mb-6">
                <div className="text-center">
                  <Play className="h-16 w-16 text-white mx-auto mb-4" />
                  <p className="text-white font-bold">Platform Overview (15 min)</p>
                  <p className="text-slate-400 text-sm">Video content would be embedded here</p>
                </div>
              </div>
              
              <h2 className="text-2xl font-bold mb-4">What You'll Learn</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Navigating the CognexiaAI dashboard</li>
                <li>CRM module basics</li>
                <li>HR and payroll features</li>
                <li>Finance and accounting overview</li>
                <li>Analytics and reporting</li>
              </ul>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
              <h2 className="text-3xl font-bold mb-6">More Video Tutorials</h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                <Link href="/docs/videos/api-integration" className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:border-blue-500 transition-all">
                  <Play className="h-6 w-6 text-blue-600 mb-2" />
                  <h3 className="font-bold mb-1">API Integration Tutorial</h3>
                  <p className="text-sm text-muted-foreground m-0">Build your first integration (20 min)</p>
                </Link>
                
                <Link href="/docs/videos/advanced-features" className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:border-blue-500 transition-all">
                  <Play className="h-6 w-6 text-purple-600 mb-2" />
                  <h3 className="font-bold mb-1">Advanced Features Series</h3>
                  <p className="text-sm text-muted-foreground m-0">Power user tips (5 videos)</p>
                </Link>
                
                <Link href="/docs/videos/webinars" className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:border-blue-500 transition-all">
                  <Play className="h-6 w-6 text-green-600 mb-2" />
                  <h3 className="font-bold mb-1">Monthly Webinars</h3>
                  <p className="text-sm text-muted-foreground m-0">Live Q&A and new features</p>
                </Link>
                
                <div className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6">
                  <Play className="h-6 w-6 text-orange-600 mb-2" />
                  <h3 className="font-bold mb-1">Customer Success Stories</h3>
                  <p className="text-sm text-muted-foreground m-0">See how others use the platform</p>
                </div>
              </div>
            </section>

            <section className="bg-gradient-to-br from-red-600 to-pink-600 rounded-2xl p-8 text-white">
              <h2 className="text-3xl font-bold mb-6">Next Steps</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <Link href="/docs/getting-started/quick-start" className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all">
                  <h3 className="font-bold mb-2">Quick Start →</h3>
                  <p className="text-sm text-red-100 m-0">Written tutorial</p>
                </Link>
                <Link href="/docs/guides/crm" className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all">
                  <h3 className="font-bold mb-2">User Guides →</h3>
                  <p className="text-sm text-red-100 m-0">Detailed documentation</p>
                </Link>
                <Link href="/support" className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all">
                  <h3 className="font-bold mb-2">Get Support →</h3>
                  <p className="text-sm text-red-100 m-0">Contact our team</p>
                </Link>
              </div>
            </section>

          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
