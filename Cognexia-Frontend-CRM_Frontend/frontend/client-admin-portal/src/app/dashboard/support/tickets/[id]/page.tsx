'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Send, User, Calendar, MessageSquare, Star } from 'lucide-react';
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
  const [rating, setRating] = useState<number>(0);

  const { data: ticketData, isLoading } = useQuery({
    queryKey: ['ticket', id],
    queryFn: async () => {
      const response = await fetch(`http://localhost:3003/api/v1/support-tickets/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch ticket');
      return response.json();
    },
  });

  const messageMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(
        `http://localhost:3003/api/v1/support-tickets/${id}/message`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
          body: JSON.stringify({ text: newMessage, isInternal: false }),
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

  const ratingMutation = useMutation({
    mutationFn: async (ratingValue: number) => {
      const response = await fetch(
        `http://localhost:3003/api/v1/support-tickets/${id}/rate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
          body: JSON.stringify({ rating: ratingValue }),
        }
      );
      if (!response.ok) throw new Error('Failed to submit rating');
      return response.json();
    },
    onSuccess: () => {
      toast.success('Thank you for your feedback!');
      queryClient.invalidateQueries({ queryKey: ['ticket', id] });
    },
    onError: () => {
      toast.error('Failed to submit rating');
    },
  });

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    messageMutation.mutate();
  };

  const handleRating = (value: number) => {
    setRating(value);
    ratingMutation.mutate(value);
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

  const showRating = ticket.status === 'resolved' || ticket.status === 'closed';

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <Link href="/dashboard/support/tickets">
          <Button variant="ghost" className="gap-2 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to My Tickets
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
                Conversation ({ticket.messages?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Message List */}
              <div className="space-y-4 max-h-[500px] overflow-y-auto">
                {ticket.messages?.filter((m: any) => !m.isInternal).map((message: any) => (
                  <div
                    key={message.id}
                    className={`p-4 rounded-lg ${
                      message.sender === ticket.submittedBy?.id
                        ? 'bg-blue-50 border border-blue-200'
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
                      {message.sender === ticket.submittedBy?.id && (
                        <Badge variant="outline" className="text-blue-700">
                          You
                        </Badge>
                      )}
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap">{message.text}</p>
                  </div>
                ))}
              </div>

              {/* New Message Form */}
              {ticket.status !== 'closed' && (
                <div className="pt-4 border-t">
                  <Label htmlFor="message">Add Reply</Label>
                  <Textarea
                    id="message"
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    rows={4}
                    className="mt-2"
                  />
                  <div className="flex items-center justify-end mt-3">
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
              )}

              {ticket.status === 'closed' && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-600 italic">
                    This ticket is closed. Please create a new ticket if you need further assistance.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Rating Section */}
          {showRating && (
            <Card className="bg-green-50 border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-600" />
                  Rate Your Experience
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">
                  How satisfied are you with the resolution of this ticket?
                </p>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      onClick={() => handleRating(value)}
                      disabled={ratingMutation.isPending}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`h-8 w-8 ${
                          value <= (rating || ticket.customerSatisfactionRating || 0)
                            ? 'text-yellow-500 fill-yellow-500'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                {ticket.customerSatisfactionRating && (
                  <p className="text-sm text-green-700 mt-2">
                    Thank you for rating this ticket {ticket.customerSatisfactionRating}/5!
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Info */}
          <Card>
            <CardHeader>
              <CardTitle>Ticket Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-gray-600">Status</Label>
                <div className="mt-1">
                  <Badge className={getStatusBadgeColor(ticket.status)}>
                    {ticket.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
              </div>
              <div>
                <Label className="text-gray-600">Priority</Label>
                <div className="mt-1">
                  <Badge className={getPriorityBadgeColor(ticket.priority)}>
                    {ticket.priority.toUpperCase()}
                  </Badge>
                </div>
              </div>
              <div>
                <Label className="text-gray-600">Category</Label>
                <p className="mt-1 capitalize">{ticket.category.replace('_', ' ')}</p>
              </div>
              <div>
                <Label className="text-gray-600">Channel</Label>
                <p className="mt-1 capitalize">{ticket.channel}</p>
              </div>
              <div>
                <Label className="text-gray-600">Created</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">
                    {new Date(ticket.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
              <div>
                <Label className="text-gray-600">Last Updated</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">
                    {new Date(ticket.updatedAt).toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Help Card */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle>Need More Help?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700 mb-4">
                While we work on your ticket, you can:
              </p>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>• Check our knowledge base</li>
                <li>• Browse FAQs</li>
                <li>• Contact us via live chat</li>
              </ul>
              <Link href="/dashboard/support">
                <Button variant="outline" className="w-full mt-4">
                  Visit Support Center
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
