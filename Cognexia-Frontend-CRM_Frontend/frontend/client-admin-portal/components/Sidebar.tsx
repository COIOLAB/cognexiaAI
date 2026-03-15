'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useUIStore } from '@/stores/ui-store';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Target,
  DollarSign,
  Megaphone,
  Headphones,
  Settings,
  ChevronLeft,
  ChevronRight,
  Contact,
  Building,
  FileText,
  Package,
  TrendingUp,
  BarChart3,
  Trophy,
  Mail,
  FolderOpen,
  Ticket,
  MessageSquare,
  BookOpen,
  Shield,
  CheckSquare,
  Calendar,
  Tags,
  Warehouse,
  FileCheck,
  PenTool,
  Phone,
  PhoneIncoming,
  ListOrdered,
  Workflow,
  BarChart2,
  Brain,
  Plug,
  Smartphone,
  Sparkles,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

const navigationSections = [
  {
    title: 'Basic Features',
    tier: 'basic',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { name: 'Accounts', href: '/accounts', icon: Building },
      { name: 'Customers', href: '/customers', icon: Users },
      { name: 'Contacts', href: '/contacts', icon: Contact },
      { name: 'Leads', href: '/leads', icon: UserPlus },
      { name: 'Opportunities', href: '/opportunities', icon: Target },
      {
        name: 'Sales',
        children: [
          { name: 'Quotes', href: '/sales/quotes', icon: FileText },
          { name: 'Orders', href: '/sales/orders', icon: Package },
          { name: 'Pipeline', href: '/sales/pipeline', icon: TrendingUp },
          { name: 'Sales Analytics', href: '/sales/analytics', icon: BarChart3 },
          { name: 'Team', href: '/sales/team', icon: Trophy },
        ],
      },
      {
        name: 'Marketing',
        children: [
          { name: 'Campaigns', href: '/marketing/campaigns', icon: Megaphone },
          { name: 'Emails', href: '/marketing/emails', icon: Mail },
          { name: 'Templates', href: '/marketing/templates', icon: FileText },
          { name: 'Segments', href: '/marketing/segments', icon: Users },
          { name: 'ROI', href: '/marketing/roi', icon: DollarSign },
          { name: 'Content', href: '/marketing/content', icon: FolderOpen },
        ],
      },
      // {
      //   name: 'Support',
      //   children: [
      //     { name: 'Support Home', href: '/support', icon: Headphones },
      //     { name: 'Tickets', href: '/support/tickets', icon: Ticket },
      //     { name: 'Live Chat', href: '/support/live-chat', icon: MessageSquare },
      //     { name: 'Knowledge Base', href: '/support/knowledge-base', icon: BookOpen },
      //     { name: 'SLA', href: '/support/sla', icon: Shield },
      //     { name: 'Support Analytics', href: '/support/analytics', icon: BarChart3 },
      //   ],
      // },
      { name: 'Products', href: '/products', icon: Package },
      { name: 'Categories', href: '/products/categories', icon: Tags },
      { name: 'Pricing', href: '/pricing', icon: DollarSign },
      { name: 'Inventory', href: '/inventory', icon: Warehouse },
      { name: 'Reports', href: '/reports', icon: FileText },
      { name: 'Dashboards', href: '/dashboards', icon: LayoutDashboard },
      { name: 'Settings', href: '/settings', icon: Settings },
    ],
  },
  {
    title: 'Premium Features',
    tier: 'premium',
    items: [
      {
        name: 'Support',
        children: [
          { name: 'Support Home', href: '/support', icon: Headphones },
          { name: 'Tickets', href: '/support/tickets', icon: Ticket },
          { name: 'Live Chat', href: '/support/live-chat', icon: MessageSquare },
          { name: 'Knowledge Base', href: '/support/knowledge-base', icon: BookOpen },
          { name: 'SLA', href: '/support/sla', icon: Shield },
          { name: 'Support Analytics', href: '/support/analytics', icon: BarChart3 },
        ],
      },
      // {
      //   name: 'Marketing',
      //   children: [
      //     { name: 'Campaigns', href: '/marketing/campaigns', icon: Megaphone },
      //     { name: 'Emails', href: '/marketing/emails', icon: Mail },
      //     { name: 'Templates', href: '/marketing/templates', icon: FileText },
      //     { name: 'Segments', href: '/marketing/segments', icon: Users },
      //     { name: 'ROI', href: '/marketing/roi', icon: DollarSign },
      //     { name: 'Content', href: '/marketing/content', icon: FolderOpen },
      //   ],
      // },
      {
        name: 'Operations',
        children: [
          { name: 'Tasks', href: '/tasks', icon: CheckSquare },
          { name: 'Activities', href: '/activities', icon: CheckSquare },
          { name: 'Calendar', href: '/calendar', icon: Calendar },
          { name: 'Documents', href: '/documents', icon: FileText },
          { name: 'Contracts', href: '/contracts', icon: FileCheck },
          { name: 'Signatures', href: '/signatures', icon: PenTool },
        ],
      },
      { name: 'Integration Hub', href: '/integration', icon: Plug },
      { name: 'Mobile Service', href: '/mobile', icon: Smartphone },
      {
        name: 'Calls',
        children: [
          { name: 'Call Center', href: '/calls', icon: Phone },
          { name: 'Active Calls', href: '/calls/active', icon: PhoneIncoming },
          { name: 'Queues', href: '/calls/queues', icon: ListOrdered },
          { name: 'IVR Builder', href: '/calls/ivr', icon: Workflow },
          { name: 'Call Analytics', href: '/calls/analytics', icon: BarChart2 },
        ],
      },
    ],
  },
  {
    title: 'Advanced Features',
    tier: 'advanced',
    items: [
      { name: 'AI Lab', href: '/ai', icon: Brain },
      { name: 'Workflow', href: '/workflow', icon: Workflow },
      { name: 'Recommendations', href: '/recommendations', icon: Sparkles },
      { name: 'Analytics', href: '/analytics', icon: TrendingUp },
      { name: 'Monitoring', href: '/monitoring', icon: BarChart3 },
      { name: 'Performance', href: '/performance', icon: BarChart2 },
      { name: 'Usage', href: '/usage', icon: TrendingUp },
      { name: 'Throttling', href: '/throttling', icon: Shield },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const [query, setQuery] = useState('');

  const tierBadgeClass = (tier: string) => {
    if (tier === 'premium') {
      return 'bg-blue-50 text-blue-700 border-blue-200';
    }
    if (tier === 'advanced') {
      return 'bg-purple-50 text-purple-700 border-purple-200';
    }
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const filteredSections = useMemo(() => {
    if (!query) return navigationSections;
    const lower = query.toLowerCase();
    return navigationSections
      .map((section) => {
        const items = section.items
          .map((item) => {
            if (item.children) {
              const matchedChildren = item.children.filter((child) =>
                child.name.toLowerCase().includes(lower),
              );
              if (item.name.toLowerCase().includes(lower) || matchedChildren.length > 0) {
                return { ...item, children: matchedChildren.length ? matchedChildren : item.children };
              }
              return null;
            }
            return item.name.toLowerCase().includes(lower) ? item : null;
          })
          .filter(Boolean);
        return items.length ? { ...section, items } : null;
      })
      .filter(Boolean) as typeof navigationSections;
  }, [query]);

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen border-r-2 border-blue-200 bg-white dark:border-blue-800 dark:bg-gray-950 transition-all duration-300 shadow-lg',
        sidebarCollapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex h-24 items-center justify-between px-6 border-b-2 border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800 shadow-sm">
        {!sidebarCollapsed ? (
          <>
            <Link href="/dashboard" className="flex items-center hover:opacity-90 transition-all transform hover:scale-105">
              <img src="/cognexiaai-logo.png" alt="CognexiaAI Logo" className="h-20 w-auto" />
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="h-10 w-10 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-full"
              title="Collapse sidebar"
            >
              <ChevronLeft className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </Button>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center w-full gap-2">
            <Link href="/dashboard" className="hover:opacity-90 transition-all transform hover:scale-105">
              <img src="/cognexiaai-logo.png" alt="CognexiaAI" className="h-12 w-auto" />
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="h-8 w-8 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-full"
              title="Expand sidebar"
            >
              <ChevronRight className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </Button>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-3 p-4 overflow-y-auto h-[calc(100vh-6rem)] scrollbar-thin scrollbar-thumb-blue-300 dark:scrollbar-thumb-blue-700 scrollbar-track-transparent hover:scrollbar-thumb-blue-400 dark:hover:scrollbar-thumb-blue-600">
        <div className={cn('sticky top-0 z-10 pb-2 bg-white/95 dark:bg-gray-950/95', sidebarCollapsed && 'hidden')}>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search features..."
              className="pl-9"
            />
          </div>
        </div>
        {filteredSections.map((section, sectionIndex) => (
          <div
            key={section.title}
            className={cn(sectionIndex > 0 && 'pt-2 border-t border-gray-100 dark:border-gray-800')}
          >
            {!sidebarCollapsed && (
              <div className="px-3 pb-2 flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                <span>{section.title}</span>
                <Badge variant="outline" className={cn('text-[10px] uppercase', tierBadgeClass(section.tier))}>
                  {section.tier}
                </Badge>
              </div>
            )}
            <div className="flex flex-col gap-1">
              {section.items.map((item) => {
                if (item.children) {
                  const groupActive = item.children.some(
                    (child) => pathname === child.href || pathname.startsWith(child.href + '/'),
                  );
                  return (
                    <div key={item.name} className="space-y-1">
                      {!sidebarCollapsed && (
                        <div className={cn('px-3 pt-2 text-xs font-semibold text-gray-500', groupActive && 'text-primary')}>
                          {item.name}
                        </div>
                      )}
                      {item.children.map((child) => {
                        const isActive =
                          pathname === child.href || pathname.startsWith(child.href + '/');
                        const Icon = child.icon;
                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={cn(
                              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                              sidebarCollapsed ? 'justify-center' : 'ml-2',
                              isActive
                                ? 'bg-primary text-primary-foreground'
                                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                            )}
                            title={sidebarCollapsed ? child.name : undefined}
                          >
                            <Icon className="h-4 w-4 flex-shrink-0" />
                            {!sidebarCollapsed && <span>{child.name}</span>}
                          </Link>
                        );
                      })}
                    </div>
                  );
                }

                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                    )}
                    title={sidebarCollapsed ? item.name : undefined}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    {!sidebarCollapsed && <span>{item.name}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {/* CMMI Level 5 Badge at bottom */}
        {!sidebarCollapsed && (
          <div className="sticky bottom-0 mt-auto p-4 border-t-2 border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800">
            <div className="space-y-2">
              <div className="text-xs font-bold text-center bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-full py-1.5 px-3 shadow-md">
                CMMI Level 5
              </div>
              <div className="flex justify-center gap-2">
                <span className="text-[10px] font-semibold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full py-1 px-2">ISO 27001</span>
                <span className="text-[10px] font-semibold bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full py-1 px-2">SOC 2</span>
              </div>
            </div>
          </div>
        )}
        {sidebarCollapsed && (
          <div className="sticky bottom-0 mt-auto p-2 border-t border-blue-200 dark:border-blue-800">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="w-full h-12 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg"
            >
              <ChevronRight className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </Button>
          </div>
        )}
      </nav>
    </aside>
  );
}
