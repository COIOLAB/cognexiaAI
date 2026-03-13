'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Brain, Mail, Phone, MapPin, Clock, Send } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    alert('Thank you for contacting us! We will get back to you soon.');
    setFormData({ name: '', email: '', company: '', subject: '', message: '' });
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                  COGNEXIAAI
                </h1>
                <p className="text-xs text-muted-foreground">Cognition Meets Precision</p>
              </div>
            </Link>
            
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-sm font-medium hover:text-blue-600 transition-colors">
                Home
              </Link>
              <Link href="/about" className="text-sm font-medium hover:text-blue-600 transition-colors">
                About
              </Link>
              <Link href="/features" className="text-sm font-medium hover:text-blue-600 transition-colors">
                Features
              </Link>
              <Link href="/contact" className="text-sm font-medium text-blue-600">
                Contact
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="bg-gradient-to-r from-blue-600 to-cyan-500">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
            <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              Get in Touch
            </span>
          </h1>
          <p className="text-xl text-muted-foreground">
            We&apos;re here to help. Reach out to our team for any questions or support.
          </p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            <Card>
              <CardHeader>
                <Mail className="h-10 w-10 text-blue-600 mb-4" />
                <CardTitle>Sales Inquiries</CardTitle>
                <CardDescription>
                  Get in touch with our sales team for pricing and demos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <a href="mailto:sales@cognexiaai.com" className="text-blue-600 hover:underline font-medium">
                  sales@cognexiaai.com
                </a>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Mail className="h-10 w-10 text-cyan-600 mb-4" />
                <CardTitle>Customer Support</CardTitle>
                <CardDescription>
                  24/7 support for all your technical questions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <a href="mailto:support@cognexiaai.com" className="text-cyan-600 hover:underline font-medium">
                  support@cognexiaai.com
                </a>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Clock className="h-10 w-10 text-purple-600 mb-4" />
                <CardTitle>Business Hours</CardTitle>
                <CardDescription>
                  We&apos;re available to help you succeed
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Monday - Friday: 9:00 AM - 6:00 PM EST
                  <br />
                  24/7 Support Available
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold mb-6">Send us a Message</h2>
              <p className="text-muted-foreground mb-8">
                Fill out the form and our team will get back to you within 24 hours.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="John Doe"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@company.com"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="company">Company Name</Label>
                  <Input
                    id="company"
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="Acme Inc"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="subject">Subject *</Label>
                  <Input
                    id="subject"
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="How can we help?"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us more about your inquiry..."
                    rows={6}
                    className="mt-2"
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-500"
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                  <Send className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </div>

            <div>
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Why Choose CognexiaAI?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center">
                      <Mail className="h-5 w-5 text-blue-600 mr-2" />
                      Quick Response Time
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Our team responds to all inquiries within 24 hours during business days.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2 flex items-center">
                      <Brain className="h-5 w-5 text-cyan-600 mr-2" />
                      Expert Guidance
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Get advice from our experienced team on how to best implement CognexiaAI 
                      for your business needs.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2 flex items-center">
                      <MapPin className="h-5 w-5 text-purple-600 mr-2" />
                      Global Support
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      We serve customers in 150+ countries with multilingual support and 
                      local expertise.
                    </p>
                  </div>

                  <div className="pt-6 border-t">
                    <h3 className="font-semibold mb-4">Prefer to talk directly?</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <Mail className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="text-sm font-medium">Sales</p>
                          <a href="mailto:sales@cognexiaai.com" className="text-sm text-blue-600 hover:underline">
                            sales@cognexiaai.com
                          </a>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Mail className="h-5 w-5 text-cyan-600" />
                        <div>
                          <p className="text-sm font-medium">Support</p>
                          <a href="mailto:support@cognexiaai.com" className="text-sm text-cyan-600 hover:underline">
                            support@cognexiaai.com
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-muted-foreground">
              Quick answers to common questions
            </p>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How quickly can I get started?</CardTitle>
                <CardDescription>
                  You can sign up and start using CognexiaAI immediately. Our onboarding process 
                  takes less than 5 minutes, and you&apos;ll have access to all features during your 
                  14-day free trial.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Do you offer training and support?</CardTitle>
                <CardDescription>
                  Yes! We provide comprehensive documentation, video tutorials, and 24/7 customer 
                  support. Enterprise customers also get dedicated account managers and personalized 
                  training sessions.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Can I migrate data from my current CRM?</CardTitle>
                <CardDescription>
                  Absolutely! We support data migration from Salesforce, HubSpot, SAP, Oracle, Zoho, 
                  and other major CRM platforms. Our team can assist with the migration process.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What security measures do you have?</CardTitle>
                <CardDescription>
                  We employ military-grade encryption, MFA, SSO, row-level security (RLS), and maintain 
                  SOC 2 Type II compliance. Your data is stored in enterprise-grade cloud infrastructure 
                  with 99.9% uptime SLA.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-cyan-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Transform Your CRM?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Start your free 14-day trial today. No credit card required.
          </p>
          <Link href="/register">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
              Start Free Trial
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p>&copy; 2026 CognexiaAI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
