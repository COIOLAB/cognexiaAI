'use client';

import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Settings, Key, Database } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function ConfigurationPage() {
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
              Documentation / Getting Started / Configuration Basics
            </div>
          </div>

          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Configuration Basics</h1>
            <p className="text-xl text-muted-foreground">
              Essential configuration settings for CognexiaAI ERP
            </p>
          </div>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            
            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
              <h2 className="text-3xl font-bold mb-6">Environment Variables</h2>
              
              <p className="mb-6">Create a <code>.env</code> file in your project root with the following variables:</p>
              
              <div className="bg-slate-900 rounded-xl p-6 mb-6">
                <pre className="text-green-400 font-mono text-sm overflow-x-auto">
{`# Application Settings
NODE_ENV=production
APP_PORT=3000
APP_URL=https://your-domain.com

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cognexia_erp
DB_USER=postgres
DB_PASSWORD=your_secure_password

# API Keys
API_SECRET_KEY=your_secret_key_here
JWT_SECRET=your_jwt_secret_here
ENCRYPTION_KEY=your_encryption_key_here

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@email.com
SMTP_PASSWORD=your_email_password

# Cloud Storage (AWS S3)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
S3_BUCKET=cognexia-files

# Redis (for caching)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password`}
                </pre>
              </div>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
              <div className="flex items-center gap-3 mb-6">
                <Database className="h-8 w-8 text-purple-600" />
                <h2 className="text-3xl font-bold m-0">Database Configuration</h2>
              </div>
              
              <h3 className="text-2xl font-bold mb-4">PostgreSQL Setup</h3>
              <div className="bg-slate-900 rounded-xl p-6 mb-6">
                <pre className="text-green-400 font-mono text-sm">
{`# Create database
createdb cognexia_erp

# Run migrations
npm run db:migrate

# Seed initial data
npm run db:seed`}
                </pre>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4">
                <p className="text-sm m-0">
                  <strong>Note:</strong> Ensure PostgreSQL service is running before executing migrations.
                </p>
              </div>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
              <div className="flex items-center gap-3 mb-6">
                <Key className="h-8 w-8 text-orange-600" />
                <h2 className="text-3xl font-bold m-0">Security Configuration</h2>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold mb-3">SSL/TLS Setup</h3>
                  <p className="mb-4">Enable HTTPS for production environments:</p>
                  <div className="bg-slate-900 rounded-xl p-6">
                    <pre className="text-green-400 font-mono text-sm">
{`# Generate SSL certificate
openssl req -x509 -nodes -days 365 \\
  -newkey rsa:2048 \\
  -keyout ssl/private.key \\
  -out ssl/certificate.crt

# Update configuration
SSL_ENABLED=true
SSL_KEY_PATH=./ssl/private.key
SSL_CERT_PATH=./ssl/certificate.crt`}
                    </pre>
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-bold mb-3">JWT Configuration</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      Token expiration: 24 hours (configurable)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      Refresh token: 30 days
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      Algorithm: HS256 (default) or RS256
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
              <div className="flex items-center gap-3 mb-6">
                <Settings className="h-8 w-8 text-blue-600" />
                <h2 className="text-3xl font-bold m-0">Application Settings</h2>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold mb-3">Module Configuration</h3>
                  <p className="mb-4">Enable/disable specific modules in <code>config/modules.json</code>:</p>
                  <div className="bg-slate-900 rounded-xl p-6">
                    <pre className="text-green-400 font-mono text-sm">
{`{
  "crm": {
    "enabled": true,
    "features": ["contacts", "deals", "activities"]
  },
  "hr": {
    "enabled": true,
    "features": ["employees", "payroll", "attendance"]
  },
  "finance": {
    "enabled": true,
    "features": ["invoicing", "expenses", "reports"]
  }
}`}
                    </pre>
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-bold mb-3">Performance Tuning</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-4">
                      <strong className="block mb-2">Connection Pool</strong>
                      <code className="text-sm">DB_POOL_SIZE=20</code>
                    </div>
                    <div className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-4">
                      <strong className="block mb-2">Cache TTL</strong>
                      <code className="text-sm">CACHE_TTL=3600</code>
                    </div>
                    <div className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-4">
                      <strong className="block mb-2">Max Upload Size</strong>
                      <code className="text-sm">MAX_FILE_SIZE=50MB</code>
                    </div>
                    <div className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-4">
                      <strong className="block mb-2">Request Timeout</strong>
                      <code className="text-sm">REQUEST_TIMEOUT=30000</code>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl p-8 text-white">
              <h2 className="text-3xl font-bold mb-6">Next Steps</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <Link href="/docs/api/rest" className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all">
                  <h3 className="font-bold mb-2">API Reference →</h3>
                  <p className="text-sm text-blue-100 m-0">Explore API documentation</p>
                </Link>
                <Link href="/docs/guides/crm" className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all">
                  <h3 className="font-bold mb-2">User Guides →</h3>
                  <p className="text-sm text-blue-100 m-0">Module-specific guides</p>
                </Link>
                <Link href="/support" className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all">
                  <h3 className="font-bold mb-2">Get Support →</h3>
                  <p className="text-sm text-blue-100 m-0">24/7 assistance available</p>
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
