'use client';

import Link from 'next/link';
import { Accessibility, CheckCircle2, ArrowLeft, Eye, Keyboard, Volume2, MonitorSmartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function AccessibilityPage() {
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
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-400 rounded-2xl flex items-center justify-center">
                  <Accessibility className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold">Accessibility Statement</h1>
                  <p className="text-slate-300 mt-2">Last Updated: January 29, 2026</p>
                </div>
              </div>
              <p className="text-xl text-blue-100">
                Our commitment to making CognexiaAI accessible to everyone, including people with disabilities.
              </p>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto space-y-12">
            
            {/* Commitment */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12">
              <h2 className="text-3xl font-bold mb-6">Our Commitment to Accessibility</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                CognexiaAI is committed to ensuring digital accessibility for people with disabilities. We continuously improve the user experience for everyone and apply relevant accessibility standards to ensure our Services are accessible to all users, regardless of ability.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                We believe that technology should be inclusive and empower everyone. Accessibility is not just a legal requirement—it's a core value that drives how we design and build our enterprise platform.
              </p>
            </div>

            {/* Standards Compliance */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12">
              <h2 className="text-3xl font-bold mb-6">Compliance Standards</h2>
              <p className="text-muted-foreground mb-6">
                CognexiaAI conforms to the following accessibility standards:
              </p>

              <div className="space-y-6">
                <div className="border-l-4 border-blue-600 pl-6 py-4">
                  <h3 className="text-xl font-semibold mb-3">WCAG 2.1 Level AA</h3>
                  <p className="text-muted-foreground mb-4">
                    Web Content Accessibility Guidelines (WCAG) 2.1 at Level AA conformance. Our platform meets the internationally recognized standard for web accessibility.
                  </p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span><strong>Perceivable:</strong> Information and UI components are presentable to users in ways they can perceive</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span><strong>Operable:</strong> UI components and navigation are operable by all users</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span><strong>Understandable:</strong> Information and UI operation are understandable</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span><strong>Robust:</strong> Content is robust enough to work with current and future technologies</span>
                    </li>
                  </ul>
                </div>

                <div className="border-l-4 border-green-600 pl-6 py-4">
                  <h3 className="text-xl font-semibold mb-3">Section 508</h3>
                  <p className="text-muted-foreground">
                    Our Services comply with Section 508 of the Rehabilitation Act, ensuring accessibility for federal agencies and their employees with disabilities.
                  </p>
                </div>

                <div className="border-l-4 border-purple-600 pl-6 py-4">
                  <h3 className="text-xl font-semibold mb-3">EN 301 549</h3>
                  <p className="text-muted-foreground">
                    European standard for accessibility requirements suitable for public procurement of ICT products and services in Europe.
                  </p>
                </div>

                <div className="border-l-4 border-orange-600 pl-6 py-4">
                  <h3 className="text-xl font-semibold mb-3">ADA Compliance</h3>
                  <p className="text-muted-foreground">
                    Americans with Disabilities Act (ADA) Title III compliance for digital accessibility in places of public accommodation.
                  </p>
                </div>
              </div>
            </div>

            {/* Accessibility Features */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12">
              <h2 className="text-3xl font-bold mb-6">Accessibility Features</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Eye className="h-8 w-8 text-blue-600" />
                    <h3 className="text-xl font-semibold">Visual Accessibility</h3>
                  </div>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>High contrast mode support</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Resizable text up to 200%</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Color contrast ratio of at least 4.5:1</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Alternative text for images</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Dark mode support</span>
                    </li>
                  </ul>
                </div>

                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Keyboard className="h-8 w-8 text-purple-600" />
                    <h3 className="text-xl font-semibold">Keyboard Navigation</h3>
                  </div>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Full keyboard navigation support</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Visible focus indicators</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Skip navigation links</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Logical tab order</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Keyboard shortcuts documentation</span>
                    </li>
                  </ul>
                </div>

                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Volume2 className="h-8 w-8 text-green-600" />
                    <h3 className="text-xl font-semibold">Screen Reader Support</h3>
                  </div>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>ARIA labels and landmarks</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Semantic HTML structure</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Descriptive link text</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Form labels and instructions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Status and error announcements</span>
                    </li>
                  </ul>
                </div>

                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <MonitorSmartphone className="h-8 w-8 text-orange-600" />
                    <h3 className="text-xl font-semibold">Responsive Design</h3>
                  </div>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Mobile-friendly interface</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Touch target size (minimum 44x44 pixels)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Orientation support (portrait/landscape)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Zoom compatibility up to 400%</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Reflow for small screens</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Compatible Technologies */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12">
              <h2 className="text-3xl font-bold mb-6">Compatible Assistive Technologies</h2>
              <p className="text-muted-foreground mb-6">
                Our Services are designed and tested to work with the following assistive technologies:
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Screen Readers</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span>JAWS (Windows)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span>NVDA (Windows)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span>VoiceOver (macOS, iOS)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span>TalkBack (Android)</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Other Assistive Tools</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Screen magnification software</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Speech recognition software</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Alternative input devices</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Browser accessibility extensions</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Testing and Monitoring */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8 md:p-12">
              <h2 className="text-3xl font-bold mb-6">Testing and Continuous Improvement</h2>
              <p className="text-muted-foreground mb-6">
                We are committed to maintaining and improving accessibility through:
              </p>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Automated Testing:</strong> Regular automated accessibility audits using industry-standard tools</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Manual Testing:</strong> Comprehensive manual testing with assistive technologies</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span><strong>User Testing:</strong> Testing with users who have disabilities</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Third-Party Audits:</strong> Annual accessibility audits by certified experts</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Training:</strong> Ongoing accessibility training for our development and design teams</span>
                </li>
              </ul>
            </div>

            {/* Known Limitations */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12">
              <h2 className="text-3xl font-bold mb-6">Known Limitations</h2>
              <p className="text-muted-foreground mb-4">
                Despite our best efforts, there may be some limitations. We are actively working to address:
              </p>
              <ul className="space-y-2 text-muted-foreground ml-6">
                <li className="flex items-start gap-2">
                  <span className="font-semibold">•</span>
                  <span>Some third-party integrations may have their own accessibility limitations</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold">•</span>
                  <span>Legacy features may require additional time for full WCAG 2.1 AA compliance</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold">•</span>
                  <span>Complex data visualizations are being enhanced for better screen reader support</span>
                </li>
              </ul>
            </div>

            {/* Feedback and Contact */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12">
              <h2 className="text-3xl font-bold mb-6">Feedback and Contact</h2>
              <p className="text-muted-foreground mb-6">
                We welcome your feedback on the accessibility of CognexiaAI. If you encounter any accessibility barriers or have suggestions for improvement, please contact us:
              </p>
              
              <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-6 space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Accessibility Team</h3>
                  <p className="text-sm text-muted-foreground mb-1">
                    <strong>Email:</strong> <a href="mailto:accessibility@cognexiaai.com" className="text-blue-600 hover:underline">accessibility@cognexiaai.com</a>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <strong>Phone:</strong> <a href="tel:+919167422630" className="text-blue-600 hover:underline">+91-9167422630</a>
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Response Time</h3>
                  <p className="text-sm text-muted-foreground">
                    We aim to respond to accessibility feedback within 2 business days and provide a resolution timeline within 5 business days.
                  </p>
                </div>
              </div>
            </div>

            {/* Formal Complaints */}
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-4">Formal Complaints Process</h2>
              <p className="text-muted-foreground mb-4">
                If you are not satisfied with our response to your accessibility concern, you may:
              </p>
              <ul className="space-y-2 text-muted-foreground ml-6">
                <li className="flex items-start gap-2">
                  <span className="font-semibold">1.</span>
                  <span>Contact our Legal Department at <a href="mailto:legal@cognexiaai.com" className="text-blue-600 hover:underline">legal@cognexiaai.com</a></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold">2.</span>
                  <span>File a complaint with relevant accessibility authorities in your jurisdiction</span>
                </li>
              </ul>
            </div>

          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
