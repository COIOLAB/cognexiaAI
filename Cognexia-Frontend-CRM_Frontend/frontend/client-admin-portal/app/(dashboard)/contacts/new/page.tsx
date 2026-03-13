'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ContactForm } from '@/components/contacts/contact-form';
import { useCreateContact } from '@/hooks/useContacts';
import type { CreateContactDto } from '@/types/api.types';

export default function NewContactPage() {
  const router = useRouter();
  const createMutation = useCreateContact();

  const handleSubmit = (data: CreateContactDto) => {
    createMutation.mutate(data, {
      onSuccess: (response) => {
        router.push(`/contacts/${response.data.id}`);
      },
    });
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Contact</h1>
          <p className="text-muted-foreground">Add a new contact to your CRM</p>
        </div>
      </div>
      <ContactForm onSubmit={handleSubmit} isLoading={createMutation.isPending} submitLabel="Create Contact" />
    </div>
  );
}
