'use client';

import Link from 'next/link';
import { ArrowLeft, Shield, Key, Lock } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function APIAuthenticationPage() {
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
              Documentation / Popular / API Authentication
            </div>
            <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <span className="bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded">API</span>
              <span>10 min read</span>
            </div>
          </div>

          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">API Authentication</h1>
            <p className="text-xl text-muted-foreground">
              Complete guide to authenticating with CognexiaAI APIs
            </p>
          </div>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            
            <section className="bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl p-8 text-white mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="h-8 w-8" />
                <h2 className="text-3xl font-bold m-0">Authentication Methods</h2>
              </div>
              <p className="text-lg text-blue-100 m-0">
                Three secure ways to authenticate: API Keys, OAuth 2.0, and JWT tokens
              </p>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
              <h2 className="text-3xl font-bold mb-6">Method 1: API Key Authentication</h2>
              
              <p className="mb-4">The simplest method for server-to-server communication.</p>
              
              <div className="bg-slate-900 rounded-xl p-6 mb-4">
                <pre className="text-green-400 font-mono text-sm">
{`curl -X GET https://api.cognexiaai.com/v1/crm/contacts \\
  -H "Authorization: Bearer sk_live_YOUR_API_KEY" \\
  -H "Content-Type: application/json"`}
                </pre>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4">
                <p className="text-sm m-0">
                  <strong>Security:</strong> Never expose API keys in client-side code or public repositories
                </p>
              </div>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
              <h2 className="text-3xl font-bold mb-6">Method 2: OAuth 2.0</h2>
              
              <p className="mb-4">For user-authorized access to resources.</p>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold mb-2">Step 1: Authorization Request</h3>
                  <div className="bg-slate-900 rounded-xl p-6">
                    <pre className="text-green-400 font-mono text-sm">
{`https://auth.cognexiaai.com/oauth/authorize?
  client_id=YOUR_CLIENT_ID&
  redirect_uri=https://yourapp.com/callback&
  response_type=code&
  scope=crm:read crm:write`}
                    </pre>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-2">Step 2: Token Exchange</h3>
                  <div className="bg-slate-900 rounded-xl p-6">
                    <pre className="text-green-400 font-mono text-sm">
{`POST https://auth.cognexiaai.com/oauth/token

{
  "grant_type": "authorization_code",
  "code": "AUTH_CODE",
  "client_id": "YOUR_CLIENT_ID",
  "client_secret": "YOUR_CLIENT_SECRET"
}`}
                    </pre>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
              <h2 className="text-3xl font-bold mb-6">Method 3: JWT Tokens</h2>
              
              <p className="mb-4">For session-based authentication in web applications.</p>
              
              <div className="bg-slate-900 rounded-xl p-6">
                <pre className="text-green-400 font-mono text-sm">
{`// Login and receive JWT
const response = await fetch('/api/auth/login', {
  method: 'POST',
  body: JSON.stringify({ email, password })
});

const { token } = await response.json();

// Use token in subsequent requests
fetch('/api/user/profile', {
  headers: {
    'Authorization': \`Bearer \${token}\`
  }
});`}
                </pre>
              </div>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
              <h2 className="text-3xl font-bold mb-6">Best Practices</h2>
              
              <div className="space-y-4">
                <div className="flex gap-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                  <Key className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-bold mb-1">Rotate Keys Regularly</p>
                    <p className="text-sm text-muted-foreground m-0">Change API keys every 90 days</p>
                  </div>
                </div>
                
                <div className="flex gap-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                  <Lock className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-bold mb-1">Use Environment Variables</p>
                    <p className="text-sm text-muted-foreground m-0">Store credentials securely</p>
                  </div>
                </div>
                
                <div className="flex gap-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                  <Shield className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-bold mb-1">Implement Rate Limiting</p>
                    <p className="text-sm text-muted-foreground m-0">Protect against abuse</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl p-8 text-white">
              <h2 className="text-3xl font-bold mb-6">Next Steps</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <Link href="/docs/api/rest" className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all">
                  <h3 className="font-bold mb-2">REST API →</h3>
                  <p className="text-sm text-blue-100 m-0">API reference</p>
                </Link>
                <Link href="/docs/api/rate-limits" className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all">
                  <h3 className="font-bold mb-2">Rate Limits →</h3>
                  <p className="text-sm text-blue-100 m-0">Usage quotas</p>
                </Link>
                <Link href="/docs/popular/security-best-practices" className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all">
                  <h3 className="font-bold mb-2">Security →</h3>
                  <p className="text-sm text-blue-100 m-0">Best practices</p>
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
