'use client';

import Link from 'next/link';
import { ArrowLeft, LayoutDashboard, PieChart, BarChart3 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function CustomDashboardsPage() {
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
              Documentation / Popular / Custom Dashboard Creation
            </div>
            <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <span className="bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded">Analytics</span>
              <span>15 min read</span>
            </div>
          </div>

          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Custom Dashboard Creation</h1>
            <p className="text-xl text-muted-foreground">
              Build personalized dashboards with drag-and-drop widgets
            </p>
          </div>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            
            <section className="bg-gradient-to-br from-green-600 to-emerald-500 rounded-2xl p-8 text-white mb-8">
              <div className="flex items-center gap-3 mb-4">
                <LayoutDashboard className="h-8 w-8" />
                <h2 className="text-3xl font-bold m-0">Dashboard Builder</h2>
              </div>
              <p className="text-lg text-green-100 m-0">
                Create custom dashboards tailored to your team's KPIs and workflows
              </p>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
              <h2 className="text-3xl font-bold mb-6">Getting Started</h2>
              
              <ol className="list-decimal pl-6 space-y-3">
                <li>Navigate to <strong>Analytics → Dashboards</strong></li>
                <li>Click <strong>+ Create Dashboard</strong></li>
                <li>Name your dashboard and set permissions</li>
                <li>Choose layout: 1, 2, or 3 columns</li>
                <li>Start adding widgets from the library</li>
              </ol>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
              <h2 className="text-3xl font-bold mb-6">Available Widget Types</h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="border-2 border-blue-200 dark:border-blue-800 rounded-xl p-6 bg-blue-50 dark:bg-blue-900/20">
                  <BarChart3 className="h-6 w-6 text-blue-600 mb-2" />
                  <h3 className="font-bold mb-1">Chart Widgets</h3>
                  <p className="text-sm text-muted-foreground m-0">Bar, Line, Area, Donut, Pie charts</p>
                </div>
                
                <div className="border-2 border-purple-200 dark:border-purple-800 rounded-xl p-6 bg-purple-50 dark:bg-purple-900/20">
                  <PieChart className="h-6 w-6 text-purple-600 mb-2" />
                  <h3 className="font-bold mb-1">KPI Metrics</h3>
                  <p className="text-sm text-muted-foreground m-0">Single value indicators with trends</p>
                </div>
                
                <div className="border-2 border-green-200 dark:border-green-800 rounded-xl p-6 bg-green-50 dark:bg-green-900/20">
                  <h3 className="font-bold mb-1">Tables</h3>
                  <p className="text-sm text-muted-foreground m-0">Sortable data grids with filters</p>
                </div>
                
                <div className="border-2 border-orange-200 dark:border-orange-800 rounded-xl p-6 bg-orange-50 dark:bg-orange-900/20">
                  <h3 className="font-bold mb-1">Heatmaps</h3>
                  <p className="text-sm text-muted-foreground m-0">Geographic and time-based patterns</p>
                </div>
              </div>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
              <h2 className="text-3xl font-bold mb-6">Widget Configuration</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold mb-3">1. Select Data Source</h3>
                  <div className="bg-slate-900 rounded-xl p-6">
                    <pre className="text-green-400 font-mono text-sm">
{`{
  "dataSource": "crm.deals",
  "aggregation": "sum",
  "field": "value",
  "groupBy": "stage"
}`}
                    </pre>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-3">2. Apply Filters</h3>
                  <div className="bg-slate-900 rounded-xl p-6">
                    <pre className="text-green-400 font-mono text-sm">
{`{
  "filters": {
    "dateRange": "last_30_days",
    "status": ["active", "pending"],
    "owner": "current_user"
  }
}`}
                    </pre>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-3">3. Customize Appearance</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Choose color schemes</li>
                    <li>Set refresh intervals</li>
                    <li>Configure tooltips and labels</li>
                    <li>Add drill-down actions</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
              <h2 className="text-3xl font-bold mb-6">Example: Sales Dashboard</h2>
              
              <div className="bg-slate-900 rounded-xl p-6">
                <pre className="text-green-400 font-mono text-sm">
{`// Dashboard configuration JSON
{
  "name": "Sales Performance",
  "layout": "2-column",
  "widgets": [
    {
      "type": "metric",
      "title": "Monthly Revenue",
      "dataSource": "crm.deals",
      "query": {
        "aggregation": "sum",
        "field": "value",
        "filter": { "stage": "closed_won", "dateRange": "this_month" }
      }
    },
    {
      "type": "bar_chart",
      "title": "Deals by Stage",
      "dataSource": "crm.deals",
      "query": {
        "aggregation": "count",
        "groupBy": "stage"
      }
    },
    {
      "type": "table",
      "title": "Top Deals",
      "dataSource": "crm.deals",
      "columns": ["title", "value", "expected_close_date"],
      "limit": 10,
      "orderBy": "value DESC"
    }
  ]
}`}
                </pre>
              </div>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
              <h2 className="text-3xl font-bold mb-6">Sharing & Permissions</h2>
              
              <div className="space-y-3">
                <div className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl">
                  <p className="font-bold mb-1">Private Dashboard</p>
                  <p className="text-sm text-muted-foreground">Visible only to you</p>
                </div>
                
                <div className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl">
                  <p className="font-bold mb-1">Team Dashboard</p>
                  <p className="text-sm text-muted-foreground">Share with specific teams or departments</p>
                </div>
                
                <div className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl">
                  <p className="font-bold mb-1">Company-Wide</p>
                  <p className="text-sm text-muted-foreground">Available to all users in your organization</p>
                </div>
              </div>
            </section>

            <section className="bg-gradient-to-br from-green-600 to-emerald-500 rounded-2xl p-8 text-white">
              <h2 className="text-3xl font-bold mb-6">Next Steps</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <Link href="/docs/guides/analytics" className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all">
                  <h3 className="font-bold mb-2">Analytics Guide →</h3>
                  <p className="text-sm text-green-100 m-0">Full documentation</p>
                </Link>
                <Link href="/docs/api/graphql" className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all">
                  <h3 className="font-bold mb-2">Query Data →</h3>
                  <p className="text-sm text-green-100 m-0">GraphQL API</p>
                </Link>
                <Link href="/docs/developer/sdks" className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all">
                  <h3 className="font-bold mb-2">Embed Dashboards →</h3>
                  <p className="text-sm text-green-100 m-0">In your apps</p>
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
