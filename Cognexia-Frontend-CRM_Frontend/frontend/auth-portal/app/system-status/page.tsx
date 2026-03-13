'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sparkles, CheckCircle2, ArrowRight, Activity, Server, Database, Cloud, Globe, Zap, AlertCircle, Clock, TrendingUp } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function SystemStatusPage() {
  const services = [
    { name: 'API Services', status: 'Operational', uptime: '99.98%', icon: Server, color: 'text-green-600', bgColor: 'bg-green-100 dark:bg-green-900/30' },
    { name: 'Web Application', status: 'Operational', uptime: '99.99%', icon: Globe, color: 'text-green-600', bgColor: 'bg-green-100 dark:bg-green-900/30' },
    { name: 'Database Services', status: 'Operational', uptime: '99.97%', icon: Database, color: 'text-green-600', bgColor: 'bg-green-100 dark:bg-green-900/30' },
    { name: 'Authentication', status: 'Operational', uptime: '100%', icon: CheckCircle2, color: 'text-green-600', bgColor: 'bg-green-100 dark:bg-green-900/30' },
    { name: 'AI Services', status: 'Operational', uptime: '99.96%', icon: Zap, color: 'text-green-600', bgColor: 'bg-green-100 dark:bg-green-900/30' },
    { name: 'Cloud Infrastructure', status: 'Operational', uptime: '99.99%', icon: Cloud, color: 'text-green-600', bgColor: 'bg-green-100 dark:bg-green-900/30' }
  ];

  const metrics = [
    { label: 'Current Uptime', value: '99.96%', icon: TrendingUp, color: 'from-green-600 to-emerald-500' },
    { label: 'Avg Response Time', value: '142ms', icon: Clock, color: 'from-blue-600 to-cyan-500' },
    { label: 'Active Incidents', value: '0', icon: AlertCircle, color: 'from-purple-600 to-pink-500' },
    { label: 'Global Regions', value: '12', icon: Globe, color: 'from-orange-600 to-red-500' }
  ];

  const recentIncidents = [
    {
      date: 'Jan 15, 2026',
      title: 'Scheduled Maintenance - Database Upgrade',
      status: 'Resolved',
      duration: '2 hours',
      impact: 'Minimal',
      description: 'Completed scheduled maintenance for database performance optimization.'
    },
    {
      date: 'Dec 28, 2025',
      title: 'API Rate Limiting Issue',
      status: 'Resolved',
      duration: '45 minutes',
      impact: 'Low',
      description: 'Temporary rate limiting issue affecting some API endpoints. Resolved quickly with no data loss.'
    },
    {
      date: 'Dec 10, 2025',
      title: 'Scheduled Security Patch',
      status: 'Resolved',
      duration: '1 hour',
      impact: 'Minimal',
      description: 'Applied critical security patches to infrastructure components.'
    }
  ];

  const uptimeData = [
    { month: 'Aug 2025', uptime: '99.98%' },
    { month: 'Sep 2025', uptime: '99.97%' },
    { month: 'Oct 2025', uptime: '99.99%' },
    { month: 'Nov 2025', uptime: '99.96%' },
    { month: 'Dec 2025', uptime: '99.98%' },
    { month: 'Jan 2026', uptime: '99.99%' }
  ];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
          <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:60px_60px]"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
          
          <div className="container relative mx-auto px-4 py-20 md:py-28">
            <div className="text-center max-w-5xl mx-auto">
              <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-4 py-2 mb-8 backdrop-blur-sm">
                <Activity className="h-4 w-4 text-green-400 animate-pulse" />
                <span className="text-sm font-medium text-green-300">All Systems Operational</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight">
                <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent animate-gradient">
                  System Status
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-blue-100 mb-4 font-light">
                Real-Time Platform Health & Performance
              </p>
              
              <p className="text-lg text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed">
                Monitor the status of CognexiaAI services in real-time. Subscribe to updates and stay informed about any incidents or maintenance windows.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" className="text-lg px-10 py-7 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 font-semibold">
                  Subscribe to Updates
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Link href="/support">
                  <Button size="lg" variant="outline" className="text-lg px-10 py-7 border-2 border-blue-400 text-blue-100 hover:bg-blue-500/10 shadow-lg font-semibold">
                    Contact Support
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Key Metrics */}
        <section className="container mx-auto px-4 py-20">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-16">
            {metrics.map((metric, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl text-center">
                <div className={`w-12 h-12 bg-gradient-to-br ${metric.color} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                  <metric.icon className="h-6 w-6 text-white" />
                </div>
                <div className="text-3xl font-bold mb-2">{metric.value}</div>
                <div className="text-sm text-muted-foreground">{metric.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Service Status */}
        <section className="container mx-auto px-4 py-20">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Service Status</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Real-time status of all CognexiaAI platform services
              </p>
            </div>

            <div className="space-y-4">
              {services.map((service, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center">
                        <service.icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold">{service.name}</h3>
                        <p className="text-sm text-muted-foreground">Last 30 days: {service.uptime} uptime</p>
                      </div>
                    </div>
                    <div className={`flex items-center gap-2 px-4 py-2 ${service.bgColor} rounded-full`}>
                      <CheckCircle2 className={`h-4 w-4 ${service.color}`} />
                      <span className={`text-sm font-semibold ${service.color}`}>{service.status}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Uptime History */}
        <section className="bg-white dark:bg-gray-900 py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold mb-4">Uptime History</h2>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                  Historical uptime data showing our commitment to reliability
                </p>
              </div>

              <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-6">
                {uptimeData.map((data, index) => (
                  <div key={index} className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6 shadow-lg text-center">
                    <div className="text-2xl font-bold text-green-600 mb-2">{data.uptime}</div>
                    <div className="text-sm text-muted-foreground">{data.month}</div>
                  </div>
                ))}
              </div>

              <div className="mt-12 text-center">
                <div className="inline-flex items-center gap-2 px-6 py-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <span className="font-semibold text-green-700 dark:text-green-400">
                    Average 6-Month Uptime: 99.98%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Recent Incidents */}
        <section className="container mx-auto px-4 py-20">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Recent Incidents & Maintenance</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Transparency in our operations and incident history
              </p>
            </div>

            <div className="space-y-6">
              {recentIncidents.map((incident, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        <h3 className="text-xl font-bold">{incident.title}</h3>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{incident.date}</span>
                        <span>•</span>
                        <span>Duration: {incident.duration}</span>
                        <span>•</span>
                        <span>Impact: {incident.impact}</span>
                      </div>
                    </div>
                    <span className="px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-semibold">
                      {incident.status}
                    </span>
                  </div>
                  <p className="text-muted-foreground">{incident.description}</p>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <p className="text-muted-foreground mb-4">
                View complete incident history and subscribe to status updates
              </p>
              <Button variant="outline" size="lg">
                View All Incidents
              </Button>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-blue-600 to-cyan-500 rounded-3xl p-12 shadow-2xl text-white text-center">
            <Activity className="h-16 w-16 mx-auto mb-6" />
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Stay Informed</h2>
            <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
              Subscribe to real-time status updates and be the first to know about any incidents or scheduled maintenance
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 font-semibold shadow-xl text-lg px-10 py-7">
                Subscribe via Email
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Link href="/support">
                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 font-semibold text-lg px-10 py-7">
                  Contact Support
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
