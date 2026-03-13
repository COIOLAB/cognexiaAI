'use client';

import Link from 'next/link';
import { Cookie, CheckCircle2, ArrowLeft, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function CookiePolicyPage() {
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
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-400 rounded-2xl flex items-center justify-center">
                  <Cookie className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold">Cookie Policy</h1>
                  <p className="text-slate-300 mt-2">Last Updated: January 29, 2026</p>
                </div>
              </div>
              <p className="text-xl text-blue-100">
                Learn how we use cookies and similar technologies to enhance your experience on CognexiaAI.
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
                <h2 className="text-3xl font-bold mb-4">1. What Are Cookies?</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Cookies are small text files that are placed on your device (computer, smartphone, or tablet) when you visit a website. Cookies help websites recognize your device and remember information about your visit, such as your preferences and login status.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  We use cookies and similar tracking technologies (such as web beacons, pixels, and local storage) to provide, protect, and improve our Services. This Cookie Policy explains what cookies are, how we use them, and your choices regarding their use.
                </p>
              </div>

              {/* Types of Cookies */}
              <div>
                <h2 className="text-3xl font-bold mb-4">2. Types of Cookies We Use</h2>
                
                <h3 className="text-xl font-semibold mb-3 mt-6">2.1 Essential Cookies</h3>
                <p className="text-muted-foreground mb-4">
                  These cookies are necessary for the Services to function properly. They enable core functionality such as security, network management, and accessibility. You cannot opt out of essential cookies.
                </p>
                <ul className="space-y-2 text-muted-foreground ml-6">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Authentication:</strong> Keeps you logged in and maintains your session</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Security:</strong> Detects authentication abuse and protects against fraud</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Load Balancing:</strong> Distributes traffic efficiently across servers</span>
                  </li>
                </ul>

                <h3 className="text-xl font-semibold mb-3 mt-6">2.2 Functional Cookies</h3>
                <p className="text-muted-foreground mb-4">
                  These cookies enable enhanced functionality and personalization, such as remembering your preferences and settings.
                </p>
                <ul className="space-y-2 text-muted-foreground ml-6">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Preferences:</strong> Language, timezone, and display settings</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span><strong>User Interface:</strong> Layout preferences and customization options</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Feature Access:</strong> Remembers which features you've used</span>
                  </li>
                </ul>

                <h3 className="text-xl font-semibold mb-3 mt-6">2.3 Analytics Cookies</h3>
                <p className="text-muted-foreground mb-4">
                  These cookies help us understand how visitors interact with our Services by collecting and reporting information anonymously.
                </p>
                <ul className="space-y-2 text-muted-foreground ml-6">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Usage Analytics:</strong> Pages visited, time spent, navigation patterns</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Performance Monitoring:</strong> Page load times, errors, and performance metrics</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Feature Adoption:</strong> Tracks which features are most used</span>
                  </li>
                </ul>

                <h3 className="text-xl font-semibold mb-3 mt-6">2.4 Marketing Cookies</h3>
                <p className="text-muted-foreground mb-4">
                  These cookies are used to track visitors across websites to display relevant advertisements and measure campaign effectiveness.
                </p>
                <ul className="space-y-2 text-muted-foreground ml-6">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Advertising:</strong> Displays relevant ads based on interests</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Retargeting:</strong> Shows ads to users who previously visited our site</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Campaign Measurement:</strong> Measures effectiveness of marketing campaigns</span>
                  </li>
                </ul>
              </div>

              {/* Specific Cookies Table */}
              <div>
                <h2 className="text-3xl font-bold mb-4">3. Specific Cookies We Use</h2>
                <div className="overflow-x-auto">
                  <div className="space-y-4">
                    {/* Essential Cookies */}
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <h4 className="font-semibold text-lg mb-2">session_token</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
                        <div><strong>Type:</strong> Essential</div>
                        <div><strong>Duration:</strong> Session</div>
                        <div><strong>Purpose:</strong> Maintains user session and authentication</div>
                      </div>
                    </div>

                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <h4 className="font-semibold text-lg mb-2">csrf_token</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
                        <div><strong>Type:</strong> Essential</div>
                        <div><strong>Duration:</strong> Session</div>
                        <div><strong>Purpose:</strong> Prevents cross-site request forgery attacks</div>
                      </div>
                    </div>

                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <h4 className="font-semibold text-lg mb-2">user_preferences</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
                        <div><strong>Type:</strong> Functional</div>
                        <div><strong>Duration:</strong> 1 year</div>
                        <div><strong>Purpose:</strong> Stores user preferences (language, theme, etc.)</div>
                      </div>
                    </div>

                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <h4 className="font-semibold text-lg mb-2">_ga</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
                        <div><strong>Type:</strong> Analytics</div>
                        <div><strong>Duration:</strong> 2 years</div>
                        <div><strong>Purpose:</strong> Google Analytics - distinguishes users</div>
                      </div>
                    </div>

                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <h4 className="font-semibold text-lg mb-2">_gid</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
                        <div><strong>Type:</strong> Analytics</div>
                        <div><strong>Duration:</strong> 24 hours</div>
                        <div><strong>Purpose:</strong> Google Analytics - distinguishes users</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Third-Party Cookies */}
              <div>
                <h2 className="text-3xl font-bold mb-4">4. Third-Party Cookies</h2>
                <p className="text-muted-foreground mb-4">
                  We may use third-party service providers who set cookies on our Services. These providers include:
                </p>
                <ul className="space-y-3 text-muted-foreground ml-6">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong>Google Analytics:</strong> For website analytics and performance monitoring
                      <br />
                      <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                        Google Privacy Policy
                      </a>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong>Intercom:</strong> For customer support and communication
                      <br />
                      <a href="https://www.intercom.com/legal/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                        Intercom Privacy Policy
                      </a>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong>Stripe:</strong> For payment processing
                      <br />
                      <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                        Stripe Privacy Policy
                      </a>
                    </div>
                  </li>
                </ul>
              </div>

              {/* Cookie Duration */}
              <div>
                <h2 className="text-3xl font-bold mb-4">5. Cookie Duration</h2>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Session Cookies</h4>
                    <p className="text-muted-foreground">
                      These are temporary cookies that expire when you close your browser. They help maintain your session while navigating the Services.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Persistent Cookies</h4>
                    <p className="text-muted-foreground">
                      These cookies remain on your device for a set period (ranging from days to years) or until you delete them. They remember your preferences across multiple sessions.
                    </p>
                  </div>
                </div>
              </div>

              {/* Managing Cookies */}
              <div>
                <h2 className="text-3xl font-bold mb-4">6. Managing Your Cookie Preferences</h2>
                
                <h3 className="text-xl font-semibold mb-3 mt-6">6.1 Cookie Consent</h3>
                <p className="text-muted-foreground mb-4">
                  When you first visit our Services, we display a cookie banner that allows you to accept or customize your cookie preferences. You can change your preferences at any time by accessing the cookie settings in your account or by clicking the cookie preferences link in the footer.
                </p>

                <h3 className="text-xl font-semibold mb-3 mt-6">6.2 Browser Settings</h3>
                <p className="text-muted-foreground mb-4">
                  Most web browsers allow you to control cookies through their settings. You can:
                </p>
                <ul className="space-y-2 text-muted-foreground ml-6">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Block all cookies</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Accept only first-party cookies</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Delete cookies after each session</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Receive notifications before cookies are set</span>
                  </li>
                </ul>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 mt-6">
                  <div className="flex items-start gap-3">
                    <Info className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold mb-2">Important Note</h4>
                      <p className="text-sm text-muted-foreground">
                        Blocking or deleting essential cookies may affect the functionality of our Services. Some features may not work properly if you disable cookies.
                      </p>
                    </div>
                  </div>
                </div>

                <h3 className="text-xl font-semibold mb-3 mt-6">6.3 Browser-Specific Instructions</h3>
                <ul className="space-y-2 text-muted-foreground ml-6">
                  <li className="flex items-start gap-2">
                    <span className="font-semibold">•</span>
                    <div>
                      <strong>Chrome:</strong> Settings → Privacy and security → Cookies and other site data
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-semibold">•</span>
                    <div>
                      <strong>Firefox:</strong> Settings → Privacy & Security → Cookies and Site Data
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-semibold">•</span>
                    <div>
                      <strong>Safari:</strong> Preferences → Privacy → Manage Website Data
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-semibold">•</span>
                    <div>
                      <strong>Edge:</strong> Settings → Cookies and site permissions → Manage and delete cookies
                    </div>
                  </li>
                </ul>
              </div>

              {/* Opt-Out Options */}
              <div>
                <h2 className="text-3xl font-bold mb-4">7. Opt-Out Options</h2>
                <p className="text-muted-foreground mb-4">
                  For specific types of cookies, you can opt out through these mechanisms:
                </p>
                <ul className="space-y-2 text-muted-foreground ml-6">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong>Google Analytics:</strong>{' '}
                      <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        Google Analytics Opt-out Browser Add-on
                      </a>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong>Advertising Cookies:</strong>{' '}
                      <a href="http://www.youronlinechoices.eu/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        Your Online Choices
                      </a>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong>Do Not Track:</strong> We respect browser Do Not Track signals
                    </div>
                  </li>
                </ul>
              </div>

              {/* Mobile Devices */}
              <div>
                <h2 className="text-3xl font-bold mb-4">8. Mobile Devices</h2>
                <p className="text-muted-foreground mb-4">
                  On mobile devices, you can manage tracking preferences through your device settings:
                </p>
                <ul className="space-y-2 text-muted-foreground ml-6">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong>iOS:</strong> Settings → Privacy → Tracking → Allow Apps to Request to Track (disable)
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong>Android:</strong> Settings → Google → Ads → Opt out of Ads Personalization
                    </div>
                  </li>
                </ul>
              </div>

              {/* Changes to Cookie Policy */}
              <div>
                <h2 className="text-3xl font-bold mb-4">9. Changes to This Cookie Policy</h2>
                <p className="text-muted-foreground">
                  We may update this Cookie Policy from time to time to reflect changes in our practices or for legal, regulatory, or operational reasons. We will notify you of material changes by posting the updated policy on our Services and updating the "Last Updated" date. Your continued use of the Services after changes constitutes acceptance of the updated Cookie Policy.
                </p>
              </div>

              {/* Contact Information */}
              <div>
                <h2 className="text-3xl font-bold mb-4">10. Contact Us</h2>
                <p className="text-muted-foreground mb-4">
                  If you have questions about our use of cookies or this Cookie Policy, please contact us:
                </p>
                <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-6 space-y-2 text-muted-foreground">
                  <p><strong>Email:</strong> <a href="mailto:privacy@cognexiaai.com" className="text-blue-600 hover:underline">privacy@cognexiaai.com</a></p>
                  <p><strong>Data Protection Officer:</strong> <a href="mailto:dpo@cognexiaai.com" className="text-blue-600 hover:underline">dpo@cognexiaai.com</a></p>
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
