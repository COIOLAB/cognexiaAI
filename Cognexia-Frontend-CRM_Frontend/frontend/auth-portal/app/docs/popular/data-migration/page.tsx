'use client';

import Link from 'next/link';
import { ArrowLeft, Database, Upload, CheckCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function DataMigrationPage() {
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
              Documentation / Popular / Data Migration Guide
            </div>
            <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <span className="bg-purple-100 dark:bg-purple-900/30 px-2 py-1 rounded">Setup</span>
              <span>25 min read</span>
            </div>
          </div>

          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Data Migration Guide</h1>
            <p className="text-xl text-muted-foreground">
              Step-by-step guide to migrating your data to CognexiaAI ERP
            </p>
          </div>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            
            <section className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl p-8 text-white mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Database className="h-8 w-8" />
                <h2 className="text-3xl font-bold m-0">Migration Overview</h2>
              </div>
              <p className="text-lg text-purple-100 m-0">
                Seamlessly migrate data from legacy systems with zero downtime
              </p>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
              <h2 className="text-3xl font-bold mb-6">Pre-Migration Checklist</h2>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Data Audit</p>
                    <p className="text-sm text-muted-foreground m-0">Clean and validate existing data</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Backup Creation</p>
                    <p className="text-sm text-muted-foreground m-0">Create full backup of current system</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Field Mapping</p>
                    <p className="text-sm text-muted-foreground m-0">Map source fields to target schema</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Test Environment</p>
                    <p className="text-sm text-muted-foreground m-0">Set up sandbox for testing</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
              <h2 className="text-3xl font-bold mb-6">Migration Methods</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="border-2 border-blue-200 dark:border-blue-800 rounded-xl p-6 bg-blue-50 dark:bg-blue-900/20">
                  <Upload className="h-8 w-8 text-blue-600 mb-3" />
                  <h3 className="text-xl font-bold mb-2">CSV Import</h3>
                  <p className="text-sm text-muted-foreground mb-3">For small to medium datasets (&lt;100K records)</p>
                  <ul className="text-sm space-y-1">
                    <li>• Download CSV template</li>
                    <li>• Map columns to fields</li>
                    <li>• Upload and validate</li>
                  </ul>
                </div>
                
                <div className="border-2 border-purple-200 dark:border-purple-800 rounded-xl p-6 bg-purple-50 dark:bg-purple-900/20">
                  <Database className="h-8 w-8 text-purple-600 mb-3" />
                  <h3 className="text-xl font-bold mb-2">API Migration</h3>
                  <p className="text-sm text-muted-foreground mb-3">For large datasets (100K+ records)</p>
                  <ul className="text-sm space-y-1">
                    <li>• Batch processing support</li>
                    <li>• Rate limit handling</li>
                    <li>• Progress tracking</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
              <h2 className="text-3xl font-bold mb-6">Step-by-Step Process</h2>
              
              <div className="space-y-6">
                <div className="border-l-4 border-blue-500 pl-6">
                  <h3 className="text-xl font-bold mb-2">Step 1: Export Data</h3>
                  <p className="mb-3">Export data from your current system in CSV or JSON format.</p>
                  <div className="bg-slate-900 rounded-xl p-6">
                    <pre className="text-green-400 font-mono text-sm">
{`# Example: Export from SQL database
SELECT * FROM contacts 
INTO OUTFILE 'contacts.csv'
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\\n';`}
                    </pre>
                  </div>
                </div>

                <div className="border-l-4 border-purple-500 pl-6">
                  <h3 className="text-xl font-bold mb-2">Step 2: Transform Data</h3>
                  <p className="mb-3">Map and transform data to match CognexiaAI schema.</p>
                  <div className="bg-slate-900 rounded-xl p-6">
                    <pre className="text-green-400 font-mono text-sm">
{`// Example transformation script
const transformContact = (oldData) => ({
  firstName: oldData.first_name,
  lastName: oldData.last_name,
  email: oldData.email_address,
  company: oldData.company_name,
  phone: oldData.phone_number
});`}
                    </pre>
                  </div>
                </div>

                <div className="border-l-4 border-green-500 pl-6">
                  <h3 className="text-xl font-bold mb-2">Step 3: Import via API</h3>
                  <p className="mb-3">Use bulk import endpoint for efficient data transfer.</p>
                  <div className="bg-slate-900 rounded-xl p-6">
                    <pre className="text-green-400 font-mono text-sm">
{`curl -X POST https://api.cognexiaai.com/v1/bulk/contacts \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d @contacts.json`}
                    </pre>
                  </div>
                </div>

                <div className="border-l-4 border-orange-500 pl-6">
                  <h3 className="text-xl font-bold mb-2">Step 4: Validate & Verify</h3>
                  <p>Run validation checks and verify data integrity.</p>
                </div>
              </div>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
              <h2 className="text-3xl font-bold mb-6">Post-Migration Tasks</h2>
              
              <ol className="list-decimal pl-6 space-y-2">
                <li>Verify record counts match between systems</li>
                <li>Test critical workflows with migrated data</li>
                <li>Set up data sync if running parallel systems</li>
                <li>Train users on new system</li>
                <li>Decommission old system after validation period</li>
              </ol>
            </section>

            <section className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl p-8 text-white">
              <h2 className="text-3xl font-bold mb-6">Next Steps</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <Link href="/docs/api/rest" className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all">
                  <h3 className="font-bold mb-2">Bulk API →</h3>
                  <p className="text-sm text-purple-100 m-0">Import endpoints</p>
                </Link>
                <Link href="/docs/integrations/custom" className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all">
                  <h3 className="font-bold mb-2">Data Sync →</h3>
                  <p className="text-sm text-purple-100 m-0">Real-time integration</p>
                </Link>
                <Link href="/support" className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all">
                  <h3 className="font-bold mb-2">Get Help →</h3>
                  <p className="text-sm text-purple-100 m-0">Migration support</p>
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
