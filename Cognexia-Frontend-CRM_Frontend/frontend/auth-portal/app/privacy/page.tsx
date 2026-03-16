'use client';

import Link from 'next/link';
import { Shield, CheckCircle2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function PrivacyPolicyPage() {
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
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl flex items-center justify-center">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold">Privacy Policy</h1>
                  <p className="text-slate-300 mt-2">Last Updated: January 29, 2026</p>
                </div>
              </div>
              <p className="text-xl text-blue-100">
                Your privacy is our priority. Learn how we protect and handle your data with CMMI Level 5 certified processes.
              </p>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12 space-y-8">
              
              {/* Introduction */}
              <div>
                <h2 className="text-3xl font-bold mb-4">1. Introduction</h2>
                <p className="text-muted-foreground leading-relaxed">
                  CognexiaAI ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Enterprise Resource Planning (ERP) platform and related services (collectively, the "Services"). Our privacy practices are certified under CMMI Level 5, ISO 27001, and SOC 2 Type II standards.
                </p>
              </div>

              {/* Information We Collect */}
              <div>
                <h2 className="text-3xl font-bold mb-4">2. Information We Collect</h2>
                
                <h3 className="text-xl font-semibold mb-3 mt-6">2.1 Information You Provide</h3>
                <ul className="space-y-2 text-muted-foreground ml-6">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Account Information:</strong> Name, email address, phone number, company name, job title, and password</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Business Data:</strong> Customer records, employee information, financial data, inventory data, and other business-related information you input into our Services</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Payment Information:</strong> Billing address, payment card details (processed securely through PCI-DSS compliant payment processors)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Communications:</strong> Support requests, feedback, and other communications with us</span>
                  </li>
                </ul>

                <h3 className="text-xl font-semibold mb-3 mt-6">2.2 Automatically Collected Information</h3>
                <ul className="space-y-2 text-muted-foreground ml-6">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Usage Data:</strong> Pages viewed, features used, time spent, click patterns, and session information</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Device Information:</strong> IP address, browser type, operating system, device identifiers, and network information</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Cookies and Tracking Technologies:</strong> Session cookies, persistent cookies, web beacons, and similar technologies</span>
                  </li>
                </ul>
              </div>

              {/* How We Use Your Information */}
              <div>
                <h2 className="text-3xl font-bold mb-4">3. How We Use Your Information</h2>
                <p className="text-muted-foreground mb-4">We use the collected information for the following purposes:</p>
                <ul className="space-y-2 text-muted-foreground ml-6">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Service Delivery:</strong> Provide, maintain, and improve our ERP platform and Services</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span><strong>AI and Analytics:</strong> Train AI models, generate insights, and provide predictive analytics (only with aggregated, anonymized data)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Communication:</strong> Send service updates, security alerts, technical notices, and support responses</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Security:</strong> Detect, prevent, and respond to fraud, security threats, and illegal activities</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Compliance:</strong> Comply with legal obligations, regulatory requirements, and law enforcement requests</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Marketing:</strong> Send promotional materials and updates (with your consent, and you may opt-out anytime)</span>
                  </li>
                </ul>
              </div>

              {/* Data Sharing and Disclosure */}
              <div>
                <h2 className="text-3xl font-bold mb-4">4. Data Sharing and Disclosure</h2>
                <p className="text-muted-foreground mb-4">We do not sell your personal information. We may share your information in the following circumstances:</p>
                <ul className="space-y-3 text-muted-foreground ml-6">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong>Service Providers:</strong> Third-party vendors who perform services on our behalf (cloud hosting, payment processing, analytics). All service providers are bound by strict data protection agreements.
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong>Business Transfers:</strong> In connection with mergers, acquisitions, or sale of assets, subject to confidentiality obligations.
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong>Legal Requirements:</strong> When required by law, court order, or government investigation.
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong>With Your Consent:</strong> Any other sharing with your explicit permission.
                    </div>
                  </li>
                </ul>
              </div>

              {/* Data Security */}
              <div>
                <h2 className="text-3xl font-bold mb-4">5. Data Security</h2>
                <p className="text-muted-foreground mb-4">
                  We implement comprehensive security measures aligned with CMMI Level 5, ISO 27001, and SOC 2 Type II standards:
                </p>
                <ul className="space-y-2 text-muted-foreground ml-6">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Encryption:</strong> AES-256 encryption at rest and TLS 1.3 in transit</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Access Controls:</strong> Multi-factor authentication, role-based access control, and principle of least privilege</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Monitoring:</strong> 24/7 security monitoring, intrusion detection, and incident response</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Infrastructure:</strong> Enterprise-grade cloud infrastructure with redundancy and disaster recovery</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Regular Audits:</strong> Annual third-party security audits and penetration testing</span>
                  </li>
                </ul>
              </div>

              {/* Your Rights */}
              <div>
                <h2 className="text-3xl font-bold mb-4">6. Your Privacy Rights</h2>
                <p className="text-muted-foreground mb-4">
                  Depending on your location, you may have the following rights regarding your personal information:
                </p>
                <ul className="space-y-2 text-muted-foreground ml-6">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Access:</strong> Request access to your personal information</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Correction:</strong> Request correction of inaccurate or incomplete data</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Deletion:</strong> Request deletion of your personal information (subject to legal retention requirements)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Data Portability:</strong> Request a copy of your data in a structured, machine-readable format</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Opt-Out:</strong> Unsubscribe from marketing communications</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Object:</strong> Object to processing of your personal information</span>
                  </li>
                </ul>
                <p className="text-muted-foreground mt-4">
                  To exercise these rights, contact us at <a href="mailto:privacy@cognexiaai.com" className="text-blue-600 hover:underline">privacy@cognexiaai.com</a>
                </p>
              </div>

              {/* Data Retention */}
              <div>
                <h2 className="text-3xl font-bold mb-4">7. Data Retention</h2>
                <p className="text-muted-foreground">
                  We retain your information for as long as necessary to provide Services and comply with legal obligations. Account data is retained while your account is active. After account closure, we retain data for 90 days for recovery purposes, then securely delete it unless required by law to retain longer. Backup data may be retained up to 1 year for disaster recovery purposes.
                </p>
              </div>

              {/* International Data Transfers */}
              <div>
                <h2 className="text-3xl font-bold mb-4">8. International Data Transfers</h2>
                <p className="text-muted-foreground">
                  Your information may be transferred to and processed in countries other than your country of residence. We ensure appropriate safeguards are in place, including Standard Contractual Clauses approved by the European Commission, to protect your data in accordance with this Privacy Policy and applicable data protection laws.
                </p>
              </div>

              {/* Children's Privacy */}
              <div>
                <h2 className="text-3xl font-bold mb-4">9. Children's Privacy</h2>
                <p className="text-muted-foreground">
                  Our Services are not intended for individuals under 18 years of age. We do not knowingly collect personal information from children. If we learn that we have collected information from a child under 18, we will promptly delete it.
                </p>
              </div>

              {/* Changes to Privacy Policy */}
              <div>
                <h2 className="text-3xl font-bold mb-4">10. Changes to This Privacy Policy</h2>
                <p className="text-muted-foreground">
                  We may update this Privacy Policy periodically. We will notify you of material changes by email or prominent notice on our Services at least 30 days before the changes take effect. Your continued use of the Services after changes constitutes acceptance of the updated Privacy Policy.
                </p>
              </div>

              {/* Contact Us */}
              <div>
                <h2 className="text-3xl font-bold mb-4">11. Contact Us</h2>
                <p className="text-muted-foreground mb-4">
                  For questions, concerns, or requests regarding this Privacy Policy or our data practices, contact us:
                </p>
                <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-6 space-y-2 text-muted-foreground">
                  <p><strong>Email:</strong> <a href="mailto:privacy@cognexiaai.com" className="text-blue-600 hover:underline">privacy@cognexiaai.com</a></p>
                  <p><strong>Data Protection Officer:</strong> <a href="mailto:dpo@cognexiaai.com" className="text-blue-600 hover:underline">dpo@cognexiaai.com</a></p>
                  <p><strong>Phone:</strong> <a href="tel:+919167422630" className="text-blue-600 hover:underline">+91-9167422630</a></p>
                  <p><strong>Address:</strong> CognexiaAI, Mumbai, India</p>
                </div>
              </div>

              {/* GDPR & CCPA Compliance Notice */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <Shield className="h-6 w-6 text-blue-600" />
                  GDPR & CCPA Compliance
                </h3>
                <p className="text-muted-foreground">
                  We are committed to compliance with the General Data Protection Regulation (GDPR) for EU residents and the California Consumer Privacy Act (CCPA) for California residents. If you are located in the EU or California, you have additional rights as outlined in this Privacy Policy. For specific GDPR or CCPA requests, please contact our Data Protection Officer.
                </p>
              </div>

            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
