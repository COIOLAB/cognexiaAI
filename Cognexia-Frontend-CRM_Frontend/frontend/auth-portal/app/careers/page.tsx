'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Brain, Sparkles, Users, Heart, TrendingUp, Zap, Award, Globe, CheckCircle2, ArrowRight, Briefcase, MapPin, Clock, DollarSign, Coffee, Home, GraduationCap, Rocket, Target, Shield, Code, Scale, HeartPulse, Video, Building2, Calendar, Monitor } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function CareersPage() {
  const jobOpenings = [
    {
      id: 1,
      title: 'Senior AI Engineer',
      department: 'Engineering',
      location: 'Remote / Hybrid',
      type: 'Full-time',
      experience: '5+ years',
      icon: Brain,
      color: 'from-blue-600 to-cyan-500',
      description: 'Build cutting-edge AI models for our Industry 5.0 platform'
    },
    {
      id: 2,
      title: 'Full Stack Developer',
      department: 'Engineering',
      location: 'Remote / On-site',
      type: 'Full-time',
      experience: '3+ years',
      icon: Code,
      color: 'from-green-600 to-emerald-500',
      description: 'Develop enterprise-grade features using React, Node.js, and TypeScript'
    },
    {
      id: 3,
      title: 'Product Manager - Legal AI',
      department: 'Product',
      location: 'Hybrid',
      type: 'Full-time',
      experience: '4+ years',
      icon: Scale,
      color: 'from-slate-600 to-purple-500',
      description: 'Lead product strategy for our Legal AI solution'
    },
    {
      id: 4,
      title: 'Healthcare AI Specialist',
      department: 'Product',
      location: 'Remote',
      type: 'Full-time',
      experience: '3+ years',
      icon: HeartPulse,
      color: 'from-cyan-600 to-blue-500',
      description: 'Drive innovation in healthcare AI with HIPAA-compliant solutions'
    },
    {
      id: 5,
      title: 'UX/UI Designer',
      department: 'Design',
      location: 'Remote / Hybrid',
      type: 'Full-time',
      experience: '3+ years',
      icon: Sparkles,
      color: 'from-purple-600 to-pink-500',
      description: 'Design beautiful, intuitive experiences for enterprise users'
    },
    {
      id: 6,
      title: 'DevOps Engineer',
      department: 'Engineering',
      location: 'Remote',
      type: 'Full-time',
      experience: '4+ years',
      icon: Rocket,
      color: 'from-orange-600 to-red-500',
      description: 'Build and maintain our cloud infrastructure with 99.9% uptime'
    },
    {
      id: 7,
      title: 'Machine Learning Researcher',
      department: 'Research',
      location: 'On-site / Hybrid',
      type: 'Full-time',
      experience: '4+ years',
      icon: Target,
      color: 'from-indigo-600 to-purple-500',
      description: 'Research next-gen AI algorithms and quantum intelligence'
    },
    {
      id: 8,
      title: 'Sales Executive - Enterprise',
      department: 'Sales',
      location: 'Remote',
      type: 'Full-time',
      experience: '5+ years',
      icon: TrendingUp,
      color: 'from-yellow-600 to-orange-500',
      description: 'Drive enterprise sales for Fortune 500 companies'
    },
    {
      id: 9,
      title: 'Customer Success Manager',
      department: 'Customer Success',
      location: 'Remote',
      type: 'Full-time',
      experience: '3+ years',
      icon: Users,
      color: 'from-blue-600 to-cyan-500',
      description: 'Ensure customer success and build lasting relationships'
    },
    {
      id: 10,
      title: 'Security Engineer',
      department: 'Security',
      location: 'Remote / Hybrid',
      type: 'Full-time',
      experience: '4+ years',
      icon: Shield,
      color: 'from-green-600 to-emerald-500',
      description: 'Maintain SOC 2 compliance and enterprise security standards'
    },
    {
      id: 11,
      title: 'Video AI Engineer',
      department: 'Engineering',
      location: 'Remote',
      type: 'Full-time',
      experience: '3+ years',
      icon: Video,
      color: 'from-orange-600 to-red-500',
      description: 'Build AI-powered video generation and editing tools'
    },
    {
      id: 12,
      title: 'Data Scientist',
      department: 'Data',
      location: 'Remote / Hybrid',
      type: 'Full-time',
      experience: '3+ years',
      icon: TrendingUp,
      color: 'from-purple-600 to-pink-500',
      description: 'Extract insights from billions of enterprise transactions'
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
                <span className="text-sm font-medium text-blue-300">Join the Future of Enterprise AI</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight">
                <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent animate-gradient">
                  Careers at CognexiaAI
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-blue-100 mb-4 font-light">
                Build the Technology of Tomorrow, Today
              </p>
              
              <p className="text-lg text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed">
                Join a team of world-class engineers, researchers, and innovators building Industry 5.0 solutions that transform how enterprises work. We're creating AI that matters.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a href="#open-positions">
                  <Button size="lg" className="text-lg px-10 py-7 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 font-semibold">
                    View Open Positions
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </a>
                <Link href="/about">
                  <Button size="lg" variant="outline" className="text-lg px-10 py-7 border-2 border-blue-400 text-blue-100 hover:bg-blue-500/10 shadow-lg font-semibold">
                    About CognexiaAI
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Why Join Us Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Why Join CognexiaAI?</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Work on cutting-edge technology with a team that values innovation, growth, and impact
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center mb-6">
                  <Rocket className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Cutting-Edge Innovation</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Work with Industry 5.0 technology, quantum intelligence, holographic experiences, and the latest AI/ML frameworks. Push the boundaries of what's possible.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-500 rounded-2xl flex items-center justify-center mb-6">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Career Growth</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Clear career progression paths, continuous learning opportunities, conference sponsorships, and mentorship from industry leaders.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-500 rounded-2xl flex items-center justify-center mb-6">
                  <Globe className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Global Impact</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Your work impacts 3,600+ clients globally across Fortune 500 companies and enterprises. Build solutions that matter at scale.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-600 to-red-500 rounded-2xl flex items-center justify-center mb-6">
                  <Heart className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Work-Life Balance</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Flexible work arrangements, unlimited PTO, remote-first culture, and a team that respects your time and wellbeing.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-600 to-orange-500 rounded-2xl flex items-center justify-center mb-6">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Diverse & Inclusive</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We celebrate diversity. Our team spans 20+ countries, and we're committed to building an inclusive workplace for everyone.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-500 rounded-2xl flex items-center justify-center mb-6">
                  <Award className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Best-in-Class Benefits</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Competitive compensation, equity, premium health insurance, retirement plans, and perks that support your lifestyle.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold mb-4">Comprehensive Benefits</h2>
                <p className="text-xl text-blue-100 max-w-3xl mx-auto">
                  We invest in our team with industry-leading benefits and perks
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <DollarSign className="h-10 w-10 text-cyan-300 mb-4" />
                  <h3 className="text-xl font-bold mb-2">Competitive Pay</h3>
                  <ul className="text-blue-100 text-sm space-y-2">
                    <li>• Top-tier salary packages</li>
                    <li>• Equity & stock options</li>
                    <li>• Performance bonuses</li>
                    <li>• Annual raises</li>
                  </ul>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <Heart className="h-10 w-10 text-pink-300 mb-4" />
                  <h3 className="text-xl font-bold mb-2">Health & Wellness</h3>
                  <ul className="text-blue-100 text-sm space-y-2">
                    <li>• Premium health insurance</li>
                    <li>• Dental & vision coverage</li>
                    <li>• Mental health support</li>
                    <li>• Fitness stipend</li>
                  </ul>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <Home className="h-10 w-10 text-green-300 mb-4" />
                  <h3 className="text-xl font-bold mb-2">Work Flexibility</h3>
                  <ul className="text-blue-100 text-sm space-y-2">
                    <li>• Remote-first culture</li>
                    <li>• Flexible working hours</li>
                    <li>• Unlimited PTO</li>
                    <li>• Hybrid options</li>
                  </ul>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <GraduationCap className="h-10 w-10 text-purple-300 mb-4" />
                  <h3 className="text-xl font-bold mb-2">Growth & Learning</h3>
                  <ul className="text-blue-100 text-sm space-y-2">
                    <li>• Learning budget</li>
                    <li>• Conference sponsorship</li>
                    <li>• Internal training</li>
                    <li>• Career mentorship</li>
                  </ul>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <Coffee className="h-10 w-10 text-orange-300 mb-4" />
                  <h3 className="text-xl font-bold mb-2">Perks & Lifestyle</h3>
                  <ul className="text-blue-100 text-sm space-y-2">
                    <li>• Home office setup</li>
                    <li>• Premium tech gear</li>
                    <li>• Team events & retreats</li>
                    <li>• Snacks & beverages</li>
                  </ul>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <Calendar className="h-10 w-10 text-yellow-300 mb-4" />
                  <h3 className="text-xl font-bold mb-2">Time Off</h3>
                  <ul className="text-blue-100 text-sm space-y-2">
                    <li>• Unlimited vacation</li>
                    <li>• Paid holidays</li>
                    <li>• Parental leave</li>
                    <li>• Sabbatical options</li>
                  </ul>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <Shield className="h-10 w-10 text-blue-300 mb-4" />
                  <h3 className="text-xl font-bold mb-2">Financial Security</h3>
                  <ul className="text-blue-100 text-sm space-y-2">
                    <li>• 401(k) matching</li>
                    <li>• Retirement planning</li>
                    <li>• Life insurance</li>
                    <li>• Disability coverage</li>
                  </ul>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <Monitor className="h-10 w-10 text-indigo-300 mb-4" />
                  <h3 className="text-xl font-bold mb-2">Equipment</h3>
                  <ul className="text-blue-100 text-sm space-y-2">
                    <li>• Latest MacBook Pro</li>
                    <li>• Multiple monitors</li>
                    <li>• Ergonomic furniture</li>
                    <li>• Premium accessories</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Open Positions Section */}
        <section id="open-positions" className="container mx-auto px-4 py-20">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Open Positions</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Find your next career move and help us build the future of enterprise AI
              </p>
            </div>

            <div className="space-y-4">
              {jobOpenings.map((job) => {
                const IconComponent = job.icon;
                return (
                  <div key={job.id} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1 border-2 border-transparent hover:border-blue-500">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`w-12 h-12 bg-gradient-to-br ${job.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                          <IconComponent className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold mb-2">{job.title}</h3>
                          <p className="text-muted-foreground text-sm mb-3">{job.description}</p>
                          <div className="flex flex-wrap gap-3 text-sm">
                            <span className="inline-flex items-center gap-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full">
                              <Briefcase className="h-3 w-3" />
                              {job.department}
                            </span>
                            <span className="inline-flex items-center gap-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-3 py-1 rounded-full">
                              <MapPin className="h-3 w-3" />
                              {job.location}
                            </span>
                            <span className="inline-flex items-center gap-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-full">
                              <Clock className="h-3 w-3" />
                              {job.type}
                            </span>
                            <span className="inline-flex items-center gap-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-3 py-1 rounded-full">
                              <Award className="h-3 w-3" />
                              {job.experience}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <Link href="/careers/apply">
                          <Button className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 font-semibold w-full md:w-auto">
                            Apply Now
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="text-center mt-12">
              <p className="text-muted-foreground mb-4">
                Don't see a position that fits? We're always looking for exceptional talent.
              </p>
              <Link href="/careers/apply">
                <Button variant="outline" size="lg" className="font-semibold">
                  Send Us Your Resume
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Our Culture Section */}
        <section className="bg-white dark:bg-gray-900 py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold mb-4">Our Culture & Values</h2>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                  The principles that define how we work and collaborate
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl p-8 text-white">
                  <Zap className="h-12 w-12 mb-4" />
                  <h3 className="text-2xl font-bold mb-4">Innovation & Excellence</h3>
                  <p className="text-blue-50 leading-relaxed">
                    We push boundaries, embrace challenges, and deliver excellence. CMMI Level 5 certification isn't just a badge—it's how we operate every day.
                  </p>
                </div>

                <div className="bg-gradient-to-br from-purple-600 to-pink-500 rounded-2xl p-8 text-white">
                  <Users className="h-12 w-12 mb-4" />
                  <h3 className="text-2xl font-bold mb-4">Collaboration & Respect</h3>
                  <p className="text-purple-50 leading-relaxed">
                    We believe the best ideas come from diverse teams working together. Everyone's voice matters, and we respect each perspective.
                  </p>
                </div>

                <div className="bg-gradient-to-br from-green-600 to-emerald-500 rounded-2xl p-8 text-white">
                  <Target className="h-12 w-12 mb-4" />
                  <h3 className="text-2xl font-bold mb-4">Ownership & Impact</h3>
                  <p className="text-green-50 leading-relaxed">
                    We empower team members to take ownership of projects and make meaningful impact. Your work directly influences 3,600+ global clients.
                  </p>
                </div>

                <div className="bg-gradient-to-br from-orange-600 to-red-500 rounded-2xl p-8 text-white">
                  <Heart className="h-12 w-12 mb-4" />
                  <h3 className="text-2xl font-bold mb-4">Growth & Development</h3>
                  <p className="text-orange-50 leading-relaxed">
                    We invest in continuous learning and career development. Your growth is our success, and we provide resources to help you thrive.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Application Process Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Our Hiring Process</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                A transparent, efficient process designed to find the perfect fit
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                  1
                </div>
                <h3 className="text-xl font-bold mb-2">Apply</h3>
                <p className="text-muted-foreground text-sm">
                  Submit your application with resume and portfolio. We review every application carefully.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                  2
                </div>
                <h3 className="text-xl font-bold mb-2">Screen</h3>
                <p className="text-muted-foreground text-sm">
                  Initial call with our team to discuss your background and interests (30 mins).
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                  3
                </div>
                <h3 className="text-xl font-bold mb-2">Interview</h3>
                <p className="text-muted-foreground text-sm">
                  Technical/role-specific interviews with team members. Meet potential colleagues.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-600 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                  4
                </div>
                <h3 className="text-xl font-bold mb-2">Offer</h3>
                <p className="text-muted-foreground text-sm">
                  Competitive offer with comprehensive benefits. Welcome to CognexiaAI!
                </p>
              </div>
            </div>

            <div className="mt-12 bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-8 border-2 border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-4">
                <CheckCircle2 className="h-6 w-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold mb-2">Fair & Inclusive Process</h3>
                  <p className="text-muted-foreground">
                    We're committed to a fair, transparent hiring process. We evaluate candidates on skills and potential, not pedigree. We welcome applicants from all backgrounds and provide reasonable accommodations when needed.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-blue-600 to-cyan-500 rounded-3xl p-12 shadow-2xl text-white text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Join Us?</h2>
            <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
              Be part of a team that's building the future of enterprise AI serving 3,600+ clients globally. Your next career move starts here.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="#open-positions">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 font-semibold shadow-xl text-lg px-10 py-7">
                  View Open Positions
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </a>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 font-semibold text-lg px-10 py-7">
                  Get in Touch
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
