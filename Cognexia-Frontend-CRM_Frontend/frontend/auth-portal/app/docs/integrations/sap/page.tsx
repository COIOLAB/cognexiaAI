'use client';

import Link from 'next/link';
import { ArrowLeft, Server } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function SAPIntegrationPage() {
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
              Documentation / Integrations / SAP
            </div>
          </div>

          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">SAP Integration</h1>
            <p className="text-xl text-muted-foreground">
              Connect with SAP ERP, S/4HANA, and Business One
            </p>
          </div>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            
            <section className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-8 text-white mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Server className="h-8 w-8" />
                <h2 className="text-3xl font-bold m-0">Enterprise Integration</h2>
              </div>
              <p className="text-lg text-indigo-100 m-0">
                Synchronize financial data, procurement, and inventory management
              </p>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
              <h2 className="text-3xl font-bold mb-6">Supported SAP Products</h2>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-4">
                  <p className="font-bold">SAP ERP</p>
                  <p className="text-sm text-muted-foreground">Traditional ERP system</p>
                </div>
                <div className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-4">
                  <p className="font-bold">SAP S/4HANA</p>
                  <p className="text-sm text-muted-foreground">Next-gen intelligent ERP</p>
                </div>
                <div className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-4">
                  <p className="font-bold">SAP Business One</p>
                  <p className="text-sm text-muted-foreground">SMB solution</p>
                </div>
              </div>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
              <h2 className="text-3xl font-bold mb-6">Data Sync</h2>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl">
                  <span className="font-bold">General Ledger Accounts</span>
                  <span className="text-sm text-green-600">✓ Synced</span>
                </div>
                <div className="flex items-center justify-between p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl">
                  <span className="font-bold">Invoices & Payments</span>
                  <span className="text-sm text-green-600">✓ Synced</span>
                </div>
                <div className="flex items-center justify-between p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl">
                  <span className="font-bold">Purchase Orders</span>
                  <span className="text-sm text-green-600">✓ Synced</span>
                </div>
                <div className="flex items-center justify-between p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl">
                  <span className="font-bold">Inventory Items</span>
                  <span className="text-sm text-green-600">✓ Synced</span>
                </div>
              </div>
            </section>

            <section className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-8 text-white">
              <h2 className="text-3xl font-bold mb-6">Next Steps</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <Link href="/docs/integrations/custom" className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all">
                  <h3 className="font-bold mb-2">Custom Integrations →</h3>
                  <p className="text-sm text-indigo-100 m-0">Build your own</p>
                </Link>
                <Link href="/docs/api/rest" className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all">
                  <h3 className="font-bold mb-2">API Docs →</h3>
                  <p className="text-sm text-indigo-100 m-0">Full reference</p>
                </Link>
                <Link href="/support" className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all">
                  <h3 className="font-bold mb-2">Get Help →</h3>
                  <p className="text-sm text-indigo-100 m-0">Contact support</p>
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
