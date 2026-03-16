'use client';

import Link from 'next/link';
import { ArrowLeft, DollarSign, FileText, CreditCard, TrendingUp } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function FinanceGuidePage() {
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
              Documentation / User Guides / Finance Module Guide
            </div>
          </div>

          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Finance Module Guide</h1>
            <p className="text-xl text-muted-foreground">
              Complete financial management and accounting system
            </p>
          </div>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            
            <section className="bg-gradient-to-br from-green-600 to-emerald-500 rounded-2xl p-8 text-white mb-8">
              <div className="flex items-center gap-3 mb-4">
                <DollarSign className="h-8 w-8" />
                <h2 className="text-3xl font-bold m-0">Finance Overview</h2>
              </div>
              <p className="text-lg text-green-100 m-0">
                Manage accounts, invoicing, expenses, and financial reporting with CMMI Level 5 compliance
              </p>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
              <h2 className="text-3xl font-bold mb-6">Chart of Accounts</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold mb-3">Account Structure</h3>
                  <div className="bg-slate-900 rounded-xl p-6">
                    <pre className="text-green-400 font-mono text-sm">
{`1000-1999: Assets
  1100: Current Assets
  1200: Fixed Assets
  1300: Investments

2000-2999: Liabilities
  2100: Current Liabilities
  2200: Long-term Liabilities

3000-3999: Equity
  3100: Share Capital
  3200: Retained Earnings

4000-4999: Revenue
  4100: Sales Revenue
  4200: Service Revenue

5000-5999: Expenses
  5100: Cost of Goods Sold
  5200: Operating Expenses`}
                    </pre>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-3">Creating Accounts</h3>
                  <ol className="list-decimal pl-6 space-y-2">
                    <li>Navigate to <strong>Finance → Chart of Accounts</strong></li>
                    <li>Click <strong>+ Add Account</strong></li>
                    <li>Select account type (Asset, Liability, Equity, Revenue, Expense)</li>
                    <li>Assign account code and name</li>
                    <li>Set tax treatment and reporting category</li>
                  </ol>
                </div>
              </div>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
              <h2 className="text-3xl font-bold mb-6">Invoicing & Billing</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold mb-3">Creating Invoices</h3>
                  <ol className="list-decimal pl-6 space-y-2">
                    <li>Go to <strong>Finance → Invoices → Create</strong></li>
                    <li>Select customer from CRM</li>
                    <li>Add line items (products/services)</li>
                    <li>Apply discounts and taxes</li>
                    <li>Set payment terms and due date</li>
                    <li>Preview and send via email</li>
                  </ol>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-3">Recurring Invoices</h3>
                  <div className="flex gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                    <FileText className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-bold mb-1">Automated Billing</p>
                      <p className="text-sm text-muted-foreground m-0">Set up monthly/quarterly/annual invoices that generate automatically</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-3">Payment Collection</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-4">
                      <CreditCard className="h-6 w-6 text-blue-600 mb-2" />
                      <p className="font-bold mb-1">Online Payments</p>
                      <p className="text-sm text-muted-foreground">Stripe, PayPal, Square</p>
                    </div>
                    <div className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-4">
                      <DollarSign className="h-6 w-6 text-green-600 mb-2" />
                      <p className="font-bold mb-1">Bank Transfer</p>
                      <p className="text-sm text-muted-foreground">ACH, Wire, SEPA</p>
                    </div>
                    <div className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-4">
                      <FileText className="h-6 w-6 text-purple-600 mb-2" />
                      <p className="font-bold mb-1">Check/Cash</p>
                      <p className="text-sm text-muted-foreground">Manual recording</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
              <h2 className="text-3xl font-bold mb-6">Expense Management</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold mb-3">Recording Expenses</h3>
                  <ol className="list-decimal pl-6 space-y-2">
                    <li>Navigate to <strong>Finance → Expenses → New</strong></li>
                    <li>Upload receipt (photo or PDF)</li>
                    <li>Enter amount, date, and category</li>
                    <li>Select vendor and payment method</li>
                    <li>Add notes and tags</li>
                    <li>Submit for approval</li>
                  </ol>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-3">Expense Categories</h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="flex items-center justify-between p-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl">
                      <span className="font-semibold">Travel & Transportation</span>
                      <span className="text-sm text-muted-foreground">5100</span>
                    </div>
                    <div className="flex items-center justify-between p-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl">
                      <span className="font-semibold">Office Supplies</span>
                      <span className="text-sm text-muted-foreground">5200</span>
                    </div>
                    <div className="flex items-center justify-between p-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl">
                      <span className="font-semibold">Marketing & Advertising</span>
                      <span className="text-sm text-muted-foreground">5300</span>
                    </div>
                    <div className="flex items-center justify-between p-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl">
                      <span className="font-semibold">Professional Services</span>
                      <span className="text-sm text-muted-foreground">5400</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-3">Approval Workflow</h3>
                  <div className="bg-slate-900 rounded-xl p-6">
                    <p className="text-slate-300 text-sm mb-2">Multi-level Approval:</p>
                    <pre className="text-green-400 font-mono text-sm">
{`$0 - $500     → Auto-approved
$500 - $5,000 → Manager approval
$5,000+       → CFO approval`}
                    </pre>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
              <h2 className="text-3xl font-bold mb-6">Financial Reports</h2>
              
              <div className="space-y-4">
                <div className="flex gap-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                  <TrendingUp className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-bold mb-1">Balance Sheet</p>
                    <p className="text-sm text-muted-foreground m-0">Assets, liabilities, and equity snapshot</p>
                  </div>
                </div>
                
                <div className="flex gap-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                  <DollarSign className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-bold mb-1">Profit & Loss (P&L)</p>
                    <p className="text-sm text-muted-foreground m-0">Revenue and expenses over time</p>
                  </div>
                </div>
                
                <div className="flex gap-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                  <FileText className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-bold mb-1">Cash Flow Statement</p>
                    <p className="text-sm text-muted-foreground m-0">Operating, investing, financing activities</p>
                  </div>
                </div>
                
                <div className="flex gap-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                  <TrendingUp className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-bold mb-1">Trial Balance</p>
                    <p className="text-sm text-muted-foreground m-0">Verify debit and credit balances</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
              <h2 className="text-3xl font-bold mb-6">Bank Reconciliation</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold mb-3">Connecting Bank Accounts</h3>
                  <ol className="list-decimal pl-6 space-y-2">
                    <li>Go to <strong>Finance → Banking → Connect Account</strong></li>
                    <li>Select your bank from 12,000+ institutions</li>
                    <li>Authorize secure connection via Plaid/Yodlee</li>
                    <li>Transactions sync automatically</li>
                  </ol>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-3">Reconciliation Process</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Review imported transactions</li>
                    <li>Match with recorded entries</li>
                    <li>Categorize unmatched transactions</li>
                    <li>Mark as reconciled</li>
                    <li>Generate reconciliation report</li>
                  </ul>

                  <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 mt-4">
                    <p className="text-sm m-0">
                      <strong>AI Matching:</strong> 95% of transactions auto-matched using machine learning
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
              <h2 className="text-3xl font-bold mb-6">Tax Management</h2>
              
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-4">
                    <p className="font-bold mb-2">Sales Tax (VAT/GST)</p>
                    <p className="text-sm text-muted-foreground">Automatic calculation on invoices</p>
                  </div>
                  <div className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-4">
                    <p className="font-bold mb-2">Tax Reports</p>
                    <p className="text-sm text-muted-foreground">Ready for filing with authorities</p>
                  </div>
                  <div className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-4">
                    <p className="font-bold mb-2">1099 Forms (US)</p>
                    <p className="text-sm text-muted-foreground">Contractor payment tracking</p>
                  </div>
                  <div className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-4">
                    <p className="font-bold mb-2">Multi-currency</p>
                    <p className="text-sm text-muted-foreground">150+ currencies supported</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-gradient-to-br from-green-600 to-emerald-500 rounded-2xl p-8 text-white">
              <h2 className="text-3xl font-bold mb-6">Next Steps</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <Link href="/docs/guides/analytics" className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all">
                  <h3 className="font-bold mb-2">Financial Analytics →</h3>
                  <p className="text-sm text-green-100 m-0">Deep insights</p>
                </Link>
                <Link href="/docs/api/rest" className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all">
                  <h3 className="font-bold mb-2">Finance API →</h3>
                  <p className="text-sm text-green-100 m-0">Integrate accounting</p>
                </Link>
                <Link href="/docs/integrations/sap" className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all">
                  <h3 className="font-bold mb-2">SAP Integration →</h3>
                  <p className="text-sm text-green-100 m-0">Enterprise ERP sync</p>
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
