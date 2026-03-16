'use client';

import Link from 'next/link';
import { ArrowLeft, Plug } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function CustomIntegrationsPage() {
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
              Documentation / Integrations / Custom Integrations
            </div>
          </div>

          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Custom Integrations</h1>
            <p className="text-xl text-muted-foreground">
              Build integrations with any third-party service or platform
            </p>
          </div>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            
            <section className="bg-gradient-to-br from-orange-600 to-red-600 rounded-2xl p-8 text-white mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Plug className="h-8 w-8" />
                <h2 className="text-3xl font-bold m-0">Build Custom Integrations</h2>
              </div>
              <p className="text-lg text-orange-100 m-0">
                Use our REST API, GraphQL, webhooks, and SDKs to connect any system
              </p>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
              <h2 className="text-3xl font-bold mb-6">Integration Methods</h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="border-2 border-blue-200 dark:border-blue-800 rounded-xl p-6 bg-blue-50 dark:bg-blue-900/20">
                  <h3 className="text-xl font-bold mb-2">REST API</h3>
                  <p className="text-sm text-muted-foreground">HTTP endpoints for CRUD operations</p>
                  <Link href="/docs/api/rest" className="text-blue-600 text-sm mt-2 inline-block">View Docs →</Link>
                </div>
                
                <div className="border-2 border-purple-200 dark:border-purple-800 rounded-xl p-6 bg-purple-50 dark:bg-purple-900/20">
                  <h3 className="text-xl font-bold mb-2">GraphQL</h3>
                  <p className="text-sm text-muted-foreground">Flexible queries and mutations</p>
                  <Link href="/docs/api/graphql" className="text-purple-600 text-sm mt-2 inline-block">View Docs →</Link>
                </div>
                
                <div className="border-2 border-green-200 dark:border-green-800 rounded-xl p-6 bg-green-50 dark:bg-green-900/20">
                  <h3 className="text-xl font-bold mb-2">Webhooks</h3>
                  <p className="text-sm text-muted-foreground">Real-time event notifications</p>
                  <Link href="/docs/developer/webhooks" className="text-green-600 text-sm mt-2 inline-block">View Docs →</Link>
                </div>
                
                <div className="border-2 border-yellow-200 dark:border-yellow-800 rounded-xl p-6 bg-yellow-50 dark:bg-yellow-900/20">
                  <h3 className="text-xl font-bold mb-2">SDKs</h3>
                  <p className="text-sm text-muted-foreground">JavaScript, Python, Go libraries</p>
                  <Link href="/docs/developer/sdks" className="text-yellow-700 text-sm mt-2 inline-block">View Docs →</Link>
                </div>
              </div>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
              <h2 className="text-3xl font-bold mb-6">Example: Slack Integration</h2>
              
              <div className="bg-slate-900 rounded-xl p-6">
                <pre className="text-green-400 font-mono text-sm">
{`// Post to Slack when deal is closed
const { CognexiaClient } = require('@cognexiaai/sdk');
const { WebClient } = require('@slack/web-api');

const cognexia = new CognexiaClient({ apiKey: process.env.API_KEY });
const slack = new WebClient(process.env.SLACK_TOKEN);

// Listen for webhook
app.post('/webhook', async (req, res) => {
  const event = req.body;
  
  if (event.type === 'deal.closed') {
    const deal = event.data.object;
    
    await slack.chat.postMessage({
      channel: '#sales',
      text: \`🎉 Deal closed: \${deal.title} - $\${deal.value}\`
    });
  }
  
  res.sendStatus(200);
});`}
                </pre>
              </div>
            </section>

            <section className="bg-gradient-to-br from-orange-600 to-red-600 rounded-2xl p-8 text-white">
              <h2 className="text-3xl font-bold mb-6">Next Steps</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <Link href="/docs/api/rest" className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all">
                  <h3 className="font-bold mb-2">API Reference →</h3>
                  <p className="text-sm text-orange-100 m-0">Full API docs</p>
                </Link>
                <Link href="/docs/developer/webhooks" className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all">
                  <h3 className="font-bold mb-2">Webhooks →</h3>
                  <p className="text-sm text-orange-100 m-0">Event subscriptions</p>
                </Link>
                <Link href="/docs/developer/sdks" className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all">
                  <h3 className="font-bold mb-2">SDKs →</h3>
                  <p className="text-sm text-orange-100 m-0">Client libraries</p>
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
