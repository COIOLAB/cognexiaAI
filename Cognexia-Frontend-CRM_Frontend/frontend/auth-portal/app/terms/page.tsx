'use client';

import Link from 'next/link';
import { FileText, CheckCircle2, ArrowLeft, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function TermsOfServicePage() {
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
                  <FileText className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold">Terms of Service</h1>
                  <p className="text-slate-300 mt-2">Last Updated: January 29, 2026</p>
                </div>
              </div>
              <p className="text-xl text-blue-100">
                Please read these terms carefully before using our Services. By accessing or using CognexiaAI, you agree to be bound by these Terms.
              </p>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12 space-y-8">
              
              {/* Acceptance of Terms */}
              <div>
                <h2 className="text-3xl font-bold mb-4">1. Acceptance of Terms</h2>
                <p className="text-muted-foreground leading-relaxed">
                  These Terms of Service ("Terms") constitute a legally binding agreement between you (either an individual or entity, "you" or "Customer") and CognexiaAI ("Company", "we", "us", or "our") governing your access to and use of the CognexiaAI Enterprise Resource Planning platform, including any related services, features, content, and applications (collectively, the "Services"). By creating an account, accessing, or using our Services, you acknowledge that you have read, understood, and agree to be bound by these Terms and our Privacy Policy.
                </p>
              </div>

              {/* Services Description */}
              <div>
                <h2 className="text-3xl font-bold mb-4">2. Services Description</h2>
                <p className="text-muted-foreground mb-4">
                  CognexiaAI provides an enterprise-grade Industry 5.0 ERP platform with the following core capabilities:
                </p>
                <ul className="space-y-2 text-muted-foreground ml-6">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span><strong>CRM Module:</strong> Customer relationship management, sales automation, and marketing campaigns</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span><strong>HR Module:</strong> Human resource management, recruitment, payroll, and performance tracking</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Finance Module:</strong> Accounting, financial reporting, and forecasting</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Supply Chain & Inventory:</strong> Logistics, warehouse management, and procurement</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span><strong>AI Services:</strong> Machine learning models, predictive analytics, and automation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Industry-Specific Solutions:</strong> Legal, Education, Healthcare, CodeX, and VideoGenX modules</span>
                  </li>
                </ul>
              </div>

              {/* Account Registration and Eligibility */}
              <div>
                <h2 className="text-3xl font-bold mb-4">3. Account Registration and Eligibility</h2>
                
                <h3 className="text-xl font-semibold mb-3 mt-6">3.1 Eligibility</h3>
                <p className="text-muted-foreground mb-4">
                  You must be at least 18 years old and have the legal capacity to enter into contracts in your jurisdiction. If you are registering on behalf of an organization, you represent that you have the authority to bind that organization to these Terms.
                </p>

                <h3 className="text-xl font-semibold mb-3 mt-6">3.2 Account Security</h3>
                <p className="text-muted-foreground mb-4">
                  You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must:
                </p>
                <ul className="space-y-2 text-muted-foreground ml-6">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Use a strong, unique password and enable multi-factor authentication</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Notify us immediately of any unauthorized access or security breach</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Provide accurate, current, and complete information during registration</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Not share your account credentials with unauthorized third parties</span>
                  </li>
                </ul>
              </div>

              {/* License and Restrictions */}
              <div>
                <h2 className="text-3xl font-bold mb-4">4. License and Usage Restrictions</h2>
                
                <h3 className="text-xl font-semibold mb-3 mt-6">4.1 Limited License</h3>
                <p className="text-muted-foreground mb-4">
                  Subject to your compliance with these Terms and payment of applicable fees, we grant you a limited, non-exclusive, non-transferable, revocable license to access and use the Services for your internal business purposes.
                </p>

                <h3 className="text-xl font-semibold mb-3 mt-6">4.2 Prohibited Activities</h3>
                <p className="text-muted-foreground mb-4">You agree NOT to:</p>
                <ul className="space-y-2 text-muted-foreground ml-6">
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <span>Reverse engineer, decompile, or disassemble any part of the Services</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <span>Rent, lease, sublicense, sell, or transfer access to the Services</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <span>Use the Services for illegal purposes or violate any laws</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <span>Interfere with or disrupt the integrity or performance of the Services</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <span>Attempt unauthorized access to our systems or networks</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <span>Use automated systems (bots, scrapers) without our written permission</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <span>Upload malicious code, viruses, or harmful content</span>
                  </li>
                </ul>
              </div>

              {/* Customer Data */}
              <div>
                <h2 className="text-3xl font-bold mb-4">5. Customer Data</h2>
                
                <h3 className="text-xl font-semibold mb-3 mt-6">5.1 Ownership</h3>
                <p className="text-muted-foreground mb-4">
                  You retain all ownership rights in your data, content, and information that you submit, upload, or input into the Services ("Customer Data"). We do not claim ownership of Customer Data.
                </p>

                <h3 className="text-xl font-semibold mb-3 mt-6">5.2 License to Process</h3>
                <p className="text-muted-foreground mb-4">
                  You grant us a limited license to access, store, process, and transmit Customer Data solely to provide the Services and as required by law. We will process Customer Data in accordance with our Privacy Policy and applicable data protection regulations (GDPR, CCPA, etc.).
                </p>

                <h3 className="text-xl font-semibold mb-3 mt-6">5.3 Data Responsibility</h3>
                <p className="text-muted-foreground mb-4">
                  You are solely responsible for the accuracy, quality, and legality of Customer Data. You represent that you have obtained all necessary rights and consents to submit Customer Data to our Services.
                </p>
              </div>

              {/* Fees and Payment */}
              <div>
                <h2 className="text-3xl font-bold mb-4">6. Fees and Payment</h2>
                
                <h3 className="text-xl font-semibold mb-3 mt-6">6.1 Subscription Fees</h3>
                <p className="text-muted-foreground mb-4">
                  Access to certain Services requires payment of subscription fees. Fees are based on your selected plan and usage. All fees are non-refundable unless otherwise stated or required by law.
                </p>

                <h3 className="text-xl font-semibold mb-3 mt-6">6.2 Billing</h3>
                <p className="text-muted-foreground mb-4">
                  Subscription fees are billed in advance on a monthly or annual basis. By providing payment information, you authorize us to charge all fees incurred. Failure to pay fees may result in suspension or termination of your account.
                </p>

                <h3 className="text-xl font-semibold mb-3 mt-6">6.3 Price Changes</h3>
                <p className="text-muted-foreground mb-4">
                  We reserve the right to modify pricing with 30 days' notice. Continued use after the notice period constitutes acceptance of new pricing.
                </p>
              </div>

              {/* Intellectual Property */}
              <div>
                <h2 className="text-3xl font-bold mb-4">7. Intellectual Property Rights</h2>
                <p className="text-muted-foreground mb-4">
                  The Services, including all software, algorithms, AI models, user interfaces, designs, trademarks, and content (excluding Customer Data), are owned by CognexiaAI and protected by intellectual property laws. All rights not expressly granted are reserved. You may not use our trademarks or branding without our prior written consent.
                </p>
              </div>

              {/* Service Level Agreement */}
              <div>
                <h2 className="text-3xl font-bold mb-4">8. Service Level Agreement (SLA)</h2>
                <p className="text-muted-foreground mb-4">
                  We commit to maintaining 99.9% uptime for our Services, measured monthly. Details of our SLA, including uptime calculations, maintenance windows, and service credits, are available in our separate <Link href="/sla" className="text-blue-600 hover:underline">Service Level Agreement document</Link>.
                </p>
              </div>

              {/* Warranties and Disclaimers */}
              <div>
                <h2 className="text-3xl font-bold mb-4">9. Warranties and Disclaimers</h2>
                
                <h3 className="text-xl font-semibold mb-3 mt-6">9.1 Service Warranty</h3>
                <p className="text-muted-foreground mb-4">
                  We warrant that the Services will perform substantially in accordance with our documentation. This warranty does not cover issues caused by misuse, unauthorized modifications, or third-party services.
                </p>

                <h3 className="text-xl font-semibold mb-3 mt-6">9.2 Disclaimer</h3>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
                  <p className="text-muted-foreground">
                    <strong>EXCEPT AS EXPRESSLY PROVIDED, THE SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. WE DISCLAIM ALL IMPLIED WARRANTIES INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICES WILL BE UNINTERRUPTED, ERROR-FREE, OR COMPLETELY SECURE.</strong>
                  </p>
                </div>
              </div>

              {/* Limitation of Liability */}
              <div>
                <h2 className="text-3xl font-bold mb-4">10. Limitation of Liability</h2>
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
                  <p className="text-muted-foreground mb-4">
                    <strong>TO THE MAXIMUM EXTENT PERMITTED BY LAW:</strong>
                  </p>
                  <ul className="space-y-2 text-muted-foreground ml-6">
                    <li className="flex items-start gap-2">
                      <span className="font-semibold">•</span>
                      <span>IN NO EVENT SHALL COGNEXIAAI BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOST PROFITS, LOST DATA, OR BUSINESS INTERRUPTION.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-semibold">•</span>
                      <span>OUR TOTAL LIABILITY FOR ANY CLAIM SHALL NOT EXCEED THE AMOUNT YOU PAID US IN THE 12 MONTHS PRECEDING THE CLAIM.</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Indemnification */}
              <div>
                <h2 className="text-3xl font-bold mb-4">11. Indemnification</h2>
                <p className="text-muted-foreground">
                  You agree to indemnify, defend, and hold harmless CognexiaAI and its officers, directors, employees, and agents from any claims, losses, damages, liabilities, and expenses (including attorneys' fees) arising from: (a) your use of the Services; (b) your violation of these Terms; (c) your Customer Data; or (d) your violation of any rights of third parties.
                </p>
              </div>

              {/* Term and Termination */}
              <div>
                <h2 className="text-3xl font-bold mb-4">12. Term and Termination</h2>
                
                <h3 className="text-xl font-semibold mb-3 mt-6">12.1 Term</h3>
                <p className="text-muted-foreground mb-4">
                  These Terms commence when you first access the Services and continue until terminated.
                </p>

                <h3 className="text-xl font-semibold mb-3 mt-6">12.2 Termination by You</h3>
                <p className="text-muted-foreground mb-4">
                  You may terminate your account at any time through your account settings or by contacting support.
                </p>

                <h3 className="text-xl font-semibold mb-3 mt-6">12.3 Termination by Us</h3>
                <p className="text-muted-foreground mb-4">
                  We may suspend or terminate your access immediately if you violate these Terms, fail to pay fees, or if required by law. We will provide notice where reasonably possible.
                </p>

                <h3 className="text-xl font-semibold mb-3 mt-6">12.4 Effect of Termination</h3>
                <p className="text-muted-foreground mb-4">
                  Upon termination, your right to access the Services ceases. You may export your Customer Data within 30 days. After this period, we may delete your data in accordance with our data retention policies.
                </p>
              </div>

              {/* Governing Law */}
              <div>
                <h2 className="text-3xl font-bold mb-4">13. Governing Law and Dispute Resolution</h2>
                <p className="text-muted-foreground mb-4">
                  These Terms are governed by the laws of India, without regard to conflict of law principles. Any disputes shall be resolved through binding arbitration in Mumbai, India, under the Arbitration and Conciliation Act, 1996. You waive any right to jury trial or class action.
                </p>
              </div>

              {/* Changes to Terms */}
              <div>
                <h2 className="text-3xl font-bold mb-4">14. Changes to Terms</h2>
                <p className="text-muted-foreground">
                  We may modify these Terms at any time. Material changes will be communicated via email or platform notification at least 30 days before taking effect. Your continued use of the Services after changes constitutes acceptance. If you disagree, you must discontinue use and may terminate your account.
                </p>
              </div>

              {/* General Provisions */}
              <div>
                <h2 className="text-3xl font-bold mb-4">15. General Provisions</h2>
                <ul className="space-y-3 text-muted-foreground ml-6">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong>Entire Agreement:</strong> These Terms, Privacy Policy, and SLA constitute the entire agreement between you and CognexiaAI.
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong>Severability:</strong> If any provision is found unenforceable, the remaining provisions remain in full effect.
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong>No Waiver:</strong> Failure to enforce any provision does not constitute a waiver.
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong>Assignment:</strong> You may not assign these Terms without our consent. We may assign without restriction.
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong>Force Majeure:</strong> Neither party is liable for delays caused by events beyond reasonable control.
                    </div>
                  </li>
                </ul>
              </div>

              {/* Contact Information */}
              <div>
                <h2 className="text-3xl font-bold mb-4">16. Contact Information</h2>
                <p className="text-muted-foreground mb-4">
                  For questions about these Terms, please contact:
                </p>
                <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-6 space-y-2 text-muted-foreground">
                  <p><strong>Email:</strong> <a href="mailto:legal@cognexiaai.com" className="text-blue-600 hover:underline">legal@cognexiaai.com</a></p>
                  <p><strong>Support:</strong> <a href="mailto:support@cognexiaai.com" className="text-blue-600 hover:underline">support@cognexiaai.com</a></p>
                  <p><strong>Phone:</strong> <a href="tel:+919167422630" className="text-blue-600 hover:underline">+91-9167422630</a></p>
                  <p><strong>Address:</strong> CognexiaAI, Mumbai, India</p>
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
