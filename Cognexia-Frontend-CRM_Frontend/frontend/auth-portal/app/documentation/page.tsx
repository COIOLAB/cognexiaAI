'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sparkles, CheckCircle2, ArrowRight, Book, Code, FileText, Video, Zap, Terminal, Globe, Download, Search, BookOpen, GraduationCap, Rocket } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function DocumentationPage() {
  const docCategories = [
    {
      title: 'Getting Started',
      icon: Rocket,
      color: 'from-blue-600 to-cyan-500',
      description: 'Quick start guides and installation instructions',
      links: [
        { title: 'Installation Guide', href: '/docs/getting-started/installation' },
        { title: 'Quick Start Tutorial', href: '/docs/getting-started/quick-start' },
        { title: 'System Requirements', href: '/docs/getting-started/system-requirements' },
        { title: 'Configuration Basics', href: '/docs/getting-started/configuration' }
      ]
    },
    {
      title: 'API Reference',
      icon: Code,
      color: 'from-purple-600 to-pink-500',
      description: 'Complete API documentation with code examples',
      links: [
        { title: 'REST API Documentation', href: '/docs/api/rest' },
        { title: 'GraphQL API Reference', href: '/docs/api/graphql' },
        { title: 'Authentication & Security', href: '/docs/api/authentication' },
        { title: 'Rate Limits & Quotas', href: '/docs/api/rate-limits' }
      ]
    },
    {
      title: 'User Guides',
      icon: BookOpen,
      color: 'from-green-600 to-emerald-500',
      description: 'Step-by-step guides for all product features',
      links: [
        { title: 'CRM User Guide', href: '/docs/guides/crm' },
        { title: 'HR Management Guide', href: '/docs/guides/hr' },
        { title: 'Finance Module Guide', href: '/docs/guides/finance' },
        { title: 'Analytics Dashboard', href: '/docs/guides/analytics' }
      ]
    },
    {
      title: 'Developer Tools',
      icon: Terminal,
      color: 'from-orange-600 to-red-500',
      description: 'SDKs, CLIs, and development resources',
      links: [
        { title: 'JavaScript/TypeScript SDK', href: '/docs/developer/sdks' },
        { title: 'CLI Tools', href: '/docs/developer/cli' },
        { title: 'Webhooks & Events', href: '/docs/developer/webhooks' }
      ]
    },
    {
      title: 'Integration Guides',
      icon: Globe,
      color: 'from-indigo-600 to-purple-500',
      description: 'Connect with third-party services and platforms',
      links: [
        { title: 'Salesforce Integration', href: '/docs/integrations/salesforce' },
        { title: 'SAP Integration', href: '/docs/integrations/sap' },
        { title: 'OAuth 2.0 Setup', href: '/docs/integrations/oauth' },
        { title: 'Custom Integrations', href: '/docs/integrations/custom' }
      ]
    },
    {
      title: 'Video Tutorials',
      icon: Video,
      color: 'from-yellow-600 to-orange-500',
      description: 'Visual learning resources and webinars',
      links: [
        { title: 'Platform Overview (15 min)', href: '/docs/videos/overview' }
      ]
    }
  ];

  const popularDocs = [
    { title: 'API Authentication', category: 'API', readTime: '10 min', href: '/docs/popular/api-authentication' },
    { title: 'Data Migration Guide', category: 'Setup', readTime: '25 min', href: '/docs/popular/data-migration' },
    { title: 'Custom Dashboard Creation', category: 'Analytics', readTime: '15 min', href: '/docs/popular/custom-dashboards' },
    { title: 'Security Best Practices', category: 'Security', readTime: '20 min', href: '/docs/popular/security-best-practices' },
    { title: 'Webhooks Implementation', category: 'Integration', readTime: '12 min', href: '/docs/popular/webhooks-implementation' },
    { title: 'Multi-tenancy Setup', category: 'Enterprise', readTime: '30 min', href: '/docs/popular/multi-tenancy' }
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
                  Documentation
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-blue-100 mb-4 font-light">
                Everything You Need to Build with CognexiaAI
              </p>
              
              <p className="text-lg text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed">
                Comprehensive guides, API references, and tutorials to help you integrate and maximize the power of our Industry 5.0 platform.
              </p>

              {/* Search Bar */}
              <div className="max-w-2xl mx-auto mb-8">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search documentation..."
                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/register">
                  <Button size="lg" className="text-lg px-10 py-7 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 font-semibold">
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button size="lg" variant="outline" className="text-lg px-10 py-7 border-2 border-blue-400 text-blue-100 hover:bg-blue-500/10 shadow-lg font-semibold">
                    Talk to Expert
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Documentation Categories */}
        <section className="container mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Documentation by Category</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Find exactly what you need with our organized documentation structure
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {docCategories.map((category, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2">
                <div className={`w-16 h-16 bg-gradient-to-br ${category.color} rounded-2xl flex items-center justify-center mb-6`}>
                  <category.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3">{category.title}</h3>
                <p className="text-muted-foreground mb-6">{category.description}</p>
                <ul className="space-y-2">
                  {category.links.map((link, idx) => (
                    <li key={idx}>
                      <Link href={link.href} className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-2">
                        <ArrowRight className="h-3 w-3" />
                        {link.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Popular Documentation */}
        <section className="bg-white dark:bg-gray-900 py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold mb-4">Popular Documentation</h2>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                  Most viewed articles by developers and enterprise users
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {popularDocs.map((doc, index) => (
                  <Link key={index} href={doc.href} className="group">
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all">
                      <div className="flex items-start justify-between mb-3">
                        <FileText className="h-6 w-6 text-blue-600" />
                        <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full">
                          {doc.readTime}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold mb-2 group-hover:text-blue-600 transition-colors">
                        {doc.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">{doc.category}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Quick Links Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Download className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Download SDKs</h3>
                <p className="text-muted-foreground mb-6">
                  Get our official SDKs for faster integration
                </p>
                <Button className="w-full bg-gradient-to-r from-blue-600 to-cyan-500">
                  View All SDKs
                </Button>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Code className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">API Explorer</h3>
                <p className="text-muted-foreground mb-6">
                  Test APIs directly in your browser
                </p>
                <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-500">
                  Launch Explorer
                </Button>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <GraduationCap className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Training Center</h3>
                <p className="text-muted-foreground mb-6">
                  Certification courses and workshops
                </p>
                <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-500">
                  Start Learning
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-blue-600 to-cyan-500 rounded-3xl p-12 shadow-2xl text-white text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Need Help?</h2>
            <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
              Can't find what you're looking for? Our support team is here to help 24/7
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/support">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 font-semibold shadow-xl text-lg px-10 py-7">
                  Contact Support
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 font-semibold text-lg px-10 py-7">
                  Schedule Demo
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
