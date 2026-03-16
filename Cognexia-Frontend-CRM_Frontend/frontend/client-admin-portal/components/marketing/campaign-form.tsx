'use client';

import * as React from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const campaignSchema = z.object({
  name: z.string().min(1, 'Campaign name is required'),
  description: z.string().optional(),
  type: z.string().min(1, 'Type is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  budget: z.coerce.number().positive().optional(),
  targetAudience: z.string().optional(),
});

type CampaignFormData = z.infer<typeof campaignSchema>;

interface CampaignFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
  submitLabel?: string;
}

export function CampaignForm({ initialData, onSubmit, isLoading, submitLabel = 'Create Campaign' }: CampaignFormProps) {
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<CampaignFormData>({
    resolver: zodResolver(campaignSchema) as unknown as Resolver<CampaignFormData>,
    defaultValues: initialData || { type: 'email' },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Campaign Information</CardTitle>
          <CardDescription>Create a new marketing campaign</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="name">Campaign Name *</Label>
              <Input id="name" placeholder="Q1 2026 Product Launch" {...register('name')} />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" placeholder="Campaign objectives and details..." rows={4} {...register('description')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Campaign Type *</Label>
              <Select onValueChange={(value) => setValue('type', value)} defaultValue={watch('type')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="social_media">Social Media</SelectItem>
                  <SelectItem value="display_ads">Display Ads</SelectItem>
                  <SelectItem value="content_marketing">Content Marketing</SelectItem>
                  <SelectItem value="webinar">Webinar</SelectItem>
                  <SelectItem value="event">Event</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && <p className="text-sm text-destructive">{errors.type.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="budget">Budget ($)</Label>
              <Input id="budget" type="number" step="0.01" placeholder="10000" {...register('budget')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date *</Label>
              <Input id="startDate" type="date" {...register('startDate')} />
              {errors.startDate && <p className="text-sm text-destructive">{errors.startDate.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input id="endDate" type="date" {...register('endDate')} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="name">Target Audience *</Label>
              <Input id="targetsegment" placeholder="Enterprise Customers, SMBs, etc." {...register('targetAudience')} />
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
