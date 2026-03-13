'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sparkles, CheckCircle2, ArrowRight, Building2, Shield, Users, Globe, Zap, Award, TrendingUp, Lock, Server, Database, Cloud, Headphones, ClipboardCheck } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function EnterprisePage() {
  const enterpriseFeatures = [
    {
      title: 'Unlimited Scalability',
      icon: Server,
      color: 'from-blue-600 to-cyan-500',
      description: 'Handle millions of transactions with auto-scaling infrastructure',
      details: [
        'Auto-scaling architecture',
        'Load balancing across regions',
        'Zero downtime deployments',
        'Handles 10M+ daily transactions'
      ]
    },
    {
      title: 'Advanced Security',
      icon: Shield,
      color: 'from-purple-600 to-pink-500',
      description: 'Military-grade encryption and compliance certifications',
      details: [
        'SOC 2 Type II certified',
        'ISO 27001 & GDPR compliant',
        'AES-256 encryption',
        'Multi-factor authentication'
      ]
    },
    {
      title: 'Dedicated Support',
      icon: Headphones,
      color: 'from-green-600 to-emerald-500',
      description: '24/7 premium support with dedicated account team',
      details: [
        'Named account executive',
        '99.9% uptime SLA',
        'Priority incident response',
        'Quarterly business reviews'
      ]
    },
    {
      title: 'Custom Integrations',
      icon: Database,
      color: 'from-orange-600 to-red-500',
      description: 'Seamless integration with your existing systems',
      details: [
        'REST & GraphQL APIs',
        'Custom connector development',
        'Legacy system migration',
        'Real-time data synchronization'
      ]
    }
  ];

  const industryUse = [
    { industry: 'Financial Services', clients: '500+', icon: TrendingUp },
    { industry: 'Healthcare', clients: '800+', icon: Building2 },
    { industry: 'Manufacturing', clients: '600+', icon: Server },
    { industry: 'Retail & E-commerce', clients: '900+', icon: Globe },
    { industry: 'Technology', clients: '700+', icon: Zap },
    { industry: 'Legal Services', clients: '400+', icon: ClipboardCheck }
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
              <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 mb-8 backdrop-blur-sm">
                <Sparkles className="h-4 w-4 text-blue-400" />
                <span className="text-sm font-medium text-blue-300">CMMI Level 5 Certified · ISO 27001 · SOC 2 Type II</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight">
                <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent animate-gradient">
                  Enterprise Solutions
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-blue-100 mb-4 font-light">
                Industry 5.0 Platform Built for Global Enterprises
              </p>
              
              <p className="text-lg text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed">
                Trusted by Fortune 500 companies worldwide. Scalable, secure, and compliant solutions designed for the most demanding enterprise requirements.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-slate-400 mb-12">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                  <span>3,600+ Enterprise Clients</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                  <span>50+ Countries</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                  <span>99.9% Uptime SLA</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/contact">
                  <Button size="lg" className="text-lg px-10 py-7 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 font-semibold">
                    Request Enterprise Demo
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button size="lg" variant="outline" className="text-lg px-10 py-7 border-2 border-blue-400 text-blue-100 hover:bg-blue-500/10 shadow-lg font-semibold">
                    View Pricing
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Enterprise Features */}
        <section className="container mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Enterprise-Grade Features</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Everything your organization needs to scale operations globally
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {enterpriseFeatures.map((feature, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2">
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground mb-6">{feature.description}</p>
                <ul className="space-y-3">
                  {feature.details.map((detail, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Industry Solutions */}
        <section className="bg-white dark:bg-gray-900 py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold mb-4">Trusted Across Industries</h2>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                  Serving diverse sectors with tailored Industry 5.0 solutions
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {industryUse.map((item, index) => (
                  <div key={index} className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <item.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">{item.industry}</h3>
                    <p className="text-3xl font-bold text-blue-600 mb-2">{item.clients}</p>
                    <p className="text-sm text-muted-foreground">Enterprise Clients</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="container mx-auto px-4 py-20">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Why Fortune 500 Choose Us</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                The enterprise platform built on industry-leading standards
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Award className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">CMMI Level 5</h3>
                <p className="text-muted-foreground">
                  Highest maturity level certification ensuring optimal quality and continuous improvement
                </p>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Lock className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Enterprise Security</h3>
                <p className="text-muted-foreground">
                  230+ security methods with SOC 2 Type II, ISO 27001, and GDPR compliance
                </p>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-green-600 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Cloud className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Global Infrastructure</h3>
                <p className="text-muted-foreground">
                  Multi-region deployment with 99.9% uptime and automatic failover
                </p>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-600 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Users className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Dedicated Team</h3>
                <p className="text-muted-foreground">
                  Named account executive, technical architect, and success manager
                </p>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <TrendingUp className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Proven ROI</h3>
                <p className="text-muted-foreground">
                  Average 40% efficiency improvement and 35% cost reduction within first year
                </p>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-yellow-600 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Globe className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Global Support</h3>
                <p className="text-muted-foreground">
                  24/7/365 support in 15+ languages across all major time zones
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-blue-600 to-cyan-500 rounded-3xl p-12 shadow-2xl text-white text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready for Enterprise Scale?</h2>
            <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
              Join 3,600+ global enterprises transforming their operations with Industry 5.0 technology
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 font-semibold shadow-xl text-lg px-10 py-7">
                  Schedule Enterprise Demo
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 font-semibold text-lg px-10 py-7">
                  View Enterprise Pricing
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
