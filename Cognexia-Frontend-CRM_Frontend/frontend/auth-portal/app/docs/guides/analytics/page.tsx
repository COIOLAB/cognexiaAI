'use client';

import Link from 'next/link';
import { ArrowLeft, BarChart3, PieChart, LineChart, Filter } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function AnalyticsGuidePage() {
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
              Documentation / User Guides / Analytics Dashboard
            </div>
          </div>

          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Analytics Dashboard</h1>
            <p className="text-xl text-muted-foreground">
              Data-driven insights and visual analytics for informed decision-making
            </p>
          </div>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            
            <section className="bg-gradient-to-br from-indigo-600 to-purple-500 rounded-2xl p-8 text-white mb-8">
              <div className="flex items-center gap-3 mb-4">
                <BarChart3 className="h-8 w-8" />
                <h2 className="text-3xl font-bold m-0">Analytics Overview</h2>
              </div>
              <p className="text-lg text-indigo-100 m-0">
                Real-time dashboards, custom reports, and AI-powered insights across all modules
              </p>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
              <h2 className="text-3xl font-bold mb-6">Dashboard Overview</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold mb-3">Pre-built Dashboards</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="border-2 border-blue-200 dark:border-blue-800 rounded-xl p-4 bg-blue-50 dark:bg-blue-900/20">
                      <BarChart3 className="h-6 w-6 text-blue-600 mb-2" />
                      <p className="font-bold mb-1">Executive Dashboard</p>
                      <p className="text-sm text-muted-foreground">KPIs, revenue, expenses, headcount</p>
                    </div>
                    <div className="border-2 border-green-200 dark:border-green-800 rounded-xl p-4 bg-green-50 dark:bg-green-900/20">
                      <LineChart className="h-6 w-6 text-green-600 mb-2" />
                      <p className="font-bold mb-1">Sales Dashboard</p>
                      <p className="text-sm text-muted-foreground">Pipeline, win rate, deal velocity</p>
                    </div>
                    <div className="border-2 border-purple-200 dark:border-purple-800 rounded-xl p-4 bg-purple-50 dark:bg-purple-900/20">
                      <PieChart className="h-6 w-6 text-purple-600 mb-2" />
                      <p className="font-bold mb-1">HR Dashboard</p>
                      <p className="text-sm text-muted-foreground">Turnover, attendance, performance</p>
                    </div>
                    <div className="border-2 border-orange-200 dark:border-orange-800 rounded-xl p-4 bg-orange-50 dark:bg-orange-900/20">
                      <BarChart3 className="h-6 w-6 text-orange-600 mb-2" />
                      <p className="font-bold mb-1">Finance Dashboard</p>
                      <p className="text-sm text-muted-foreground">Cash flow, AR/AP, profitability</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-3">Custom Dashboards</h3>
                  <ol className="list-decimal pl-6 space-y-2">
                    <li>Navigate to <strong>Analytics → Dashboards → Create New</strong></li>
                    <li>Drag and drop widgets from library</li>
                    <li>Configure data sources and filters</li>
                    <li>Customize layout and styling</li>
                    <li>Share with team or keep private</li>
                  </ol>
                </div>
              </div>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
              <h2 className="text-3xl font-bold mb-6">Chart Types & Visualizations</h2>
              
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-4">
                  <p className="font-bold mb-2">Bar Charts</p>
                  <p className="text-sm text-muted-foreground">Compare categories</p>
                </div>
                <div className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-4">
                  <p className="font-bold mb-2">Line Charts</p>
                  <p className="text-sm text-muted-foreground">Trends over time</p>
                </div>
                <div className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-4">
                  <p className="font-bold mb-2">Pie/Donut</p>
                  <p className="text-sm text-muted-foreground">Part-to-whole</p>
                </div>
                <div className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-4">
                  <p className="font-bold mb-2">Area Charts</p>
                  <p className="text-sm text-muted-foreground">Cumulative values</p>
                </div>
                <div className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-4">
                  <p className="font-bold mb-2">Scatter Plots</p>
                  <p className="text-sm text-muted-foreground">Correlations</p>
                </div>
                <div className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-4">
                  <p className="font-bold mb-2">Heatmaps</p>
                  <p className="text-sm text-muted-foreground">Intensity patterns</p>
                </div>
                <div className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-4">
                  <p className="font-bold mb-2">Funnel Charts</p>
                  <p className="text-sm text-muted-foreground">Conversion stages</p>
                </div>
                <div className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-4">
                  <p className="font-bold mb-2">Gauge Meters</p>
                  <p className="text-sm text-muted-foreground">KPI progress</p>
                </div>
                <div className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-4">
                  <p className="font-bold mb-2">Tables</p>
                  <p className="text-sm text-muted-foreground">Detailed data</p>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4">
                <p className="text-sm m-0">
                  <strong>Interactive:</strong> Click, drill-down, filter, and export all visualizations
                </p>
              </div>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
              <h2 className="text-3xl font-bold mb-6">Filtering & Segmentation</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold mb-3">Global Filters</h3>
                  <div className="flex gap-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                    <Filter className="h-6 w-6 text-purple-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-bold mb-1">Apply Across Dashboard</p>
                      <p className="text-sm text-muted-foreground m-0">Date range, department, region, product, customer segment</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-3">Common Filter Options</h3>
                  <div className="bg-slate-900 rounded-xl p-6">
                    <pre className="text-green-400 font-mono text-sm">
{`Date Range:
  • Today, Yesterday, Last 7/30/90 days
  • This/Last Week, Month, Quarter, Year
  • Custom range picker

Comparisons:
  • vs Previous Period
  • vs Same Period Last Year
  • vs Budget/Forecast

Dimensions:
  • By Department, Team, Region
  • By Product, Category, Channel
  • By Customer Type, Segment`}
                    </pre>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
              <h2 className="text-3xl font-bold mb-6">Report Builder</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold mb-3">Creating Custom Reports</h3>
                  <ol className="list-decimal pl-6 space-y-2">
                    <li>Go to <strong>Analytics → Reports → New Report</strong></li>
                    <li>Select data source (CRM, HR, Finance, etc.)</li>
                    <li>Choose columns/fields to include</li>
                    <li>Add calculated fields and formulas</li>
                    <li>Apply filters and grouping</li>
                    <li>Set sorting and formatting</li>
                    <li>Save and schedule automated delivery</li>
                  </ol>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-3">Calculated Fields</h3>
                  <div className="bg-slate-900 rounded-xl p-6">
                    <p className="text-slate-300 text-sm mb-2">Example Formulas:</p>
                    <pre className="text-green-400 font-mono text-sm">
{`// Profit Margin
(Revenue - Cost) / Revenue * 100

// Customer Lifetime Value
Average_Order_Value * Purchase_Frequency * Customer_Lifespan

// Employee Turnover Rate
(Departures / Average_Headcount) * 100

// Days Sales Outstanding
(Accounts_Receivable / Total_Credit_Sales) * Days_in_Period`}
                    </pre>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
              <h2 className="text-3xl font-bold mb-6">AI-Powered Insights</h2>
              
              <div className="space-y-4">
                <div className="flex gap-4 p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl">
                  <div>
                    <p className="font-bold mb-1">🔍 Anomaly Detection</p>
                    <p className="text-sm text-muted-foreground m-0">Automatically flag unusual patterns in revenue, expenses, or KPIs</p>
                  </div>
                </div>
                
                <div className="flex gap-4 p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl">
                  <div>
                    <p className="font-bold mb-1">📈 Predictive Analytics</p>
                    <p className="text-sm text-muted-foreground m-0">Forecast sales, churn risk, and inventory needs with ML models</p>
                  </div>
                </div>
                
                <div className="flex gap-4 p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl">
                  <div>
                    <p className="font-bold mb-1">💡 Smart Recommendations</p>
                    <p className="text-sm text-muted-foreground m-0">Get AI-suggested actions based on data patterns</p>
                  </div>
                </div>
                
                <div className="flex gap-4 p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl">
                  <div>
                    <p className="font-bold mb-1">🗣️ Natural Language Queries</p>
                    <p className="text-sm text-muted-foreground m-0">Ask questions in plain English: "Show me top 10 customers by revenue last quarter"</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
              <h2 className="text-3xl font-bold mb-6">Sharing & Collaboration</h2>
              
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-4">
                    <p className="font-bold mb-2">Email Delivery</p>
                    <p className="text-sm text-muted-foreground">Schedule daily/weekly/monthly reports</p>
                  </div>
                  <div className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-4">
                    <p className="font-bold mb-2">Slack/Teams Integration</p>
                    <p className="text-sm text-muted-foreground">Post dashboards to channels</p>
                  </div>
                  <div className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-4">
                    <p className="font-bold mb-2">Public Links</p>
                    <p className="text-sm text-muted-foreground">Share with password protection</p>
                  </div>
                  <div className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-4">
                    <p className="font-bold mb-2">Export</p>
                    <p className="text-sm text-muted-foreground">PDF, Excel, CSV, PowerPoint</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
              <h2 className="text-3xl font-bold mb-6">Data Connectors</h2>
              
              <div className="grid md:grid-cols-3 gap-3">
                <div className="flex items-center justify-center p-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl">
                  <span className="font-semibold">Google Analytics</span>
                </div>
                <div className="flex items-center justify-center p-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl">
                  <span className="font-semibold">Salesforce</span>
                </div>
                <div className="flex items-center justify-center p-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl">
                  <span className="font-semibold">SAP</span>
                </div>
                <div className="flex items-center justify-center p-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl">
                  <span className="font-semibold">SQL Databases</span>
                </div>
                <div className="flex items-center justify-center p-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl">
                  <span className="font-semibold">REST APIs</span>
                </div>
                <div className="flex items-center justify-center p-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl">
                  <span className="font-semibold">CSV/Excel Upload</span>
                </div>
              </div>
            </section>

            <section className="bg-gradient-to-br from-indigo-600 to-purple-500 rounded-2xl p-8 text-white">
              <h2 className="text-3xl font-bold mb-6">Next Steps</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <Link href="/docs/api/rest" className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all">
                  <h3 className="font-bold mb-2">Analytics API →</h3>
                  <p className="text-sm text-indigo-100 m-0">Programmatic access</p>
                </Link>
                <Link href="/docs/developer/sdks" className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all">
                  <h3 className="font-bold mb-2">Embed Dashboards →</h3>
                  <p className="text-sm text-indigo-100 m-0">White-label analytics</p>
                </Link>
                <Link href="/docs/integrations/custom" className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all">
                  <h3 className="font-bold mb-2">Custom Connectors →</h3>
                  <p className="text-sm text-indigo-100 m-0">Connect any data source</p>
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
