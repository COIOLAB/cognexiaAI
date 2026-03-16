'use client';

import Link from 'next/link';
import { ArrowLeft, Cloud, RefreshCw } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function SalesforceIntegrationPage() {
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
              Documentation / Integrations / Salesforce
            </div>
          </div>

          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Salesforce Integration</h1>
            <p className="text-xl text-muted-foreground">
              Bi-directional sync between CognexiaAI and Salesforce CRM
            </p>
          </div>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            
            <section className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl p-8 text-white mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Cloud className="h-8 w-8" />
                <h2 className="text-3xl font-bold m-0">Integration Overview</h2>
              </div>
              <p className="text-lg text-blue-100 m-0">
                Seamlessly sync contacts, accounts, opportunities, and activities between platforms
              </p>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
              <h2 className="text-3xl font-bold mb-6">Setup Guide</h2>
              
              <ol className="list-decimal pl-6 space-y-4">
                <li>
                  <strong>Connect Salesforce Account</strong>
                  <p>Navigate to Settings → Integrations → Salesforce → Connect</p>
                </li>
                <li>
                  <strong>Authorize Access</strong>
                  <p>Grant permissions for Contacts, Accounts, Opportunities, Tasks, Events</p>
                </li>
                <li>
                  <strong>Configure Sync Settings</strong>
                  <p>Choose sync direction: One-way or Bi-directional</p>
                </li>
                <li>
                  <strong>Field Mapping</strong>
                  <p>Map CognexiaAI fields to Salesforce fields</p>
                </li>
                <li>
                  <strong>Initial Sync</strong>
                  <p>Import existing data from Salesforce (optional)</p>
                </li>
              </ol>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
              <h2 className="text-3xl font-bold mb-6">Sync Options</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="border-2 border-blue-200 dark:border-blue-800 rounded-xl p-6 bg-blue-50 dark:bg-blue-900/20">
                  <RefreshCw className="h-6 w-6 text-blue-600 mb-3" />
                  <h3 className="text-xl font-bold mb-2">Real-time Sync</h3>
                  <p className="text-sm text-muted-foreground">Changes propagate instantly using webhooks</p>
                </div>
                
                <div className="border-2 border-green-200 dark:border-green-800 rounded-xl p-6 bg-green-50 dark:bg-green-900/20">
                  <RefreshCw className="h-6 w-6 text-green-600 mb-3" />
                  <h3 className="text-xl font-bold mb-2">Scheduled Sync</h3>
                  <p className="text-sm text-muted-foreground">Batch updates every 15 minutes, hourly, or daily</p>
                </div>
              </div>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
              <h2 className="text-3xl font-bold mb-6">Supported Objects</h2>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl">
                  <span className="font-bold">Contacts ↔ Leads/Contacts</span>
                  <span className="text-sm text-green-600">✓ Synced</span>
                </div>
                <div className="flex items-center justify-between p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl">
                  <span className="font-bold">Deals ↔ Opportunities</span>
                  <span className="text-sm text-green-600">✓ Synced</span>
                </div>
                <div className="flex items-center justify-between p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl">
                  <span className="font-bold">Companies ↔ Accounts</span>
                  <span className="text-sm text-green-600">✓ Synced</span>
                </div>
                <div className="flex items-center justify-between p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl">
                  <span className="font-bold">Activities ↔ Tasks/Events</span>
                  <span className="text-sm text-green-600">✓ Synced</span>
                </div>
              </div>
            </section>

            <section className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl p-8 text-white">
              <h2 className="text-3xl font-bold mb-6">Next Steps</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <Link href="/docs/integrations/sap" className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all">
                  <h3 className="font-bold mb-2">SAP Integration →</h3>
                  <p className="text-sm text-blue-100 m-0">Enterprise ERP sync</p>
                </Link>
                <Link href="/docs/integrations/oauth" className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all">
                  <h3 className="font-bold mb-2">OAuth Setup →</h3>
                  <p className="text-sm text-blue-100 m-0">Authentication guide</p>
                </Link>
                <Link href="/docs/api/rest" className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all">
                  <h3 className="font-bold mb-2">API Reference →</h3>
                  <p className="text-sm text-blue-100 m-0">Build custom integrations</p>
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
