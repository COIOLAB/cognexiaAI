'use client';

import Link from 'next/link';
import { ArrowLeft, Users, Mail, DollarSign, BarChart3 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function CRMUserGuidePage() {
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
              Documentation / User Guides / CRM User Guide
            </div>
          </div>

          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">CRM User Guide</h1>
            <p className="text-xl text-muted-foreground">
              Complete guide to managing customer relationships effectively
            </p>
          </div>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            
            <section className="bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl p-8 text-white mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Users className="h-8 w-8" />
                <h2 className="text-3xl font-bold m-0">CRM Overview</h2>
              </div>
              <p className="text-lg text-blue-100 m-0">
                Centralize customer data, track interactions, and accelerate deal closures with CognexiaAI CRM
              </p>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
              <h2 className="text-3xl font-bold mb-6">Getting Started with CRM</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold mb-3">1. Access the CRM Module</h3>
                  <p className="mb-3">Navigate to <strong>CRM</strong> from the main dashboard menu. You'll see:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Contacts - All customer and lead information</li>
                    <li>Companies - Organization management</li>
                    <li>Deals - Sales pipeline tracking</li>
                    <li>Activities - Tasks, calls, meetings</li>
                    <li>Reports - Performance analytics</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-2xl font-bold mb-3">2. Set Up Your Sales Pipeline</h3>
                  <p>Go to <strong>Settings → CRM → Pipeline Configuration</strong></p>
                  <div className="bg-slate-900 rounded-xl p-6 mt-3">
                    <p className="text-slate-300 text-sm mb-2">Default Pipeline Stages:</p>
                    <pre className="text-green-400 font-mono text-sm">
{`Lead → Qualified → Proposal → Negotiation → Closed Won/Lost`}
                    </pre>
                  </div>
                  <p className="mt-3">Customize stages to match your sales process.</p>
                </div>
              </div>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
              <h2 className="text-3xl font-bold mb-6">Managing Contacts</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold mb-3">Adding New Contacts</h3>
                  <ol className="list-decimal pl-6 space-y-2">
                    <li>Click <strong>+ New Contact</strong> in the CRM module</li>
                    <li>Fill in required fields: First Name, Last Name, Email</li>
                    <li>Add optional information: Phone, Company, Title, Tags</li>
                    <li>Assign to a team member or keep unassigned</li>
                    <li>Click <strong>Save</strong> to create the contact</li>
                  </ol>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-3">Importing Contacts</h3>
                  <p className="mb-3">Bulk import from CSV or integrate with existing systems:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Navigate to <strong>CRM → Contacts → Import</strong></li>
                    <li>Download CSV template or use your own</li>
                    <li>Map columns to CRM fields</li>
                    <li>Review and confirm import</li>
                  </ul>
                  
                  <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 mt-4">
                    <p className="text-sm m-0">
                      <strong>Tip:</strong> Supports up to 10,000 contacts per import. For larger imports, use the API.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-3">Contact Segmentation</h3>
                  <p className="mb-3">Use tags and custom fields to segment contacts:</p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-4">
                      <p className="font-bold mb-2">By Tags</p>
                      <code className="text-sm">lead, customer, vip, churned</code>
                    </div>
                    <div className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-4">
                      <p className="font-bold mb-2">By Industry</p>
                      <code className="text-sm">tech, healthcare, finance</code>
                    </div>
                    <div className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-4">
                      <p className="font-bold mb-2">By Region</p>
                      <code className="text-sm">north-america, europe, asia</code>
                    </div>
                    <div className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-4">
                      <p className="font-bold mb-2">By Value</p>
                      <code className="text-sm">high-value, mid-tier, small</code>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
              <h2 className="text-3xl font-bold mb-6">Deal Management</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold mb-3">Creating Deals</h3>
                  <ol className="list-decimal pl-6 space-y-2">
                    <li>Click <strong>+ New Deal</strong> in the Deals section</li>
                    <li>Enter deal name and estimated value</li>
                    <li>Associate with a contact and company</li>
                    <li>Set expected close date</li>
                    <li>Select pipeline stage</li>
                    <li>Assign deal owner</li>
                  </ol>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-3">Moving Deals Through Pipeline</h3>
                  <p className="mb-3">Track deal progress with Kanban board view:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Drag and drop deals between stages</li>
                    <li>Update deal value and probability</li>
                    <li>Add notes and activities</li>
                    <li>Set reminders for follow-ups</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-3">Deal Insights</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4">
                      <DollarSign className="h-6 w-6 text-green-600 mb-2" />
                      <p className="font-bold">Total Pipeline Value</p>
                      <p className="text-2xl font-bold text-green-600">$2.4M</p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-4">
                      <BarChart3 className="h-6 w-6 text-blue-600 mb-2" />
                      <p className="font-bold">Win Rate</p>
                      <p className="text-2xl font-bold text-blue-600">42%</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-4">
                      <Users className="h-6 w-6 text-purple-600 mb-2" />
                      <p className="font-bold">Avg. Deal Size</p>
                      <p className="text-2xl font-bold text-purple-600">$48K</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
              <h2 className="text-3xl font-bold mb-6">Email Integration</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold mb-3">Connect Your Email</h3>
                  <p className="mb-3">Sync emails automatically with CRM contacts:</p>
                  <ol className="list-decimal pl-6 space-y-2">
                    <li>Go to <strong>Settings → Integrations → Email</strong></li>
                    <li>Choose provider (Gmail, Outlook, Office 365)</li>
                    <li>Authorize access</li>
                    <li>Configure sync settings</li>
                  </ol>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-3">Email Tracking</h3>
                  <div className="flex gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                    <Mail className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-bold mb-1">Track Opens and Clicks</p>
                      <p className="text-sm text-muted-foreground m-0">Get real-time notifications when contacts open emails or click links</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-3">Email Templates</h3>
                  <p className="mb-3">Create reusable templates for common scenarios:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Welcome emails for new leads</li>
                    <li>Follow-up sequences</li>
                    <li>Meeting confirmations</li>
                    <li>Proposal submissions</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
              <h2 className="text-3xl font-bold mb-6">Reports & Analytics</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl">
                  <div>
                    <p className="font-bold">Sales Performance</p>
                    <p className="text-sm text-muted-foreground">Individual and team metrics</p>
                  </div>
                  <Link href="/docs/guides/analytics" className="text-blue-600 hover:text-blue-700 font-semibold">View →</Link>
                </div>
                
                <div className="flex items-center justify-between p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl">
                  <div>
                    <p className="font-bold">Pipeline Analysis</p>
                    <p className="text-sm text-muted-foreground">Conversion rates by stage</p>
                  </div>
                  <Link href="/docs/guides/analytics" className="text-blue-600 hover:text-blue-700 font-semibold">View →</Link>
                </div>
                
                <div className="flex items-center justify-between p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl">
                  <div>
                    <p className="font-bold">Revenue Forecasting</p>
                    <p className="text-sm text-muted-foreground">Predicted closures and revenue</p>
                  </div>
                  <Link href="/docs/guides/analytics" className="text-blue-600 hover:text-blue-700 font-semibold">View →</Link>
                </div>
                
                <div className="flex items-center justify-between p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl">
                  <div>
                    <p className="font-bold">Activity Reports</p>
                    <p className="text-sm text-muted-foreground">Calls, emails, meetings logged</p>
                  </div>
                  <Link href="/docs/guides/analytics" className="text-blue-600 hover:text-blue-700 font-semibold">View →</Link>
                </div>
              </div>
            </section>

            <section className="bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl p-8 text-white">
              <h2 className="text-3xl font-bold mb-6">Next Steps</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <Link href="/docs/guides/hr" className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all">
                  <h3 className="font-bold mb-2">HR Management →</h3>
                  <p className="text-sm text-blue-100 m-0">Employee management</p>
                </Link>
                <Link href="/docs/api/rest" className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all">
                  <h3 className="font-bold mb-2">CRM API →</h3>
                  <p className="text-sm text-blue-100 m-0">Integrate with CRM</p>
                </Link>
                <Link href="/docs/integrations/salesforce" className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all">
                  <h3 className="font-bold mb-2">Salesforce Sync →</h3>
                  <p className="text-sm text-blue-100 m-0">Two-way integration</p>
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
