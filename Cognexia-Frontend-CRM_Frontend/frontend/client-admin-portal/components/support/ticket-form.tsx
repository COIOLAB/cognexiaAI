'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import type { CreateTicketDto, SupportTicket, TicketPriority, TicketCategory, TicketChannel } from '@/types/api.types';

const ticketSchema = z.object({
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  priority: z.enum(['low', 'medium', 'high', 'urgent', 'critical']),
  category: z.enum(['technical', 'billing', 'general_inquiry', 'feature_request', 'bug', 'complaint', 'other']),
  channel: z.enum(['web', 'email', 'phone', 'chat', 'whatsapp', 'slack']),
  customerId: z.string().min(1, 'Customer Email ID is required'),
  tags: z.string().optional(),
});

type TicketFormData = z.infer<typeof ticketSchema>;

interface TicketFormProps {
  initialData?: SupportTicket;
  onSubmit: (data: CreateTicketDto) => void;
  isLoading?: boolean;
  submitLabel?: string;
}

export function TicketForm({ initialData, onSubmit, isLoading, submitLabel = 'Create Ticket' }: TicketFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<TicketFormData>({
    resolver: zodResolver(ticketSchema),
    defaultValues: initialData ? {
      subject: initialData.subject,
      description: initialData.description,
      priority: initialData.priority,
      category: initialData.category,
      channel: initialData.channel,
      customerId: initialData.customerId,
      tags: initialData.tags?.join(', ') || '',
    } : {
      priority: 'medium',
      category: 'general_inquiry',
      channel: 'web',
    },
  });

  const categoryMap: Record<string, string> = {
  technical: 'technical_issue',
  billing: 'billing_inquiry',
  general_inquiry: 'account_management',
  feature_request: 'feature_request',
  bug: 'bug_report',
  complaint: 'other',
  other: 'other',
};

  // const onFormSubmit = (data: TicketFormData) => {
  //   const payload: CreateTicketDto = {
  //     subject: data.subject,
  //     description: data.description,
  //     priority: data.priority as TicketPriority,
  //     category: data.category as TicketCategory,
  //     channel: data.channel as TicketChannel,
  //     customerId: data.customerId,
  //     tags: data.tags ? data.tags.split(',').map(t => t.trim()).filter(Boolean) : undefined,
  //   };
  //   onSubmit(payload);
  //   // console.log(payload);
  // };
const onFormSubmit = (data: TicketFormData) => {
  const payload: CreateTicketDto = {
    subject: data.subject,
    description: data.description,
    priority: data.priority as TicketPriority,
    category: categoryMap[data.category] as TicketCategory, // map here
    channel: data.channel as TicketChannel,
    customerId: data.customerId,
    tags: data.tags
      ? data.tags.split(',').map(t => t.trim()).filter(Boolean)
      : undefined,
  };
  onSubmit(payload);
};


  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Ticket Information</CardTitle>
          <CardDescription>Create a new support ticket</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="subject">Subject *</Label>
              <Input id="subject" placeholder="Brief description of the issue" {...register('subject')} />
              {errors.subject && <p className="text-sm text-destructive">{errors.subject.message}</p>}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea id="description" placeholder="Detailed description of the issue..." rows={6} {...register('description')} />
              {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority *</Label>
              <Select onValueChange={(value) => setValue('priority', value as any)} defaultValue={watch('priority')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
              {errors.priority && <p className="text-sm text-destructive">{String(errors.priority.message)}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select onValueChange={(value) => setValue('category', value as any)} defaultValue={watch('category')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="billing">Billing</SelectItem>
                  <SelectItem value="general_inquiry">General Inquiry</SelectItem>
                  <SelectItem value="feature_request">Feature Request</SelectItem>
                  <SelectItem value="bug">Bug Report</SelectItem>
                  <SelectItem value="complaint">Complaint</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="channel">Channel *</Label>
              <Select onValueChange={(value) => setValue('channel', value as any)} defaultValue={watch('channel')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="web">Web Portal</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="phone">Phone</SelectItem>
                  <SelectItem value="chat">Live Chat</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="slack">Slack</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerId">Email ID *</Label>
              <Input id="customerId" placeholder="Customer Email ID" {...register('customerId')} />
              {errors.customerId && <p className="text-sm text-destructive">{errors.customerId.message}</p>}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input id="tags" placeholder="urgent, payment-issue, api" {...register('tags')} />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => window.history.back()}>Cancel</Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
