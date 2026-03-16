'use client';

import Link from 'next/link';
import { ArrowLeft, Building2, Users, Shield } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function MultiTenancyPage() {
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
            <div className="text-sm text-muted-foreground mb-2">
              Documentation / Popular / Multi-tenancy Setup
            </div>
            <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <span className="bg-purple-100 dark:bg-purple-900/30 px-2 py-1 rounded">Enterprise</span>
              <span>30 min read</span>
            </div>
          </div>

          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Multi-tenancy Setup</h1>
            <p className="text-xl text-muted-foreground">
              Configure secure multi-tenant architecture for enterprise organizations
            </p>
          </div>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            
            <section className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl p-8 text-white mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Building2 className="h-8 w-8" />
                <h2 className="text-3xl font-bold m-0">Multi-Tenancy Overview</h2>
              </div>
              <p className="text-lg text-purple-100 m-0">
                Manage multiple organizations with complete data isolation and custom branding
              </p>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
              <h2 className="text-3xl font-bold mb-6">Architecture Types</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="border-2 border-blue-200 dark:border-blue-800 rounded-xl p-6 bg-blue-50 dark:bg-blue-900/20">
                  <h3 className="text-xl font-bold mb-3">Shared Database</h3>
                  <p className="text-sm text-muted-foreground mb-3">Single database with tenant_id columns</p>
                  <ul className="text-sm space-y-1">
                    <li>✓ Cost-effective</li>
                    <li>✓ Easy maintenance</li>
                    <li>✓ Efficient resource usage</li>
                  </ul>
                </div>
                
                <div className="border-2 border-purple-200 dark:border-purple-800 rounded-xl p-6 bg-purple-50 dark:bg-purple-900/20">
                  <h3 className="text-xl font-bold mb-3">Isolated Database</h3>
                  <p className="text-sm text-muted-foreground mb-3">Separate database per tenant</p>
                  <ul className="text-sm space-y-1">
                    <li>✓ Maximum isolation</li>
                    <li>✓ Custom schema per tenant</li>
                    <li>✓ Enterprise compliance</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
              <h2 className="text-3xl font-bold mb-6">Setup Steps</h2>
              
              <div className="space-y-6">
                <div className="border-l-4 border-blue-500 pl-6">
                  <h3 className="text-xl font-bold mb-3">Step 1: Enable Multi-Tenancy</h3>
                  <div className="bg-slate-900 rounded-xl p-6">
                    <pre className="text-green-400 font-mono text-sm">
{`// Configuration
{
  "multiTenancy": {
    "enabled": true,
    "mode": "shared_database", // or "isolated_database"
    "tenantIdentifier": "subdomain" // or "header" or "path"
  }
}`}
                    </pre>
                  </div>
                </div>

                <div className="border-l-4 border-purple-500 pl-6">
                  <h3 className="text-xl font-bold mb-3">Step 2: Create Tenant</h3>
                  <div className="bg-slate-900 rounded-xl p-6">
                    <pre className="text-green-400 font-mono text-sm">
{`POST https://api.cognexiaai.com/v1/tenants

{
  "name": "Acme Corporation",
  "subdomain": "acme",
  "settings": {
    "timezone": "America/New_York",
    "currency": "USD",
    "dateFormat": "MM/DD/YYYY"
  },
  "branding": {
    "logo": "https://cdn.acme.com/logo.png",
    "primaryColor": "#0066CC",
    "customDomain": "erp.acme.com"
  }
}`}
                    </pre>
                  </div>
                </div>

                <div className="border-l-4 border-green-500 pl-6">
                  <h3 className="text-xl font-bold mb-3">Step 3: Configure Access</h3>
                  <p className="mb-3">Set up tenant-specific authentication and authorization.</p>
                  <div className="bg-slate-900 rounded-xl p-6">
                    <pre className="text-green-400 font-mono text-sm">
{`// Middleware for tenant resolution
function resolveTenant(req, res, next) {
  const subdomain = req.hostname.split('.')[0];
  
  // Load tenant from database
  const tenant = await getTenantBySubdomain(subdomain);
  
  if (!tenant) {
    return res.status(404).send('Tenant not found');
  }
  
  req.tenant = tenant;
  next();
}`}
                    </pre>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
              <h2 className="text-3xl font-bold mb-6">Data Isolation</h2>
              
              <div className="space-y-4">
                <div className="flex gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <Shield className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-bold mb-1">Row-Level Security</p>
                    <p className="text-sm text-muted-foreground m-0">All queries automatically filtered by tenant_id</p>
                  </div>
                </div>
                
                <div className="flex gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <Users className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-bold mb-1">User Segregation</p>
                    <p className="text-sm text-muted-foreground m-0">Users can only access their tenant's data</p>
                  </div>
                </div>
                
                <div className="flex gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <Building2 className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-bold mb-1">Cross-Tenant Prevention</p>
                    <p className="text-sm text-muted-foreground m-0">API validates tenant context on every request</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
              <h2 className="text-3xl font-bold mb-6">Custom Branding</h2>
              
              <div className="bg-slate-900 rounded-xl p-6">
                <pre className="text-green-400 font-mono text-sm">
{`// Tenant branding configuration
{
  "tenantId": "acme",
  "branding": {
    "logo": {
      "light": "https://cdn.acme.com/logo-light.png",
      "dark": "https://cdn.acme.com/logo-dark.png"
    },
    "colors": {
      "primary": "#0066CC",
      "secondary": "#FF6B35",
      "accent": "#4ECDC4"
    },
    "fonts": {
      "heading": "Inter",
      "body": "Inter"
    },
    "customDomain": "erp.acme.com",
    "customCSS": ".custom-header { ... }"
  }
}`}
                </pre>
              </div>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
              <h2 className="text-3xl font-bold mb-6">Tenant Management</h2>
              
              <div className="space-y-3">
                <div className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl">
                  <h3 className="font-bold mb-2">Provisioning</h3>
                  <p className="text-sm text-muted-foreground">Automated tenant creation with default settings and sample data</p>
                </div>
                
                <div className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl">
                  <h3 className="font-bold mb-2">Billing</h3>
                  <p className="text-sm text-muted-foreground">Per-tenant usage tracking and subscription management</p>
                </div>
                
                <div className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl">
                  <h3 className="font-bold mb-2">Backup & Recovery</h3>
                  <p className="text-sm text-muted-foreground">Tenant-specific backup policies and point-in-time recovery</p>
                </div>
                
                <div className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl">
                  <h3 className="font-bold mb-2">Migration</h3>
                  <p className="text-sm text-muted-foreground">Tools to move tenants between regions or architectures</p>
                </div>
              </div>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
              <h2 className="text-3xl font-bold mb-6">Performance Optimization</h2>
              
              <ol className="list-decimal pl-6 space-y-2">
                <li>Index tenant_id columns on all tables</li>
                <li>Implement tenant-aware caching strategies</li>
                <li>Use connection pooling per tenant</li>
                <li>Monitor and alert on per-tenant resource usage</li>
                <li>Implement rate limiting at tenant level</li>
              </ol>
            </section>

            <section className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl p-8 text-white">
              <h2 className="text-3xl font-bold mb-6">Next Steps</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <Link href="/docs/api/rest" className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all">
                  <h3 className="font-bold mb-2">Tenant API →</h3>
                  <p className="text-sm text-purple-100 m-0">Management endpoints</p>
                </Link>
                <Link href="/docs/popular/security-best-practices" className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all">
                  <h3 className="font-bold mb-2">Security →</h3>
                  <p className="text-sm text-purple-100 m-0">Isolation practices</p>
                </Link>
                <Link href="/enterprise" className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all">
                  <h3 className="font-bold mb-2">Enterprise →</h3>
                  <p className="text-sm text-purple-100 m-0">Contact sales</p>
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
