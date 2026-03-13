'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Brain, Users, DollarSign, Truck, Package, ShoppingCart, Scale, GraduationCap, HeartPulse, Code, Video, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function ProductsPage() {
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
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
              <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent animate-gradient">
                Our Products
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-blue-100 mb-4 font-light">
              Enterprise-Grade Industry 5.0 Solutions
            </p>
            
            <p className="text-lg text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Comprehensive suite of AI-powered, Quantum Computing, and Blockchain-enabled solutions designed to transform enterprise operations. Trusted by Fortune 500 companies worldwide.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-400" />
                <span>230+ Security Methods</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-400" />
                <span>60+ AI Services</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-400" />
                <span>99.9% Uptime SLA</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="bg-white dark:bg-slate-900 border-y border-gray-200 dark:border-gray-800 py-8">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm text-muted-foreground mb-4 font-semibold">TRUSTED BY INDUSTRY LEADERS WORLDWIDE</p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 opacity-60">
            <div className="text-xl font-bold text-slate-600 dark:text-slate-400">Fortune 500</div>
            <div className="text-xl font-bold text-slate-600 dark:text-slate-400">Enterprise</div>
            <div className="text-xl font-bold text-slate-600 dark:text-slate-400">Global Leaders</div>
            <div className="text-xl font-bold text-slate-600 dark:text-slate-400">10K+ Users</div>
          </div>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="container mx-auto px-4 py-20">

        {/* ERP Suite Section */}
        <div className="mb-20">
          <div className="mb-12">
            <h2 className="text-4xl font-bold text-center mb-4">CognexiaAI ERP</h2>
            <p className="text-xl text-center text-muted-foreground max-w-3xl mx-auto">
              Comprehensive Enterprise Resource Planning modules for complete business transformation
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {/* CRM */}
            <Link href="/CognexiaAI_CRM_Brochure.html" target="_blank">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2 h-full">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center mb-6">
                  <Brain className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3">CognexiaAI CRM</h3>
                <p className="text-muted-foreground mb-4">
                  Complete Customer Relationship Management with AI-powered insights and 360° customer intelligence
                </p>
                <div className="flex items-center gap-2 text-blue-600 font-semibold">
                  View Details <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </Link>

            {/* HR */}
            <Link href="/CognexiaAI_HR_Features.html" target="_blank">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2 h-full">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-500 rounded-2xl flex items-center justify-center mb-6">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3">CognexiaAI HR</h3>
                <p className="text-muted-foreground mb-4">
                  Intelligent Human Resource Management with AI recruitment and quantum workforce planning
                </p>
                <div className="flex items-center gap-2 text-purple-600 font-semibold">
                  View Details <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </Link>

            {/* Finance */}
            <Link href="/CognexiaAI_Finance_Features.html" target="_blank">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2 h-full">
                <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-500 rounded-2xl flex items-center justify-center mb-6">
                  <DollarSign className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Finance & Accounting</h3>
                <p className="text-muted-foreground mb-4">
                  Enterprise financial management with blockchain security and AI-powered forecasting
                </p>
                <div className="flex items-center gap-2 text-green-600 font-semibold">
                  View Details <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </Link>

            {/* Supply Chain */}
            <Link href="/CognexiaAI_SupplyChain_Features.html" target="_blank">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2 h-full">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-600 to-red-500 rounded-2xl flex items-center justify-center mb-6">
                  <Truck className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Supply Chain</h3>
                <p className="text-muted-foreground mb-4">
                  End-to-end visibility with IoT tracking and blockchain-verified logistics
                </p>
                <div className="flex items-center gap-2 text-orange-600 font-semibold">
                  View Details <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </Link>

            {/* Inventory */}
            <Link href="/CognexiaAI_Inventory_Features.html" target="_blank">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2 h-full">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-500 rounded-2xl flex items-center justify-center mb-6">
                  <Package className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Inventory Management</h3>
                <p className="text-muted-foreground mb-4">
                  Smart inventory with AI demand forecasting and quantum optimization
                </p>
                <div className="flex items-center gap-2 text-indigo-600 font-semibold">
                  View Details <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </Link>

            {/* Procurement */}
            <Link href="/CognexiaAI_Procurement_Features.html" target="_blank">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2 h-full">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-600 to-orange-500 rounded-2xl flex items-center justify-center mb-6">
                  <ShoppingCart className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Procurement</h3>
                <p className="text-muted-foreground mb-4">
                  Intelligent procurement with autonomous purchasing and smart contracts
                </p>
                <div className="flex items-center gap-2 text-yellow-600 font-semibold">
                  View Details <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* LLM Solutions Section */}
        <div className="mb-20">
          <div className="mb-12">
            <h2 className="text-4xl font-bold text-center mb-4">CognexiaAI LLM Solutions</h2>
            <p className="text-xl text-center text-muted-foreground max-w-3xl mx-auto">
              Industry-specific AI models powered by advanced Large Language Models
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {/* Legal */}
            <Link href="/CognexiaAI_Legal_Features.html" target="_blank">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2 h-full">
                <div className="w-16 h-16 bg-gradient-to-br from-slate-700 to-slate-900 rounded-2xl flex items-center justify-center mb-6">
                  <Scale className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3">CognexiaAI Legal</h3>
                <p className="text-muted-foreground mb-4">
                  AI-powered legal research, contract analysis, and case management
                </p>
                <div className="flex items-center gap-2 text-slate-700 font-semibold">
                  View Details <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </Link>

            {/* Education */}
            <Link href="/CognexiaAI_Education_Features.html" target="_blank">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2 h-full">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-violet-500 rounded-2xl flex items-center justify-center mb-6">
                  <GraduationCap className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3">CognexiaAI Education</h3>
                <p className="text-muted-foreground mb-4">
                  Personalized learning, adaptive assessments, and intelligent tutoring systems
                </p>
                <div className="flex items-center gap-2 text-purple-600 font-semibold">
                  View Details <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </Link>

            {/* Healthcare */}
            <Link href="/CognexiaAI_Healthcare_Features.html" target="_blank">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2 h-full">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-600 to-blue-500 rounded-2xl flex items-center justify-center mb-6">
                  <HeartPulse className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3">CognexiaAI Healthcare</h3>
                <p className="text-muted-foreground mb-4">
                  AI diagnostics, patient care optimization, and medical research acceleration
                </p>
                <div className="flex items-center gap-2 text-cyan-600 font-semibold">
                  View Details <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </Link>

            {/* CodeX */}
            <Link href="/CognexiaAI_CodeX_Features.html" target="_blank">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2 h-full">
                <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-500 rounded-2xl flex items-center justify-center mb-6">
                  <Code className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3">CognexiaAI CodeX</h3>
                <p className="text-muted-foreground mb-4">
                  AI-powered code generation, review, and optimization for developers
                </p>
                <div className="flex items-center gap-2 text-green-600 font-semibold">
                  View Details <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </Link>

            {/* VideoGenX */}
            <Link href="/CognexiaAI_VideoGenX_Features.html" target="_blank">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2 h-full">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-600 to-red-500 rounded-2xl flex items-center justify-center mb-6">
                  <Video className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3">CognexiaAI VideoGenX</h3>
                <p className="text-muted-foreground mb-4">
                  AI video generation, editing, and content creation platform
                </p>
                <div className="flex items-center gap-2 text-orange-600 font-semibold">
                  View Details <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-800 dark:to-gray-700 rounded-3xl p-12 shadow-xl">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Experience the Future?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join the Industry 5.0 revolution today. No credit card required.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Link href="/register">
              <Button size="lg" className="text-lg px-10 py-7 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 font-semibold">
                Start Enterprise Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/">
              <Button size="lg" variant="outline" className="text-lg px-10 py-7 border-2 shadow-lg font-semibold">
                Back to Home
              </Button>
            </Link>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span>14-day Enterprise Trial</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span>No Credit Card Required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span>24/7 Enterprise Support</span>
            </div>
          </div>
        </div>
      </section>

    </div>
    <Footer />
    </>
  );
}
