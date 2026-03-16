'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sparkles, CheckCircle2, ArrowRight, Headphones, Book, MessageSquare, Video, Mail, Phone, Clock, HelpCircle, FileText, Search } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function SupportPage() {
  const supportChannels = [
    {
      title: '24/7 Live Chat',
      icon: MessageSquare,
      color: 'from-blue-600 to-cyan-500',
      description: 'Get instant help from our support team',
      availability: 'Available 24/7',
      responseTime: '<2 minutes'
    },
    {
      title: 'Email Support',
      icon: Mail,
      color: 'from-purple-600 to-pink-500',
      description: 'Detailed assistance for complex issues',
      availability: 'support@cognexiaai.com',
      responseTime: '<4 hours'
    },
    {
      title: 'Phone Support',
      icon: Phone,
      color: 'from-green-600 to-emerald-500',
      description: 'Speak directly with support specialists',
      availability: '+91-9167422630',
      responseTime: 'Immediate'
    }
  ];

  const faqs = [
    {
      question: 'How do I get started with CognexiaAI?',
      answer: 'Sign up for a free trial, complete the onboarding wizard, and start exploring our modules. Our quick start guide will help you set up in under 30 minutes.'
    },
    {
      question: 'What are the system requirements?',
      answer: 'CognexiaAI is a cloud-based platform accessible via modern web browsers (Chrome, Firefox, Safari, Edge). No software installation required.'
    },
    {
      question: 'How secure is my data?',
      answer: 'We use AES-256 encryption, SOC 2 Type II certified infrastructure, and ISO 27001 compliant security measures. Your data is backed up across multiple regions.'
    },
    {
      question: 'Can I integrate with existing systems?',
      answer: 'Yes! We provide REST & GraphQL APIs, pre-built connectors for Salesforce, SAP, Oracle, and custom integration support.'
    },
    {
      question: 'What is your uptime SLA?',
      answer: '99.9% uptime guarantee with automatic failover and multi-region redundancy. Enterprise plans include 99.99% SLA options.'
    },
    {
      question: 'Do you offer training and onboarding?',
      answer: 'Yes! We provide comprehensive training materials, video tutorials, live webinars, and dedicated onboarding for Enterprise customers.'
    }
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
                <span className="text-sm font-medium text-blue-300">24/7 Enterprise Support · Average Response Time: &lt;2 min</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight">
                <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent animate-gradient">
                  Support Center
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-blue-100 mb-4 font-light">
                We're Here to Help You Succeed
              </p>
              
              <p className="text-lg text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed">
                Get expert assistance from our world-class support team available 24/7. Search our knowledge base, watch tutorials, or contact us directly.
              </p>

              {/* Search Bar */}
              <div className="max-w-2xl mx-auto mb-12">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search help articles, guides, tutorials..."
                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/contact">
                  <Button size="lg" className="text-lg px-10 py-7 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 font-semibold">
                    Contact Support
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/documentation">
                  <Button size="lg" variant="outline" className="text-lg px-10 py-7 border-2 border-blue-400 text-blue-100 hover:bg-blue-500/10 shadow-lg font-semibold">
                    View Documentation
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Support Channels */}
        <section className="container mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Get Help Your Way</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Multiple channels to reach our expert support team
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {supportChannels.map((channel, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2 text-center">
                <div className={`w-16 h-16 bg-gradient-to-br ${channel.color} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                  <channel.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3">{channel.title}</h3>
                <p className="text-muted-foreground mb-6">{channel.description}</p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-center gap-2 text-blue-600 font-semibold">
                    <Clock className="h-4 w-4" />
                    <span>{channel.availability}</span>
                  </div>
                  <div className="text-muted-foreground">
                    Response Time: {channel.responseTime}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Help Categories */}
        <section className="bg-white dark:bg-gray-900 py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold mb-4">Browse Help Topics</h2>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                  Find answers in our comprehensive knowledge base
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Link href="#" className="group">
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all">
                    <Book className="h-8 w-8 text-blue-600 mb-4" />
                    <h3 className="text-lg font-bold mb-2 group-hover:text-blue-600 transition-colors">Getting Started</h3>
                    <p className="text-sm text-muted-foreground">Setup guides & tutorials</p>
                    <p className="text-xs text-blue-600 mt-2">45 articles</p>
                  </div>
                </Link>

                <Link href="#" className="group">
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all">
                    <FileText className="h-8 w-8 text-purple-600 mb-4" />
                    <h3 className="text-lg font-bold mb-2 group-hover:text-purple-600 transition-colors">API & Integration</h3>
                    <p className="text-sm text-muted-foreground">Developer resources</p>
                    <p className="text-xs text-purple-600 mt-2">62 articles</p>
                  </div>
                </Link>

                <Link href="#" className="group">
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all">
                    <HelpCircle className="h-8 w-8 text-green-600 mb-4" />
                    <h3 className="text-lg font-bold mb-2 group-hover:text-green-600 transition-colors">Troubleshooting</h3>
                    <p className="text-sm text-muted-foreground">Common issues & fixes</p>
                    <p className="text-xs text-green-600 mt-2">38 articles</p>
                  </div>
                </Link>

                <Link href="#" className="group">
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all">
                    <Video className="h-8 w-8 text-orange-600 mb-4" />
                    <h3 className="text-lg font-bold mb-2 group-hover:text-orange-600 transition-colors">Video Tutorials</h3>
                    <p className="text-sm text-muted-foreground">Step-by-step videos</p>
                    <p className="text-xs text-orange-600 mt-2">28 videos</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Frequently Asked Questions</h2>
              <p className="text-xl text-muted-foreground">
                Quick answers to common questions
              </p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <details key={index} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg group">
                  <summary className="font-bold text-lg cursor-pointer list-none flex items-center justify-between">
                    <span>{faq.question}</span>
                    <ArrowRight className="h-5 w-5 transition-transform group-open:rotate-90" />
                  </summary>
                  <p className="mt-4 text-muted-foreground leading-relaxed">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-blue-600 to-cyan-500 rounded-3xl p-12 shadow-2xl text-white text-center">
            <Headphones className="h-16 w-16 mx-auto mb-6" />
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Still Need Help?</h2>
            <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
              Our support team is available 24/7 to assist you with any questions or issues
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 font-semibold shadow-xl text-lg px-10 py-7">
                  Contact Support Team
                  <MessageSquare className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/register">
                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 font-semibold text-lg px-10 py-7">
                  Start Free Trial
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
