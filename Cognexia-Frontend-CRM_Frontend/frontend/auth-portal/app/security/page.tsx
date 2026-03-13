'use client';

import Link from 'next/link';
import { Shield, CheckCircle2, ArrowLeft, Lock, Server, Eye, FileCheck, Award, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function SecurityCompliancePage() {
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
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-400 rounded-2xl flex items-center justify-center">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold">Security & Compliance</h1>
                  <p className="text-slate-300 mt-2">Enterprise-Grade Protection | CMMI Level 5 Certified</p>
                </div>
              </div>
              <p className="text-xl text-blue-100">
                World-class security infrastructure and compliance certifications protecting your business-critical data.
              </p>
            </div>
          </div>
        </section>

        {/* Certifications Banner */}
        <section className="bg-white dark:bg-slate-900 border-y border-gray-200 dark:border-gray-800 py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-center text-2xl font-bold mb-8">Industry-Leading Certifications</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-800 dark:to-gray-700 rounded-xl">
                <Award className="h-12 w-12 mx-auto mb-3 text-blue-600" />
                <h3 className="font-bold text-lg">CMMI Level 5</h3>
                <p className="text-sm text-muted-foreground">Optimizing</p>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-700 rounded-xl">
                <Shield className="h-12 w-12 mx-auto mb-3 text-green-600" />
                <h3 className="font-bold text-lg">ISO 27001</h3>
                <p className="text-sm text-muted-foreground">Certified</p>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-700 rounded-xl">
                <FileCheck className="h-12 w-12 mx-auto mb-3 text-purple-600" />
                <h3 className="font-bold text-lg">SOC 2 Type II</h3>
                <p className="text-sm text-muted-foreground">Audited</p>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-800 dark:to-gray-700 rounded-xl">
                <Lock className="h-12 w-12 mx-auto mb-3 text-orange-600" />
                <h3 className="font-bold text-lg">GDPR</h3>
                <p className="text-sm text-muted-foreground">Compliant</p>
              </div>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-6xl mx-auto space-y-16">
            
            {/* Security Infrastructure */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12">
              <div className="flex items-center gap-3 mb-6">
                <Server className="h-8 w-8 text-blue-600" />
                <h2 className="text-3xl font-bold">Security Infrastructure</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mt-8">
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                  <h3 className="text-xl font-semibold mb-4">Data Encryption</h3>
                  <ul className="space-y-3 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span><strong>At Rest:</strong> AES-256 encryption for all stored data</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span><strong>In Transit:</strong> TLS 1.3 for all data transmission</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span><strong>Database:</strong> Encrypted database connections and backups</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span><strong>Keys:</strong> Hardware Security Modules (HSM) for key management</span>
                    </li>
                  </ul>
                </div>

                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                  <h3 className="text-xl font-semibold mb-4">Access Control</h3>
                  <ul className="space-y-3 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span><strong>MFA:</strong> Multi-factor authentication required</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span><strong>RBAC:</strong> Role-based access control with least privilege</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span><strong>SSO:</strong> Single sign-on with SAML 2.0 support</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span><strong>Session:</strong> Automatic timeout and secure session management</span>
                    </li>
                  </ul>
                </div>

                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                  <h3 className="text-xl font-semibold mb-4">Network Security</h3>
                  <ul className="space-y-3 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                      <span><strong>Firewall:</strong> Next-generation firewall with IPS/IDS</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                      <span><strong>DDoS:</strong> Advanced DDoS protection and mitigation</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                      <span><strong>WAF:</strong> Web application firewall protecting all endpoints</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                      <span><strong>VPN:</strong> Secure VPN access for administrative tasks</span>
                    </li>
                  </ul>
                </div>

                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                  <h3 className="text-xl font-semibold mb-4">Monitoring & Detection</h3>
                  <ul className="space-y-3 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                      <span><strong>24/7 SOC:</strong> Security Operations Center monitoring</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                      <span><strong>SIEM:</strong> Real-time security event correlation</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                      <span><strong>Anomaly:</strong> AI-powered anomaly detection</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                      <span><strong>Alerts:</strong> Instant security incident notifications</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Compliance Frameworks */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12">
              <div className="flex items-center gap-3 mb-6">
                <FileCheck className="h-8 w-8 text-green-600" />
                <h2 className="text-3xl font-bold">Compliance Frameworks</h2>
              </div>

              <div className="space-y-6">
                <div className="border-l-4 border-blue-600 pl-6 py-4">
                  <h3 className="text-2xl font-semibold mb-3">CMMI Level 5 - Optimizing</h3>
                  <p className="text-muted-foreground mb-4">
                    Capability Maturity Model Integration (CMMI) Level 5 represents the highest level of process maturity, demonstrating continuous process improvement and optimization.
                  </p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span>Quantitative process management and optimization</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span>Continuous improvement culture and innovation</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span>Data-driven decision making and risk management</span>
                    </li>
                  </ul>
                </div>

                <div className="border-l-4 border-green-600 pl-6 py-4">
                  <h3 className="text-2xl font-semibold mb-3">ISO 27001:2022</h3>
                  <p className="text-muted-foreground mb-4">
                    International standard for Information Security Management Systems (ISMS), ensuring comprehensive security controls.
                  </p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>114 security controls across 14 domains</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Annual third-party audits and recertification</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Risk-based approach to information security</span>
                    </li>
                  </ul>
                </div>

                <div className="border-l-4 border-purple-600 pl-6 py-4">
                  <h3 className="text-2xl font-semibold mb-3">SOC 2 Type II</h3>
                  <p className="text-muted-foreground mb-4">
                    Service Organization Control report demonstrating operational effectiveness over an extended period.
                  </p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                      <span>Security, Availability, Processing Integrity, Confidentiality, Privacy</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                      <span>Independent auditor testing over 6+ months</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                      <span>Annual re-audit and compliance verification</span>
                    </li>
                  </ul>
                </div>

                <div className="border-l-4 border-orange-600 pl-6 py-4">
                  <h3 className="text-2xl font-semibold mb-3">GDPR & Data Privacy</h3>
                  <p className="text-muted-foreground mb-4">
                    General Data Protection Regulation compliance ensuring EU data subject rights and privacy.
                  </p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                      <span>Data Protection Officer (DPO) appointed</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                      <span>Data Processing Agreements with all vendors</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                      <span>Privacy by Design and Default principles</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                      <span>Data breach notification within 72 hours</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Security Practices */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12">
              <div className="flex items-center gap-3 mb-6">
                <Eye className="h-8 w-8 text-indigo-600" />
                <h2 className="text-3xl font-bold">Security Practices</h2>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-6 border border-gray-200 dark:border-gray-700 rounded-xl">
                  <Zap className="h-12 w-12 mx-auto mb-4 text-yellow-600" />
                  <h3 className="font-semibold text-lg mb-2">Penetration Testing</h3>
                  <p className="text-sm text-muted-foreground">
                    Quarterly penetration testing by certified ethical hackers to identify vulnerabilities
                  </p>
                </div>

                <div className="text-center p-6 border border-gray-200 dark:border-gray-700 rounded-xl">
                  <Shield className="h-12 w-12 mx-auto mb-4 text-green-600" />
                  <h3 className="font-semibold text-lg mb-2">Vulnerability Scanning</h3>
                  <p className="text-sm text-muted-foreground">
                    Continuous automated scanning and patching of security vulnerabilities
                  </p>
                </div>

                <div className="text-center p-6 border border-gray-200 dark:border-gray-700 rounded-xl">
                  <FileCheck className="h-12 w-12 mx-auto mb-4 text-blue-600" />
                  <h3 className="font-semibold text-lg mb-2">Security Training</h3>
                  <p className="text-sm text-muted-foreground">
                    Mandatory security awareness training for all employees quarterly
                  </p>
                </div>
              </div>
            </div>

            {/* Data Protection */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8 md:p-12">
              <h2 className="text-3xl font-bold mb-6">Data Protection & Privacy</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xl font-semibold mb-4">Data Residency</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span>Multi-region data centers with geographic redundancy</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span>Choose data storage location by region</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span>Data sovereignty compliance for local regulations</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-4">Backup & Recovery</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Automated daily backups with 30-day retention</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Point-in-time recovery for disaster scenarios</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Geo-redundant backup storage across multiple regions</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Contact Security Team */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12">
              <h2 className="text-3xl font-bold mb-4">Security & Compliance Contacts</h2>
              <p className="text-muted-foreground mb-6">
                For security inquiries, compliance questions, or to report vulnerabilities:
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-6">
                  <h3 className="font-semibold mb-3">Security Team</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    <strong>Email:</strong> <a href="mailto:security@cognexiaai.com" className="text-blue-600 hover:underline">security@cognexiaai.com</a>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <strong>Vulnerability Reports:</strong> <a href="mailto:security@cognexiaai.com" className="text-blue-600 hover:underline">security@cognexiaai.com</a>
                  </p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-6">
                  <h3 className="font-semibold mb-3">Compliance Team</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    <strong>Email:</strong> <a href="mailto:compliance@cognexiaai.com" className="text-blue-600 hover:underline">compliance@cognexiaai.com</a>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <strong>DPO:</strong> <a href="mailto:dpo@cognexiaai.com" className="text-blue-600 hover:underline">dpo@cognexiaai.com</a>
                  </p>
                </div>
              </div>
            </div>

          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
