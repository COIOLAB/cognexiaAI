'use client';

import Link from 'next/link';
import { ArrowLeft, Code2, Package } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function SDKsPage() {
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
              Documentation / Developer Tools / SDKs
            </div>
          </div>

          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">JavaScript/TypeScript SDK</h1>
            <p className="text-xl text-muted-foreground">
              Official SDK for Node.js and browser environments
            </p>
          </div>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            
            <section className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl p-8 text-white mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Code2 className="h-8 w-8" />
                <h2 className="text-3xl font-bold m-0">SDK Overview</h2>
              </div>
              <p className="text-lg text-yellow-100 m-0">
                Type-safe SDK with full IntelliSense support and automatic error handling
              </p>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
              <h2 className="text-3xl font-bold mb-6">Installation</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold mb-3">npm</h3>
                  <div className="bg-slate-900 rounded-xl p-6">
                    <pre className="text-green-400 font-mono text-sm">
{`npm install @cognexiaai/sdk`}
                    </pre>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-3">yarn</h3>
                  <div className="bg-slate-900 rounded-xl p-6">
                    <pre className="text-green-400 font-mono text-sm">
{`yarn add @cognexiaai/sdk`}
                    </pre>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-3">pnpm</h3>
                  <div className="bg-slate-900 rounded-xl p-6">
                    <pre className="text-green-400 font-mono text-sm">
{`pnpm add @cognexiaai/sdk`}
                    </pre>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
              <h2 className="text-3xl font-bold mb-6">Quick Start</h2>
              
              <div className="bg-slate-900 rounded-xl p-6 mb-6">
                <pre className="text-green-400 font-mono text-sm">
{`import { CognexiaClient } from '@cognexiaai/sdk';

const client = new CognexiaClient({
  apiKey: process.env.COGNEXIA_API_KEY,
  environment: 'production' // or 'sandbox'
});

// Create a contact
const contact = await client.crm.contacts.create({
  firstName: 'Jane',
  lastName: 'Doe',
  email: 'jane@example.com',
  company: 'Acme Corp'
});

console.log(contact.id); // cnt_123`}
                </pre>
              </div>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
              <h2 className="text-3xl font-bold mb-6">CRM Module</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold mb-3">List Contacts</h3>
                  <div className="bg-slate-900 rounded-xl p-6">
                    <pre className="text-green-400 font-mono text-sm">
{`const contacts = await client.crm.contacts.list({
  page: 1,
  limit: 50,
  tags: ['enterprise']
});

for (const contact of contacts.data) {
  console.log(contact.email);
}`}
                    </pre>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-3">Update Contact</h3>
                  <div className="bg-slate-900 rounded-xl p-6">
                    <pre className="text-green-400 font-mono text-sm">
{`await client.crm.contacts.update('cnt_123', {
  tags: ['customer', 'vip'],
  customFields: {
    industry: 'Technology',
    revenue: 5000000
  }
});`}
                    </pre>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-3">Create Deal</h3>
                  <div className="bg-slate-900 rounded-xl p-6">
                    <pre className="text-green-400 font-mono text-sm">
{`const deal = await client.crm.deals.create({
  title: 'Enterprise License',
  value: 50000,
  contactId: 'cnt_123',
  stage: 'proposal',
  expectedCloseDate: '2026-03-31'
});`}
                    </pre>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
              <h2 className="text-3xl font-bold mb-6">Python SDK</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold mb-3">Installation</h3>
                  <div className="bg-slate-900 rounded-xl p-6">
                    <pre className="text-green-400 font-mono text-sm">
{`pip install cognexiaai`}
                    </pre>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-3">Usage</h3>
                  <div className="bg-slate-900 rounded-xl p-6">
                    <pre className="text-green-400 font-mono text-sm">
{`from cognexiaai import CognexiaClient

client = CognexiaClient(api_key='your_api_key')

# Create contact
contact = client.crm.contacts.create(
    first_name='Jane',
    last_name='Doe',
    email='jane@example.com'
)

# List contacts with filters
contacts = client.crm.contacts.list(
    tags=['enterprise'],
    limit=50
)

for contact in contacts:
    print(contact.email)`}
                    </pre>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
              <h2 className="text-3xl font-bold mb-6">Error Handling</h2>
              
              <div className="bg-slate-900 rounded-xl p-6">
                <pre className="text-green-400 font-mono text-sm">
{`import { CognexiaError } from '@cognexiaai/sdk';

try {
  await client.crm.contacts.create({
    email: 'invalid-email'
  });
} catch (error) {
  if (error instanceof CognexiaError) {
    console.error('Status:', error.status);
    console.error('Code:', error.code);
    console.error('Message:', error.message);
  }
}`}
                </pre>
              </div>
            </section>

            <section className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl p-8 text-white">
              <h2 className="text-3xl font-bold mb-6">Next Steps</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <Link href="/docs/developer/cli" className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all">
                  <h3 className="font-bold mb-2">CLI Tools →</h3>
                  <p className="text-sm text-yellow-100 m-0">Command line interface</p>
                </Link>
                <Link href="/docs/developer/webhooks" className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all">
                  <h3 className="font-bold mb-2">Webhooks →</h3>
                  <p className="text-sm text-yellow-100 m-0">Event notifications</p>
                </Link>
                <Link href="/docs/api/rest" className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all">
                  <h3 className="font-bold mb-2">REST API →</h3>
                  <p className="text-sm text-yellow-100 m-0">Full API reference</p>
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
