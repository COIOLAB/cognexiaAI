'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Brain, Sparkles, Shield, CheckCircle2, ArrowRight, Users, DollarSign, Truck, Package, ShoppingCart, Scale, GraduationCap, HeartPulse, Code, Video } from 'lucide-react';
import { AuthService } from '@/lib/auth-service';
import toast, { Toaster } from 'react-hot-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function HomePage() {
  const [isDemoLoading, setIsDemoLoading] = useState(false);

  const handleDemoLogin = async () => {
    setIsDemoLoading(true);
    try {
      const authData = await AuthService.demoLogin();
      AuthService.storeAuth(authData);
      toast.success('Demo ready! Redirecting...');
      setTimeout(() => {
        AuthService.redirectBasedOnRole(authData);
      }, 800);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Demo login failed. Please try again.');
    } finally {
      setIsDemoLoading(false);
    }
  };

  return (
    <>
      <Toaster position="top-center" />
      <Navbar />
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:60px_60px]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
        
        <div className="container relative mx-auto px-4 py-24 md:py-32">
          <div className="text-center max-w-5xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 mb-8 backdrop-blur-sm">
              <Sparkles className="h-4 w-4 text-blue-400" />
              <span className="text-sm font-medium text-blue-300">CMMI Level 5 Certified · ISO 27001 · SOC 2 Type II</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 tracking-tight">
              <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent animate-gradient">
                CognexiaAI ERP
              </span>
            </h1>
            
            <p className="text-2xl md:text-4xl text-blue-100 mb-4 font-light">
              Cognition Meets Precision
            </p>
            
            <p className="text-lg md:text-xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              Enterprise-Grade Industry 5.0 Platform with Quantum Intelligence, Holographic Experiences, and Predictive Analytics. Trusted by Fortune 500 companies worldwide.
            </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <Link href="/register">
              <Button size="lg" className="text-lg px-10 py-7 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 font-semibold">
                Start Enterprise Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-10 py-7 border-2 border-blue-400 text-blue-100 hover:bg-blue-500/10 shadow-lg font-semibold"
              onClick={handleDemoLogin}
              disabled={isDemoLoading}
            >
              {isDemoLoading ? 'Initializing...' : 'Live Demo'}
            </Button>
            <Link href="/login">
              <Button size="lg" variant="outline" className="text-lg px-10 py-7 border-2 border-slate-600 text-slate-300 hover:bg-slate-800 shadow-lg font-semibold">
                Sign In
              </Button>
            </Link>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-slate-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-400" />
              <span>14-day Enterprise Trial</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-400" />
              <span>No Credit Card Required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-400" />
              <span>24/7 Enterprise Support</span>
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

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="text-center p-8 rounded-2xl bg-white dark:bg-gray-800 shadow-xl">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-500 rounded-2xl flex items-center justify-center mb-6">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Industry 5.0 Technology</h3>
            <p className="text-muted-foreground">
              Quantum Intelligence, Holographic Experiences, and AR/VR Sales - technology others can only dream of
            </p>
          </div>

          <div className="text-center p-8 rounded-2xl bg-white dark:bg-gray-800 shadow-xl">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center mb-6">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-4">AI-First Platform</h3>
            <p className="text-muted-foreground">
              10+ AI services with neural networks, LLMs, and predictive analytics built right in
            </p>
          </div>

          <div className="text-center p-8 rounded-2xl bg-white dark:bg-gray-800 shadow-xl">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-500 rounded-2xl flex items-center justify-center mb-6">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Enterprise Security</h3>
            <p className="text-muted-foreground">
              230+ security methods with military-grade encryption and SOC 2 Type II compliance
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-5xl mx-auto bg-gradient-to-r from-blue-600 to-cyan-500 rounded-3xl p-12 shadow-2xl text-white">
          <h2 className="text-4xl font-bold text-center mb-12">Powered by Innovation</h2>
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold mb-2">83</div>
              <div className="text-blue-100">Database Entities</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">60+</div>
              <div className="text-blue-100">AI Services</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">200+</div>
              <div className="text-blue-100">ERP Fields</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">99.9%</div>
              <div className="text-blue-100">Uptime SLA</div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Products Section */}
      <section className="container mx-auto px-4 py-20 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">Our Products</h2>
          <p className="text-xl text-center text-muted-foreground mb-8 max-w-3xl mx-auto">
            Comprehensive Industry 5.0 ERP modules designed to transform your entire business operation
          </p>
          <div className="text-center mb-12">
            <Link href="/products">
              <Button size="lg" variant="outline" className="text-lg px-8 py-4 shadow-lg">
                View All Products
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* CRM Product */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center mb-6">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3">CognexiaAI CRM</h3>
              <p className="text-muted-foreground mb-4">
                Complete Customer Relationship Management with AI-powered insights, sales automation, and 360° customer intelligence.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Customer & Lead Management</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Sales Pipeline Automation</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Marketing Campaigns</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Support Ticket System</span>
                </li>
              </ul>
              <a href="/CognexiaAI_CRM_Brochure.html" target="_blank" className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-2">
                Learn more <ArrowRight className="h-4 w-4" />
              </a>
            </div>

            {/* HR Product */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-500 rounded-2xl flex items-center justify-center mb-6">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3">CognexiaAI HR</h3>
              <p className="text-muted-foreground mb-4">
                Intelligent Human Resource Management with AI recruitment, performance analytics, and quantum-optimized workforce planning.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Employee Lifecycle Management</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>AI-Powered Talent Acquisition</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Payroll & Benefits</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Performance Management</span>
                </li>
              </ul>
              <a href="/CognexiaAI_HR_Features.html" target="_blank" className="text-purple-600 hover:text-purple-700 font-semibold flex items-center gap-2">
                Learn more <ArrowRight className="h-4 w-4" />
              </a>
            </div>

            {/* Finance Product */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-500 rounded-2xl flex items-center justify-center mb-6">
                <DollarSign className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Finance & Accounting</h3>
              <p className="text-muted-foreground mb-4">
                Enterprise financial management with blockchain security, quantum risk analysis, and AI-powered forecasting.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>General Ledger & Accounts</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>AP/AR & Cash Management</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Financial Reporting</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Tax Management</span>
                </li>
              </ul>
              <a href="/CognexiaAI_Finance_Features.html" target="_blank" className="text-green-600 hover:text-green-700 font-semibold flex items-center gap-2">
                Learn more <ArrowRight className="h-4 w-4" />
              </a>
            </div>

            {/* Supply Chain Product */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-600 to-red-500 rounded-2xl flex items-center justify-center mb-6">
                <Truck className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Supply Chain</h3>
              <p className="text-muted-foreground mb-4">
                End-to-end supply chain visibility with IoT tracking, AI demand forecasting, and blockchain-verified logistics.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Supply Chain Planning</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Supplier Management</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Logistics & Transportation</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Real-Time Tracking</span>
                </li>
              </ul>
              <a href="/CognexiaAI_SupplyChain_Features.html" target="_blank" className="text-orange-600 hover:text-orange-700 font-semibold flex items-center gap-2">
                Learn more <ArrowRight className="h-4 w-4" />
              </a>
            </div>

            {/* Inventory Product */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-500 rounded-2xl flex items-center justify-center mb-6">
                <Package className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Inventory</h3>
              <p className="text-muted-foreground mb-4">
                Smart inventory management with AI-powered demand forecasting, IoT tracking, and quantum optimization.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Real-Time Inventory Tracking</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Multi-Warehouse Management</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>AI Demand Forecasting</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Blockchain Traceability</span>
                </li>
              </ul>
              <a href="/CognexiaAI_Inventory_Features.html" target="_blank" className="text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-2">
                Learn more <ArrowRight className="h-4 w-4" />
              </a>
            </div>

            {/* Procurement Product */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-600 to-orange-500 rounded-2xl flex items-center justify-center mb-6">
                <ShoppingCart className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Procurement</h3>
              <p className="text-muted-foreground mb-4">
                Intelligent procurement with autonomous purchasing, AI vendor selection, and smart contract automation.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Purchase Order Management</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Vendor Management</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>RFQ & Bidding System</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>AI Cost Optimization</span>
                </li>
              </ul>
              <a href="/CognexiaAI_Procurement_Features.html" target="_blank" className="text-yellow-600 hover:text-yellow-700 font-semibold flex items-center gap-2">
                Learn more <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* LLM Solutions Section */}
      <section className="container mx-auto px-4 py-20 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">CognexiaAI LLM Solutions</h2>
          <p className="text-xl text-center text-muted-foreground mb-8 max-w-3xl mx-auto">
            Industry-specific AI models powered by advanced Large Language Models for specialized domains
          </p>
          <div className="text-center mb-12">
            <Link href="/products">
              <Button size="lg" variant="outline" className="text-lg px-8 py-4 shadow-lg">
                Explore All LLM Solutions
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Legal AI */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-slate-700 to-slate-900 rounded-2xl flex items-center justify-center mb-6">
                <Scale className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3">CognexiaAI Legal</h3>
              <p className="text-muted-foreground mb-4">
                AI-powered legal research, document drafting, contract analysis, and case management for all practice areas.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>500+ Practice Area Features</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Criminal & Civil Law Support</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>AI Legal Document Generation</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>100M+ Legal Documents Database</span>
                </li>
              </ul>
              <a href="/CognexiaAI_Legal_Features.html" target="_blank" className="text-slate-700 hover:text-slate-900 font-semibold flex items-center gap-2">
                Learn more <ArrowRight className="h-4 w-4" />
              </a>
            </div>

            {/* Education AI */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-violet-500 rounded-2xl flex items-center justify-center mb-6">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3">CognexiaAI Education</h3>
              <p className="text-muted-foreground mb-4">
                Personalized learning, adaptive assessments, intelligent tutoring, and institutional management systems.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>400+ Education Features</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>AI Personal Tutor</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>50M+ Learning Resources</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>98% Learning Improvement</span>
                </li>
              </ul>
              <a href="/CognexiaAI_Education_Features.html" target="_blank" className="text-purple-600 hover:text-purple-700 font-semibold flex items-center gap-2">
                Learn more <ArrowRight className="h-4 w-4" />
              </a>
            </div>

            {/* Healthcare AI */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-600 to-blue-500 rounded-2xl flex items-center justify-center mb-6">
                <HeartPulse className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3">CognexiaAI Healthcare</h3>
              <p className="text-muted-foreground mb-4">
                AI diagnostics, patient care optimization, medical research acceleration, and EHR management.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>450+ Healthcare Features</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>97% Diagnostic Accuracy</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>10,000+ Disease Recognition</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>HIPAA & HL7 FHIR Compliant</span>
                </li>
              </ul>
              <a href="/CognexiaAI_Healthcare_Features.html" target="_blank" className="text-cyan-600 hover:text-cyan-700 font-semibold flex items-center gap-2">
                Learn more <ArrowRight className="h-4 w-4" />
              </a>
            </div>

            {/* CodeX */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-500 rounded-2xl flex items-center justify-center mb-6">
                <Code className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3">CognexiaAI CodeX</h3>
              <p className="text-muted-foreground mb-4">
                AI-powered code generation, intelligent debugging, code review, and optimization for developers.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>400+ Development Features</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>100+ Programming Languages</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>98% Code Accuracy</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>80% Development Speed Increase</span>
                </li>
              </ul>
              <a href="/CognexiaAI_CodeX_Features.html" target="_blank" className="text-green-600 hover:text-green-700 font-semibold flex items-center gap-2">
                Learn more <ArrowRight className="h-4 w-4" />
              </a>
            </div>

            {/* VideoGenX */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-600 to-red-500 rounded-2xl flex items-center justify-center mb-6">
                <Video className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3">CognexiaAI VideoGenX</h3>
              <p className="text-muted-foreground mb-4">
                AI video generation, professional editing, content creation, and social media optimization platform.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>350+ Video Creation Features</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Text-to-Video Generation</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>8K Resolution Support</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>90% Time Savings</span>
                </li>
              </ul>
              <a href="/CognexiaAI_VideoGenX_Features.html" target="_blank" className="text-orange-600 hover:text-orange-700 font-semibold flex items-center gap-2">
                Learn more <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">Why Teams Choose CognexiaAI</h2>
          <div className="space-y-6">
            {[
              'One-click migration from any CRM (Salesforce, HubSpot, SAP, Oracle, Zoho)',
              '100+ third-party integrations ready to use',
              'Universal data migration with field mapping and rollback',
              'Real-time analytics with 199+ methods',
              'Autonomous workflows with 400+ features',
              'Multi-tenant architecture with complete data isolation',
            ].map((benefit, index) => (
              <div key={index} className="flex items-start gap-4 p-6 rounded-xl bg-white dark:bg-gray-800 shadow-lg">
                <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                <p className="text-lg">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-800 dark:to-gray-700 rounded-3xl p-12 shadow-xl">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Experience the Future?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join the Industry 5.0 revolution today. No credit card required.
          </p>
          <Link href="/register">
            <Button size="lg" className="text-lg px-8 py-6 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 shadow-xl">
              Start Your Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

    </div>
    <Footer />
    </>
  );
}
