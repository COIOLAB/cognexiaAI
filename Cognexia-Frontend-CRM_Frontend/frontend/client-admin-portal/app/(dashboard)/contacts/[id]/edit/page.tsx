'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ContactForm } from '@/components/contacts/contact-form';
import { useContact, useUpdateContact } from '@/hooks/useContacts';
import type { CreateContactDto } from '@/types/api.types';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditContactPage() {
  const params = useParams();
  const router = useRouter();
  const contactId = params.id as string;

  const { data, isLoading } = useContact(contactId);
  const updateMutation = useUpdateContact();
  const contact = data?.data;

  const handleSubmit = (formData: CreateContactDto) => {
    updateMutation.mutate({ id: contactId, data: formData }, {
      onSuccess: () => router.push(`/contacts/${contactId}`),
    });
  };

  if (isLoading) return (
    <div className="flex flex-col gap-6 p-6">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-[600px]" />
    </div>
  );

  if (!contact) return (
    <div className="flex flex-col items-center justify-center gap-4 p-6">
      <h2 className="text-2xl font-bold">Contact not found</h2>
      <Button onClick={() => router.push('/contacts')}>Back to Contacts</Button>
    </div>
  );

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Contact</h1>
          <p className="text-muted-foreground">Update {contact.fullName}</p>
        </div>
      </div>
      <ContactForm initialData={contact} onSubmit={handleSubmit} isLoading={updateMutation.isPending} submitLabel="Save Changes" />
    </div>
  );
}
