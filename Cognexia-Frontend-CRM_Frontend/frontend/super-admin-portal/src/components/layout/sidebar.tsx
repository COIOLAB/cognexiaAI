'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  CreditCard, 
  TrendingUp, 
  Activity,
  Settings,
  BarChart3,
  DollarSign,
  HeartPulse,
  UserCog,
  Shield,
  Zap,
  Headphones,
  Sliders,
  Bell,
  Workflow,
  FileText,
  Globe,
  Upload,
  Target,
  FlaskConical,
  Key,
  Smartphone,
  Palette,
  Brain,
  Lightbulb,
  MessageSquare,
  AlertTriangle,
  Database,
  HardDrive,
  Rocket,
  Code,
  CheckCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  // Core
  { name: 'Dashboard', href: '/', icon: LayoutDashboard, section: 'Core' },
  { name: 'Organizations', href: '/organizations', icon: Building2, section: 'Core' },
  { name: 'Users', href: '/users', icon: Users, section: 'Core' },
  { name: 'Billing', href: '/billing', icon: CreditCard, section: 'Core' },
  
  // Analytics & Insights
  { name: 'Platform Analytics', href: '/analytics', icon: BarChart3, section: 'Analytics' },
  { name: 'Revenue & Billing', href: '/revenue', icon: DollarSign, section: 'Analytics' },
  { name: 'Organization Health', href: '/health', icon: HeartPulse, section: 'Analytics' },
  { name: 'Feature Usage', href: '/feature-usage', icon: Zap, section: 'Analytics' },
  
  // User Management
  { name: 'User Impersonation', href: '/users/impersonate', icon: UserCog, section: 'Management' },
  
  // Security & Compliance
  { name: 'Security Center', href: '/security', icon: Shield, section: 'Security' },
  
  // Operations
  { name: 'Support Tickets', href: '/tickets', icon: Headphones, section: 'Operations' },
  { name: 'Communication', href: '/communications', icon: Bell, section: 'Operations' },
  { name: 'Workflows', href: '/workflows', icon: Workflow, section: 'Operations' },
  
  // Configuration
  { name: 'System Config', href: '/config', icon: Sliders, section: 'Configuration' },
  { name: 'API Management', href: '/api-management', icon: Key, section: 'Configuration' },
  { name: 'White-Label', href: '/white-label', icon: Palette, section: 'Configuration' },
  
  // Advanced
  { name: 'Custom Reports', href: '/reports', icon: FileText, section: 'Advanced' },
  { name: 'Multi-Region', href: '/regions', icon: Globe, section: 'Advanced' },
  { name: 'Organization Onboarding', href: '/onboarding', icon: Upload, section: 'Advanced' },
  { name: 'KPI Goals', href: '/kpis', icon: Target, section: 'Advanced' },
  { name: 'A/B Testing', href: '/ab-testing', icon: FlaskConical, section: 'Advanced' },
  { name: 'Mobile Admin', href: '/mobile', icon: Smartphone, section: 'Advanced' },
  
  // AI & Intelligence (NEW)
  { name: 'Predictive Analytics', href: '/predictive-analytics', icon: Brain, section: 'AI' },
  { name: 'Smart Recommendations', href: '/recommendations', icon: Lightbulb, section: 'AI' },
  { name: 'NL Query', href: '/nl-query', icon: MessageSquare, section: 'AI' },
  { name: 'Anomaly Detection', href: '/anomaly-detection', icon: AlertTriangle, section: 'AI' },
  { name: 'Health Scoring v2', href: '/health-v2', icon: HeartPulse, section: 'AI' },
  
  // Operations & Infrastructure (NEW)
  { name: 'DB Console', href: '/db-console', icon: Database, section: 'Infrastructure' },
  { name: 'Audit Logs', href: '/audit', icon: FileText, section: 'Infrastructure' },
  { name: 'Performance', href: '/performance-monitor', icon: Activity, section: 'Infrastructure' },
  { name: 'Disaster Recovery', href: '/disaster-recovery', icon: HardDrive, section: 'Infrastructure' },
  
  // Financial (NEW)
  { name: 'Financial Analytics', href: '/financial-advanced', icon: TrendingUp, section: 'Financial' },
  { name: 'Invoices', href: '/invoices', icon: FileText, section: 'Financial' },
  
  // Customer Success (NEW)
  { name: 'CS Milestones', href: '/customer-success', icon: CheckCircle, section: 'Success' },
  { name: 'Support Analytics+', href: '/support-analytics-advanced', icon: Headphones, section: 'Success' },
  
  // Developer (NEW)
  { name: 'Dev Portal', href: '/dev-portal', icon: Code, section: 'Developer' },
  { name: 'Releases', href: '/releases', icon: Rocket, section: 'Developer' },
  
  // Legacy
  { name: 'System Health', href: '/system-health', icon: Activity, section: 'Legacy' },
  { name: 'Settings', href: '/settings', icon: Settings, section: 'Legacy' },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  // Group items by section
  const sections = navItems.reduce((acc: any, item) => {
    if (!acc[item.section]) acc[item.section] = [];
    acc[item.section].push(item);
    return acc;
  }, {});

  const sectionOrder = ['Core', 'Analytics', 'AI', 'Management', 'Security', 'Operations', 'Configuration', 'Advanced', 'Infrastructure', 'Financial', 'Success', 'Developer'];

  return (
    <div className={cn(
      "flex h-full flex-col border-r-2 border-blue-200 bg-white dark:border-blue-800 dark:bg-gray-950 transition-all duration-300 shadow-lg",
      collapsed ? "w-20" : "w-64"
    )}>
      {/* Logo Header */}
      <div className="flex h-24 items-center justify-between px-6 border-b-2 border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800 shadow-sm">
        {!collapsed ? (
          <>
            <Link href="/" className="flex items-center hover:opacity-90 transition-all transform hover:scale-105">
              <img src="/cognexiaai-logo.png" alt="CognexiaAI Logo" className="h-20 w-auto" />
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed(true)}
              className="h-10 w-10 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-full"
              title="Collapse sidebar"
            >
              <ChevronLeft className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </Button>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center w-full gap-2">
            <Link href="/" className="hover:opacity-90 transition-all transform hover:scale-105">
              <img src="/cognexiaai-logo.png" alt="CognexiaAI" className="h-12 w-auto" />
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed(false)}
              className="h-8 w-8 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-full"
              title="Expand sidebar"
            >
              <ChevronRight className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </Button>
          </div>
        )}
      </div>
      
      {!collapsed && (
        <div className="px-4 py-3 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border-b-2 border-purple-200 dark:border-purple-800">
          <div className="flex items-center justify-center gap-2">
            <Shield className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <span className="text-sm font-bold text-purple-700 dark:text-purple-300">Super Admin Portal</span>
          </div>
        </div>
      )}
      
      <nav className="flex-1 overflow-y-auto px-3 py-4 scrollbar-thin scrollbar-thumb-blue-300 dark:scrollbar-thumb-blue-700 scrollbar-track-transparent">
        {sectionOrder.map((sectionName) => {
          const items = sections[sectionName];
          if (!items || items.length === 0) return null;

          return (
            <div key={sectionName} className="mb-4">
              {!collapsed && (
                <h3 className="px-3 mb-2 text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                  {sectionName}
                </h3>
              )}
              <div className="space-y-1">
                {items.map((item: any) => {
                  const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                  const Icon = item.icon;
                  
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                        collapsed ? 'justify-center' : '',
                        isActive
                          ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400'
                      )}
                      title={collapsed ? item.name : undefined}
                    >
                      <Icon className="h-5 w-5 flex-shrink-0" />
                      {!collapsed && <span>{item.name}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>
      
      {/* CMMI Level 5 Badge at bottom */}
      {!collapsed && (
        <div className="border-t-2 border-blue-200 dark:border-blue-800 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800">
          <div className="space-y-2">
            <div className="text-xs font-bold text-center bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-full py-1.5 px-3 shadow-md">
              CMMI Level 5
            </div>
            <div className="flex justify-center gap-2">
              <span className="text-[10px] font-semibold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full py-1 px-2">ISO 27001</span>
              <span className="text-[10px] font-semibold bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full py-1 px-2">SOC 2</span>
            </div>
            <p className="text-xs text-center text-gray-600 dark:text-gray-400 pt-2">33 Features • v3.0.0</p>
          </div>
        </div>
      )}
      {collapsed && (
        <div className="border-t border-blue-200 dark:border-blue-800 p-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(false)}
            className="w-full h-12 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg"
          >
            <ChevronRight className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </Button>
        </div>
      )}
    </div>
  );
}
