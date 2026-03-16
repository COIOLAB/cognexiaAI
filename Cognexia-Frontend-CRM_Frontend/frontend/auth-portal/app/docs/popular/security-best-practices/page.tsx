'use client';

import Link from 'next/link';
import { ArrowLeft, Shield, Lock, AlertTriangle, CheckCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function SecurityBestPracticesPage() {
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
            <div className="text-sm text-muted-foreground mb-2">
              Documentation / Popular / Security Best Practices
            </div>
            <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <span className="bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded">Security</span>
              <span>20 min read</span>
            </div>
          </div>

          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Security Best Practices</h1>
            <p className="text-xl text-muted-foreground">
              Enterprise-grade security guidelines for CognexiaAI ERP
            </p>
          </div>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            
            <section className="bg-gradient-to-br from-red-600 to-orange-600 rounded-2xl p-8 text-white mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="h-8 w-8" />
                <h2 className="text-3xl font-bold m-0">Security Overview</h2>
              </div>
              <p className="text-lg text-red-100 m-0">
                CMMI Level 5, ISO 27001, SOC 2 Type II certified security practices
              </p>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
              <h2 className="text-3xl font-bold mb-6">Authentication Security</h2>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Multi-Factor Authentication (MFA)</p>
                    <p className="text-sm text-muted-foreground m-0">Enable MFA for all admin and privileged accounts</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Strong Password Policy</p>
                    <p className="text-sm text-muted-foreground m-0">Minimum 12 characters, complexity requirements, 90-day rotation</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Session Management</p>
                    <p className="text-sm text-muted-foreground m-0">30-minute idle timeout, secure session tokens</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
              <h2 className="text-3xl font-bold mb-6">API Security</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold mb-3">1. API Key Management</h3>
                  <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 mb-3">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm m-0">
                        <strong>Never</strong> commit API keys to version control or expose them in client-side code
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-slate-900 rounded-xl p-6">
                    <pre className="text-green-400 font-mono text-sm">
{`# Store in environment variables
export COGNEXIA_API_KEY="sk_live_..."

# Use in application
const apiKey = process.env.COGNEXIA_API_KEY;`}
                    </pre>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-3">2. Rate Limiting</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Implement client-side rate limiting</li>
                    <li>Respect X-RateLimit-* headers</li>
                    <li>Implement exponential backoff for retries</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-3">3. Request Validation</h3>
                  <div className="bg-slate-900 rounded-xl p-6">
                    <pre className="text-green-400 font-mono text-sm">
{`// Validate and sanitize all inputs
const validateEmail = (email) => {
  const regex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
  return regex.test(email);
};

// Prevent injection attacks
const sanitizeInput = (input) => {
  return input.replace(/[<>]/g, '');
};`}
                    </pre>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
              <h2 className="text-3xl font-bold mb-6">Data Protection</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="border-2 border-blue-200 dark:border-blue-800 rounded-xl p-6 bg-blue-50 dark:bg-blue-900/20">
                  <Lock className="h-6 w-6 text-blue-600 mb-3" />
                  <h3 className="font-bold mb-2">Encryption at Rest</h3>
                  <p className="text-sm text-muted-foreground">AES-256 encryption for all stored data</p>
                </div>
                
                <div className="border-2 border-purple-200 dark:border-purple-800 rounded-xl p-6 bg-purple-50 dark:bg-purple-900/20">
                  <Shield className="h-6 w-6 text-purple-600 mb-3" />
                  <h3 className="font-bold mb-2">Encryption in Transit</h3>
                  <p className="text-sm text-muted-foreground">TLS 1.3 for all API communications</p>
                </div>
              </div>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
              <h2 className="text-3xl font-bold mb-6">Access Control</h2>
              
              <div className="space-y-4">
                <div className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl">
                  <h3 className="font-bold mb-2">Role-Based Access Control (RBAC)</h3>
                  <p className="text-sm text-muted-foreground">Assign minimum necessary permissions to each role</p>
                </div>
                
                <div className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl">
                  <h3 className="font-bold mb-2">Principle of Least Privilege</h3>
                  <p className="text-sm text-muted-foreground">Users should only have access to data they need</p>
                </div>
                
                <div className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl">
                  <h3 className="font-bold mb-2">Regular Access Reviews</h3>
                  <p className="text-sm text-muted-foreground">Audit permissions quarterly, revoke unused access</p>
                </div>
              </div>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
              <h2 className="text-3xl font-bold mb-6">Security Monitoring</h2>
              
              <ol className="list-decimal pl-6 space-y-3">
                <li>Enable audit logging for all critical operations</li>
                <li>Monitor failed login attempts and unusual access patterns</li>
                <li>Set up alerts for suspicious activities</li>
                <li>Regular security scans and penetration testing</li>
                <li>Incident response plan and procedures</li>
              </ol>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
              <h2 className="text-3xl font-bold mb-6">Compliance Checklist</h2>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl">
                  <input type="checkbox" className="h-5 w-5" />
                  <span>GDPR data protection requirements</span>
                </div>
                <div className="flex items-center gap-3 p-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl">
                  <input type="checkbox" className="h-5 w-5" />
                  <span>SOC 2 Type II controls</span>
                </div>
                <div className="flex items-center gap-3 p-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl">
                  <input type="checkbox" className="h-5 w-5" />
                  <span>ISO 27001 information security</span>
                </div>
                <div className="flex items-center gap-3 p-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl">
                  <input type="checkbox" className="h-5 w-5" />
                  <span>HIPAA compliance (if applicable)</span>
                </div>
              </div>
            </section>

            <section className="bg-gradient-to-br from-red-600 to-orange-600 rounded-2xl p-8 text-white">
              <h2 className="text-3xl font-bold mb-6">Next Steps</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <Link href="/docs/api/authentication" className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all">
                  <h3 className="font-bold mb-2">Authentication →</h3>
                  <p className="text-sm text-red-100 m-0">Secure API access</p>
                </Link>
                <Link href="/trust-center" className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all">
                  <h3 className="font-bold mb-2">Trust Center →</h3>
                  <p className="text-sm text-red-100 m-0">Certifications</p>
                </Link>
                <Link href="/support" className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all">
                  <h3 className="font-bold mb-2">Security Team →</h3>
                  <p className="text-sm text-red-100 m-0">Report issues</p>
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
