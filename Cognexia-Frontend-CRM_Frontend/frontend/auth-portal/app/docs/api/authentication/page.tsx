'use client';

import Link from 'next/link';
import { ArrowLeft, Shield, Key, Lock } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function AuthenticationPage() {
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
              Documentation / API Reference / Authentication & Security
            </div>
          </div>

          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Authentication & Security</h1>
            <p className="text-xl text-muted-foreground">
              Secure your API requests with industry-standard authentication
            </p>
          </div>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            
            <section className="bg-gradient-to-br from-green-600 to-emerald-500 rounded-2xl p-8 text-white mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="h-8 w-8" />
                <h2 className="text-3xl font-bold m-0">Security Standards</h2>
              </div>
              <div className="grid md:grid-cols-3 gap-4 mt-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <p className="font-bold text-lg m-0">OAuth 2.0</p>
                  <p className="text-sm text-green-100 m-0">Industry standard</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <p className="font-bold text-lg m-0">TLS 1.3</p>
                  <p className="text-sm text-green-100 m-0">Encrypted transport</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <p className="font-bold text-lg m-0">HMAC SHA-256</p>
                  <p className="text-sm text-green-100 m-0">Request signing</p>
                </div>
              </div>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
              <h2 className="text-3xl font-bold mb-6">API Key Authentication</h2>
              
              <p className="mb-6">The simplest method for server-to-server communication:</p>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold mb-3">1. Generate API Key</h3>
                  <p>Navigate to <strong>Settings → API Keys</strong> in your dashboard</p>
                  <div className="bg-slate-900 rounded-xl p-6 mt-3">
                    <pre className="text-green-400 font-mono text-sm">
{`API Key: sk_live_1234567890abcdefghijklmnop
Secret: sk_secret_abcdefghijklmnopqrstuvwxyz123456`}
                    </pre>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-3">2. Include in Headers</h3>
                  <div className="bg-slate-900 rounded-xl p-6">
                    <pre className="text-green-400 font-mono text-sm">
{`Authorization: Bearer sk_live_1234567890abcdefghijklmnop`}
                    </pre>
                  </div>
                </div>

                <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4">
                  <p className="text-sm m-0">
                    <strong>Security:</strong> Never expose API keys in client-side code. Use environment variables.
                  </p>
                </div>
              </div>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
              <h2 className="text-3xl font-bold mb-6">OAuth 2.0 Flow</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold mb-3">Authorization Code Grant</h3>
                  <p className="mb-3">For applications that can securely store secrets:</p>
                  
                  <div className="bg-slate-900 rounded-xl p-6 mb-4">
                    <p className="text-slate-300 text-sm mb-2">Step 1: Redirect to Authorization</p>
                    <pre className="text-green-400 font-mono text-sm">
{`https://auth.cognexiaai.com/oauth/authorize?
  client_id=YOUR_CLIENT_ID&
  redirect_uri=https://yourapp.com/callback&
  response_type=code&
  scope=crm:read crm:write hr:read`}
                    </pre>
                  </div>

                  <div className="bg-slate-900 rounded-xl p-6 mb-4">
                    <p className="text-slate-300 text-sm mb-2">Step 2: Exchange Code for Token</p>
                    <pre className="text-green-400 font-mono text-sm">
{`curl -X POST https://auth.cognexiaai.com/oauth/token \\
  -H "Content-Type: application/json" \\
  -d '{
    "grant_type": "authorization_code",
    "code": "AUTH_CODE",
    "client_id": "YOUR_CLIENT_ID",
    "client_secret": "YOUR_CLIENT_SECRET",
    "redirect_uri": "https://yourapp.com/callback"
  }'`}
                    </pre>
                  </div>

                  <div className="bg-slate-900 rounded-xl p-6">
                    <p className="text-slate-300 text-sm mb-2">Response:</p>
                    <pre className="text-green-400 font-mono text-sm">
{`{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "refresh_1234567890",
  "scope": "crm:read crm:write hr:read"
}`}
                    </pre>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-3">Refresh Token</h3>
                  <div className="bg-slate-900 rounded-xl p-6">
                    <pre className="text-green-400 font-mono text-sm">
{`curl -X POST https://auth.cognexiaai.com/oauth/token \\
  -H "Content-Type: application/json" \\
  -d '{
    "grant_type": "refresh_token",
    "refresh_token": "refresh_1234567890",
    "client_id": "YOUR_CLIENT_ID",
    "client_secret": "YOUR_CLIENT_SECRET"
  }'`}
                    </pre>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
              <h2 className="text-3xl font-bold mb-6">Scopes & Permissions</h2>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl">
                  <code className="font-bold">crm:read</code>
                  <span className="text-sm text-muted-foreground">Read CRM contacts and deals</span>
                </div>
                <div className="flex items-center justify-between p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl">
                  <code className="font-bold">crm:write</code>
                  <span className="text-sm text-muted-foreground">Create and update CRM data</span>
                </div>
                <div className="flex items-center justify-between p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl">
                  <code className="font-bold">hr:read</code>
                  <span className="text-sm text-muted-foreground">Read employee data</span>
                </div>
                <div className="flex items-center justify-between p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl">
                  <code className="font-bold">hr:write</code>
                  <span className="text-sm text-muted-foreground">Manage employees and attendance</span>
                </div>
                <div className="flex items-center justify-between p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl">
                  <code className="font-bold">finance:read</code>
                  <span className="text-sm text-muted-foreground">View financial records</span>
                </div>
                <div className="flex items-center justify-between p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl">
                  <code className="font-bold">finance:write</code>
                  <span className="text-sm text-muted-foreground">Create invoices and transactions</span>
                </div>
                <div className="flex items-center justify-between p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl">
                  <code className="font-bold">admin</code>
                  <span className="text-sm text-muted-foreground">Full administrative access</span>
                </div>
              </div>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
              <h2 className="text-3xl font-bold mb-6">Webhook Signatures</h2>
              
              <p className="mb-6">Verify webhook authenticity using HMAC signatures:</p>
              
              <div className="bg-slate-900 rounded-xl p-6 mb-6">
                <pre className="text-green-400 font-mono text-sm">
{`const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
  const hmac = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(hmac)
  );
}

// Usage
const isValid = verifyWebhook(
  req.body,
  req.headers['x-cognexia-signature'],
  process.env.WEBHOOK_SECRET
);`}
                </pre>
              </div>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
              <h2 className="text-3xl font-bold mb-6">Security Best Practices</h2>
              
              <div className="space-y-4">
                <div className="flex gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <Key className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-bold mb-1">Rotate API Keys Regularly</p>
                    <p className="text-sm text-muted-foreground m-0">Change keys every 90 days or after team member changes</p>
                  </div>
                </div>
                
                <div className="flex gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <Lock className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-bold mb-1">Use Environment Variables</p>
                    <p className="text-sm text-muted-foreground m-0">Never hardcode keys in source code or commit to version control</p>
                  </div>
                </div>
                
                <div className="flex gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <Shield className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-bold mb-1">Principle of Least Privilege</p>
                    <p className="text-sm text-muted-foreground m-0">Request only the scopes you need</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-gradient-to-br from-green-600 to-emerald-500 rounded-2xl p-8 text-white">
              <h2 className="text-3xl font-bold mb-6">Next Steps</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <Link href="/docs/api/rate-limits" className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all">
                  <h3 className="font-bold mb-2">Rate Limits →</h3>
                  <p className="text-sm text-green-100 m-0">API quotas</p>
                </Link>
                <Link href="/docs/integrations/oauth" className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all">
                  <h3 className="font-bold mb-2">OAuth Setup →</h3>
                  <p className="text-sm text-green-100 m-0">Full integration</p>
                </Link>
                <Link href="/docs/developer/webhooks" className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all">
                  <h3 className="font-bold mb-2">Webhooks →</h3>
                  <p className="text-sm text-green-100 m-0">Event handling</p>
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
