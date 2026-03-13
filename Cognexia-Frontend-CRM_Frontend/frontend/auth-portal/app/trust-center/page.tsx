'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sparkles, CheckCircle2, ArrowRight, Shield, Lock, Award, FileCheck, Globe, Eye, Database, Server, AlertCircle, UserCheck } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function TrustCenterPage() {
  const certifications = [
    { name: 'CMMI Level 5', icon: Award, status: 'Certified', color: 'from-blue-600 to-cyan-500' },
    { name: 'ISO 27001', icon: Shield, status: 'Certified', color: 'from-purple-600 to-pink-500' },
    { name: 'SOC 2 Type II', icon: FileCheck, status: 'Certified', color: 'from-green-600 to-emerald-500' },
    { name: 'GDPR Compliant', icon: Lock, status: 'Compliant', color: 'from-orange-600 to-red-500' },
    { name: 'HIPAA Compliant', icon: UserCheck, status: 'Compliant', color: 'from-indigo-600 to-purple-500' },
    { name: 'ISO 9001', icon: Award, status: 'Certified', color: 'from-yellow-600 to-orange-500' }
  ];

  const securityMeasures = [
    {
      title: 'Data Encryption',
      description: 'AES-256 encryption at rest and TLS 1.3 for data in transit',
      icon: Lock,
      details: [
        'End-to-end encryption',
        'Key management with HSM',
        'Perfect forward secrecy',
        'Regular cryptographic audits'
      ]
    },
    {
      title: 'Access Control',
      description: 'Multi-factor authentication and role-based access',
      icon: UserCheck,
      details: [
        'MFA enforcement',
        'SSO integration (SAML, OAuth)',
        'Granular permissions',
        'Session management'
      ]
    },
    {
      title: 'Infrastructure Security',
      description: '24/7 monitoring and threat detection',
      icon: Server,
      details: [
        'DDoS protection',
        'Firewall & IDS/IPS',
        'Regular penetration testing',
        'Vulnerability scanning'
      ]
    },
    {
      title: 'Data Privacy',
      description: 'Compliance with global privacy regulations',
      icon: Eye,
      details: [
        'GDPR & CCPA compliant',
        'Data residency options',
        'Privacy by design',
        'Customer data ownership'
      ]
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
                <span className="text-sm font-medium text-blue-300">CMMI Level 5 Certified · ISO 27001 · SOC 2 Type II</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight">
                <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent animate-gradient">
                  Trust Center
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-blue-100 mb-4 font-light">
                Security, Compliance, and Privacy at Our Core
              </p>
              
              <p className="text-lg text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed">
                Your trust is our top priority. Learn about our commitment to security, compliance certifications, and data protection practices that keep your enterprise data safe.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-slate-400 mb-12">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                  <span>230+ Security Methods</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                  <span>6+ Major Certifications</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                  <span>24/7 SOC Monitoring</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/security">
                  <Button size="lg" className="text-lg px-10 py-7 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 font-semibold">
                    View Security Details
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button size="lg" variant="outline" className="text-lg px-10 py-7 border-2 border-blue-400 text-blue-100 hover:bg-blue-500/10 shadow-lg font-semibold">
                    Contact Security Team
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Certifications */}
        <section className="container mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Certifications & Compliance</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Independently verified and audited by leading certification bodies
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {certifications.map((cert, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2 text-center">
                <div className={`w-20 h-20 bg-gradient-to-br ${cert.color} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                  <cert.icon className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3">{cert.name}</h3>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-semibold text-green-700 dark:text-green-400">{cert.status}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Security Measures */}
        <section className="bg-white dark:bg-gray-900 py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold mb-4">Security Measures</h2>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                  Multi-layered security architecture protecting your data 24/7
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {securityMeasures.map((measure, index) => (
                  <div key={index} className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8 shadow-xl">
                    <div className="flex items-start gap-4 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center flex-shrink-0">
                        <measure.icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold mb-2">{measure.title}</h3>
                        <p className="text-muted-foreground">{measure.description}</p>
                      </div>
                    </div>
                    <ul className="space-y-2">
                      {measure.details.map((detail, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Transparency & Reports */}
        <section className="container mx-auto px-4 py-20">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Transparency Reports</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Regular audits and compliance documentation available on request
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl text-center">
                <FileCheck className="h-12 w-12 text-blue-600 mx-auto mb-6" />
                <h3 className="text-2xl font-bold mb-4">SOC 2 Report</h3>
                <p className="text-muted-foreground mb-6">
                  Annual Type II compliance report
                </p>
                <Button variant="outline" className="w-full">Request Report</Button>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl text-center">
                <Shield className="h-12 w-12 text-purple-600 mx-auto mb-6" />
                <h3 className="text-2xl font-bold mb-4">Penetration Test</h3>
                <p className="text-muted-foreground mb-6">
                  Quarterly security assessment
                </p>
                <Button variant="outline" className="w-full">Request Summary</Button>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl text-center">
                <Database className="h-12 w-12 text-green-600 mx-auto mb-6" />
                <h3 className="text-2xl font-bold mb-4">Data Processing</h3>
                <p className="text-muted-foreground mb-6">
                  GDPR Article 28 compliant DPA
                </p>
                <Link href="/dpa">
                  <Button variant="outline" className="w-full">View DPA</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Incident Response */}
        <section className="bg-white dark:bg-gray-900 py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-800 dark:to-gray-700 rounded-3xl p-12 shadow-xl border-2 border-orange-200 dark:border-orange-900">
              <div className="flex items-start gap-4 mb-6">
                <AlertCircle className="h-12 w-12 text-orange-600 flex-shrink-0" />
                <div>
                  <h2 className="text-3xl font-bold mb-4">Security Incident Response</h2>
                  <p className="text-muted-foreground text-lg mb-6">
                    Our dedicated Security Operations Center (SOC) monitors systems 24/7/365 to detect and respond to potential threats immediately.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span><strong>Immediate Detection:</strong> Real-time threat monitoring and alerting</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span><strong>Rapid Response:</strong> Incident response team available within minutes</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span><strong>Transparent Communication:</strong> Immediate notification to affected customers</span>
                    </li>
                  </ul>
                </div>
              </div>
              <Link href="/contact">
                <Button className="mt-6 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700">
                  Report Security Issue
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-blue-600 to-cyan-500 rounded-3xl p-12 shadow-2xl text-white text-center">
            <Shield className="h-16 w-16 mx-auto mb-6" />
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Questions About Security?</h2>
            <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
              Our security team is available to answer your questions and provide detailed documentation
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 font-semibold shadow-xl text-lg px-10 py-7">
                  Contact Security Team
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/security">
                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 font-semibold text-lg px-10 py-7">
                  View Full Security Page
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
