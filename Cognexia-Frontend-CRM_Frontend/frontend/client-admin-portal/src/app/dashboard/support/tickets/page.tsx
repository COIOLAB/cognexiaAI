'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Ticket, Search, Plus, MessageSquare } from 'lucide-react';
import Link from 'next/link';

interface SupportTicket {
  id: string;
  ticketNumber: string;
  subject: string;
  status: string;
  priority: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export default function MyTicketsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data: ticketsData, isLoading } = useQuery({
    queryKey: ['my-tickets', statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const response = await fetch(
        `http://localhost:3003/api/v1/support-tickets?${params.toString()}`,
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

  const tickets: SupportTicket[] = ticketsData?.data || [];

  const filteredTickets = tickets.filter((ticket) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      ticket.ticketNumber.toLowerCase().includes(searchLower) ||
      ticket.subject.toLowerCase().includes(searchLower) ||
      ticket.category.toLowerCase().includes(searchLower)
    );
  });

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

  const getPriorityBadgeColor = (priority: string) => {
    const colors: Record<string, string> = {
      urgent: 'bg-red-100 text-red-800 border-red-300',
      high: 'bg-orange-100 text-orange-800 border-orange-300',
      medium: 'bg-blue-100 text-blue-800 border-blue-300',
      low: 'bg-gray-100 text-gray-800 border-gray-300',
    };
    return colors[priority] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const formatStatus = (status: string) => {
    return status
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatCategory = (category: string) => {
    return category
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
            My Support Tickets
          </h1>
          <p className="text-gray-600 mt-1">
            View and manage your support requests
          </p>
        </div>
        <Link href="/dashboard/support/new-ticket">
          <Button size="lg" className="gap-2">
            <Plus className="h-5 w-5" />
            New Ticket
          </Button>
        </Link>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-600">Open</p>
            <p className="text-2xl font-bold text-blue-600">
              {tickets.filter((t) => t.status === 'open').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-600">In Progress</p>
            <p className="text-2xl font-bold text-yellow-600">
              {tickets.filter((t) => t.status === 'in_progress').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-600">Resolved</p>
            <p className="text-2xl font-bold text-green-600">
              {tickets.filter((t) => t.status === 'resolved').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-600">Total</p>
            <p className="text-2xl font-bold text-gray-900">{tickets.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tickets List */}
      <Card>
        <CardHeader>
          <CardTitle>All Tickets</CardTitle>
          <CardDescription>Your support ticket history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search tickets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="waiting_response">Waiting Response</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="text-center py-12">Loading tickets...</div>
          ) : filteredTickets.length === 0 ? (
            <div className="text-center py-12">
              <Ticket className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No tickets found</p>
              <Link href="/dashboard/support/new-ticket">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Your First Ticket
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTickets.map((ticket) => (
                <Link
                  key={ticket.id}
                  href={`/dashboard/support/tickets/${ticket.id}`}
                  className="block"
                >
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-blue-500">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge variant="outline" className="font-mono">
                              {ticket.ticketNumber}
                            </Badge>
                            <Badge className={getStatusBadgeColor(ticket.status)}>
                              {formatStatus(ticket.status)}
                            </Badge>
                            <Badge className={getPriorityBadgeColor(ticket.priority)}>
                              {ticket.priority.toUpperCase()}
                            </Badge>
                            <Badge variant="outline">
                              {formatCategory(ticket.category)}
                            </Badge>
                          </div>
                          <h3 className="font-semibold text-lg mb-2">
                            {ticket.subject}
                          </h3>
                          <div className="flex items-center gap-6 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <MessageSquare className="h-4 w-4" />
                              View conversation
                            </span>
                            <span>
                              Created {new Date(ticket.createdAt).toLocaleDateString()}
                            </span>
                            <span>
                              Updated {new Date(ticket.updatedAt).toLocaleDateString()}
                            </span>
                          </div>
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

      {/* Help Section */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle>Need Help?</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 mb-4">
            Can't find what you're looking for? Our support team is here to help!
          </p>
          <div className="flex gap-4">
            <Link href="/dashboard/support/new-ticket">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Create New Ticket
              </Button>
            </Link>
            <Link href="/dashboard/support">
              <Button variant="outline">Browse Help Resources</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
