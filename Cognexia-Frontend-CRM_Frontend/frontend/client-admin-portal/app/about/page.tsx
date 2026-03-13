import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Target, Users, Rocket, Heart, Lightbulb, Globe, Award } from 'lucide-react';

export default function AboutPage() {
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
              <Link href="/about" className="text-sm font-medium text-blue-600">
                About
              </Link>
              <Link href="/features" className="text-sm font-medium hover:text-blue-600 transition-colors">
                Features
              </Link>
              <Link href="/contact" className="text-sm font-medium hover:text-blue-600 transition-colors">
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
              About CognexiaAI
            </span>
          </h1>
          <p className="text-xl text-muted-foreground">
            We&apos;re building the future of enterprise software with AI at the core
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Our Mission</h2>
              <p className="text-lg text-muted-foreground mb-4">
                At CognexiaAI, we believe that every business deserves access to enterprise-grade 
                tools that combine the power of artificial intelligence with human intuition.
              </p>
              <p className="text-lg text-muted-foreground mb-4">
                Our mission is to revolutionize how businesses manage customer relationships by 
                providing an intelligent, secure, and scalable platform that grows with your needs.
              </p>
              <p className="text-lg text-muted-foreground">
                We&apos;re not just building software—we&apos;re creating the foundation for the next 
                generation of business intelligence.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <Target className="h-8 w-8 text-blue-600 mb-2" />
                  <CardTitle>Vision</CardTitle>
                  <CardDescription>
                    Leading the Industry 5.0 revolution in enterprise software
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <Users className="h-8 w-8 text-cyan-600 mb-2" />
                  <CardTitle>People First</CardTitle>
                  <CardDescription>
                    Technology that empowers teams and customers
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <Rocket className="h-8 w-8 text-purple-600 mb-2" />
                  <CardTitle>Innovation</CardTitle>
                  <CardDescription>
                    Pushing boundaries with cutting-edge AI
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <Heart className="h-8 w-8 text-pink-600 mb-2" />
                  <CardTitle>Integrity</CardTitle>
                  <CardDescription>
                    Trust, transparency, and ethical AI
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Core Values</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lightbulb className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle>Innovation First</CardTitle>
                <CardDescription className="text-base">
                  We constantly push the boundaries of what&apos;s possible with AI and machine learning, 
                  staying ahead of industry trends and customer needs.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle>Customer Success</CardTitle>
                <CardDescription className="text-base">
                  Your success is our success. We&apos;re committed to providing exceptional support 
                  and continuously improving based on your feedback.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Globe className="h-8 w-8 text-purple-600" />
                </div>
                <CardTitle>Global Impact</CardTitle>
                <CardDescription className="text-base">
                  We build solutions that work across cultures, languages, and time zones, 
                  making world-class CRM accessible to businesses everywhere.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-cyan-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">CognexiaAI by the Numbers</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">2024</div>
              <div className="text-blue-100">Founded</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">10K+</div>
              <div className="text-blue-100">Active Users</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">150+</div>
              <div className="text-blue-100">Countries</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">99.9%</div>
              <div className="text-blue-100">Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Powered by Industry 5.0 Technology</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Built with the latest technologies for maximum performance and scalability
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>AI & ML</CardTitle>
                <CardDescription>
                  TensorFlow, PyTorch, Advanced NLP models for intelligent automation
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Security</CardTitle>
                <CardDescription>
                  Military-grade encryption, MFA, SSO, Row-level security (RLS)
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Cloud Native</CardTitle>
                <CardDescription>
                  Kubernetes, Docker, Auto-scaling infrastructure
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Modern Stack</CardTitle>
                <CardDescription>
                  TypeScript, Next.js, NestJS, PostgreSQL, Redis
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Join Us on This Journey</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Be part of the future of enterprise software
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-cyan-500">
                Start Free Trial
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline">
                Get in Touch
              </Button>
            </Link>
          </div>
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
