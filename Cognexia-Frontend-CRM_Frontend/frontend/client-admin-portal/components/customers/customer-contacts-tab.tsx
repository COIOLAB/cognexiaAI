'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Mail, Phone, User, Plus, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { contactApi } from '@/services/contact.api';
import type { Contact } from '@/types/api.types';

interface CustomerContactsTabProps {
  customerId: string;
}

export function CustomerContactsTab({ customerId }: CustomerContactsTabProps) {
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ['customer-contacts', customerId],
    queryFn: () => contactApi.getByCustomerId(customerId),
    staleTime: 60000,
  });

  const contacts = data?.data || [];

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-[200px]" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Contacts ({contacts.length})</h3>
          <p className="text-sm text-muted-foreground">
            All contacts associated with this customer
          </p>
        </div>
        <Button onClick={() => router.push(`/contacts/new?customerId=${customerId}`)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Contact
        </Button>
      </div>

      {contacts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <User className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">No contacts found</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => router.push(`/contacts/new?customerId=${customerId}`)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add First Contact
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {contacts.map((contact) => (
            <Card
              key={contact.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => router.push(`/contacts/${contact.id}`)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">
                      {contact.firstName} {contact.lastName}
                    </CardTitle>
                    <CardDescription>{contact.title}</CardDescription>
                  </div>
                  <Badge variant={contact.status === 'active' ? 'default' : 'secondary'}>
                    {contact.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={`mailto:${contact.email}`}
                      onClick={(e) => e.stopPropagation()}
                      className="hover:underline truncate"
                    >
                      {contact.email}
                    </a>
                  </div>
                  {contact.workPhone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <a
                        href={`tel:${contact.workPhone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="hover:underline"
                      >
                        {contact.workPhone}
                      </a>
                    </div>
                  )}
                </div>

                {contact.type && (
                  <div>
                    <Badge variant="outline" className="capitalize">
                      {contact.type.replace('_', ' ')}
                    </Badge>
                  </div>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/contacts/${contact.id}`);
                  }}
                >
                  View Details
                  <ExternalLink className="ml-2 h-3 w-3" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
