'use client';

import Link from 'next/link';
import { ArrowLeft, Terminal } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function CLIPage() {
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
              Documentation / Developer Tools / CLI Tools
            </div>
          </div>

          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">CLI Tools</h1>
            <p className="text-xl text-muted-foreground">
              Command-line interface for CognexiaAI ERP
            </p>
          </div>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            
            <section className="bg-gradient-to-br from-slate-700 to-gray-900 rounded-2xl p-8 text-white mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Terminal className="h-8 w-8" />
                <h2 className="text-3xl font-bold m-0">CLI Overview</h2>
              </div>
              <p className="text-lg text-slate-300 m-0">
                Manage resources, run scripts, and automate workflows from the terminal
              </p>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
              <h2 className="text-3xl font-bold mb-6">Installation</h2>
              
              <div className="bg-slate-900 rounded-xl p-6">
                <pre className="text-green-400 font-mono text-sm">
{`# npm
npm install -g @cognexiaai/cli

# Verify installation
cognexia --version`}
                </pre>
              </div>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
              <h2 className="text-3xl font-bold mb-6">Authentication</h2>
              
              <div className="bg-slate-900 rounded-xl p-6 mb-4">
                <pre className="text-green-400 font-mono text-sm">
{`# Login interactively
cognexia login

# Or set API key directly
cognexia config set api-key sk_live_your_key_here`}
                </pre>
              </div>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
              <h2 className="text-3xl font-bold mb-6">Common Commands</h2>
              
              <div className="space-y-4">
                <div className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-4">
                  <code className="font-bold">cognexia contacts list</code>
                  <p className="text-sm text-muted-foreground mt-2">List all CRM contacts</p>
                </div>
                
                <div className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-4">
                  <code className="font-bold">cognexia contacts create</code>
                  <p className="text-sm text-muted-foreground mt-2">Create new contact interactively</p>
                </div>
                
                <div className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-4">
                  <code className="font-bold">cognexia invoices generate</code>
                  <p className="text-sm text-muted-foreground mt-2">Generate and send invoices</p>
                </div>
                
                <div className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-4">
                  <code className="font-bold">cognexia data export</code>
                  <p className="text-sm text-muted-foreground mt-2">Export data to CSV/JSON</p>
                </div>
              </div>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
              <h2 className="text-3xl font-bold mb-6">Examples</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold mb-3">Bulk Import</h3>
                  <div className="bg-slate-900 rounded-xl p-6">
                    <pre className="text-green-400 font-mono text-sm">
{`cognexia contacts import --file contacts.csv --dry-run
cognexia contacts import --file contacts.csv`}
                    </pre>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-3">Generate Reports</h3>
                  <div className="bg-slate-900 rounded-xl p-6">
                    <pre className="text-green-400 font-mono text-sm">
{`cognexia reports sales --from 2026-01-01 --to 2026-01-31 --format pdf
cognexia reports hr-summary --output summary.json`}
                    </pre>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-3">Webhook Management</h3>
                  <div className="bg-slate-900 rounded-xl p-6">
                    <pre className="text-green-400 font-mono text-sm">
{`cognexia webhooks list
cognexia webhooks create --url https://yourapp.com/webhook --events contact.created,deal.closed`}
                    </pre>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-gradient-to-br from-slate-700 to-gray-900 rounded-2xl p-8 text-white">
              <h2 className="text-3xl font-bold mb-6">Next Steps</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <Link href="/docs/developer/webhooks" className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all">
                  <h3 className="font-bold mb-2">Webhooks →</h3>
                  <p className="text-sm text-slate-300 m-0">Event notifications</p>
                </Link>
                <Link href="/docs/developer/sdks" className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all">
                  <h3 className="font-bold mb-2">SDKs →</h3>
                  <p className="text-sm text-slate-300 m-0">Client libraries</p>
                </Link>
                <Link href="/docs/api/rest" className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all">
                  <h3 className="font-bold mb-2">API Docs →</h3>
                  <p className="text-sm text-slate-300 m-0">Full reference</p>
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
