'use client';

import Link from 'next/link';
import { DollarSign, CheckCircle2, ArrowLeft, Zap, Building2, Crown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function PricingPage() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
          <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:60px_60px]"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
          
          <div className="container relative mx-auto px-4 py-16">
            <Link href="/">
              <Button variant="outline" className="mb-8 border-slate-600 text-slate-300 hover:bg-slate-800">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
            
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 mb-8 backdrop-blur-sm">
                <DollarSign className="h-4 w-4 text-blue-400" />
                <span className="text-sm font-medium text-blue-300">Transparent, Enterprise Pricing</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
                  Choose Your Plan
                </span>
              </h1>
              
              <p className="text-xl text-blue-100 max-w-3xl mx-auto">
                Enterprise-grade ERP solutions with CMMI Level 5 certification. Scale from startup to Fortune 500 with confidence.
              </p>
            </div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              
              {/* Professional Plan */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border-2 border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">Professional</h3>
                    <p className="text-sm text-muted-foreground">For growing teams</p>
                  </div>
                </div>
                
                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold">$499</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">Up to 50 users</p>
                </div>

                <Link href="/register">
                  <Button className="w-full mb-6" size="lg">
                    Start 14-Day Trial
                  </Button>
                </Link>

                <div className="space-y-4">
                  <p className="font-semibold text-sm uppercase text-muted-foreground">What's Included</p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">All Core ERP Modules (CRM, HR, Finance)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">50 GB Storage</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Standard AI Features</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Email Support (24/7)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">99.5% Uptime SLA</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Basic Analytics Dashboard</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">API Access (1,000 calls/day)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <X className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">Advanced AI Services</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <X className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">Dedicated Account Manager</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Enterprise Plan - Popular */}
              <div className="bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl shadow-2xl p-8 relative transform md:scale-105">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-orange-500 to-amber-400 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
                    MOST POPULAR
                  </span>
                </div>
                
                <div className="flex items-center gap-3 mb-6 text-white">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">Enterprise</h3>
                    <p className="text-sm text-blue-100">For large organizations</p>
                  </div>
                </div>
                
                <div className="mb-6 text-white">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold">$1,999</span>
                    <span className="text-blue-100">/month</span>
                  </div>
                  <p className="text-sm text-blue-100 mt-2">Up to 500 users</p>
                </div>

                <Link href="/register">
                  <Button className="w-full mb-6 bg-white text-blue-600 hover:bg-blue-50" size="lg">
                    Start 14-Day Trial
                  </Button>
                </Link>

                <div className="space-y-4 text-white">
                  <p className="font-semibold text-sm uppercase text-blue-100">Everything in Professional, plus</p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-white flex-shrink-0 mt-0.5" />
                      <span className="text-sm">All Advanced ERP Modules</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-white flex-shrink-0 mt-0.5" />
                      <span className="text-sm">1 TB Storage</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-white flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Advanced AI & Quantum Features</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-white flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Priority Phone & Chat Support</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-white flex-shrink-0 mt-0.5" />
                      <span className="text-sm">99.9% Uptime SLA</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-white flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Advanced Analytics & BI</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-white flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Unlimited API Calls</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-white flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Custom Integrations</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-white flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Dedicated Account Manager</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Ultimate Plan */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border-2 border-purple-500">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-500 rounded-xl flex items-center justify-center">
                    <Crown className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">Ultimate</h3>
                    <p className="text-sm text-muted-foreground">For Fortune 500</p>
                  </div>
                </div>
                
                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold">Custom</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">Unlimited users</p>
                </div>

                <Link href="/contact">
                  <Button className="w-full mb-6" variant="outline" size="lg">
                    Contact Sales
                  </Button>
                </Link>

                <div className="space-y-4">
                  <p className="font-semibold text-sm uppercase text-muted-foreground">Everything in Enterprise, plus</p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">White-Label Solution</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Unlimited Storage</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Custom AI Model Training</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">24/7 Dedicated Support Team</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">99.99% Uptime SLA</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Private Cloud Deployment</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Custom Development</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">On-Site Training</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Legal & Compliance Consultation</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Feature Comparison Table */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12 mb-16">
              <h2 className="text-3xl font-bold mb-8 text-center">Feature Comparison</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left p-4 font-semibold">Features</th>
                      <th className="text-center p-4 font-semibold">Professional</th>
                      <th className="text-center p-4 font-semibold bg-blue-50 dark:bg-blue-900/20">Enterprise</th>
                      <th className="text-center p-4 font-semibold">Ultimate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    <tr>
                      <td className="p-4">Users</td>
                      <td className="text-center p-4">Up to 50</td>
                      <td className="text-center p-4 bg-blue-50 dark:bg-blue-900/20">Up to 500</td>
                      <td className="text-center p-4">Unlimited</td>
                    </tr>
                    <tr>
                      <td className="p-4">Storage</td>
                      <td className="text-center p-4">50 GB</td>
                      <td className="text-center p-4 bg-blue-50 dark:bg-blue-900/20">1 TB</td>
                      <td className="text-center p-4">Unlimited</td>
                    </tr>
                    <tr>
                      <td className="p-4">Uptime SLA</td>
                      <td className="text-center p-4">99.5%</td>
                      <td className="text-center p-4 bg-blue-50 dark:bg-blue-900/20">99.9%</td>
                      <td className="text-center p-4">99.99%</td>
                    </tr>
                    <tr>
                      <td className="p-4">Support</td>
                      <td className="text-center p-4">Email</td>
                      <td className="text-center p-4 bg-blue-50 dark:bg-blue-900/20">Priority</td>
                      <td className="text-center p-4">Dedicated Team</td>
                    </tr>
                    <tr>
                      <td className="p-4">AI Services</td>
                      <td className="text-center p-4">Standard</td>
                      <td className="text-center p-4 bg-blue-50 dark:bg-blue-900/20">Advanced</td>
                      <td className="text-center p-4">Custom</td>
                    </tr>
                    <tr>
                      <td className="p-4">Custom Integrations</td>
                      <td className="text-center p-4"><X className="h-5 w-5 text-gray-400 mx-auto" /></td>
                      <td className="text-center p-4 bg-blue-50 dark:bg-blue-900/20"><CheckCircle2 className="h-5 w-5 text-green-600 mx-auto" /></td>
                      <td className="text-center p-4"><CheckCircle2 className="h-5 w-5 text-green-600 mx-auto" /></td>
                    </tr>
                    <tr>
                      <td className="p-4">Private Cloud</td>
                      <td className="text-center p-4"><X className="h-5 w-5 text-gray-400 mx-auto" /></td>
                      <td className="text-center p-4 bg-blue-50 dark:bg-blue-900/20"><X className="h-5 w-5 text-gray-400 mx-auto" /></td>
                      <td className="text-center p-4"><CheckCircle2 className="h-5 w-5 text-green-600 mx-auto" /></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Add-Ons */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8 md:p-12 mb-16">
              <h2 className="text-3xl font-bold mb-8 text-center">Optional Add-Ons</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
                  <h3 className="text-xl font-bold mb-2">Additional Users</h3>
                  <p className="text-3xl font-bold text-blue-600 mb-3">$10<span className="text-sm text-muted-foreground">/user/month</span></p>
                  <p className="text-sm text-muted-foreground">Scale beyond plan limits</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
                  <h3 className="text-xl font-bold mb-2">Extra Storage</h3>
                  <p className="text-3xl font-bold text-blue-600 mb-3">$50<span className="text-sm text-muted-foreground">/100GB/month</span></p>
                  <p className="text-sm text-muted-foreground">Additional cloud storage</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
                  <h3 className="text-xl font-bold mb-2">Premium Support</h3>
                  <p className="text-3xl font-bold text-blue-600 mb-3">$500<span className="text-sm text-muted-foreground">/month</span></p>
                  <p className="text-sm text-muted-foreground">1-hour response time</p>
                </div>
              </div>
            </div>

            {/* FAQ */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12">
              <h2 className="text-3xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
              <div className="space-y-6 max-w-3xl mx-auto">
                <div>
                  <h3 className="text-xl font-semibold mb-2">Can I change plans later?</h3>
                  <p className="text-muted-foreground">Yes, you can upgrade or downgrade your plan at any time. Changes take effect at the start of the next billing cycle.</p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">What payment methods do you accept?</h3>
                  <p className="text-muted-foreground">We accept all major credit cards, wire transfers, and can set up custom billing arrangements for Enterprise and Ultimate plans.</p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Is there a setup fee?</h3>
                  <p className="text-muted-foreground">No setup fees for Professional and Enterprise plans. Ultimate plans may have custom implementation fees based on requirements.</p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">What happens after the 14-day trial?</h3>
                  <p className="text-muted-foreground">Your trial automatically converts to a paid subscription. You can cancel anytime during the trial with no charges.</p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Do you offer discounts for annual billing?</h3>
                  <p className="text-muted-foreground">Yes! Save 20% with annual billing. Contact our sales team for volume discounts and multi-year agreements.</p>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center bg-gradient-to-br from-blue-600 to-cyan-500 rounded-3xl p-12 shadow-2xl text-white">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl mb-8">
              Join thousands of companies already using CognexiaAI
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="text-lg px-10 py-7 bg-white text-blue-600 hover:bg-blue-50">
                  Start Free Trial
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="text-lg px-10 py-7 border-2 border-white text-white hover:bg-white/10">
                  Contact Sales
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
