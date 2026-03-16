import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Brain, 
  Shield, 
  Zap, 
  Users, 
  BarChart3, 
  Globe,
  Target,
  Database,
  Lock,
  TrendingUp,
  MessageSquare,
  FileText,
  Calendar,
  Mail,
  Phone,
  CheckCircle2,
  Sparkles,
  Eye,
  Cpu,
  Network,
  Workflow,
  PackageCheck,
  Rocket,
  Bot,
  HeartHandshake,
  Award,
  Activity
} from 'lucide-react';

export default function FeaturesPage() {
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
              <Link href="/features" className="text-sm font-medium text-blue-600">
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
          <div className="mb-4">
            <span className="inline-block px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-semibold rounded-full">
              Industry 5.0 Technology
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
            <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              The Most Advanced CRM
            </span>
            <br />
            <span className="text-3xl md:text-4xl">Ever Built</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-4">
            83 Database Entities • 60+ AI Services • 1000+ Methods
          </p>
          <p className="text-lg text-muted-foreground">
            Quantum Intelligence • Holographic Experiences • AR/VR Sales • 200+ ERP Fields
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-5 gap-8 text-center">
            <div className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl">
              <div className="text-4xl font-bold text-blue-600 mb-2">83</div>
              <div className="text-sm text-muted-foreground">Database Entities</div>
            </div>
            <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl">
              <div className="text-4xl font-bold text-purple-600 mb-2">60+</div>
              <div className="text-sm text-muted-foreground">AI Services</div>
            </div>
            <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl">
              <div className="text-4xl font-bold text-green-600 mb-2">200+</div>
              <div className="text-sm text-muted-foreground">ERP Fields</div>
            </div>
            <div className="p-6 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl">
              <div className="text-4xl font-bold text-orange-600 mb-2">100+</div>
              <div className="text-sm text-muted-foreground">Integrations</div>
            </div>
            <div className="p-6 bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 rounded-xl">
              <div className="text-4xl font-bold text-red-600 mb-2">230+</div>
              <div className="text-sm text-muted-foreground">Security Methods</div>
            </div>
          </div>
        </div>
      </section>

      {/* Core CRM Features */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Core CRM Capabilities</h2>
            <p className="text-lg text-muted-foreground">
              Complete customer lifecycle management with 83 database entities
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="border-2 hover:border-blue-500 transition-all">
              <CardHeader>
                <Users className="h-10 w-10 text-blue-600 mb-4" />
                <CardTitle>360° Customer Management</CardTitle>
                <CardDescription>
                  Digital twins, quantum entanglement analysis, customer segmentation & tiering
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-green-600" /> Complete lifecycle tracking</li>
                  <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-green-600" /> Customer digital twins</li>
                  <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-green-600" /> Self-service portal</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-cyan-500 transition-all">
              <CardHeader>
                <Target className="h-10 w-10 text-cyan-600 mb-4" />
                <CardTitle>AI Lead Scoring</CardTitle>
                <CardDescription>
                  ML-powered scoring, intelligent routing, automated nurturing, deal probability
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-green-600" /> Predictive lead scoring</li>
                  <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-green-600" /> Smart lead routing</li>
                  <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-green-600" /> Conversion analytics</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-green-500 transition-all">
              <CardHeader>
                <MessageSquare className="h-10 w-10 text-green-600 mb-4" />
                <CardTitle>Omni-Channel Support</CardTitle>
                <CardDescription>
                  Email, Phone, Chat, Web, Portal with SLA tracking and automated escalation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-green-600" /> Multi-channel ticketing</li>
                  <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-green-600" /> SLA management</li>
                  <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-green-600" /> Knowledge base</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-purple-500 transition-all">
              <CardHeader>
                <TrendingUp className="h-10 w-10 text-purple-600 mb-4" />
                <CardTitle>Sales Pipeline</CardTitle>
                <CardDescription>
                  Visual pipeline, opportunity tracking, forecasting, win/loss analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-green-600" /> Stage automation</li>
                  <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-green-600" /> Revenue forecasting</li>
                  <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-green-600" /> Deal probability</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Industry 5.0 Revolutionary Features */}
      <section className="py-20 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-blue-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="mb-4">
              <span className="inline-block px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-semibold rounded-full">
                Industry 5.0 Exclusive
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                Revolutionary Technology
              </span>
            </h2>
            <p className="text-lg text-muted-foreground">
              The only CRM with quantum intelligence, holographic experiences, and AR/VR sales
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="border-2 border-purple-200 dark:border-purple-800 hover:border-purple-500 transition-all bg-white/50 dark:bg-gray-900/50 backdrop-blur">
              <CardHeader>
                <Brain className="h-12 w-12 text-purple-600 mb-4" />
                <CardTitle>Quantum Intelligence AI</CardTitle>
                <CardDescription>
                  Cognitive computing, neural processing, consciousness simulation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center"><Sparkles className="h-4 w-4 mr-2 text-purple-600" /> Knowledge graph intelligence</li>
                  <li className="flex items-center"><Sparkles className="h-4 w-4 mr-2 text-purple-600" /> Semantic analysis engine</li>
                  <li className="flex items-center"><Sparkles className="h-4 w-4 mr-2 text-purple-600" /> Contextual reasoning</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-pink-200 dark:border-pink-800 hover:border-pink-500 transition-all bg-white/50 dark:bg-gray-900/50 backdrop-blur">
              <CardHeader>
                <Eye className="h-12 w-12 text-pink-600 mb-4" />
                <CardTitle>Holographic Experience</CardTitle>
                <CardDescription>
                  Volumetric displays, interactive holograms, spatial computing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center"><Sparkles className="h-4 w-4 mr-2 text-pink-600" /> Light field projection</li>
                  <li className="flex items-center"><Sparkles className="h-4 w-4 mr-2 text-pink-600" /> 3D holographic displays</li>
                  <li className="flex items-center"><Sparkles className="h-4 w-4 mr-2 text-pink-600" /> Spatial interactions</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-200 dark:border-blue-800 hover:border-blue-500 transition-all bg-white/50 dark:bg-gray-900/50 backdrop-blur">
              <CardHeader>
                <Sparkles className="h-12 w-12 text-blue-600 mb-4" />
                <CardTitle>AR/VR Sales</CardTitle>
                <CardDescription>
                  Virtual showrooms, AR demos, VR meetings, 3D configurators
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center"><Sparkles className="h-4 w-4 mr-2 text-blue-600" /> Immersive showrooms</li>
                  <li className="flex items-center"><Sparkles className="h-4 w-4 mr-2 text-blue-600" /> Product visualization</li>
                  <li className="flex items-center"><Sparkles className="h-4 w-4 mr-2 text-blue-600" /> Haptic feedback</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-indigo-200 dark:border-indigo-800 hover:border-indigo-500 transition-all bg-white/50 dark:bg-gray-900/50 backdrop-blur">
              <CardHeader>
                <HeartHandshake className="h-12 w-12 text-indigo-600 mb-4" />
                <CardTitle>Emotional Intelligence</CardTitle>
                <CardDescription>
                  Emotion detection, empathy modeling, psychographic profiling
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center"><Sparkles className="h-4 w-4 mr-2 text-indigo-600" /> Facial/voice/text analysis</li>
                  <li className="flex items-center"><Sparkles className="h-4 w-4 mr-2 text-indigo-600" /> Sentiment tracking</li>
                  <li className="flex items-center"><Sparkles className="h-4 w-4 mr-2 text-indigo-600" /> Personality profiling</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* AI & Machine Learning */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                Advanced AI & Machine Learning
              </span>
            </h2>
            <p className="text-lg text-muted-foreground">
              10+ AI services with neural networks, LLMs, and predictive analytics
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card>
              <CardHeader>
                <Cpu className="h-10 w-10 text-cyan-600 mb-4" />
                <CardTitle>Neural Networks</CardTitle>
                <CardDescription>
                  CNN, RNN, Transformers, GANs for deep customer analysis
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Bot className="h-10 w-10 text-blue-600 mb-4" />
                <CardTitle>Conversational AI</CardTitle>
                <CardDescription>
                  87+ features with NLP, intent recognition, sentiment detection
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <TrendingUp className="h-10 w-10 text-purple-600 mb-4" />
                <CardTitle>Predictive Analytics</CardTitle>
                <CardDescription>
                  Revenue forecasting, churn prediction, deal closure probability
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Sparkles className="h-10 w-10 text-pink-600 mb-4" />
                <CardTitle>LLM Integration</CardTitle>
                <CardDescription>
                  GPT/Claude integration, AI content generation, recommendations
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Analytics & Reporting */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Analytics & Business Intelligence</h2>
            <p className="text-lg text-muted-foreground">
              199+ analytics methods with real-time dashboards and custom reporting
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <BarChart3 className="h-10 w-10 text-green-600 mb-4" />
                <CardTitle>Advanced Analytics (199+ Methods)</CardTitle>
                <CardDescription>
                  Real-time dashboards, custom reports, cohort analysis, funnel analysis, scheduled reporting
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Rocket className="h-10 w-10 text-orange-600 mb-4" />
                <CardTitle>Real-Time Analytics (114+ Features)</CardTitle>
                <CardDescription>
                  Live customer behavior, instant alerts, live dashboards, performance monitoring
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Award className="h-10 w-10 text-blue-600 mb-4" />
                <CardTitle>Business Intelligence</CardTitle>
                <CardDescription>
                  Conversion metrics, performance analytics, engagement tracking, satisfaction modeling
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Integration & Migration */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Universal Integration & Migration</h2>
            <p className="text-lg text-muted-foreground">
              One-click migration from ANY CRM with 200+ ERP fields and 100+ integrations
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card>
              <CardHeader>
                <Network className="h-10 w-10 text-orange-600 mb-4" />
                <CardTitle>Universal Migration</CardTitle>
                <CardDescription>
                  Salesforce, HubSpot, SAP, Oracle, Zoho with field mapping
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Database className="h-10 w-10 text-red-600 mb-4" />
                <CardTitle>200+ ERP Fields</CardTitle>
                <CardDescription>
                  Deepest ERP integration with sync status and metadata
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Globe className="h-10 w-10 text-blue-600 mb-4" />
                <CardTitle>Integration Hub</CardTitle>
                <CardDescription>
                  100+ integrations: Gmail, Outlook, Slack, Teams, APIs
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Phone className="h-10 w-10 text-green-600 mb-4" />
                <CardTitle>Telephony</CardTitle>
                <CardDescription>
                  VoIP, call recording, transcription, analytics, queues
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Enterprise Security */}
      <section className="py-20 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Enterprise Security & Compliance</h2>
            <p className="text-lg text-muted-foreground">
              230+ security methods with military-grade encryption and SOC 2 compliance
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="border-2 border-red-200 dark:border-red-800">
              <CardHeader>
                <Shield className="h-10 w-10 text-red-600 mb-4" />
                <CardTitle>230+ Security Methods</CardTitle>
                <CardDescription>
                  MFA (TOTP), SSO (Google, Azure, Okta), JWT, RBAC
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 border-orange-200 dark:border-orange-800">
              <CardHeader>
                <Lock className="h-10 w-10 text-orange-600 mb-4" />
                <CardTitle>Military-Grade Protection</CardTitle>
                <CardDescription>
                  RLS on 80+ tables, tenant isolation, field-level encryption
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 border-amber-200 dark:border-amber-800">
              <CardHeader>
                <FileText className="h-10 w-10 text-amber-600 mb-4" />
                <CardTitle>Compliance & Audit</CardTitle>
                <CardDescription>
                  SOC 2 Type II, GDPR, HIPAA ready, complete audit trails
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 border-yellow-200 dark:border-yellow-800">
              <CardHeader>
                <Activity className="h-10 w-10 text-yellow-600 mb-4" />
                <CardTitle>Threat Detection</CardTitle>
                <CardDescription>
                  Real-time monitoring, anomaly detection, DDoS protection
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Automation & Workflows */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Autonomous Workflows & Automation</h2>
            <p className="text-lg text-muted-foreground">
              400+ autonomous features with self-optimizing workflows
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Workflow className="h-10 w-10 text-indigo-600 mb-4" />
                <CardTitle>Autonomous Orchestrator (400+ Features)</CardTitle>
                <CardDescription>
                  AI-powered orchestration, self-optimizing workflows, predictive automation
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Zap className="h-10 w-10 text-purple-600 mb-4" />
                <CardTitle>Visual Workflow Builder (43+ Features)</CardTitle>
                <CardDescription>
                  Drag-and-drop designer, conditional logic, parallel processing
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Mail className="h-10 w-10 text-blue-600 mb-4" />
                <CardTitle>Marketing Automation</CardTitle>
                <CardDescription>
                  Email campaigns, A/B testing, sequences, behavioral triggers
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Additional Features */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Complete Feature Set</h2>
            <p className="text-lg text-muted-foreground">
              Everything you need for enterprise CRM
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card>
              <CardHeader>
                <PackageCheck className="h-10 w-10 text-teal-600 mb-4" />
                <CardTitle>Product & Inventory</CardTitle>
                <CardDescription>
                  Catalog, variants, pricing, stock tracking, alerts
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <FileText className="h-10 w-10 text-blue-600 mb-4" />
                <CardTitle>Document Management</CardTitle>
                <CardDescription>
                  Versioning, PDF generation, form builder, e-signature
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Award className="h-10 w-10 text-purple-600 mb-4" />
                <CardTitle>Billing & Subscriptions</CardTitle>
                <CardDescription>
                  Stripe integration, usage billing, invoices, dynamic pricing
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-10 w-10 text-green-600 mb-4" />
                <CardTitle>Organization Management</CardTitle>
                <CardDescription>
                  Multi-tenant, hierarchies, territories, resource allocation
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Calendar className="h-10 w-10 text-pink-600 mb-4" />
                <CardTitle>Activity & Task Management</CardTitle>
                <CardDescription>
                  Task assignment, priorities, reminders, templates
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Phone className="h-10 w-10 text-cyan-600 mb-4" />
                <CardTitle>Communication</CardTitle>
                <CardDescription>
                  Email campaigns, notifications, multi-channel messaging
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Target className="h-10 w-10 text-orange-600 mb-4" />
                <CardTitle>Sales Enablement</CardTitle>
                <CardDescription>
                  Playbooks, scripts, coaching, performance tracking
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Globe className="h-10 w-10 text-indigo-600 mb-4" />
                <CardTitle>Mobile & PWA</CardTitle>
                <CardDescription>
                  Native apps, offline mode, push notifications, mobile sync
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Competitive Advantages */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-cyan-500 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Why CognexiaAI Wins
            </h2>
            <p className="text-xl text-blue-100">
              10 competitive advantages no other CRM can match
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 text-center text-white">
            <div className="p-6 bg-white/10 backdrop-blur rounded-xl">
              <Sparkles className="h-8 w-8 mx-auto mb-3" />
              <div className="font-semibold">Industry 5.0</div>
              <div className="text-sm text-blue-100">Only holographic CRM</div>
            </div>
            <div className="p-6 bg-white/10 backdrop-blur rounded-xl">
              <Network className="h-8 w-8 mx-auto mb-3" />
              <div className="font-semibold">Universal Migration</div>
              <div className="text-sm text-blue-100">One-click from any CRM</div>
            </div>
            <div className="p-6 bg-white/10 backdrop-blur rounded-xl">
              <Database className="h-8 w-8 mx-auto mb-3" />
              <div className="font-semibold">200+ ERP Fields</div>
              <div className="text-sm text-blue-100">Deepest integration</div>
            </div>
            <div className="p-6 bg-white/10 backdrop-blur rounded-xl">
              <Brain className="h-8 w-8 mx-auto mb-3" />
              <div className="font-semibold">AI-First</div>
              <div className="text-sm text-blue-100">10+ AI services built-in</div>
            </div>
            <div className="p-6 bg-white/10 backdrop-blur rounded-xl">
              <Shield className="h-8 w-8 mx-auto mb-3" />
              <div className="font-semibold">Military Security</div>
              <div className="text-sm text-blue-100">SOC 2 compliant</div>
            </div>
            <div className="p-6 bg-white/10 backdrop-blur rounded-xl">
              <Eye className="h-8 w-8 mx-auto mb-3" />
              <div className="font-semibold">AR/VR Sales</div>
              <div className="text-sm text-blue-100">Immersive experiences</div>
            </div>
            <div className="p-6 bg-white/10 backdrop-blur rounded-xl">
              <Brain className="h-8 w-8 mx-auto mb-3" />
              <div className="font-semibold">Quantum AI</div>
              <div className="text-sm text-blue-100">Next-gen insights</div>
            </div>
            <div className="p-6 bg-white/10 backdrop-blur rounded-xl">
              <Workflow className="h-8 w-8 mx-auto mb-3" />
              <div className="font-semibold">Autonomous</div>
              <div className="text-sm text-blue-100">Self-optimizing</div>
            </div>
            <div className="p-6 bg-white/10 backdrop-blur rounded-xl">
              <Database className="h-8 w-8 mx-auto mb-3" />
              <div className="font-semibold">83 Entities</div>
              <div className="text-sm text-blue-100">Most comprehensive</div>
            </div>
            <div className="p-6 bg-white/10 backdrop-blur rounded-xl">
              <Rocket className="h-8 w-8 mx-auto mb-3" />
              <div className="font-semibold">99.9% Uptime</div>
              <div className="text-sm text-blue-100">Enterprise reliability</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Experience the Future?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join the Industry 5.0 revolution. Start your free trial today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="text-lg px-8 py-6 bg-gradient-to-r from-blue-600 to-cyan-500">
                Start Free Trial
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                Contact Sales
              </Button>
            </Link>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p>&copy; 2026 CognexiaAI. All rights reserved.</p>
            <p className="text-sm mt-2">
              Contact: <a href="mailto:sales@cognexiaai.com" className="hover:text-white">sales@cognexiaai.com</a> | 
              <a href="mailto:support@cognexiaai.com" className="hover:text-white ml-2">support@cognexiaai.com</a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
