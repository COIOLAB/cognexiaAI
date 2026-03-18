'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ColumnDef } from '@tanstack/react-table';
import { Download, Mail, Phone, Plus, Trash2, User, Users } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DataTable,
  DataTableColumnHeader,
  DataTableRowActions,
} from '@/components/DataTable';
import {
  useContacts,
  useBulkDeleteContacts,
  useExportContacts,
  useDeleteContact,
} from '@/hooks/useContacts';
import type { Contact, ContactFilters } from '@/types/api.types';
import { toast } from 'sonner';

export default function ContactsPage() {
  const router = useRouter();
  const [selectedContacts, setSelectedContacts] = React.useState<Contact[]>([]);
  const [filters, setFilters] = React.useState<ContactFilters>({
    page: 1,
    limit: 20,
  });

  const { data: contactsData, isLoading } = useContacts(filters);
  const deleteContact = useDeleteContact();
  const bulkDelete = useBulkDeleteContacts();
  const exportMutation = useExportContacts();

  const contacts = contactsData?.data?.contacts || [];

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const columns: ColumnDef<Contact>[] = [
    {
      accessorKey: 'fullName',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
      cell: ({ row }) => {
        const contact = row.original;
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs">
                {getInitials(contact.firstName, contact.lastName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{contact.fullName}</p>
              <p className="text-sm text-muted-foreground">{contact.title}</p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'email',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <a href={`mailto:${row.original.email}`} className="text-sm hover:underline">
            {row.original.email}
          </a>
        </div>
      ),
    },
    {
      accessorKey: 'workPhone',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Phone" />,
      cell: ({ row }) => {
        const phone = row.original.workPhone || row.original.mobilePhone;
        if (!phone) return <span className="text-muted-foreground">—</span>;
        return (
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <a href={`tel:${phone}`} className="text-sm hover:underline">
              {phone}
            </a>
          </div>
        );
      },
    },
    {
      accessorKey: 'type',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Type" />,
      cell: ({ row }) => (
        <Badge variant="outline" className="capitalize">
          {row.original.type.replace('_', ' ')}
        </Badge>
      ),
    },
    {
      accessorKey: 'status',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => {
        const status = row.original.status;
        const variant =
          status === 'active'
            ? 'default'
            : status === 'inactive'
            ? 'secondary'
            : 'destructive';

        return (
          <Badge variant={variant} className="capitalize">
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'role',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Role" />,
      cell: ({ row }) => {
        const role = row.original.role;
        if (!role) return <span className="text-muted-foreground">—</span>;
        return <span className="text-sm capitalize">{role.replace('_', ' ')}</span>;
      },
    },
    {
      accessorKey: 'influence',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Influence" />,
      cell: ({ row }) => {
        const influence = row.original.influence;
        return (
          <div className="flex items-center gap-1">
            <div className="text-sm font-medium">{influence}/10</div>
            <Badge
              variant={influence >= 7 ? 'default' : influence >= 5 ? 'secondary' : 'outline'}
              className="ml-1"
            >
              {influence >= 7 ? 'High' : influence >= 5 ? 'Med' : 'Low'}
            </Badge>
          </div>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <DataTableRowActions
          onView={() => router.push(`/contacts/${row.original.id}`)}
          onEdit={() => router.push(`/contacts/${row.original.id}/edit`)}
          onDelete={() => handleDeleteContact(row.original.id)}
        />
      ),
    },
  ];

  const handleDeleteContact = (id: string) => {
    if (confirm('Are you sure you want to delete this contact?')) {
      deleteContact.mutate(id);
    }
  };

  const handleBulkDelete = () => {
    if (selectedContacts.length === 0) {
      toast.error('No contacts selected');
      return;
    }

    if (
      confirm(
        `Are you sure you want to delete ${selectedContacts.length} contact(s)? This action cannot be undone.`
      )
    ) {
      const ids = selectedContacts.map((c) => c.id);
      bulkDelete.mutate(ids, {
        onSuccess: () => {
          setSelectedContacts([]);
        },
      });
    }
  };

  const handleExport = (format: 'csv' | 'excel' = 'csv') => {
    exportMutation.mutate({ filters, format });
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contacts</h1>
          <p className="text-muted-foreground">
            Manage contacts and their relationships across customers
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => handleExport('csv')}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button onClick={() => router.push('/contacts/new')}>
            <Plus className="mr-2 h-4 w-4" />
            Add Contact
          </Button>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedContacts.length > 0 && (
        <Card className="border-primary">
          <CardContent className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">
                {selectedContacts.length} contact(s) selected
              </span>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
                disabled={bulkDelete.isPending}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Selected
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedContacts([])}
            >
              Clear Selection
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Contacts</CardTitle>
          <CardDescription>
            A list of all contacts with their key information and relationships
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={contacts}
            searchKey="fullName"
            searchPlaceholder="Search contacts..."
            onRowClick={(contact) => router.push(`/contacts/${contact.id}`)}
            enableRowSelection
            onRowSelectionChange={setSelectedContacts}
            pageSize={filters.limit}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
    </div>
  );
}
