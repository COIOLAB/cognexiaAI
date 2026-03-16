'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Brain, Sparkles, Shield, Users, Target, Zap, Award, Globe, Heart, TrendingUp, CheckCircle2, ArrowRight, Rocket, Scale, GraduationCap, HeartPulse, Code, Video, Building2, MapPin, Mail, Phone } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function AboutPage() {
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
                <span className="text-sm font-medium text-blue-300">Leading Enterprise Innovation Since 2022</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight">
                <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent animate-gradient">
                  About CognexiaAI
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-blue-100 mb-4 font-light">
                Where Cognition Meets Precision
              </p>
              
              <p className="text-lg text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed">
                CognexiaAI is revolutionizing enterprise technology with Industry 5.0 solutions that combine quantum intelligence, holographic experiences, and AI-powered precision. Trusted by Fortune 500 companies worldwide.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/careers">
                  <Button size="lg" className="text-lg px-10 py-7 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 font-semibold">
                    Join Our Team
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button size="lg" variant="outline" className="text-lg px-10 py-7 border-2 border-blue-400 text-blue-100 hover:bg-blue-500/10 shadow-lg font-semibold">
                    Contact Us
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Mission & Vision Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <div className="bg-gradient-to-br from-blue-600 to-cyan-500 rounded-3xl p-10 shadow-2xl text-white">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6">
                <Target className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
              <p className="text-blue-50 text-lg leading-relaxed">
                To empower enterprises with Industry 5.0 technology that seamlessly blends human cognition with AI precision, creating intelligent systems that transform how businesses operate, innovate, and grow in the digital age.
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-600 to-pink-500 rounded-3xl p-10 shadow-2xl text-white">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6">
                <Rocket className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-4">Our Vision</h2>
              <p className="text-purple-50 text-lg leading-relaxed">
                To be the world's most trusted Industry 5.0 platform, setting the global standard for enterprise AI integration, quantum intelligence, and holographic experiences that redefine what's possible in business technology.
              </p>
            </div>
          </div>
        </section>

        {/* Company Story Section */}
        <section className="bg-white dark:bg-gray-900 py-20">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Our Story</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                From vision to global leadership in enterprise AI solutions
              </p>
            </div>

            <div className="space-y-12">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 rounded-full px-4 py-2 mb-4">
                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">2022 - Foundation</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-4">The Beginning</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    CognexiaAI was founded in 2022 as a proprietorship by a team of AI researchers, enterprise architects, and industry veterans with a singular vision: to create an ERP platform that doesn't just automate processes but truly understands business context through artificial intelligence.
                  </p>
                </div>
                <div className="bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900 dark:to-cyan-900 rounded-2xl p-12 flex items-center justify-center">
                  <Brain className="h-32 w-32 text-blue-600 dark:text-blue-400" />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 rounded-2xl p-12 flex items-center justify-center md:order-1">
                  <Award className="h-32 w-32 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="md:order-2">
                  <div className="inline-flex items-center gap-2 bg-purple-100 dark:bg-purple-900/30 rounded-full px-4 py-2 mb-4">
                    <span className="text-sm font-bold text-purple-600 dark:text-purple-400">2022-2025 - Rigorous Development</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Innovation & Excellence</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    We invested three years in rigorous research and development, building our Industry 5.0 platform with quantum intelligence, achieving CMMI Level 5 certification, and expanding our AI services to 60+ modules. Our commitment to excellence shaped every line of code and every feature.
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900/30 rounded-full px-4 py-2 mb-4">
                    <span className="text-sm font-bold text-green-600 dark:text-green-400">2025-Present - Global Impact</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Product Launch & Global Success</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    In 2025, we launched our comprehensive product suite including ERP modules and LLM solutions. Today, CognexiaAI serves 3,600+ clients globally across healthcare, finance, legal, education, and enterprise sectors. We continue to push the boundaries of AI-powered business technology.
                  </p>
                </div>
                <div className="bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 rounded-2xl p-12 flex items-center justify-center">
                  <Globe className="h-32 w-32 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Core Values Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Our Core Values</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                The principles that guide everything we do
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center mb-6">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Innovation First</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We push boundaries with Industry 5.0 technology, quantum intelligence, and AI innovations that set new standards in enterprise software.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-500 rounded-2xl flex items-center justify-center mb-6">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Customer Success</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Our customers' success is our success. We provide 24/7 enterprise support and continuously adapt to meet evolving business needs.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-500 rounded-2xl flex items-center justify-center mb-6">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Security & Trust</h3>
                <p className="text-muted-foreground leading-relaxed">
                  With 230+ security methods and SOC 2 Type II compliance, we protect enterprise data with military-grade encryption and zero-trust architecture.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-600 to-red-500 rounded-2xl flex items-center justify-center mb-6">
                  <Heart className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">People & Culture</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We foster a diverse, inclusive culture where every team member can innovate, grow, and make meaningful impact.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-600 to-orange-500 rounded-2xl flex items-center justify-center mb-6">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Continuous Excellence</h3>
                <p className="text-muted-foreground leading-relaxed">
                  CMMI Level 5 certification reflects our commitment to continuous improvement and operational excellence at every level.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-500 rounded-2xl flex items-center justify-center mb-6">
                  <Globe className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Global Impact</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We serve enterprises worldwide, breaking barriers with AI solutions that work across industries, cultures, and languages.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">CognexiaAI by the Numbers</h2>
              <div className="grid md:grid-cols-4 gap-8">
                <div className="text-center">
                  <div className="text-5xl md:text-6xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">3,600+</div>
                  <div className="text-blue-100 text-lg">Global Clients</div>
                </div>
                <div className="text-center">
                  <div className="text-5xl md:text-6xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-300 bg-clip-text text-transparent">60+</div>
                  <div className="text-blue-100 text-lg">AI Services</div>
                </div>
                <div className="text-center">
                  <div className="text-5xl md:text-6xl font-bold mb-2 bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent">99.9%</div>
                  <div className="text-blue-100 text-lg">Uptime SLA</div>
                </div>
                <div className="text-center">
                  <div className="text-5xl md:text-6xl font-bold mb-2 bg-gradient-to-r from-orange-400 to-red-300 bg-clip-text text-transparent">24/7</div>
                  <div className="text-blue-100 text-lg">Enterprise Support</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Solutions We Offer */}
        <section className="container mx-auto px-4 py-20">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Enterprise Solutions</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Comprehensive platforms designed for every industry
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Link href="/products" className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2">
                <div className="w-12 h-12 bg-gradient-to-br from-slate-600 to-purple-500 rounded-xl flex items-center justify-center mb-4">
                  <Scale className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">Legal AI</h3>
                <p className="text-sm text-muted-foreground">500+ features for legal practice management and AI-powered research</p>
              </Link>

              <Link href="/products" className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-violet-500 rounded-xl flex items-center justify-center mb-4">
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">Education AI</h3>
                <p className="text-sm text-muted-foreground">400+ features for personalized learning and educational excellence</p>
              </Link>

              <Link href="/products" className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-600 to-blue-500 rounded-xl flex items-center justify-center mb-4">
                  <HeartPulse className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">Healthcare AI</h3>
                <p className="text-sm text-muted-foreground">450+ features with 97% diagnostic accuracy and HIPAA compliance</p>
              </Link>

              <Link href="/products" className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2">
                <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-500 rounded-xl flex items-center justify-center mb-4">
                  <Code className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">CodeX</h3>
                <p className="text-sm text-muted-foreground">400+ features supporting 100+ programming languages</p>
              </Link>

              <Link href="/products" className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-600 to-red-500 rounded-xl flex items-center justify-center mb-4">
                  <Video className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">VideoGenX</h3>
                <p className="text-sm text-muted-foreground">350+ features for AI-powered video generation and editing</p>
              </Link>

              <Link href="/products" className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center mb-4">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">ERP Modules</h3>
                <p className="text-sm text-muted-foreground">CRM, Finance, HR, Supply Chain, Inventory, Procurement & more</p>
              </Link>
            </div>
          </div>
        </section>

        {/* Certifications & Awards */}
        <section className="bg-white dark:bg-gray-900 py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold mb-4">Certifications & Compliance</h2>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                  Industry-leading standards and certifications
                </p>
              </div>

              <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[
                  'CMMI Level 5',
                  'ISO 27001',
                  'SOC 2 Type II',
                  'HIPAA Compliant',
                  'GDPR Compliant',
                  'HL7 FHIR',
                  'FERPA',
                  'COPPA',
                  'OWASP Top 10',
                  'PCI DSS',
                  'NIST Framework',
                  'Zero Trust Architecture'
                ].map((cert) => (
                  <div key={cert} className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6 text-center border-2 border-blue-200 dark:border-blue-800">
                    <Award className="h-8 w-8 text-blue-600 dark:text-blue-400 mx-auto mb-3" />
                    <p className="font-bold text-sm">{cert}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Contact Info Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-blue-600 to-cyan-500 rounded-3xl p-12 shadow-2xl text-white">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Get in Touch</h2>
              <p className="text-blue-100 text-lg">
                Have questions? Want to learn more? Our team is here to help.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="text-center">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-bold mb-2">Headquarters</h3>
                <p className="text-blue-100 text-sm">Global Innovation Center<br />Enterprise District</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Mail className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-bold mb-2">Email</h3>
                <p className="text-blue-100 text-sm">info@cognexiaai.com<br />support@cognexiaai.com</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Phone className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-bold mb-2">Support</h3>
                <p className="text-blue-100 text-sm">24/7 Enterprise Support<br />Global Presence</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 font-semibold shadow-xl">
                  Contact Sales
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/careers">
                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 font-semibold">
                  View Open Positions
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Transform Your Enterprise?</h2>
            <p className="text-xl text-muted-foreground mb-10 max-w-3xl mx-auto">
              Join 3,600+ global clients who trust CognexiaAI for their mission-critical operations
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="text-lg px-10 py-7 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 shadow-2xl font-semibold">
                  Start Enterprise Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/products">
                <Button size="lg" variant="outline" className="text-lg px-10 py-7 shadow-lg font-semibold">
                  Explore Products
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
