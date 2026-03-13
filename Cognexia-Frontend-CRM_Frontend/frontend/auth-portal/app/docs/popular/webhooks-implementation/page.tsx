'use client';

import Link from 'next/link';
import { ArrowLeft, Webhook, Code, Zap } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function WebhooksImplementationPage() {
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
              Documentation / Popular / Webhooks Implementation
            </div>
            <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <span className="bg-indigo-100 dark:bg-indigo-900/30 px-2 py-1 rounded">Integration</span>
              <span>12 min read</span>
            </div>
          </div>

          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Webhooks Implementation</h1>
            <p className="text-xl text-muted-foreground">
              Complete guide to implementing webhooks for real-time event notifications
            </p>
          </div>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            
            <section className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-8 text-white mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Webhook className="h-8 w-8" />
                <h2 className="text-3xl font-bold m-0">Webhooks Overview</h2>
              </div>
              <p className="text-lg text-indigo-100 m-0">
                Receive real-time HTTP notifications when events occur in your CognexiaAI account
              </p>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
              <h2 className="text-3xl font-bold mb-6">Quick Start</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold mb-3">1. Create Webhook Endpoint</h3>
                  <div className="bg-slate-900 rounded-xl p-6">
                    <pre className="text-green-400 font-mono text-sm">
{`// Express.js example
app.post('/webhook', express.json(), (req, res) => {
  const event = req.body;
  
  console.log('Event received:', event.type);
  console.log('Event data:', event.data);
  
  // Process the event
  processEvent(event);
  
  // Respond quickly (within 5 seconds)
  res.status(200).send('OK');
});`}
                    </pre>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-3">2. Register Webhook</h3>
                  <div className="bg-slate-900 rounded-xl p-6">
                    <pre className="text-green-400 font-mono text-sm">
{`curl -X POST https://api.cognexiaai.com/v1/webhooks \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "url": "https://yourapp.com/webhook",
    "events": ["contact.created", "deal.closed"],
    "description": "Production webhook"
  }'`}
                    </pre>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-3">3. Verify Signatures</h3>
                  <div className="bg-slate-900 rounded-xl p-6">
                    <pre className="text-green-400 font-mono text-sm">
{`const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, secret) {
  const hmac = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(hmac)
  );
}`}
                    </pre>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
              <h2 className="text-3xl font-bold mb-6">Event Types</h2>
              
              <div className="space-y-4">
                <div className="p-4 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20">
                  <p className="font-bold">CRM Events</p>
                  <code className="text-sm">contact.created, contact.updated, deal.created, deal.closed</code>
                </div>
                
                <div className="p-4 border-l-4 border-green-500 bg-green-50 dark:bg-green-900/20">
                  <p className="font-bold">Finance Events</p>
                  <code className="text-sm">invoice.created, invoice.paid, payment.received</code>
                </div>
                
                <div className="p-4 border-l-4 border-purple-500 bg-purple-50 dark:bg-purple-900/20">
                  <p className="font-bold">HR Events</p>
                  <code className="text-sm">employee.created, attendance.logged, payroll.processed</code>
                </div>
              </div>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
              <h2 className="text-3xl font-bold mb-6">Complete Implementation Example</h2>
              
              <div className="bg-slate-900 rounded-xl p-6">
                <pre className="text-green-400 font-mono text-sm">
{`const express = require('express');
const crypto = require('crypto');
const app = express();

// Webhook endpoint
app.post('/webhook', 
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const signature = req.headers['x-cognexia-signature'];
    const secret = process.env.WEBHOOK_SECRET;
    
    // Verify signature
    const isValid = verifySignature(
      req.body, 
      signature, 
      secret
    );
    
    if (!isValid) {
      return res.status(401).send('Invalid signature');
    }
    
    const event = JSON.parse(req.body);
    
    // Process event asynchronously
    processEventAsync(event).catch(console.error);
    
    // Respond immediately
    res.status(200).send('OK');
  }
);

async function processEventAsync(event) {
  switch (event.type) {
    case 'contact.created':
      await handleContactCreated(event.data);
      break;
    case 'deal.closed':
      await handleDealClosed(event.data);
      break;
    default:
      console.log('Unhandled event:', event.type);
  }
}

app.listen(3000);`}
                </pre>
              </div>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
              <h2 className="text-3xl font-bold mb-6">Best Practices</h2>
              
              <div className="space-y-4">
                <div className="flex gap-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                  <Zap className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-bold mb-1">Respond Quickly</p>
                    <p className="text-sm text-muted-foreground m-0">Return 200 within 5 seconds, process asynchronously</p>
                  </div>
                </div>
                
                <div className="flex gap-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                  <Code className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-bold mb-1">Idempotency</p>
                    <p className="text-sm text-muted-foreground m-0">Use event ID to prevent duplicate processing</p>
                  </div>
                </div>
                
                <div className="flex gap-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                  <Webhook className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-bold mb-1">Retry Logic</p>
                    <p className="text-sm text-muted-foreground m-0">We retry up to 3 times with exponential backoff</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
              <h2 className="text-3xl font-bold mb-6">Testing Webhooks</h2>
              
              <ol className="list-decimal pl-6 space-y-3">
                <li>Use ngrok or similar to expose local endpoint</li>
                <li>Register test webhook URL in sandbox environment</li>
                <li>Trigger test events from dashboard</li>
                <li>Verify payload structure and signature validation</li>
                <li>Test error handling and retry logic</li>
              </ol>
              
              <div className="bg-slate-900 rounded-xl p-6 mt-4">
                <pre className="text-green-400 font-mono text-sm">
{`# Expose local server with ngrok
ngrok http 3000

# Register webhook with ngrok URL
curl -X POST https://api.cognexiaai.com/v1/webhooks \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{"url": "https://abc123.ngrok.io/webhook"}'`}
                </pre>
              </div>
            </section>

            <section className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-8 text-white">
              <h2 className="text-3xl font-bold mb-6">Next Steps</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <Link href="/docs/developer/webhooks" className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all">
                  <h3 className="font-bold mb-2">Full Documentation →</h3>
                  <p className="text-sm text-indigo-100 m-0">Complete webhook guide</p>
                </Link>
                <Link href="/docs/api/authentication" className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all">
                  <h3 className="font-bold mb-2">Verify Signatures →</h3>
                  <p className="text-sm text-indigo-100 m-0">Security guide</p>
                </Link>
                <Link href="/docs/developer/cli" className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all">
                  <h3 className="font-bold mb-2">CLI Tools →</h3>
                  <p className="text-sm text-indigo-100 m-0">Manage webhooks</p>
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
