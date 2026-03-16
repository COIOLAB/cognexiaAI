'use client';

import Link from 'next/link';
import { ArrowLeft, Gauge, AlertCircle, TrendingUp } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function RateLimitsPage() {
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
              Documentation / API Reference / Rate Limits & Quotas
            </div>
          </div>

          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Rate Limits & Quotas</h1>
            <p className="text-xl text-muted-foreground">
              Understand API usage limits and optimization strategies
            </p>
          </div>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            
            <section className="bg-gradient-to-br from-orange-600 to-red-500 rounded-2xl p-8 text-white mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Gauge className="h-8 w-8" />
                <h2 className="text-3xl font-bold m-0">Rate Limit Overview</h2>
              </div>
              <p className="text-lg text-orange-100 m-0">
                All API requests are subject to rate limiting to ensure fair usage and system stability
              </p>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
              <h2 className="text-3xl font-bold mb-6">Rate Limit Tiers</h2>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="border-2 border-blue-200 dark:border-blue-800 rounded-xl p-6">
                  <h3 className="text-2xl font-bold mb-3 text-blue-600">Free Tier</h3>
                  <div className="space-y-2">
                    <p className="text-3xl font-bold">100</p>
                    <p className="text-sm text-muted-foreground">requests per minute</p>
                    <div className="h-px bg-gray-200 dark:bg-gray-700 my-4"></div>
                    <p className="text-2xl font-bold">10,000</p>
                    <p className="text-sm text-muted-foreground">requests per day</p>
                  </div>
                </div>

                <div className="border-2 border-purple-200 dark:border-purple-800 rounded-xl p-6 bg-purple-50 dark:bg-purple-900/20">
                  <h3 className="text-2xl font-bold mb-3 text-purple-600">Professional</h3>
                  <div className="space-y-2">
                    <p className="text-3xl font-bold">1,000</p>
                    <p className="text-sm text-muted-foreground">requests per minute</p>
                    <div className="h-px bg-gray-200 dark:bg-gray-700 my-4"></div>
                    <p className="text-2xl font-bold">100,000</p>
                    <p className="text-sm text-muted-foreground">requests per day</p>
                  </div>
                </div>

                <div className="border-2 border-green-200 dark:border-green-800 rounded-xl p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                  <h3 className="text-2xl font-bold mb-3 text-green-600">Enterprise</h3>
                  <div className="space-y-2">
                    <p className="text-3xl font-bold">10,000</p>
                    <p className="text-sm text-muted-foreground">requests per minute</p>
                    <div className="h-px bg-gray-200 dark:bg-gray-700 my-4"></div>
                    <p className="text-2xl font-bold">Unlimited</p>
                    <p className="text-sm text-muted-foreground">custom quotas available</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
              <h2 className="text-3xl font-bold mb-6">Rate Limit Headers</h2>
              
              <p className="mb-6">Every API response includes rate limit information in headers:</p>
              
              <div className="bg-slate-900 rounded-xl p-6 mb-6">
                <pre className="text-green-400 font-mono text-sm">
{`HTTP/1.1 200 OK
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 847
X-RateLimit-Reset: 1706543400
Retry-After: 42`}
                </pre>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <code className="font-bold text-sm mt-1">X-RateLimit-Limit</code>
                  <p className="text-sm text-muted-foreground m-0">Maximum requests allowed per window</p>
                </div>
                <div className="flex items-start gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <code className="font-bold text-sm mt-1">X-RateLimit-Remaining</code>
                  <p className="text-sm text-muted-foreground m-0">Requests remaining in current window</p>
                </div>
                <div className="flex items-start gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <code className="font-bold text-sm mt-1">X-RateLimit-Reset</code>
                  <p className="text-sm text-muted-foreground m-0">Unix timestamp when limit resets</p>
                </div>
                <div className="flex items-start gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <code className="font-bold text-sm mt-1">Retry-After</code>
                  <p className="text-sm text-muted-foreground m-0">Seconds to wait before retry (429 only)</p>
                </div>
              </div>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
              <h2 className="text-3xl font-bold mb-6">429 Rate Limit Response</h2>
              
              <div className="bg-slate-900 rounded-xl p-6 mb-6">
                <pre className="text-red-400 font-mono text-sm">
{`HTTP/1.1 429 Too Many Requests
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1706543400
Retry-After: 42

{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Retry after 42 seconds.",
    "retryAfter": 42,
    "limit": 1000,
    "resetAt": "2026-01-29T16:30:00Z"
  }
}`}
                </pre>
              </div>

              <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm m-0">
                    <strong>Important:</strong> Implement exponential backoff when receiving 429 responses
                  </p>
                </div>
              </div>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
              <h2 className="text-3xl font-bold mb-6">Handling Rate Limits</h2>
              
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-3">Exponential Backoff (Node.js)</h3>
                <div className="bg-slate-900 rounded-xl p-6">
                  <pre className="text-green-400 font-mono text-sm">
{`async function makeRequestWithRetry(url, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': \`Bearer \${process.env.API_KEY}\`
        }
      });
      
      if (response.status === 429) {
        const retryAfter = parseInt(
          response.headers.get('Retry-After') || '1'
        );
        const delay = Math.min(retryAfter * 1000, 60000);
        
        console.log(\`Rate limited. Waiting \${delay}ms...\`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      return await response.json();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => 
        setTimeout(resolve, Math.pow(2, i) * 1000)
      );
    }
  }
}`}
                  </pre>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-3">Python Example</h3>
                <div className="bg-slate-900 rounded-xl p-6">
                  <pre className="text-green-400 font-mono text-sm">
{`import time
import requests
from requests.adapters import HTTPAdapter
from requests.packages.urllib3.util.retry import Retry

def get_api_client():
    session = requests.Session()
    retry = Retry(
        total=3,
        backoff_factor=1,
        status_forcelist=[429, 500, 502, 503, 504]
    )
    adapter = HTTPAdapter(max_retries=retry)
    session.mount('https://', adapter)
    return session

# Usage
client = get_api_client()
response = client.get(
    'https://api.cognexiaai.com/v1/crm/contacts',
    headers={'Authorization': f'Bearer {API_KEY}'}
)`}
                  </pre>
                </div>
              </div>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
              <h2 className="text-3xl font-bold mb-6">Optimization Strategies</h2>
              
              <div className="space-y-4">
                <div className="flex gap-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                  <TrendingUp className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-bold mb-1">Use Bulk Endpoints</p>
                    <p className="text-sm text-muted-foreground m-0">Create/update multiple records in a single request instead of individual calls</p>
                  </div>
                </div>
                
                <div className="flex gap-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                  <TrendingUp className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-bold mb-1">Implement Caching</p>
                    <p className="text-sm text-muted-foreground m-0">Cache responses locally and respect Cache-Control headers</p>
                  </div>
                </div>
                
                <div className="flex gap-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                  <TrendingUp className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-bold mb-1">Use Webhooks</p>
                    <p className="text-sm text-muted-foreground m-0">Subscribe to events instead of polling for updates</p>
                  </div>
                </div>
                
                <div className="flex gap-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                  <TrendingUp className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-bold mb-1">GraphQL Field Selection</p>
                    <p className="text-sm text-muted-foreground m-0">Request only the fields you need to reduce response size</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
              <h2 className="text-3xl font-bold mb-6">Concurrent Request Limits</h2>
              
              <p className="mb-4">Maximum simultaneous connections per API key:</p>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl">
                  <span className="font-bold">Free Tier</span>
                  <span className="text-2xl font-bold text-blue-600">5</span>
                </div>
                <div className="flex items-center justify-between p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl">
                  <span className="font-bold">Professional</span>
                  <span className="text-2xl font-bold text-purple-600">50</span>
                </div>
                <div className="flex items-center justify-between p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl">
                  <span className="font-bold">Enterprise</span>
                  <span className="text-2xl font-bold text-green-600">500</span>
                </div>
              </div>
            </section>

            <section className="bg-gradient-to-br from-orange-600 to-red-500 rounded-2xl p-8 text-white">
              <h2 className="text-3xl font-bold mb-6">Next Steps</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <Link href="/docs/api/rest" className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all">
                  <h3 className="font-bold mb-2">REST API →</h3>
                  <p className="text-sm text-orange-100 m-0">API reference</p>
                </Link>
                <Link href="/docs/developer/webhooks" className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all">
                  <h3 className="font-bold mb-2">Webhooks →</h3>
                  <p className="text-sm text-orange-100 m-0">Event subscriptions</p>
                </Link>
                <Link href="/pricing" className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all">
                  <h3 className="font-bold mb-2">Upgrade Plan →</h3>
                  <p className="text-sm text-orange-100 m-0">Higher limits</p>
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
