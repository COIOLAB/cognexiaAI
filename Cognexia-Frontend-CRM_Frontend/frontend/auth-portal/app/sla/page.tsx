'use client';

import Link from 'next/link';
import { Award, CheckCircle2, ArrowLeft, Clock, Shield, Zap, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function SLAPage() {
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
            
            <div className="max-w-4xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-400 rounded-2xl flex items-center justify-center">
                  <Award className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold">Service Level Agreement</h1>
                  <p className="text-slate-300 mt-2">Effective: January 29, 2026</p>
                </div>
              </div>
              <p className="text-xl text-blue-100">
                Our commitment to 99.9% uptime and enterprise-grade service reliability backed by CMMI Level 5 processes.
              </p>
            </div>
          </div>
        </section>

        {/* SLA Summary Banner */}
        <section className="bg-white dark:bg-slate-900 border-y border-gray-200 dark:border-gray-800 py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
              <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-700 rounded-xl">
                <div className="text-4xl font-bold text-green-600 mb-2">99.9%</div>
                <p className="text-sm font-semibold">Uptime Guarantee</p>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-800 dark:to-gray-700 rounded-xl">
                <div className="text-4xl font-bold text-blue-600 mb-2">&lt;200ms</div>
                <p className="text-sm font-semibold">API Response Time</p>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-700 rounded-xl">
                <div className="text-4xl font-bold text-purple-600 mb-2">24/7</div>
                <p className="text-sm font-semibold">Support Availability</p>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-800 dark:to-gray-700 rounded-xl">
                <div className="text-4xl font-bold text-orange-600 mb-2">&lt;1hr</div>
                <p className="text-sm font-semibold">Critical Issue Response</p>
              </div>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-6xl mx-auto space-y-12">
            
            {/* Introduction */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12">
              <h2 className="text-3xl font-bold mb-6">1. Service Level Agreement Overview</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                This Service Level Agreement ("SLA") defines the service levels that CognexiaAI will provide to customers for our Enterprise Resource Planning (ERP) platform. This SLA is incorporated into and forms part of the Terms of Service between CognexiaAI and Customer.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Our CMMI Level 5 certified processes ensure consistent, predictable, and measurable service quality. We are committed to maintaining the highest standards of availability, performance, and support.
              </p>
            </div>

            {/* Uptime Commitment */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12">
              <div className="flex items-center gap-3 mb-6">
                <Activity className="h-8 w-8 text-green-600" />
                <h2 className="text-3xl font-bold">2. Uptime Commitment</h2>
              </div>

              <h3 className="text-xl font-semibold mb-3 mt-6">2.1 Service Availability</h3>
              <p className="text-muted-foreground mb-4">
                CognexiaAI guarantees 99.9% uptime for the Services, measured monthly. This translates to:
              </p>
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-600 mb-2">43.8 minutes</div>
                  <p className="text-sm text-muted-foreground">Maximum downtime per month</p>
                </div>
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-600 mb-2">8.76 hours</div>
                  <p className="text-sm text-muted-foreground">Maximum downtime per year</p>
                </div>
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-600 mb-2">99.9%</div>
                  <p className="text-sm text-muted-foreground">Monthly availability target</p>
                </div>
              </div>

              <h3 className="text-xl font-semibold mb-3 mt-6">2.2 Uptime Calculation</h3>
              <p className="text-muted-foreground mb-4">
                Uptime Percentage = (Total Minutes in Month - Downtime Minutes) / Total Minutes in Month × 100
              </p>
              <ul className="space-y-2 text-muted-foreground ml-6">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Downtime</strong> is measured from when we detect an issue until service is fully restored</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Excluded Downtime:</strong> Scheduled maintenance windows (with 7 days notice)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Excluded Downtime:</strong> Issues caused by factors outside our control (force majeure)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Excluded Downtime:</strong> Customer's equipment, network, or third-party issues</span>
                </li>
              </ul>
            </div>

            {/* Performance Standards */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12">
              <div className="flex items-center gap-3 mb-6">
                <Zap className="h-8 w-8 text-yellow-600" />
                <h2 className="text-3xl font-bold">3. Performance Standards</h2>
              </div>

              <div className="space-y-6">
                <div className="border-l-4 border-blue-600 pl-6 py-4">
                  <h3 className="text-xl font-semibold mb-3">3.1 API Response Time</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span><strong>95th Percentile:</strong> &lt;200ms for standard API requests</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span><strong>99th Percentile:</strong> &lt;500ms for standard API requests</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span><strong>Complex Queries:</strong> &lt;2 seconds for data-intensive operations</span>
                    </li>
                  </ul>
                </div>

                <div className="border-l-4 border-green-600 pl-6 py-4">
                  <h3 className="text-xl font-semibold mb-3">3.2 Data Processing</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span><strong>Batch Processing:</strong> Completed within scheduled time windows</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span><strong>Data Synchronization:</strong> Real-time or near real-time (within 5 seconds)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span><strong>Report Generation:</strong> Standard reports within 30 seconds</span>
                    </li>
                  </ul>
                </div>

                <div className="border-l-4 border-purple-600 pl-6 py-4">
                  <h3 className="text-xl font-semibold mb-3">3.3 Page Load Time</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span><strong>Initial Page Load:</strong> &lt;3 seconds (95th percentile)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span><strong>Subsequent Navigation:</strong> &lt;1 second (cached content)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span><strong>Dashboard Refresh:</strong> &lt;2 seconds</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Support Response Times */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12">
              <div className="flex items-center gap-3 mb-6">
                <Clock className="h-8 w-8 text-blue-600" />
                <h2 className="text-3xl font-bold">4. Support Response Times</h2>
              </div>

              <p className="text-muted-foreground mb-6">
                We provide tiered support based on issue severity. All times are measured during business hours unless otherwise specified.
              </p>

              <div className="overflow-x-auto">
                <div className="space-y-4">
                  <div className="border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-red-700 dark:text-red-400">Priority 1 - Critical</h3>
                      <span className="px-3 py-1 bg-red-600 text-white rounded-full text-sm font-semibold">24/7</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Complete service outage or critical functionality failure affecting all users
                    </p>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm font-semibold mb-1">Initial Response</p>
                        <p className="text-2xl font-bold text-red-700 dark:text-red-400">&lt;1 hour</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold mb-1">Status Updates</p>
                        <p className="text-2xl font-bold text-red-700 dark:text-red-400">Every 2 hours</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold mb-1">Resolution Target</p>
                        <p className="text-2xl font-bold text-red-700 dark:text-red-400">&lt;4 hours</p>
                      </div>
                    </div>
                  </div>

                  <div className="border border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-orange-700 dark:text-orange-400">Priority 2 - High</h3>
                      <span className="px-3 py-1 bg-orange-600 text-white rounded-full text-sm font-semibold">24/7</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Major functionality impaired or significant performance degradation
                    </p>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm font-semibold mb-1">Initial Response</p>
                        <p className="text-2xl font-bold text-orange-700 dark:text-orange-400">&lt;4 hours</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold mb-1">Status Updates</p>
                        <p className="text-2xl font-bold text-orange-700 dark:text-orange-400">Daily</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold mb-1">Resolution Target</p>
                        <p className="text-2xl font-bold text-orange-700 dark:text-orange-400">&lt;24 hours</p>
                      </div>
                    </div>
                  </div>

                  <div className="border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-yellow-700 dark:text-yellow-400">Priority 3 - Medium</h3>
                      <span className="px-3 py-1 bg-yellow-600 text-white rounded-full text-sm font-semibold">Business Hours</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Minor functionality issues with workaround available
                    </p>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm font-semibold mb-1">Initial Response</p>
                        <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">&lt;8 hours</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold mb-1">Status Updates</p>
                        <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">Every 2 days</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold mb-1">Resolution Target</p>
                        <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">&lt;5 days</p>
                      </div>
                    </div>
                  </div>

                  <div className="border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-blue-700 dark:text-blue-400">Priority 4 - Low</h3>
                      <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm font-semibold">Business Hours</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      General questions, feature requests, or cosmetic issues
                    </p>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm font-semibold mb-1">Initial Response</p>
                        <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">&lt;24 hours</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold mb-1">Status Updates</p>
                        <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">Weekly</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold mb-1">Resolution Target</p>
                        <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">&lt;15 days</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 bg-slate-50 dark:bg-slate-900 rounded-lg p-6">
                <h4 className="font-semibold mb-2">Business Hours</h4>
                <p className="text-sm text-muted-foreground">
                  Monday - Friday, 9:00 AM to 6:00 PM IST, excluding Indian public holidays
                </p>
              </div>
            </div>

            {/* Service Credits */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12">
              <div className="flex items-center gap-3 mb-6">
                <Shield className="h-8 w-8 text-green-600" />
                <h2 className="text-3xl font-bold">5. Service Credits</h2>
              </div>

              <p className="text-muted-foreground mb-6">
                If we fail to meet our uptime commitment, you may be eligible for service credits based on the following schedule:
              </p>

              <div className="overflow-x-auto">
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  <div className="bg-slate-50 dark:bg-slate-900 p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-2 gap-4 font-semibold">
                      <div>Monthly Uptime Percentage</div>
                      <div>Service Credit</div>
                    </div>
                  </div>
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    <div className="p-4 grid grid-cols-2 gap-4">
                      <div className="text-muted-foreground">99.0% to &lt;99.9%</div>
                      <div className="font-semibold text-green-600">10% of monthly fee</div>
                    </div>
                    <div className="p-4 grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-900">
                      <div className="text-muted-foreground">95.0% to &lt;99.0%</div>
                      <div className="font-semibold text-green-600">25% of monthly fee</div>
                    </div>
                    <div className="p-4 grid grid-cols-2 gap-4">
                      <div className="text-muted-foreground">&lt;95.0%</div>
                      <div className="font-semibold text-green-600">50% of monthly fee</div>
                    </div>
                  </div>
                </div>
              </div>

              <h3 className="text-xl font-semibold mb-3 mt-6">5.1 Service Credit Process</h3>
              <ul className="space-y-2 text-muted-foreground ml-6">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span>Customer must submit a claim within 30 days of the incident</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span>Claims must include date, time, and description of downtime experienced</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span>CognexiaAI will investigate and respond within 15 business days</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span>Approved credits applied to next month's invoice</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span>Service credits are the sole remedy for SLA breaches</span>
                </li>
              </ul>
            </div>

            {/* Maintenance Windows */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8 md:p-12">
              <h2 className="text-3xl font-bold mb-6">6. Scheduled Maintenance</h2>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Standard Maintenance:</strong> Maximum 4 hours per month, typically Sunday 2:00 AM - 6:00 AM IST</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Notice Period:</strong> Minimum 7 days advance notice via email and in-app notification</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Emergency Maintenance:</strong> 24 hours notice when possible, immediate action if security-critical</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Exclusion:</strong> Scheduled maintenance does not count against uptime SLA</span>
                </li>
              </ul>
            </div>

            {/* Monitoring and Reporting */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12">
              <h2 className="text-3xl font-bold mb-6">7. Monitoring and Reporting</h2>
              <p className="text-muted-foreground mb-6">
                We maintain comprehensive monitoring and provide transparent reporting:
              </p>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Real-time Status:</strong> Public status page at status.cognexiaai.com with live metrics</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Incident Notifications:</strong> Automatic email and SMS alerts for service issues</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Monthly Reports:</strong> Detailed uptime and performance reports available in dashboard</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span><strong>SLA Dashboard:</strong> Real-time view of SLA compliance and metrics</span>
                </li>
              </ul>
            </div>

            {/* Exclusions */}
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-4">8. SLA Exclusions</h2>
              <p className="text-muted-foreground mb-4">
                This SLA does not apply to service unavailability caused by:
              </p>
              <ul className="space-y-2 text-muted-foreground ml-6">
                <li className="flex items-start gap-2">
                  <span className="font-semibold">•</span>
                  <span>Factors outside our reasonable control (force majeure, internet disruptions, DDoS attacks)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold">•</span>
                  <span>Customer's equipment, software, or network connectivity issues</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold">•</span>
                  <span>Scheduled maintenance communicated in accordance with section 6</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold">•</span>
                  <span>Customer's use of Services in violation of Terms of Service</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold">•</span>
                  <span>Beta, pilot, or preview features explicitly marked as such</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold">•</span>
                  <span>Third-party integrations or services</span>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12">
              <h2 className="text-3xl font-bold mb-4">9. SLA Support Contact</h2>
              <p className="text-muted-foreground mb-4">
                For SLA-related questions or to file a service credit claim:
              </p>
              <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-6 space-y-2 text-muted-foreground">
                <p><strong>Email:</strong> <a href="mailto:sla@cognexiaai.com" className="text-blue-600 hover:underline">sla@cognexiaai.com</a></p>
                <p><strong>Support Portal:</strong> <a href="mailto:support@cognexiaai.com" className="text-blue-600 hover:underline">support@cognexiaai.com</a></p>
                <p><strong>Emergency Hotline:</strong> <a href="tel:+919167422630" className="text-blue-600 hover:underline">+91-9167422630</a></p>
                <p><strong>Status Page:</strong> status.cognexiaai.com</p>
              </div>
            </div>

          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
