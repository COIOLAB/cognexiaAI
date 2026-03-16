'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
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
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Loader2 } from 'lucide-react';
import type { CreateCustomerDto, Customer, CustomerType, CustomerSize } from '@/types/api.types';

// Validation schema
const customerSchema = z.object({
  companyName: z.string().min(2, 'Company name must be at least 2 characters'),
  customerType: z.enum(['b2b', 'b2c', 'b2b2c']),
  industry: z.string().min(1, 'Industry is required'),
  size: z.enum(['startup', 'small_medium', 'enterprise', 'large_enterprise', 'individual']),
  
  // Primary Contact
  primaryContact: z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    title: z.string().min(1, 'Title is required'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(1, 'Phone is required'),
    mobile: z.string().optional(),
    linkedin: z.string().url('Invalid LinkedIn URL').optional().or(z.literal('')),
  }),
  
  // Address
  address: z.object({
    street: z.string().min(1, 'Street address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().optional(),
    country: z.string().min(1, 'Country is required'),
    zipCode: z.string().min(1, 'ZIP code is required'),
    region: z.string().min(1, 'Region is required'),
  }),
  
  // Demographics (Optional)
  demographics: z.object({
    website: z.string().url('Invalid URL').optional().or(z.literal('')),
    foundedYear: z.coerce.number().int().min(1800).max(new Date().getFullYear()).optional(),
    employeeCount: z.coerce.number().int().positive().optional(),
    annualRevenue: z.coerce.number().positive().optional(),
    taxId: z.string().optional(),
  }).optional(),
  
  // Tags
  tags: z.string().optional(), // Will be split into array
});

type CustomerFormData = z.infer<typeof customerSchema>;

interface CustomerFormProps {
  initialData?: Customer;
  onSubmit: (data: CreateCustomerDto) => void;
  isLoading?: boolean;
  submitLabel?: string;
}

export function CustomerForm({ initialData, onSubmit, isLoading, submitLabel = 'Create Customer' }: CustomerFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(customerSchema) as any,
    defaultValues: initialData ? {
      companyName: initialData.companyName,
      customerType: initialData.customerType as any,
      industry: initialData.industry,
      size: initialData.size as any,
      primaryContact: {
        firstName: initialData.primaryContact.firstName,
        lastName: initialData.primaryContact.lastName,
        title: initialData.primaryContact.title,
        email: initialData.primaryContact.email,
        phone: initialData.primaryContact.phone,
        mobile: initialData.primaryContact.mobile || '',
        linkedin: initialData.primaryContact.linkedin || '',
      },
      address: {
        street: initialData.address.street,
        city: initialData.address.city,
        state: initialData.address.state || '',
        country: initialData.address.country,
        zipCode: initialData.address.zipCode,
        region: initialData.address.region,
      },
      demographics: {
        website: initialData.demographics?.website || '',
        foundedYear: initialData.demographics?.foundedYear,
        employeeCount: initialData.demographics?.employeeCount,
        annualRevenue: initialData.demographics?.annualRevenue,
        taxId: initialData.demographics?.taxId || '',
      },
      tags: initialData.tags?.join(', ') || '',
    } : undefined,
  });

  const onFormSubmit = (data: CustomerFormData) => {
    const payload: CreateCustomerDto = {
      companyName: data.companyName,
      customerType: data.customerType as CustomerType,
      industry: data.industry,
      size: data.size as CustomerSize,
      primaryContact: {
        ...data.primaryContact,
        mobile: data.primaryContact.mobile || undefined,
        linkedin: data.primaryContact.linkedin || undefined,
      },
      address: {
        ...data.address,
        state: data.address.state || undefined,
      },
      demographics: data.demographics ? {
        website: data.demographics.website || undefined,
        foundedYear: data.demographics.foundedYear,
        employeeCount: data.demographics.employeeCount,
        annualRevenue: data.demographics.annualRevenue,
        taxId: data.demographics.taxId || undefined,
      } : undefined,
      tags: data.tags ? data.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
    };

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="contact">Contact Details</TabsTrigger>
          <TabsTrigger value="additional">Additional Info</TabsTrigger>
        </TabsList>

        {/* Basic Information */}
        <TabsContent value="basic" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>Basic details about the customer</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input
                    id="companyName"
                    placeholder="Acme Corporation"
                    {...register('companyName')}
                  />
                  {errors.companyName && (
                    <p className="text-sm text-destructive">{errors.companyName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customerType">Customer Type *</Label>
                  <Select
                    onValueChange={(value) => setValue('customerType', value as any)}
                    defaultValue={watch('customerType')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="b2b">B2B</SelectItem>
                      <SelectItem value="b2c">B2C</SelectItem>
                      <SelectItem value="b2b2c">B2B2C</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.customerType && (
                    <p className="text-sm text-destructive">{String(errors.customerType.message)}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="industry">Industry *</Label>
                  <Input
                    id="industry"
                    placeholder="Technology"
                    {...register('industry')}
                  />
                  {errors.industry && (
                    <p className="text-sm text-destructive">{errors.industry.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="size">Company Size *</Label>
                  <Select
                    onValueChange={(value) => setValue('size', value as any)}
                    defaultValue={watch('size')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="individual">Individual</SelectItem>
                      <SelectItem value="startup">Startup (1-10)</SelectItem>
                      <SelectItem value="small_medium">SMB (11-500)</SelectItem>
                      <SelectItem value="enterprise">Enterprise (501-5000)</SelectItem>
                      <SelectItem value="large_enterprise">Large Enterprise (5000+)</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.size && (
                    <p className="text-sm text-destructive">{String(errors.size.message)}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact Details */}
        <TabsContent value="contact" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Primary Contact</CardTitle>
              <CardDescription>Main point of contact for this customer</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    placeholder="John"
                    {...register('primaryContact.firstName')}
                  />
                  {errors.primaryContact?.firstName && (
                    <p className="text-sm text-destructive">{errors.primaryContact.firstName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    placeholder="Doe"
                    {...register('primaryContact.lastName')}
                  />
                  {errors.primaryContact?.lastName && (
                    <p className="text-sm text-destructive">{errors.primaryContact.lastName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Job Title *</Label>
                  <Input
                    id="title"
                    placeholder="CEO"
                    {...register('primaryContact.title')}
                  />
                  {errors.primaryContact?.title && (
                    <p className="text-sm text-destructive">{errors.primaryContact.title.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    {...register('primaryContact.email')}
                  />
                  {errors.primaryContact?.email && (
                    <p className="text-sm text-destructive">{errors.primaryContact.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    placeholder="+1 (555) 123-4567"
                    {...register('primaryContact.phone')}
                  />
                  {errors.primaryContact?.phone && (
                    <p className="text-sm text-destructive">{errors.primaryContact.phone.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mobile">Mobile</Label>
                  <Input
                    id="mobile"
                    placeholder="+1 (555) 987-6543"
                    {...register('primaryContact.mobile')}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="linkedin">LinkedIn Profile</Label>
                  <Input
                    id="linkedin"
                    placeholder="https://linkedin.com/in/johndoe"
                    {...register('primaryContact.linkedin')}
                  />
                  {errors.primaryContact?.linkedin && (
                    <p className="text-sm text-destructive">{errors.primaryContact.linkedin.message}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Address</CardTitle>
              <CardDescription>Physical location of the customer</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="street">Street Address *</Label>
                  <Input
                    id="street"
                    placeholder="123 Main Street"
                    {...register('address.street')}
                  />
                  {errors.address?.street && (
                    <p className="text-sm text-destructive">{errors.address.street.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    placeholder="San Francisco"
                    {...register('address.city')}
                  />
                  {errors.address?.city && (
                    <p className="text-sm text-destructive">{errors.address.city.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State/Province</Label>
                  <Input
                    id="state"
                    placeholder="California"
                    {...register('address.state')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="zipCode">ZIP/Postal Code *</Label>
                  <Input
                    id="zipCode"
                    placeholder="94102"
                    {...register('address.zipCode')}
                  />
                  {errors.address?.zipCode && (
                    <p className="text-sm text-destructive">{errors.address.zipCode.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Country *</Label>
                  <Input
                    id="country"
                    placeholder="United States"
                    {...register('address.country')}
                  />
                  {errors.address?.country && (
                    <p className="text-sm text-destructive">{errors.address.country.message}</p>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="region">Region *</Label>
                  <Input
                    id="region"
                    placeholder="North America"
                    {...register('address.region')}
                  />
                  {errors.address?.region && (
                    <p className="text-sm text-destructive">{errors.address.region.message}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Additional Information */}
        <TabsContent value="additional" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Additional Details</CardTitle>
              <CardDescription>Optional information about the customer</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    placeholder="https://example.com"
                    {...register('demographics.website')}
                  />
                  {errors.demographics?.website && (
                    <p className="text-sm text-destructive">{errors.demographics.website.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="foundedYear">Founded Year</Label>
                  <Input
                    id="foundedYear"
                    type="number"
                    placeholder="2020"
                    {...register('demographics.foundedYear')}
                  />
                  {errors.demographics?.foundedYear && (
                    <p className="text-sm text-destructive">{errors.demographics.foundedYear.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="employeeCount">Number of Employees</Label>
                  <Input
                    id="employeeCount"
                    type="number"
                    placeholder="50"
                    {...register('demographics.employeeCount')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="annualRevenue">Annual Revenue ($)</Label>
                  <Input
                    id="annualRevenue"
                    type="number"
                    placeholder="1000000"
                    {...register('demographics.annualRevenue')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="taxId">Tax ID</Label>
                  <Input
                    id="taxId"
                    placeholder="XX-XXXXXXX"
                    {...register('demographics.taxId')}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    placeholder="VIP, Enterprise, Tech"
                    {...register('tags')}
                  />
                  <p className="text-xs text-muted-foreground">
                    Separate multiple tags with commas
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Separator />

      {/* Form Actions */}
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
