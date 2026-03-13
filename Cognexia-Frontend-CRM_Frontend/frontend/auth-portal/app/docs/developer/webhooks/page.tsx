'use client';

import Link from 'next/link';
import { ArrowLeft, Webhook, Zap } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function WebhooksPage() {
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
              Documentation / Developer Tools / Webhooks & Events
            </div>
          </div>

          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Webhooks & Events</h1>
            <p className="text-xl text-muted-foreground">
              Real-time event notifications for your applications
            </p>
          </div>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            
            <section className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl p-8 text-white mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Webhook className="h-8 w-8" />
                <h2 className="text-3xl font-bold m-0">Webhooks Overview</h2>
              </div>
              <p className="text-lg text-purple-100 m-0">
                Subscribe to events and receive HTTP POST notifications in real-time
              </p>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
              <h2 className="text-3xl font-bold mb-6">Creating Webhooks</h2>
              
              <div className="space-y-4">
                <ol className="list-decimal pl-6 space-y-2">
                  <li>Navigate to <strong>Settings → Developers → Webhooks</strong></li>
                  <li>Click <strong>+ Create Webhook</strong></li>
                  <li>Enter your endpoint URL</li>
                  <li>Select events to subscribe to</li>
                  <li>Save and receive a webhook secret</li>
                </ol>

                <div className="bg-slate-900 rounded-xl p-6 mt-4">
                  <p className="text-slate-300 text-sm mb-2">Example POST request:</p>
                  <pre className="text-green-400 font-mono text-sm">
{`POST https://api.cognexiaai.com/v1/webhooks
Authorization: Bearer YOUR_API_KEY

{
  "url": "https://yourapp.com/webhook",
  "events": ["contact.created", "deal.closed"],
  "description": "Production webhook"
}`}
                  </pre>
                </div>
              </div>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
              <h2 className="text-3xl font-bold mb-6">Available Events</h2>
              
              <div className="grid md:grid-cols-2 gap-3">
                <div className="border-2 border-blue-200 dark:border-blue-800 rounded-xl p-4 bg-blue-50 dark:bg-blue-900/20">
                  <p className="font-bold mb-2">CRM Events</p>
                  <ul className="text-sm space-y-1">
                    <li>contact.created</li>
                    <li>contact.updated</li>
                    <li>deal.created</li>
                    <li>deal.stage_changed</li>
                    <li>deal.closed</li>
                  </ul>
                </div>

                <div className="border-2 border-green-200 dark:border-green-800 rounded-xl p-4 bg-green-50 dark:bg-green-900/20">
                  <p className="font-bold mb-2">Finance Events</p>
                  <ul className="text-sm space-y-1">
                    <li>invoice.created</li>
                    <li>invoice.paid</li>
                    <li>payment.received</li>
                    <li>expense.submitted</li>
                  </ul>
                </div>

                <div className="border-2 border-purple-200 dark:border-purple-800 rounded-xl p-4 bg-purple-50 dark:bg-purple-900/20">
                  <p className="font-bold mb-2">HR Events</p>
                  <ul className="text-sm space-y-1">
                    <li>employee.created</li>
                    <li>attendance.logged</li>
                    <li>leave.requested</li>
                    <li>payroll.processed</li>
                  </ul>
                </div>

                <div className="border-2 border-orange-200 dark:border-orange-800 rounded-xl p-4 bg-orange-50 dark:bg-orange-900/20">
                  <p className="font-bold mb-2">System Events</p>
                  <ul className="text-sm space-y-1">
                    <li>user.logged_in</li>
                    <li>api_key.created</li>
                    <li>export.completed</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
              <h2 className="text-3xl font-bold mb-6">Webhook Payload</h2>
              
              <div className="bg-slate-900 rounded-xl p-6">
                <pre className="text-green-400 font-mono text-sm">
{`{
  "id": "evt_123456",
  "type": "contact.created",
  "created": 1706543400,
  "data": {
    "object": {
      "id": "cnt_789",
      "firstName": "Jane",
      "lastName": "Doe",
      "email": "jane@example.com",
      "company": "Acme Corp",
      "createdAt": "2026-01-29T15:30:00Z"
    }
  }
}`}
                </pre>
              </div>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
              <h2 className="text-3xl font-bold mb-6">Verifying Webhooks</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold mb-3">Node.js Example</h3>
                  <div className="bg-slate-900 rounded-xl p-6">
                    <pre className="text-green-400 font-mono text-sm">
{`const crypto = require('crypto');

app.post('/webhook', (req, res) => {
  const signature = req.headers['x-cognexia-signature'];
  const secret = process.env.WEBHOOK_SECRET;
  
  const hmac = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(req.body))
    .digest('hex');
  
  if (signature === hmac) {
    // Process event
    const event = req.body;
    console.log('Event:', event.type);
    res.sendStatus(200);
  } else {
    res.sendStatus(401);
  }
});`}
                    </pre>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-3">Python Example</h3>
                  <div className="bg-slate-900 rounded-xl p-6">
                    <pre className="text-green-400 font-mono text-sm">
{`import hmac
import hashlib

@app.route('/webhook', methods=['POST'])
def webhook():
    signature = request.headers.get('X-Cognexia-Signature')
    secret = os.environ.get('WEBHOOK_SECRET')
    
    computed = hmac.new(
        secret.encode(),
        request.data,
        hashlib.sha256
    ).hexdigest()
    
    if signature == computed:
        event = request.json
        print(f"Event: {event['type']}")
        return '', 200
    return '', 401`}
                    </pre>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
              <h2 className="text-3xl font-bold mb-6">Best Practices</h2>
              
              <div className="space-y-4">
                <div className="flex gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <Zap className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-bold mb-1">Respond Quickly</p>
                    <p className="text-sm text-muted-foreground m-0">Return 200 status within 5 seconds. Process asynchronously.</p>
                  </div>
                </div>
                
                <div className="flex gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <Zap className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-bold mb-1">Handle Retries</p>
                    <p className="text-sm text-muted-foreground m-0">Events retry up to 3 times with exponential backoff</p>
                  </div>
                </div>
                
                <div className="flex gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <Zap className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-bold mb-1">Idempotency</p>
                    <p className="text-sm text-muted-foreground m-0">Use event ID to prevent duplicate processing</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl p-8 text-white">
              <h2 className="text-3xl font-bold mb-6">Next Steps</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <Link href="/docs/api/authentication" className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all">
                  <h3 className="font-bold mb-2">Security →</h3>
                  <p className="text-sm text-purple-100 m-0">Webhook signatures</p>
                </Link>
                <Link href="/docs/developer/cli" className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all">
                  <h3 className="font-bold mb-2">CLI Tools →</h3>
                  <p className="text-sm text-purple-100 m-0">Manage webhooks</p>
                </Link>
                <Link href="/docs/developer/sdks" className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all">
                  <h3 className="font-bold mb-2">SDKs →</h3>
                  <p className="text-sm text-purple-100 m-0">Client libraries</p>
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
