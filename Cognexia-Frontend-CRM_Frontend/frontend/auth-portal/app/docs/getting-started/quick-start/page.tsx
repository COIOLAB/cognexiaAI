'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle2, Play, Code, Zap } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function QuickStartPage() {
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
              Documentation / Getting Started / Quick Start Tutorial
            </div>
          </div>

          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Quick Start Tutorial</h1>
            <p className="text-xl text-muted-foreground">
              Get up and running with CognexiaAI ERP in under 30 minutes
            </p>
            <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
              <span>Last updated: January 2026</span>
              <span>•</span>
              <span>25 min read</span>
            </div>
          </div>

          {/* Content */}
          <div className="prose prose-lg dark:prose-invert max-w-none">
            
            {/* Introduction */}
            <section className="bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl p-8 text-white mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Play className="h-8 w-8" />
                <h2 className="text-3xl font-bold m-0">What You'll Build</h2>
              </div>
              <p className="mb-0 text-blue-100 text-lg">
                In this tutorial, you'll create your first CRM workflow, add users, configure permissions, and make your first API call. By the end, you'll have a working CognexiaAI ERP instance ready for development.
              </p>
            </section>

            {/* Step 1 */}
            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
              <h2 className="text-3xl font-bold mb-6">Step 1: Create Your Account</h2>
              
              <div className="space-y-4 mb-6">
                <p>Sign up for a free trial account to get started:</p>
                
                <div className="bg-slate-900 rounded-xl p-6">
                  <pre className="text-green-400 font-mono text-sm">
{`# Navigate to registration
https://app.cognexiaai.com/register

# Or use CLI
cognexia-cli signup --email your@email.com`}
                  </pre>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4">
                  <p className="text-sm m-0">
                    <strong>Free Trial:</strong> Includes 14 days access to all features, 50 users, and unlimited API calls.
                  </p>
                </div>
              </div>
            </section>

            {/* Step 2 */}
            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
              <h2 className="text-3xl font-bold mb-6">Step 2: Setup Your Organization</h2>
              
              <div className="space-y-4">
                <p>Complete the onboarding wizard to configure your organization:</p>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="border-2 border-blue-200 dark:border-blue-800 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                      <strong>Organization Details</strong>
                    </div>
                    <p className="text-sm text-muted-foreground m-0">Name, industry, size, location</p>
                  </div>
                  
                  <div className="border-2 border-blue-200 dark:border-blue-800 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                      <strong>Module Selection</strong>
                    </div>
                    <p className="text-sm text-muted-foreground m-0">Choose CRM, HR, Finance, etc.</p>
                  </div>
                  
                  <div className="border-2 border-blue-200 dark:border-blue-800 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                      <strong>User Roles</strong>
                    </div>
                    <p className="text-sm text-muted-foreground m-0">Define admin, manager, staff roles</p>
                  </div>
                  
                  <div className="border-2 border-blue-200 dark:border-blue-800 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                      <strong>Integrations</strong>
                    </div>
                    <p className="text-sm text-muted-foreground m-0">Connect email, calendar, storage</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Step 3 */}
            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
              <h2 className="text-3xl font-bold mb-6">Step 3: Create Your First CRM Contact</h2>
              
              <p className="mb-6">Let's add a customer contact using the web interface:</p>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <strong>Navigate to CRM Module:</strong> Click on "CRM" in the main navigation
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <strong>Click "Add Contact":</strong> Fill in name, email, phone, company
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <strong>Add Tags:</strong> Categorize with tags like "VIP", "Lead", "Customer"
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <strong>Save:</strong> Your first contact is now in the system
                  </div>
                </div>
              </div>

              <div className="mt-6 bg-slate-900 rounded-xl p-6">
                <p className="text-slate-300 text-sm mb-2">Or use the API:</p>
                <pre className="text-green-400 font-mono text-sm">
{`curl -X POST https://api.cognexiaai.com/v1/crm/contacts \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "company": "Acme Corp",
    "tags": ["lead", "enterprise"]
  }'`}
                </pre>
              </div>
            </section>

            {/* Step 4 */}
            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
              <h2 className="text-3xl font-bold mb-6">Step 4: Configure User Permissions</h2>
              
              <p className="mb-6">Set up role-based access control (RBAC):</p>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold mb-3">Create User Roles</h3>
                  <div className="bg-slate-900 rounded-xl p-6">
                    <pre className="text-green-400 font-mono text-sm">
{`# Navigate to Settings > User Management > Roles
# Create roles: Admin, Manager, Sales, Support

# Or via CLI
cognexia-cli roles create \\
  --name "Sales Manager" \\
  --permissions "crm:read,crm:write,reports:read"`}
                    </pre>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-3">Invite Team Members</h3>
                  <div className="bg-slate-900 rounded-xl p-6">
                    <pre className="text-green-400 font-mono text-sm">
{`cognexia-cli users invite \\
  --email teammate@company.com \\
  --role "Sales Manager" \\
  --send-email`}
                    </pre>
                  </div>
                </div>
              </div>
            </section>

            {/* Step 5 */}
            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
              <h2 className="text-3xl font-bold mb-6">Step 5: Make Your First API Call</h2>
              
              <p className="mb-6">Generate an API key and test the connection:</p>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold mb-3">1. Generate API Key</h3>
                  <p className="text-muted-foreground mb-3">Go to Settings → API Keys → Generate New Key</p>
                  <div className="bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-500 p-4">
                    <p className="text-sm m-0">
                      <strong>Security:</strong> Save your API key securely. It won't be shown again.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-3">2. Test Authentication</h3>
                  <div className="bg-slate-900 rounded-xl p-6">
                    <pre className="text-green-400 font-mono text-sm">
{`# Test API connection
curl https://api.cognexiaai.com/v1/auth/verify \\
  -H "Authorization: Bearer YOUR_API_KEY"

# Expected response:
{
  "status": "success",
  "user": {
    "id": "usr_123",
    "email": "you@company.com",
    "role": "admin"
  }
}`}
                    </pre>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-3">3. Fetch Your Data</h3>
                  <div className="bg-slate-900 rounded-xl p-6">
                    <pre className="text-green-400 font-mono text-sm">
{`# List all contacts
curl https://api.cognexiaai.com/v1/crm/contacts \\
  -H "Authorization: Bearer YOUR_API_KEY"

# Response includes pagination
{
  "data": [...],
  "pagination": {
    "page": 1,
    "per_page": 50,
    "total": 1
  }
}`}
                    </pre>
                  </div>
                </div>
              </div>
            </section>

            {/* Step 6 */}
            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
              <h2 className="text-3xl font-bold mb-6">Step 6: Create a Dashboard</h2>
              
              <p className="mb-6">Build your first analytics dashboard:</p>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-bold text-sm">1</span>
                  </div>
                  <div>
                    <strong>Go to Analytics:</strong> Navigate to the Analytics module
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-bold text-sm">2</span>
                  </div>
                  <div>
                    <strong>Create Dashboard:</strong> Click "New Dashboard" and give it a name
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-bold text-sm">3</span>
                  </div>
                  <div>
                    <strong>Add Widgets:</strong> Drag and drop charts, tables, and metrics
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-bold text-sm">4</span>
                  </div>
                  <div>
                    <strong>Configure Data Sources:</strong> Connect to CRM, HR, Finance modules
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-bold text-sm">5</span>
                  </div>
                  <div>
                    <strong>Share:</strong> Set permissions and share with your team
                  </div>
                </div>
              </div>
            </section>

            {/* Congratulations */}
            <section className="bg-gradient-to-br from-green-600 to-emerald-500 rounded-2xl p-8 text-white mb-8">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle2 className="h-8 w-8" />
                <h2 className="text-3xl font-bold m-0">Congratulations!</h2>
              </div>
              <p className="mb-6 text-green-100 text-lg">
                You've successfully set up CognexiaAI ERP, created your first contact, configured permissions, made API calls, and built a dashboard. You're ready to start building!
              </p>
              
              <div className="grid md:grid-cols-3 gap-4">
                <Link href="/docs/api/rest" className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all">
                  <Code className="h-6 w-6 mb-2" />
                  <h3 className="font-bold mb-1">API Docs</h3>
                  <p className="text-sm text-green-100 m-0">Explore full API reference</p>
                </Link>
                <Link href="/docs/guides/crm" className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all">
                  <Zap className="h-6 w-6 mb-2" />
                  <h3 className="font-bold mb-1">CRM Guide</h3>
                  <p className="text-sm text-green-100 m-0">Advanced CRM features</p>
                </Link>
                <Link href="/support" className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all">
                  <CheckCircle2 className="h-6 w-6 mb-2" />
                  <h3 className="font-bold mb-1">Get Help</h3>
                  <p className="text-sm text-green-100 m-0">24/7 support available</p>
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
