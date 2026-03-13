'use client';

import * as React from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import type { CreateContactDto, Contact, ContactType, ContactRole } from '@/types/api.types';

const contactSchema = z.object({
  type: z.enum(['primary', 'decision_maker', 'influencer', 'technical', 'financial', 'legal', 'end_user', 'champion', 'gatekeeper']),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  middleName: z.string().optional(),
  title: z.string().min(1, 'Job title is required'),
  department: z.string().optional(),
  role: z.enum(['ceo', 'cto', 'cfo', 'vp_sales', 'vp_marketing', 'vp_operations', 'director', 'manager', 'supervisor', 'analyst', 'coordinator', 'specialist', 'consultant', 'other']).optional(),
  email: z.string().email('Invalid email address'),
  secondaryEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  workPhone: z.string().optional(),
  mobilePhone: z.string().optional(),
  customerId: z.string().min(1, 'Customer ID is required'),
  influence: z.coerce.number().min(0).max(100).optional(),
  budgetAuthority: z.boolean().optional(),
  skills: z.string().optional(),
  interests: z.string().optional(),
  languages: z.string().optional(),
});

type ContactFormData = z.infer<typeof contactSchema>;

interface ContactFormProps {
  initialData?: Contact;
  onSubmit: (data: CreateContactDto) => void;
  isLoading?: boolean;
  submitLabel?: string;
}

export function ContactForm({ initialData, onSubmit, isLoading, submitLabel = 'Create Contact' }: ContactFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema) as unknown as Resolver<ContactFormData>,
    defaultValues: initialData ? {
      type: initialData.type,
      firstName: initialData.firstName,
      lastName: initialData.lastName,
      middleName: initialData.middleName || '',
      title: initialData.title,
      department: initialData.department || '',
      role: initialData.role,
      email: initialData.email,
      secondaryEmail: initialData.secondaryEmail || '',
      workPhone: initialData.workPhone || '',
      mobilePhone: initialData.mobilePhone || '',
      customerId: initialData.customerId,
      influence: initialData.influence,
      budgetAuthority: initialData.budgetAuthority,
      skills: initialData.skills?.join(', ') || '',
      interests: initialData.interests?.join(', ') || '',
      languages: initialData.languages?.join(', ') || '',
    } : {
      type: 'primary',
      budgetAuthority: false,
    },
  });

  const [budgetAuthority, setBudgetAuthority] = React.useState(initialData?.budgetAuthority || false);

  const onFormSubmit = (data: ContactFormData) => {
    const payload: CreateContactDto = {
      type: data.type as ContactType,
      firstName: data.firstName,
      lastName: data.lastName,
      middleName: data.middleName || undefined,
      title: data.title,
      department: data.department || undefined,
      role: data.role as ContactRole | undefined,
      email: data.email,
      secondaryEmail: data.secondaryEmail || undefined,
      workPhone: data.workPhone || undefined,
      mobilePhone: data.mobilePhone || undefined,
      customerId: data.customerId,
      influence: data.influence,
      budgetAuthority: budgetAuthority,
      skills: data.skills ? data.skills.split(',').map(s => s.trim()).filter(Boolean) : undefined,
      interests: data.interests ? data.interests.split(',').map(i => i.trim()).filter(Boolean) : undefined,
      languages: data.languages ? data.languages.split(',').map(l => l.trim()).filter(Boolean) : undefined,
    };

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="additional">Additional Info</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>Basic details about the contact</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input id="firstName" placeholder="John" {...register('firstName')} />
                  {errors.firstName && <p className="text-sm text-destructive">{errors.firstName.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input id="lastName" placeholder="Doe" {...register('lastName')} />
                  {errors.lastName && <p className="text-sm text-destructive">{errors.lastName.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="middleName">Middle Name</Label>
                  <Input id="middleName" placeholder="Michael" {...register('middleName')} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Contact Type *</Label>
                  <Select onValueChange={(value) => setValue('type', value as any)} defaultValue={watch('type')}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="primary">Primary</SelectItem>
                      <SelectItem value="decision_maker">Decision Maker</SelectItem>
                      <SelectItem value="influencer">Influencer</SelectItem>
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="financial">Financial</SelectItem>
                      <SelectItem value="legal">Legal</SelectItem>
                      <SelectItem value="end_user">End User</SelectItem>
                      <SelectItem value="champion">Champion</SelectItem>
                      <SelectItem value="gatekeeper">Gatekeeper</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.type && <p className="text-sm text-destructive">{String(errors.type.message)}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Job Title *</Label>
                  <Input id="title" placeholder="Sales Director" {...register('title')} />
                  {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input id="department" placeholder="Sales" {...register('department')} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select onValueChange={(value) => setValue('role', value as any)} defaultValue={watch('role')}>
                    <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ceo">CEO</SelectItem>
                      <SelectItem value="cto">CTO</SelectItem>
                      <SelectItem value="cfo">CFO</SelectItem>
                      <SelectItem value="vp_sales">VP Sales</SelectItem>
                      <SelectItem value="vp_marketing">VP Marketing</SelectItem>
                      <SelectItem value="vp_operations">VP Operations</SelectItem>
                      <SelectItem value="director">Director</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="supervisor">Supervisor</SelectItem>
                      <SelectItem value="analyst">Analyst</SelectItem>
                      <SelectItem value="coordinator">Coordinator</SelectItem>
                      <SelectItem value="specialist">Specialist</SelectItem>
                      <SelectItem value="consultant">Consultant</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" type="email" placeholder="john@example.com" {...register('email')} />
                  {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="secondaryEmail">Secondary Email</Label>
                  <Input id="secondaryEmail" type="email" placeholder="john.doe@personal.com" {...register('secondaryEmail')} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="workPhone">Work Phone</Label>
                  <Input id="workPhone" placeholder="+1 (555) 123-4567" {...register('workPhone')} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mobilePhone">Mobile Phone</Label>
                  <Input id="mobilePhone" placeholder="+1 (555) 987-6543" {...register('mobilePhone')} />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="customerId">Customer ID *</Label>
                  <Input id="customerId" placeholder="Customer UUID" {...register('customerId')} />
                  {errors.customerId && <p className="text-sm text-destructive">{errors.customerId.message}</p>}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="additional" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
              <CardDescription>Optional details and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="influence">Influence Score (0-100)</Label>
                  <Input id="influence" type="number" min="0" max="100" placeholder="75" {...register('influence')} />
                </div>

                <div className="space-y-2 flex items-center">
                  <div className="flex items-center gap-2 mt-6">
                    <Checkbox 
                      id="budgetAuthority" 
                      checked={budgetAuthority}
                      onCheckedChange={(checked) => setBudgetAuthority(checked as boolean)}
                    />
                    <Label htmlFor="budgetAuthority">Has Budget Authority</Label>
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="skills">Skills (comma-separated)</Label>
                  <Input id="skills" placeholder="Sales, Negotiation, CRM" {...register('skills')} />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="interests">Interests (comma-separated)</Label>
                  <Input id="interests" placeholder="Technology, Innovation, Growth" {...register('interests')} />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="languages">Languages (comma-separated)</Label>
                  <Input id="languages" placeholder="English, Spanish, French" {...register('languages')} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex items-center justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => window.history.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
