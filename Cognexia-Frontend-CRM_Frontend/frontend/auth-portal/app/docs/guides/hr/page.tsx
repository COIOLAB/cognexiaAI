'use client';

import Link from 'next/link';
import { ArrowLeft, UserCheck, Calendar, TrendingUp, Clock } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function HRGuidePage() {
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
              Documentation / User Guides / HR Management Guide
            </div>
          </div>

          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">HR Management Guide</h1>
            <p className="text-xl text-muted-foreground">
              Complete employee lifecycle management system
            </p>
          </div>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            
            <section className="bg-gradient-to-br from-purple-600 to-pink-500 rounded-2xl p-8 text-white mb-8">
              <div className="flex items-center gap-3 mb-4">
                <UserCheck className="h-8 w-8" />
                <h2 className="text-3xl font-bold m-0">HR Module Overview</h2>
              </div>
              <p className="text-lg text-purple-100 m-0">
                Manage employees, track attendance, process payroll, and streamline HR operations
              </p>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
              <h2 className="text-3xl font-bold mb-6">Employee Management</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold mb-3">Adding Employees</h3>
                  <ol className="list-decimal pl-6 space-y-2">
                    <li>Navigate to <strong>HR → Employees</strong></li>
                    <li>Click <strong>+ Add Employee</strong></li>
                    <li>Enter personal information (Name, Email, Phone, DOB)</li>
                    <li>Set employment details (Department, Position, Join Date, Salary)</li>
                    <li>Upload documents (ID, contracts, certifications)</li>
                    <li>Assign manager and access permissions</li>
                  </ol>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-3">Employee Directory</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-4">
                      <p className="font-bold mb-2">Search & Filter</p>
                      <p className="text-sm text-muted-foreground">By department, position, location, status</p>
                    </div>
                    <div className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-4">
                      <p className="font-bold mb-2">Org Chart</p>
                      <p className="text-sm text-muted-foreground">Visual hierarchy and reporting lines</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
              <h2 className="text-3xl font-bold mb-6">Attendance Tracking</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold mb-3">Clock In/Out</h3>
                  <div className="bg-slate-900 rounded-xl p-6">
                    <p className="text-slate-300 text-sm mb-2">Multiple Methods:</p>
                    <ul className="text-green-400 font-mono text-sm list-disc pl-6 space-y-1">
                      <li>Web Portal - Dashboard → Clock In</li>
                      <li>Mobile App - GPS-verified location</li>
                      <li>Biometric Devices - Face/fingerprint recognition</li>
                      <li>API Integration - Custom kiosks</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-3">Leave Management</h3>
                  <ol className="list-decimal pl-6 space-y-2">
                    <li>Employees submit leave requests via self-service portal</li>
                    <li>Managers receive email notifications</li>
                    <li>Approve or reject with comments</li>
                    <li>Auto-deduct from leave balance</li>
                    <li>Track leave accruals and carry-forwards</li>
                  </ol>

                  <div className="grid md:grid-cols-4 gap-4 mt-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                      <p className="text-sm text-muted-foreground">Annual Leave</p>
                      <p className="text-2xl font-bold text-blue-600">15 days</p>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
                      <p className="text-sm text-muted-foreground">Sick Leave</p>
                      <p className="text-2xl font-bold text-green-600">10 days</p>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4">
                      <p className="text-sm text-muted-foreground">Personal</p>
                      <p className="text-2xl font-bold text-purple-600">5 days</p>
                    </div>
                    <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4">
                      <p className="text-sm text-muted-foreground">Used</p>
                      <p className="text-2xl font-bold text-orange-600">8 days</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-3">Shift Management</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Create and manage shift schedules</li>
                    <li>Assign employees to shifts</li>
                    <li>Handle shift swaps and overtime</li>
                    <li>Track shift differentials for payroll</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
              <h2 className="text-3xl font-bold mb-6">Payroll Processing</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold mb-3">Payroll Setup</h3>
                  <ol className="list-decimal pl-6 space-y-2">
                    <li>Configure pay periods (monthly, bi-weekly, weekly)</li>
                    <li>Set up salary components (base, allowances, deductions)</li>
                    <li>Define tax rules and statutory compliance</li>
                    <li>Connect bank accounts for direct deposit</li>
                  </ol>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-3">Running Payroll</h3>
                  <div className="bg-slate-900 rounded-xl p-6 mb-4">
                    <p className="text-slate-300 text-sm mb-2">Automated Process:</p>
                    <pre className="text-green-400 font-mono text-sm">
{`1. Calculate Gross Pay (Salary + Overtime + Bonuses)
2. Apply Deductions (Tax, Insurance, Loans)
3. Generate Net Pay
4. Create Payslips
5. Process Bank Transfers
6. Update Accounting Ledgers`}
                    </pre>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4">
                    <p className="text-sm m-0">
                      <strong>Compliance:</strong> Automatically handles tax calculations for 150+ countries
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
              <h2 className="text-3xl font-bold mb-6">Performance Management</h2>
              
              <div className="space-y-4">
                <div className="flex gap-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                  <TrendingUp className="h-6 w-6 text-purple-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-bold mb-1">Goal Setting (OKRs/KPIs)</p>
                    <p className="text-sm text-muted-foreground m-0">Define objectives, key results, and track progress quarterly</p>
                  </div>
                </div>
                
                <div className="flex gap-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                  <Calendar className="h-6 w-6 text-purple-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-bold mb-1">Performance Reviews</p>
                    <p className="text-sm text-muted-foreground m-0">360-degree feedback, annual reviews, and continuous feedback</p>
                  </div>
                </div>
                
                <div className="flex gap-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                  <Clock className="h-6 w-6 text-purple-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-bold mb-1">1-on-1 Meetings</p>
                    <p className="text-sm text-muted-foreground m-0">Schedule and document regular check-ins with direct reports</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
              <h2 className="text-3xl font-bold mb-6">Recruitment & Onboarding</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold mb-3">Applicant Tracking</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Post jobs to multiple boards</li>
                    <li>Screen and rank candidates</li>
                    <li>Schedule interviews</li>
                    <li>Collect feedback from interviewers</li>
                    <li>Send offer letters</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-3">Onboarding Workflow</h3>
                  <ol className="list-decimal pl-6 space-y-2">
                    <li>Send pre-boarding documents (contracts, policies)</li>
                    <li>Create IT accounts and email</li>
                    <li>Assign equipment and workspace</li>
                    <li>Schedule orientation and training</li>
                    <li>Assign buddy/mentor</li>
                    <li>30/60/90 day check-ins</li>
                  </ol>
                </div>
              </div>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
              <h2 className="text-3xl font-bold mb-6">Reports & Analytics</h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-4">
                  <p className="font-bold mb-2">Headcount Reports</p>
                  <p className="text-sm text-muted-foreground">By department, location, status</p>
                </div>
                <div className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-4">
                  <p className="font-bold mb-2">Turnover Analysis</p>
                  <p className="text-sm text-muted-foreground">Attrition rates and trends</p>
                </div>
                <div className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-4">
                  <p className="font-bold mb-2">Attendance Reports</p>
                  <p className="text-sm text-muted-foreground">Late arrivals, absences, overtime</p>
                </div>
                <div className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-4">
                  <p className="font-bold mb-2">Payroll Summary</p>
                  <p className="text-sm text-muted-foreground">Cost analysis by department</p>
                </div>
              </div>
            </section>

            <section className="bg-gradient-to-br from-purple-600 to-pink-500 rounded-2xl p-8 text-white">
              <h2 className="text-3xl font-bold mb-6">Next Steps</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <Link href="/docs/guides/finance" className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all">
                  <h3 className="font-bold mb-2">Finance Module →</h3>
                  <p className="text-sm text-purple-100 m-0">Accounting & invoicing</p>
                </Link>
                <Link href="/docs/api/rest" className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all">
                  <h3 className="font-bold mb-2">HR API →</h3>
                  <p className="text-sm text-purple-100 m-0">Integrate HR data</p>
                </Link>
                <Link href="/docs/guides/analytics" className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all">
                  <h3 className="font-bold mb-2">HR Analytics →</h3>
                  <p className="text-sm text-purple-100 m-0">Workforce insights</p>
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
