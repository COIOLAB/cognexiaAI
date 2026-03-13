'use client';

import Link from 'next/link';
import { ArrowLeft, Key } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function OAuthSetupPage() {
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
              Documentation / Integrations / OAuth 2.0
            </div>
          </div>

          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">OAuth 2.0 Setup</h1>
            <p className="text-xl text-muted-foreground">
              Secure authentication for third-party applications
            </p>
          </div>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            
            <section className="bg-gradient-to-br from-green-600 to-teal-600 rounded-2xl p-8 text-white mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Key className="h-8 w-8" />
                <h2 className="text-3xl font-bold m-0">OAuth 2.0 Protocol</h2>
              </div>
              <p className="text-lg text-green-100 m-0">
                Industry-standard authorization framework for secure API access
              </p>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
              <h2 className="text-3xl font-bold mb-6">Creating OAuth App</h2>
              
              <ol className="list-decimal pl-6 space-y-3">
                <li>Go to Settings → Developers → OAuth Apps</li>
                <li>Click + Create OAuth App</li>
                <li>Enter app name and description</li>
                <li>Add redirect URIs (callback URLs)</li>
                <li>Select required scopes</li>
                <li>Save and receive Client ID and Client Secret</li>
              </ol>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
              <h2 className="text-3xl font-bold mb-6">Authorization Flow</h2>
              
              <div className="bg-slate-900 rounded-xl p-6">
                <pre className="text-green-400 font-mono text-sm">
{`# Step 1: Redirect user to authorization URL
https://auth.cognexiaai.com/oauth/authorize?
  client_id=YOUR_CLIENT_ID&
  redirect_uri=https://yourapp.com/callback&
  response_type=code&
  scope=crm:read crm:write

# Step 2: Exchange code for access token
POST https://auth.cognexiaai.com/oauth/token
Content-Type: application/json

{
  "grant_type": "authorization_code",
  "code": "AUTH_CODE",
  "client_id": "YOUR_CLIENT_ID",
  "client_secret": "YOUR_CLIENT_SECRET",
  "redirect_uri": "https://yourapp.com/callback"
}`}
                </pre>
              </div>
            </section>

            <section className="bg-gradient-to-br from-green-600 to-teal-600 rounded-2xl p-8 text-white">
              <h2 className="text-3xl font-bold mb-6">Next Steps</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <Link href="/docs/api/authentication" className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all">
                  <h3 className="font-bold mb-2">Authentication →</h3>
                  <p className="text-sm text-green-100 m-0">Full security guide</p>
                </Link>
                <Link href="/docs/developer/sdks" className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all">
                  <h3 className="font-bold mb-2">SDKs →</h3>
                  <p className="text-sm text-green-100 m-0">OAuth client libraries</p>
                </Link>
                <Link href="/docs/integrations/custom" className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all">
                  <h3 className="font-bold mb-2">Custom Apps →</h3>
                  <p className="text-sm text-green-100 m-0">Build integrations</p>
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
