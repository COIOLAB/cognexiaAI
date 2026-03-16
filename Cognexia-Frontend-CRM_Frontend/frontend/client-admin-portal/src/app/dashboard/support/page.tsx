'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Ticket, Plus, MessageSquare, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function SupportCenterPage() {
  const { data: statsData } = useQuery({
    queryKey: ['my-ticket-stats'],
    queryFn: async () => {
      const response = await fetch(
        'http://localhost:3003/api/v1/support-tickets/stats/overview',
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
        }
      );
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    },
  });

  const { data: recentTicketsData } = useQuery({
    queryKey: ['recent-tickets'],
    queryFn: async () => {
      const response = await fetch(
        'http://localhost:3003/api/v1/support-tickets?limit=5',
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
        }
      );
      if (!response.ok) throw new Error('Failed to fetch tickets');
      return response.json();
    },
  });

  const stats = statsData?.data;
  const recentTickets = recentTicketsData?.data || [];

  const getStatusBadgeColor = (status: string) => {
    const colors: Record<string, string> = {
      open: 'bg-blue-100 text-blue-800 border-blue-300',
      in_progress: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      waiting_response: 'bg-purple-100 text-purple-800 border-purple-300',
      resolved: 'bg-green-100 text-green-800 border-green-300',
      closed: 'bg-gray-100 text-gray-800 border-gray-300',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const formatStatus = (status: string) => {
    return status
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Ticket className="h-8 w-8 text-blue-600" />
            Support Center
          </h1>
          <p className="text-gray-600 mt-1">
            Get help and manage your support tickets
          </p>
        </div>
        <Link href="/dashboard/support/new-ticket">
          <Button size="lg" className="gap-2">
            <Plus className="h-5 w-5" />
            New Ticket
          </Button>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">My Tickets</p>
                <p className="text-2xl font-bold">{stats?.byStatus?.open || 0}</p>
              </div>
              <Ticket className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {stats?.byStatus?.inProgress || 0}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Resolved</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats?.byStatus?.resolved || 0}
                </p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Response</p>
                <p className="text-2xl font-bold text-purple-600">2.5h</p>
              </div>
              <MessageSquare className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href="/dashboard/support/new-ticket">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <Plus className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle>Submit a Ticket</CardTitle>
                  <CardDescription>Report an issue or request help</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Link>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href="/dashboard/support/tickets">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                  <Ticket className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <CardTitle>View My Tickets</CardTitle>
                  <CardDescription>Check status of your requests</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Link>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <CardTitle>Live Chat</CardTitle>
                <CardDescription>Chat with our support team</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Recent Tickets */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Tickets</CardTitle>
            <Link href="/dashboard/support/tickets">
              <Button variant="outline">View All</Button>
            </Link>
          </div>
          <CardDescription>Your latest support requests</CardDescription>
        </CardHeader>
        <CardContent>
          {recentTickets.length === 0 ? (
            <div className="text-center py-12">
              <Ticket className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No tickets yet</p>
              <Link href="/dashboard/support/new-ticket">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Your First Ticket
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentTickets.slice(0, 5).map((ticket: any) => (
                <Link
                  key={ticket.id}
                  href={`/dashboard/support/tickets/${ticket.id}`}
                  className="block"
                >
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge variant="outline" className="font-mono text-xs">
                              {ticket.ticketNumber}
                            </Badge>
                            <Badge className={getStatusBadgeColor(ticket.status)}>
                              {formatStatus(ticket.status)}
                            </Badge>
                          </div>
                          <h4 className="font-semibold">{ticket.subject}</h4>
                          <p className="text-sm text-gray-500 mt-1">
                            Created {new Date(ticket.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Help Resources */}
      <Card>
        <CardHeader>
          <CardTitle>Help Resources</CardTitle>
          <CardDescription>Self-service resources to solve common issues</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <h4 className="font-semibold mb-2">📚 Knowledge Base</h4>
              <p className="text-sm text-gray-600">
                Browse articles and guides to find answers quickly
              </p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <h4 className="font-semibold mb-2">❓ FAQs</h4>
              <p className="text-sm text-gray-600">
                Find answers to frequently asked questions
              </p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <h4 className="font-semibold mb-2">📹 Video Tutorials</h4>
              <p className="text-sm text-gray-600">
                Watch step-by-step guides and tutorials
              </p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <h4 className="font-semibold mb-2">📧 Email Support</h4>
              <p className="text-sm text-gray-600">
                Contact us directly at support@cognexiaai.com
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-blue-600" />
            Need Immediate Help?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 mb-4">
            For urgent issues, please contact our support team directly:
          </p>
          <div className="space-y-2">
            <p className="font-semibold">📞 Phone: +1 (555) 123-4567</p>
            <p className="font-semibold">📧 Email: support@cognexiaai.com</p>
            <p className="text-sm text-gray-600">Available 24/7 for Premium customers</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
