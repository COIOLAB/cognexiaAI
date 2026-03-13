'use client';

import Link from 'next/link';
import { FileSignature, CheckCircle2, ArrowLeft, Shield, Database, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function DPAPage() {
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
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-400 rounded-2xl flex items-center justify-center">
                  <FileSignature className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold">Data Processing Agreement</h1>
                  <p className="text-slate-300 mt-2">Last Updated: January 29, 2026</p>
                </div>
              </div>
              <p className="text-xl text-blue-100">
                GDPR-compliant Data Processing Agreement for enterprise customers protecting your data rights.
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
                <h2 className="text-3xl font-bold mb-4">1. Introduction and Parties</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  This Data Processing Agreement ("DPA") forms part of the Terms of Service between CognexiaAI ("Processor" or "we") and the customer ("Controller" or "you") for the provision of the Services. This DPA reflects the parties' agreement with respect to the processing of Personal Data in accordance with the requirements of applicable Data Protection Laws, including the EU General Data Protection Regulation (GDPR) 2016/679.
                </p>
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                  <div className="flex items-start gap-3">
                    <Shield className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold mb-2">GDPR Compliance Statement</h4>
                      <p className="text-sm text-muted-foreground">
                        This DPA ensures compliance with GDPR Articles 28, 32, 33, and 34, establishing clear responsibilities for data processing activities.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Definitions */}
              <div>
                <h2 className="text-3xl font-bold mb-4">2. Definitions</h2>
                <p className="text-muted-foreground mb-4">In this DPA, the following terms have the meanings set out below:</p>
                <ul className="space-y-3 text-muted-foreground ml-6">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong>"Personal Data"</strong> means any information relating to an identified or identifiable natural person processed by Processor on behalf of Controller in connection with the Services.
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong>"Data Protection Laws"</strong> means all applicable laws relating to privacy, data protection, and data security, including GDPR, CCPA, and any implementing or supplementary legislation.
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong>"Data Subject"</strong> means the individual to whom Personal Data relates.
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong>"Sub-processor"</strong> means any third-party processor engaged by Processor to process Personal Data on behalf of Controller.
                    </div>
                  </li>
                </ul>
              </div>

              {/* Scope and Details of Processing */}
              <div>
                <h2 className="text-3xl font-bold mb-4">3. Scope and Details of Processing</h2>
                
                <h3 className="text-xl font-semibold mb-3 mt-6">3.1 Subject Matter and Duration</h3>
                <p className="text-muted-foreground mb-4">
                  The subject matter of the processing is the provision of the Services in accordance with the Terms of Service. The duration of processing shall be for the term of the Services agreement.
                </p>

                <h3 className="text-xl font-semibold mb-3 mt-6">3.2 Nature and Purpose of Processing</h3>
                <p className="text-muted-foreground mb-4">
                  Processor will process Personal Data for the following purposes:
                </p>
                <ul className="space-y-2 text-muted-foreground ml-6">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Provision and maintenance of the ERP Services</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Customer support and technical assistance</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Service improvement and analytics (anonymized)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Security monitoring and incident response</span>
                  </li>
                </ul>

                <h3 className="text-xl font-semibold mb-3 mt-6">3.3 Types of Personal Data</h3>
                <ul className="space-y-2 text-muted-foreground ml-6">
                  <li className="flex items-start gap-2">
                    <Database className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span>Contact information (names, email addresses, phone numbers)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Database className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span>Employment information (job titles, department, employee IDs)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Database className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span>Financial information (billing details, transaction records)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Database className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span>Technical data (IP addresses, device information, usage logs)</span>
                  </li>
                </ul>

                <h3 className="text-xl font-semibold mb-3 mt-6">3.4 Categories of Data Subjects</h3>
                <ul className="space-y-2 text-muted-foreground ml-6">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <span>Controller's employees and contractors</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <span>Controller's customers and clients</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <span>Controller's suppliers and partners</span>
                  </li>
                </ul>
              </div>

              {/* Processor's Obligations */}
              <div>
                <h2 className="text-3xl font-bold mb-4">4. Processor's Obligations</h2>
                
                <h3 className="text-xl font-semibold mb-3 mt-6">4.1 Processing Instructions</h3>
                <p className="text-muted-foreground mb-4">
                  Processor shall process Personal Data only on documented instructions from Controller, unless required to do so by applicable law. Controller instructs Processor to process Personal Data for the purposes described in this DPA and the Terms of Service.
                </p>

                <h3 className="text-xl font-semibold mb-3 mt-6">4.2 Confidentiality</h3>
                <p className="text-muted-foreground mb-4">
                  Processor shall ensure that persons authorized to process Personal Data have committed themselves to confidentiality or are under an appropriate statutory obligation of confidentiality. All employees with access to Personal Data are bound by strict confidentiality agreements.
                </p>

                <h3 className="text-xl font-semibold mb-3 mt-6">4.3 Security Measures</h3>
                <p className="text-muted-foreground mb-4">
                  Processor shall implement appropriate technical and organizational measures to ensure a level of security appropriate to the risk, including:
                </p>
                <ul className="space-y-2 text-muted-foreground ml-6">
                  <li className="flex items-start gap-2">
                    <Lock className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Pseudonymization and encryption of Personal Data</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Lock className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Ongoing confidentiality, integrity, availability, and resilience of systems</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Lock className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Ability to restore availability and access to data in a timely manner</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Lock className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Regular testing, assessment, and evaluation of security effectiveness</span>
                  </li>
                </ul>
              </div>

              {/* Sub-processors */}
              <div>
                <h2 className="text-3xl font-bold mb-4">5. Sub-processors</h2>
                
                <h3 className="text-xl font-semibold mb-3 mt-6">5.1 General Authorization</h3>
                <p className="text-muted-foreground mb-4">
                  Controller provides general authorization for Processor to engage Sub-processors. Processor shall:
                </p>
                <ul className="space-y-2 text-muted-foreground ml-6">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span>Maintain a list of Sub-processors on our website</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span>Provide 30 days' notice of any new Sub-processor</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span>Ensure Sub-processors are bound by written agreements with equivalent obligations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span>Remain fully liable for Sub-processor performance</span>
                  </li>
                </ul>

                <h3 className="text-xl font-semibold mb-3 mt-6">5.2 Current Sub-processors</h3>
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Amazon Web Services (AWS)</h4>
                    <p className="text-sm text-muted-foreground">Cloud infrastructure and hosting services</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Stripe, Inc.</h4>
                    <p className="text-sm text-muted-foreground">Payment processing services</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">SendGrid (Twilio)</h4>
                    <p className="text-sm text-muted-foreground">Email delivery services</p>
                  </div>
                </div>
              </div>

              {/* Data Subject Rights */}
              <div>
                <h2 className="text-3xl font-bold mb-4">6. Data Subject Rights</h2>
                <p className="text-muted-foreground mb-4">
                  Processor shall, to the extent legally permitted, promptly notify Controller if it receives a request from a Data Subject to exercise their rights under Data Protection Laws. Processor shall:
                </p>
                <ul className="space-y-2 text-muted-foreground ml-6">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span>Assist Controller in responding to Data Subject requests</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span>Provide technical and organizational measures to facilitate such requests</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span>Not respond directly to Data Subjects without Controller's authorization</span>
                  </li>
                </ul>
              </div>

              {/* Data Breach Notification */}
              <div>
                <h2 className="text-3xl font-bold mb-4">7. Data Breach Notification</h2>
                <p className="text-muted-foreground mb-4">
                  Processor shall notify Controller without undue delay (and in any event within 24 hours) after becoming aware of a Personal Data breach. The notification shall include:
                </p>
                <ul className="space-y-2 text-muted-foreground ml-6">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <span>Description of the nature of the breach</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <span>Categories and approximate number of Data Subjects and records concerned</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <span>Likely consequences of the breach</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <span>Measures taken or proposed to address the breach</span>
                  </li>
                </ul>
              </div>

              {/* Data Transfers */}
              <div>
                <h2 className="text-3xl font-bold mb-4">8. International Data Transfers</h2>
                <p className="text-muted-foreground mb-4">
                  Where Processor transfers Personal Data outside the European Economic Area (EEA), Processor shall ensure that:
                </p>
                <ul className="space-y-2 text-muted-foreground ml-6">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span>Transfers are to countries with adequate data protection (as determined by the European Commission)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span>Standard Contractual Clauses (SCCs) approved by the European Commission are implemented</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span>Appropriate safeguards and supplementary measures are in place</span>
                  </li>
                </ul>
              </div>

              {/* Audits and Compliance */}
              <div>
                <h2 className="text-3xl font-bold mb-4">9. Audits and Compliance</h2>
                <p className="text-muted-foreground mb-4">
                  Processor shall make available to Controller information necessary to demonstrate compliance with this DPA and allow for audits:
                </p>
                <ul className="space-y-2 text-muted-foreground ml-6">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Annual SOC 2 Type II audit reports</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>ISO 27001 certification documentation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Security questionnaires and compliance documentation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>On-site audits with reasonable notice (subject to confidentiality)</span>
                  </li>
                </ul>
              </div>

              {/* Data Deletion */}
              <div>
                <h2 className="text-3xl font-bold mb-4">10. Data Deletion and Return</h2>
                <p className="text-muted-foreground mb-4">
                  Upon termination or expiration of the Services, Processor shall, at Controller's choice:
                </p>
                <ul className="space-y-2 text-muted-foreground ml-6">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <span>Return all Personal Data to Controller in a structured, commonly used format</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <span>Delete all Personal Data and certify in writing to Controller</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <span>Deletion occurs within 90 days unless legal requirements mandate retention</span>
                  </li>
                </ul>
              </div>

              {/* Liability */}
              <div>
                <h2 className="text-3xl font-bold mb-4">11. Liability</h2>
                <p className="text-muted-foreground">
                  Each party's liability arising out of or related to this DPA shall be subject to the limitations of liability set forth in the Terms of Service. Nothing in this DPA shall limit either party's liability for breaches of its obligations under applicable Data Protection Laws.
                </p>
              </div>

              {/* Contact Information */}
              <div>
                <h2 className="text-3xl font-bold mb-4">12. Contact for DPA Matters</h2>
                <p className="text-muted-foreground mb-4">
                  For questions or concerns related to this Data Processing Agreement:
                </p>
                <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-6 space-y-2 text-muted-foreground">
                  <p><strong>Data Protection Officer:</strong> <a href="mailto:dpo@cognexiaai.com" className="text-blue-600 hover:underline">dpo@cognexiaai.com</a></p>
                  <p><strong>Legal Department:</strong> <a href="mailto:legal@cognexiaai.com" className="text-blue-600 hover:underline">legal@cognexiaai.com</a></p>
                  <p><strong>Privacy Team:</strong> <a href="mailto:privacy@cognexiaai.com" className="text-blue-600 hover:underline">privacy@cognexiaai.com</a></p>
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
