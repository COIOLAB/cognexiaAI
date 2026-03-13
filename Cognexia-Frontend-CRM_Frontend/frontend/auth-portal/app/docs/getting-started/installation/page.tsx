'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle2, Copy, Terminal, Download, Server } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function InstallationGuidePage() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        
        <div className="container mx-auto px-4 py-12 max-w-5xl">
          {/* Breadcrumb */}
          <div className="mb-8">
            <Link href="/documentation" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Documentation
            </Link>
            <div className="text-sm text-muted-foreground">
              Documentation / Getting Started / Installation Guide
            </div>
          </div>

          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Installation Guide</h1>
            <p className="text-xl text-muted-foreground">
              Complete guide to installing CognexiaAI ERP platform on your infrastructure
            </p>
            <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
              <span>Last updated: January 2026</span>
              <span>•</span>
              <span>15 min read</span>
            </div>
          </div>

          {/* Content */}
          <div className="prose prose-lg dark:prose-invert max-w-none">
            
            {/* Prerequisites */}
            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
              <h2 className="text-3xl font-bold mb-6">Prerequisites</h2>
              <p className="mb-6">Before installing CognexiaAI ERP, ensure your system meets the following requirements:</p>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <strong>Operating System:</strong> Linux (Ubuntu 20.04+, RHEL 8+, CentOS 8+) or Windows Server 2019+
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <strong>Hardware:</strong> Minimum 16GB RAM, 4 CPU cores, 100GB SSD storage
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <strong>Database:</strong> PostgreSQL 14+ or MySQL 8.0+
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <strong>Runtime:</strong> Node.js 18+ and Python 3.10+
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <strong>Network:</strong> HTTPS/SSL certificate, open ports 443, 80, 5432
                  </div>
                </div>
              </div>
            </section>

            {/* Cloud Installation */}
            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
              <h2 className="text-3xl font-bold mb-6">Cloud Deployment (Recommended)</h2>
              <p className="mb-6">Deploy CognexiaAI on AWS, Azure, or Google Cloud with our automated scripts:</p>
              
              <div className="bg-slate-900 rounded-xl p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Terminal className="h-4 w-4" />
                    <span className="text-sm font-mono">bash</span>
                  </div>
                  <button className="text-slate-400 hover:text-white">
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
                <pre className="text-green-400 font-mono text-sm overflow-x-auto">
{`# AWS Deployment
curl -sSL https://install.cognexiaai.com/aws | bash

# Azure Deployment  
curl -sSL https://install.cognexiaai.com/azure | bash

# Google Cloud Deployment
curl -sSL https://install.cognexiaai.com/gcp | bash`}
                </pre>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 mb-6">
                <p className="text-sm">
                  <strong>Pro Tip:</strong> Cloud deployment includes automatic scaling, backup, and monitoring setup.
                </p>
              </div>
            </section>

            {/* Docker Installation */}
            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
              <h2 className="text-3xl font-bold mb-6">Docker Installation</h2>
              <p className="mb-6">Quick setup using Docker Compose:</p>
              
              <div className="space-y-4 mb-6">
                <div>
                  <h3 className="text-xl font-bold mb-3">1. Clone Repository</h3>
                  <div className="bg-slate-900 rounded-xl p-6">
                    <pre className="text-green-400 font-mono text-sm overflow-x-auto">
{`git clone https://github.com/cognexiaai/erp-platform.git
cd erp-platform`}
                    </pre>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-3">2. Configure Environment</h3>
                  <div className="bg-slate-900 rounded-xl p-6">
                    <pre className="text-green-400 font-mono text-sm overflow-x-auto">
{`cp .env.example .env
# Edit .env with your configuration
nano .env`}
                    </pre>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-3">3. Start Services</h3>
                  <div className="bg-slate-900 rounded-xl p-6">
                    <pre className="text-green-400 font-mono text-sm overflow-x-auto">
{`docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f`}
                    </pre>
                  </div>
                </div>
              </div>
            </section>

            {/* Manual Installation */}
            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
              <h2 className="text-3xl font-bold mb-6">Manual Installation</h2>
              
              <h3 className="text-2xl font-bold mb-4">Backend Setup</h3>
              <div className="bg-slate-900 rounded-xl p-6 mb-6">
                <pre className="text-green-400 font-mono text-sm overflow-x-auto">
{`# Install dependencies
cd backend
npm install

# Setup database
npm run db:migrate
npm run db:seed

# Start backend server
npm run start:prod`}
                </pre>
              </div>

              <h3 className="text-2xl font-bold mb-4">Frontend Setup</h3>
              <div className="bg-slate-900 rounded-xl p-6 mb-6">
                <pre className="text-green-400 font-mono text-sm overflow-x-auto">
{`# Install dependencies
cd frontend/auth-portal
npm install

# Build for production
npm run build

# Start production server
npm run start`}
                </pre>
              </div>
            </section>

            {/* Post Installation */}
            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
              <h2 className="text-3xl font-bold mb-6">Post-Installation Steps</h2>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-blue-600 font-bold">1</span>
                  </div>
                  <div>
                    <strong>Access Admin Panel:</strong> Navigate to https://your-domain.com/admin
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-blue-600 font-bold">2</span>
                  </div>
                  <div>
                    <strong>Create Admin Account:</strong> Follow the setup wizard to create your first admin user
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-blue-600 font-bold">3</span>
                  </div>
                  <div>
                    <strong>Configure SSL:</strong> Set up SSL certificate for secure HTTPS connections
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-blue-600 font-bold">4</span>
                  </div>
                  <div>
                    <strong>Setup Backups:</strong> Configure automated backup schedule
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-blue-600 font-bold">5</span>
                  </div>
                  <div>
                    <strong>Enable Monitoring:</strong> Activate system monitoring and alerts
                  </div>
                </div>
              </div>
            </section>

            {/* Troubleshooting */}
            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
              <h2 className="text-3xl font-bold mb-6">Troubleshooting</h2>
              
              <div className="space-y-4">
                <details className="border-l-4 border-blue-500 pl-4">
                  <summary className="font-bold cursor-pointer">Database connection failed</summary>
                  <p className="mt-2 text-muted-foreground">
                    Verify database credentials in .env file and ensure PostgreSQL/MySQL service is running.
                  </p>
                </details>
                
                <details className="border-l-4 border-blue-500 pl-4">
                  <summary className="font-bold cursor-pointer">Port already in use</summary>
                  <p className="mt-2 text-muted-foreground">
                    Change the port in configuration or stop conflicting services using: <code>lsof -ti:3000 | xargs kill -9</code>
                  </p>
                </details>
                
                <details className="border-l-4 border-blue-500 pl-4">
                  <summary className="font-bold cursor-pointer">Module not found errors</summary>
                  <p className="mt-2 text-muted-foreground">
                    Delete node_modules and package-lock.json, then run <code>npm install</code> again.
                  </p>
                </details>
              </div>
            </section>

            {/* Next Steps */}
            <section className="bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl p-8 text-white mb-8">
              <h2 className="text-3xl font-bold mb-6">Next Steps</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <Link href="/docs/getting-started/quick-start" className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all">
                  <h3 className="font-bold mb-2">Quick Start Tutorial →</h3>
                  <p className="text-sm text-blue-100">Get started with your first project</p>
                </Link>
                <Link href="/docs/getting-started/configuration" className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all">
                  <h3 className="font-bold mb-2">Configuration Basics →</h3>
                  <p className="text-sm text-blue-100">Learn about system configuration</p>
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
