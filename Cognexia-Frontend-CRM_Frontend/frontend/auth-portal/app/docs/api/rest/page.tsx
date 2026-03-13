'use client';

import Link from 'next/link';
import { ArrowLeft, Code, CheckCircle2, Copy } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function RestApiPage() {
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
              Documentation / API Reference / REST API
            </div>
          </div>

          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">REST API Documentation</h1>
            <p className="text-xl text-muted-foreground">
              Complete REST API reference for CognexiaAI ERP platform
            </p>
          </div>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            
            <section className="bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl p-8 text-white mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Code className="h-8 w-8" />
                <h2 className="text-3xl font-bold m-0">Base URL</h2>
              </div>
              <div className="bg-slate-900 rounded-xl p-4">
                <code className="text-green-400 text-lg">https://api.cognexiaai.com/v1</code>
              </div>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
              <h2 className="text-3xl font-bold mb-6">Authentication</h2>
              
              <p className="mb-6">All API requests require authentication using Bearer tokens:</p>
              
              <div className="bg-slate-900 rounded-xl p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-slate-300 text-sm font-mono">Authorization Header</span>
                  <button className="text-slate-400 hover:text-white">
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
                <pre className="text-green-400 font-mono text-sm">
{`curl -X GET https://api.cognexiaai.com/v1/crm/contacts \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`}
                </pre>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4">
                <p className="text-sm m-0">
                  <strong>Get API Key:</strong> Navigate to Settings → API Keys in your dashboard to generate keys.
                </p>
              </div>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
              <h2 className="text-3xl font-bold mb-6">CRM Endpoints</h2>
              
              <div className="space-y-6">
                <div className="border-l-4 border-blue-500 pl-6">
                  <h3 className="text-2xl font-bold mb-3">List Contacts</h3>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 rounded-md mb-3">
                    <span className="text-green-700 dark:text-green-400 font-bold text-sm">GET</span>
                    <code className="text-sm">/crm/contacts</code>
                  </div>
                  
                  <div className="bg-slate-900 rounded-xl p-6 mb-4">
                    <pre className="text-green-400 font-mono text-sm">
{`curl -X GET "https://api.cognexiaai.com/v1/crm/contacts?page=1&limit=50" \\
  -H "Authorization: Bearer YOUR_API_KEY"`}
                    </pre>
                  </div>

                  <p className="font-semibold mb-2">Response (200 OK):</p>
                  <div className="bg-slate-900 rounded-xl p-6">
                    <pre className="text-green-400 font-mono text-sm">
{`{
  "data": [
    {
      "id": "cnt_123",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "company": "Acme Corp",
      "createdAt": "2026-01-15T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 100,
    "pages": 2
  }
}`}
                    </pre>
                  </div>
                </div>

                <div className="border-l-4 border-green-500 pl-6">
                  <h3 className="text-2xl font-bold mb-3">Create Contact</h3>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-md mb-3">
                    <span className="text-blue-700 dark:text-blue-400 font-bold text-sm">POST</span>
                    <code className="text-sm">/crm/contacts</code>
                  </div>
                  
                  <div className="bg-slate-900 rounded-xl p-6 mb-4">
                    <pre className="text-green-400 font-mono text-sm">
{`curl -X POST https://api.cognexiaai.com/v1/crm/contacts \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane@example.com",
    "company": "Tech Inc",
    "phone": "+1-555-0123",
    "tags": ["lead", "enterprise"]
  }'`}
                    </pre>
                  </div>

                  <p className="font-semibold mb-2">Response (201 Created):</p>
                  <div className="bg-slate-900 rounded-xl p-6">
                    <pre className="text-green-400 font-mono text-sm">
{`{
  "id": "cnt_124",
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@example.com",
  "company": "Tech Inc",
  "phone": "+1-555-0123",
  "tags": ["lead", "enterprise"],
  "createdAt": "2026-01-29T15:30:00Z"
}`}
                    </pre>
                  </div>
                </div>

                <div className="border-l-4 border-orange-500 pl-6">
                  <h3 className="text-2xl font-bold mb-3">Update Contact</h3>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-100 dark:bg-orange-900/30 rounded-md mb-3">
                    <span className="text-orange-700 dark:text-orange-400 font-bold text-sm">PUT</span>
                    <code className="text-sm">/crm/contacts/:id</code>
                  </div>
                  
                  <div className="bg-slate-900 rounded-xl p-6">
                    <pre className="text-green-400 font-mono text-sm">
{`curl -X PUT https://api.cognexiaai.com/v1/crm/contacts/cnt_124 \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "company": "Tech Industries Inc",
    "tags": ["customer", "enterprise"]
  }'`}
                    </pre>
                  </div>
                </div>

                <div className="border-l-4 border-red-500 pl-6">
                  <h3 className="text-2xl font-bold mb-3">Delete Contact</h3>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-100 dark:bg-red-900/30 rounded-md mb-3">
                    <span className="text-red-700 dark:text-red-400 font-bold text-sm">DELETE</span>
                    <code className="text-sm">/crm/contacts/:id</code>
                  </div>
                  
                  <div className="bg-slate-900 rounded-xl p-6">
                    <pre className="text-green-400 font-mono text-sm">
{`curl -X DELETE https://api.cognexiaai.com/v1/crm/contacts/cnt_124 \\
  -H "Authorization: Bearer YOUR_API_KEY"`}
                    </pre>
                  </div>
                  
                  <p className="font-semibold mb-2 mt-4">Response (204 No Content)</p>
                </div>
              </div>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
              <h2 className="text-3xl font-bold mb-6">HR Endpoints</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl">
                  <div>
                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 rounded-md mr-3">
                      <span className="text-green-700 dark:text-green-400 font-bold text-sm">GET</span>
                    </span>
                    <code>/hr/employees</code>
                  </div>
                  <span className="text-sm text-muted-foreground">List all employees</span>
                </div>
                
                <div className="flex items-center justify-between p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl">
                  <div>
                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-md mr-3">
                      <span className="text-blue-700 dark:text-blue-400 font-bold text-sm">POST</span>
                    </span>
                    <code>/hr/employees</code>
                  </div>
                  <span className="text-sm text-muted-foreground">Create employee</span>
                </div>

                <div className="flex items-center justify-between p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl">
                  <div>
                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 rounded-md mr-3">
                      <span className="text-green-700 dark:text-green-400 font-bold text-sm">GET</span>
                    </span>
                    <code>/hr/attendance</code>
                  </div>
                  <span className="text-sm text-muted-foreground">Get attendance records</span>
                </div>
              </div>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
              <h2 className="text-3xl font-bold mb-6">Error Responses</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold mb-2">400 Bad Request</h3>
                  <div className="bg-slate-900 rounded-xl p-6">
                    <pre className="text-red-400 font-mono text-sm">
{`{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email is required",
    "field": "email"
  }
}`}
                    </pre>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-2">401 Unauthorized</h3>
                  <div className="bg-slate-900 rounded-xl p-6">
                    <pre className="text-red-400 font-mono text-sm">
{`{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired API key"
  }
}`}
                    </pre>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-2">429 Rate Limit</h3>
                  <div className="bg-slate-900 rounded-xl p-6">
                    <pre className="text-red-400 font-mono text-sm">
{`{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests",
    "retryAfter": 60
  }
}`}
                    </pre>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl p-8 text-white">
              <h2 className="text-3xl font-bold mb-6">Next Steps</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <Link href="/docs/api/graphql" className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all">
                  <h3 className="font-bold mb-2">GraphQL API →</h3>
                  <p className="text-sm text-blue-100 m-0">Advanced queries</p>
                </Link>
                <Link href="/docs/api/authentication" className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all">
                  <h3 className="font-bold mb-2">Authentication →</h3>
                  <p className="text-sm text-blue-100 m-0">Security guide</p>
                </Link>
                <Link href="/docs/developer/sdks" className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all">
                  <h3 className="font-bold mb-2">SDKs →</h3>
                  <p className="text-sm text-blue-100 m-0">Client libraries</p>
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
