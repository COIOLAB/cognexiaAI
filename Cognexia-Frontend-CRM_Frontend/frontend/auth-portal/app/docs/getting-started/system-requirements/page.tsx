'use client';

import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Server, Database, Cloud, Monitor } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function SystemRequirementsPage() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-12 max-w-5xl">
          <div className="mb-8">
            <Link href="/documentation" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Documentation
            </Link>
            <div className="text-sm text-muted-foreground">
              Documentation / Getting Started / System Requirements
            </div>
          </div>

          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">System Requirements</h1>
            <p className="text-xl text-muted-foreground">
              Hardware and software specifications for optimal CognexiaAI ERP performance
            </p>
          </div>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            
            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
              <div className="flex items-center gap-3 mb-6">
                <Server className="h-8 w-8 text-blue-600" />
                <h2 className="text-3xl font-bold m-0">Server Requirements</h2>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold mb-4">Minimum Requirements</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-4">
                      <strong className="text-lg mb-2 block">CPU</strong>
                      <p className="text-muted-foreground m-0">4 cores @ 2.5 GHz</p>
                    </div>
                    <div className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-4">
                      <strong className="text-lg mb-2 block">RAM</strong>
                      <p className="text-muted-foreground m-0">16 GB DDR4</p>
                    </div>
                    <div className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-4">
                      <strong className="text-lg mb-2 block">Storage</strong>
                      <p className="text-muted-foreground m-0">100 GB SSD</p>
                    </div>
                    <div className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-4">
                      <strong className="text-lg mb-2 block">Network</strong>
                      <p className="text-muted-foreground m-0">1 Gbps bandwidth</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-bold mb-4">Recommended (Production)</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="border-2 border-blue-200 dark:border-blue-800 rounded-xl p-4 bg-blue-50 dark:bg-blue-900/20">
                      <strong className="text-lg mb-2 block">CPU</strong>
                      <p className="text-muted-foreground m-0">8+ cores @ 3.0 GHz</p>
                    </div>
                    <div className="border-2 border-blue-200 dark:border-blue-800 rounded-xl p-4 bg-blue-50 dark:bg-blue-900/20">
                      <strong className="text-lg mb-2 block">RAM</strong>
                      <p className="text-muted-foreground m-0">32 GB DDR4</p>
                    </div>
                    <div className="border-2 border-blue-200 dark:border-blue-800 rounded-xl p-4 bg-blue-50 dark:bg-blue-900/20">
                      <strong className="text-lg mb-2 block">Storage</strong>
                      <p className="text-muted-foreground m-0">500 GB NVMe SSD</p>
                    </div>
                    <div className="border-2 border-blue-200 dark:border-blue-800 rounded-xl p-4 bg-blue-50 dark:bg-blue-900/20">
                      <strong className="text-lg mb-2 block">Network</strong>
                      <p className="text-muted-foreground m-0">10 Gbps bandwidth</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
              <div className="flex items-center gap-3 mb-6">
                <Database className="h-8 w-8 text-purple-600" />
                <h2 className="text-3xl font-bold m-0">Database Requirements</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <strong>PostgreSQL 14+ (Recommended)</strong>
                    <p className="text-muted-foreground m-0">Best performance with advanced features</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <strong>MySQL 8.0+</strong>
                    <p className="text-muted-foreground m-0">Fully supported alternative</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <strong>MongoDB 6.0+</strong>
                    <p className="text-muted-foreground m-0">For document storage and AI features</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
              <div className="flex items-center gap-3 mb-6">
                <Monitor className="h-8 w-8 text-green-600" />
                <h2 className="text-3xl font-bold m-0">Software Requirements</h2>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold mb-3">Operating System</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      Ubuntu 20.04 LTS or later
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      RHEL 8+ / CentOS 8+
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      Windows Server 2019+
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      macOS 12+ (Development only)
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-3">Runtime Environment</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      Node.js 18.x or 20.x LTS
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      Python 3.10 or 3.11
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      Docker 24+ and Docker Compose 2.x
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
              <div className="flex items-center gap-3 mb-6">
                <Cloud className="h-8 w-8 text-orange-600" />
                <h2 className="text-3xl font-bold m-0">Cloud Platform Support</h2>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl">
                  <h3 className="font-bold text-lg mb-2">AWS</h3>
                  <p className="text-sm text-muted-foreground">EC2, RDS, S3, ECS</p>
                </div>
                <div className="text-center p-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl">
                  <h3 className="font-bold text-lg mb-2">Azure</h3>
                  <p className="text-sm text-muted-foreground">VMs, SQL Database, Blob Storage</p>
                </div>
                <div className="text-center p-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl">
                  <h3 className="font-bold text-lg mb-2">Google Cloud</h3>
                  <p className="text-sm text-muted-foreground">Compute Engine, Cloud SQL, GCS</p>
                </div>
              </div>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
              <h2 className="text-3xl font-bold mb-6">Browser Compatibility</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xl font-bold mb-3 text-green-600">✓ Supported</h3>
                  <ul className="space-y-2">
                    <li>Chrome 100+ (Recommended)</li>
                    <li>Firefox 100+</li>
                    <li>Safari 15+</li>
                    <li>Edge 100+</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-3 text-red-600">✗ Not Supported</h3>
                  <ul className="space-y-2">
                    <li>Internet Explorer (all versions)</li>
                    <li>Opera Mini</li>
                    <li>Browsers with JavaScript disabled</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl p-8 text-white">
              <h2 className="text-3xl font-bold mb-6">Next Steps</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <Link href="/docs/getting-started/installation" className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all">
                  <h3 className="font-bold mb-2">Installation Guide →</h3>
                  <p className="text-sm text-blue-100 m-0">Begin installation process</p>
                </Link>
                <Link href="/docs/getting-started/configuration" className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all">
                  <h3 className="font-bold mb-2">Configuration →</h3>
                  <p className="text-sm text-blue-100 m-0">Configure your system</p>
                </Link>
              </div>
            </section>

          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
