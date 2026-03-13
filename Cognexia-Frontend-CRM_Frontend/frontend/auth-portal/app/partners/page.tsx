'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sparkles, CheckCircle2, ArrowRight, Handshake, Users, TrendingUp, Award, Globe, Zap, Target, Shield, Code, Building2, Rocket } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function PartnersPage() {
  const partnerTypes = [
    {
      title: 'Technology Partners',
      icon: Code,
      color: 'from-blue-600 to-cyan-500',
      description: 'Integrate your technology with CognexiaAI platform',
      benefits: [
        'Access to enterprise APIs',
        'Co-marketing opportunities',
        'Technical support & training',
        'Joint solution development'
      ]
    },
    {
      title: 'Reseller Partners',
      icon: TrendingUp,
      color: 'from-purple-600 to-pink-500',
      description: 'Expand your portfolio with Industry 5.0 solutions',
      benefits: [
        'Attractive partner margins',
        'Sales enablement resources',
        'Lead generation support',
        'Dedicated partner portal'
      ]
    },
    {
      title: 'Implementation Partners',
      icon: Rocket,
      color: 'from-green-600 to-emerald-500',
      description: 'Help enterprises deploy CognexiaAI solutions',
      benefits: [
        'Implementation training',
        'Certification programs',
        'Customer referrals',
        'Priority support access'
      ]
    },
    {
      title: 'Strategic Partners',
      icon: Target,
      color: 'from-orange-600 to-red-500',
      description: 'Build long-term strategic alliances',
      benefits: [
        'Co-innovation opportunities',
        'Executive engagement',
        'Market development funds',
        'Global reach expansion'
      ]
    }
  ];

  const existingPartners = [
    { name: 'AWS', category: 'Cloud Infrastructure' },
    { name: 'Microsoft Azure', category: 'Cloud Infrastructure' },
    { name: 'Google Cloud', category: 'Cloud Infrastructure' },
    { name: 'Salesforce', category: 'CRM Integration' },
    { name: 'SAP', category: 'ERP Integration' },
    { name: 'Oracle', category: 'Database Solutions' },
    { name: 'IBM', category: 'AI & Analytics' },
    { name: 'Stripe', category: 'Payment Processing' }
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
                  Partner With Us
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-blue-100 mb-4 font-light">
                Build, Grow, and Succeed Together
              </p>
              
              <p className="text-lg text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed">
                Join our global partner ecosystem and unlock new opportunities with Industry 5.0 technology. Together, we empower enterprises worldwide with AI-powered solutions.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/contact">
                  <Button size="lg" className="text-lg px-10 py-7 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 font-semibold">
                    Become a Partner
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/products">
                  <Button size="lg" variant="outline" className="text-lg px-10 py-7 border-2 border-blue-400 text-blue-100 hover:bg-blue-500/10 shadow-lg font-semibold">
                    Explore Solutions
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Partner Types Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Partnership Programs</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Choose the partnership model that aligns with your business goals
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {partnerTypes.map((partner, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2">
                <div className={`w-16 h-16 bg-gradient-to-br ${partner.color} rounded-2xl flex items-center justify-center mb-6`}>
                  <partner.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3">{partner.title}</h3>
                <p className="text-muted-foreground mb-6">{partner.description}</p>
                <ul className="space-y-3">
                  {partner.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Why Partner Section */}
        <section className="bg-white dark:bg-gray-900 py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold mb-4">Why Partner with CognexiaAI?</h2>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                  Leverage our technology, expertise, and global reach to accelerate your growth
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Globe className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Global Reach</h3>
                  <p className="text-muted-foreground">
                    Access to 3,600+ enterprise clients across 50+ countries
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Award className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">CMMI Level 5</h3>
                  <p className="text-muted-foreground">
                    Partner with the highest quality-certified Industry 5.0 platform
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-600 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <TrendingUp className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Revenue Growth</h3>
                  <p className="text-muted-foreground">
                    Competitive margins and recurring revenue opportunities
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-orange-600 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Zap className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Innovation</h3>
                  <p className="text-muted-foreground">
                    Co-innovate with cutting-edge AI and quantum technologies
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Shield className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Enterprise Security</h3>
                  <p className="text-muted-foreground">
                    SOC 2 Type II and ISO 27001 certified infrastructure
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-yellow-600 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Users className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Dedicated Support</h3>
                  <p className="text-muted-foreground">
                    Partner success team available 24/7 to support your growth
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Existing Partners Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Our Technology Partners</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Trusted by leading technology providers worldwide
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {existingPartners.map((partner, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all text-center">
                  <div className="font-bold text-lg mb-2">{partner.name}</div>
                  <div className="text-sm text-muted-foreground">{partner.category}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-blue-600 to-cyan-500 rounded-3xl p-12 shadow-2xl text-white text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Partner?</h2>
            <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
              Join our growing ecosystem and unlock new revenue opportunities with Industry 5.0 technology
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 font-semibold shadow-xl text-lg px-10 py-7">
                  Apply Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/products">
                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 font-semibold text-lg px-10 py-7">
                  View Solutions
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
