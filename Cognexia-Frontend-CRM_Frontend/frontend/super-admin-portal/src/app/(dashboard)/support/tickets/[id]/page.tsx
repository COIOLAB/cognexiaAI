'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Send, User, Building2, Calendar, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [newMessage, setNewMessage] = useState('');
  const [isInternal, setIsInternal] = useState(false);

  const { data: ticketData, isLoading } = useQuery({
    queryKey: ['ticket', id],
    queryFn: async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003/api/v1'}/support-tickets/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch ticket');
      return response.json();
    },
  });

  const assignMutation = useMutation({
    mutationFn: async (assignedTo: string) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003/api/v1'}/support-tickets/${id}/assign`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
          body: JSON.stringify({ assignedTo }),
        }
      );
      if (!response.ok) throw new Error('Failed to assign ticket');
      return response.json();
    },
    onSuccess: () => {
      toast.success('Ticket assigned successfully');
      queryClient.invalidateQueries({ queryKey: ['ticket', id] });
    },
    onError: () => {
      toast.error('Failed to assign ticket');
    },
  });

  const statusMutation = useMutation({
    mutationFn: async (status: string) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003/api/v1'}/support-tickets/${id}/status`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
          body: JSON.stringify({ status }),
        }
      );
      if (!response.ok) throw new Error('Failed to update status');
      return response.json();
    },
    onSuccess: () => {
      toast.success('Status updated successfully');
      queryClient.invalidateQueries({ queryKey: ['ticket', id] });
    },
    onError: () => {
      toast.error('Failed to update status');
    },
  });

  const messageMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003/api/v1'}/support-tickets/${id}/message`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
          body: JSON.stringify({ text: newMessage, isInternal }),
        }
      );
      if (!response.ok) throw new Error('Failed to send message');
      return response.json();
    },
    onSuccess: () => {
      toast.success('Message sent successfully');
      setNewMessage('');
      queryClient.invalidateQueries({ queryKey: ['ticket', id] });
    },
    onError: () => {
      toast.error('Failed to send message');
    },
  });

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    messageMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">Loading ticket...</div>
      </div>
    );
  }

  const ticket = ticketData?.data;
  if (!ticket) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12 text-red-600">Ticket not found</div>
      </div>
    );
  }

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

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <Link href="/support/tickets">
          <Button variant="ghost" className="gap-2 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Tickets
          </Button>
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">{ticket.subject}</h1>
            <div className="flex items-center gap-3 mt-3">
              <Badge variant="outline" className="font-mono">
                {ticket.ticketNumber}
              </Badge>
              <Badge className={getStatusBadgeColor(ticket.status)}>
                {ticket.status.replace('_', ' ').toUpperCase()}
              </Badge>
              <Badge className={getPriorityBadgeColor(ticket.priority)}>
                {ticket.priority.toUpperCase()}
              </Badge>
              <Badge variant="outline">{ticket.category}</Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
            </CardContent>
          </Card>

          {/* Messages */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Messages ({ticket.messages?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Message List */}
              <div className="space-y-4 max-h-[500px] overflow-y-auto">
                {ticket.messages?.map((message: any) => (
                  <div
                    key={message.id}
                    className={`p-4 rounded-lg ${
                      message.isInternal
                        ? 'bg-yellow-50 border border-yellow-200'
                        : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <User className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold">{message.senderName}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(message.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      {message.isInternal && (
                        <Badge variant="outline" className="text-yellow-700">
                          Internal
                        </Badge>
                      )}
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap">{message.text}</p>
                  </div>
                ))}
              </div>

              {/* New Message Form */}
              <div className="pt-4 border-t">
                <Label htmlFor="message">Add Message</Label>
                <Textarea
                  id="message"
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  rows={4}
                  className="mt-2"
                />
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="internal"
                      checked={isInternal}
                      onChange={(e) => setIsInternal(e.target.checked)}
                      className="rounded"
                    />
                    <Label htmlFor="internal" className="text-sm cursor-pointer">
                      Internal note (not visible to customer)
                    </Label>
                  </div>
                  <Button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || messageMutation.isPending}
                    className="gap-2"
                  >
                    <Send className="h-4 w-4" />
                    Send Message
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={ticket.status}
                  onValueChange={(value) => statusMutation.mutate(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="waiting_response">Waiting Response</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Assign To</Label>
                <Select
                  value={ticket.assignedTo || 'unassigned'}
                  onValueChange={(value) =>
                    value !== 'unassigned' && assignMutation.mutate(value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Unassigned" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    <SelectItem value="user-1">Support Agent</SelectItem>
                    <SelectItem value="user-2">Support Manager</SelectItem>
                    <SelectItem value="user-3">Technical Specialist</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-gray-600">Organization</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Building2 className="h-4 w-4 text-gray-500" />
                  <Link
                    href={`/organizations/${ticket.organizationId}`}
                    className="text-blue-600 hover:underline"
                  >
                    {ticket.organizationName}
                  </Link>
                </div>
              </div>
              <div>
                <Label className="text-gray-600">Submitted By</Label>
                <div className="flex items-center gap-2 mt-1">
                  <User className="h-4 w-4 text-gray-500" />
                  <span>{ticket.submittedBy.name}</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {ticket.submittedBy.email}
                </p>
              </div>
              <div>
                <Label className="text-gray-600">Channel</Label>
                <p className="mt-1 capitalize">{ticket.channel}</p>
              </div>
              <div>
                <Label className="text-gray-600">Created</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>{new Date(ticket.createdAt).toLocaleString()}</span>
                </div>
              </div>
              <div>
                <Label className="text-gray-600">Last Updated</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>{new Date(ticket.updatedAt).toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
