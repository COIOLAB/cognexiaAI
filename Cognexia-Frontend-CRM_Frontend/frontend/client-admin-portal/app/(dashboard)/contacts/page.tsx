'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ColumnDef } from '@tanstack/react-table';
import {
  Download,
  Mail,
  Phone,
  Plus,
  Trash2,
  Upload,
} from 'lucide-react';

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
import type {
  Contact,
  ContactFilters,
  ContactRole,
  ContactStatus,
  ContactType,
} from '@/types/api.types';
import { toast } from 'sonner';
import {
  createImportedId,
  ensureCsvFile,
  normalizeCsvValue,
  parseCsvBoolean,
  parseCsvNumber,
  parseCsvText,
} from '@/lib/csv-import';

type ContactRow = Contact & {
  isClientImported?: boolean;
};

const contactTypeValues = new Set<ContactType>([
  'primary',
  'decision_maker',
  'influencer',
  'technical',
  'financial',
  'legal',
  'end_user',
  'champion',
  'gatekeeper',
]);

const contactRoleValues = new Set<ContactRole>([
  'ceo',
  'cto',
  'cfo',
  'vp_sales',
  'vp_marketing',
  'vp_operations',
  'director',
  'manager',
  'supervisor',
  'analyst',
  'coordinator',
  'specialist',
  'consultant',
  'other',
]);

const isImportedContact = (contact: ContactRow) => contact.isClientImported === true;

const contactTemplateHeaders = [
  'type',
  'first name',
  'last name',
  'middle name',
  'title',
  'department',
  'role',
  'email',
  'secondary email',
  'work phone',
  'mobile phone',
  'customer id',
  'influence',
  'budget authority',
  'linkedin',
  'website',
  'skills',
  'interests',
  'languages',
  'work address street',
  'work address city',
  'work address state',
  'work address zip code',
  'work address country',
];

const contactTemplateSampleRow = [
  'primary',
  'John',
  'Doe',
  'Michael',
  'Sales Director',
  'Sales',
  'director',
  'john.doe@example.com',
  'john.personal@example.com',
  '+1 555 123 4567',
  '+1 555 987 6543',
  '00000000-0000-0000-0000-000000000456',
  '75',
  'yes',
  'https://linkedin.com/in/johndoe',
  'https://example.com',
  'Sales|Negotiation|CRM',
  'Technology|Growth',
  'English|Spanish',
  '123 Main Street',
  'San Francisco',
  'California',
  '94105',
  'United States',
];

export default function ContactsPage() {
  const router = useRouter();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [selectedContacts, setSelectedContacts] = React.useState<ContactRow[]>([]);
  const [importedContacts, setImportedContacts] = React.useState<ContactRow[]>([]);
  const [isImporting, setIsImporting] = React.useState(false);
  const [filters] = React.useState<ContactFilters>({
    page: 1,
    limit: 20,
  });

  const { data: contactsData, isLoading } = useContacts(filters);
  const deleteContact = useDeleteContact();
  const bulkDelete = useBulkDeleteContacts();
  const exportMutation = useExportContacts();

  const contacts = React.useMemo<ContactRow[]>(
    () => [...importedContacts, ...(contactsData?.data?.contacts || [])],
    [contactsData?.data?.contacts, importedContacts]
  );
  const importedContactIds = React.useMemo(
    () => new Set(importedContacts.map((contact) => contact.id)),
    [importedContacts]
  );

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const columns: ColumnDef<ContactRow>[] = [
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
              <p className="text-sm text-muted-foreground">
                {contact.title}
                {isImportedContact(contact) ? ' • Imported from CSV' : ''}
              </p>
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
    if (importedContactIds.has(id)) {
      if (confirm('Are you sure you want to delete this imported contact?')) {
        setImportedContacts((currentContacts) =>
          currentContacts.filter((contact) => contact.id !== id)
        );
        setSelectedContacts((currentContacts) =>
          currentContacts.filter((contact) => contact.id !== id)
        );
        toast.success('Imported contact removed');
      }
      return;
    }

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
      const localIds = selectedContacts
        .filter((contact) => importedContactIds.has(contact.id))
        .map((contact) => contact.id);
      const serverIds = selectedContacts
        .filter((contact) => !importedContactIds.has(contact.id))
        .map((contact) => contact.id);

      if (localIds.length > 0) {
        setImportedContacts((currentContacts) =>
          currentContacts.filter((contact) => !localIds.includes(contact.id))
        );
      }

      if (serverIds.length > 0) {
        bulkDelete.mutate(serverIds, {
          onSuccess: () => {
            setSelectedContacts([]);
          },
        });
      } else {
        setSelectedContacts([]);
        toast.success(`${localIds.length} imported contact(s) removed`);
      }
    }
  };

  const handleExport = (format: 'csv' | 'excel' = 'csv') => {
    exportMutation.mutate({ filters, format });
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleDownloadTemplate = () => {
    const escapeCsvValue = (value: string) =>
      /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;

    const csv = [contactTemplateHeaders, contactTemplateSampleRow]
      .map((row) => row.map(escapeCsvValue).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = downloadUrl;
    link.download = 'contacts_import_template.csv';
    link.click();
    URL.revokeObjectURL(downloadUrl);
  };

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) {
      return;
    }

    try {
      ensureCsvFile(file);
      setIsImporting(true);

      const parsedRows = parseCsvText(await file.text());
      const existingEmails = new Set(contacts.map((contact) => normalizeCsvValue(contact.email)));
      const duplicateRows: number[] = [];
      const newContacts: ContactRow[] = [];

      parsedRows.forEach((row, index) => {
        const email = row.email;
        const firstName = row.firstname || row.first;
        const lastName = row.lastname || row.last;

        if (!email || !firstName || !lastName) {
          throw new Error(
            `Row ${index + 2} is missing required fields. Required columns: firstName, lastName, email.`
          );
        }

        const emailKey = normalizeCsvValue(email);
        if (existingEmails.has(emailKey)) {
          duplicateRows.push(index + 2);
          return;
        }

        const type = normalizeCsvValue(row.type) as ContactType;
        const role = normalizeCsvValue(row.role) as ContactRole;

        existingEmails.add(emailKey);
        newContacts.push({
          id: createImportedId('contact', index),
          type: contactTypeValues.has(type) ? type : 'primary',
          status: 'active' as ContactStatus,
          firstName,
          lastName,
          middleName: row.middlename || undefined,
          fullName: `${firstName} ${lastName}`.trim(),
          title: row.title || 'Contact',
          department: row.department || undefined,
          role: contactRoleValues.has(role) ? role : undefined,
          seniorityLevel: row.senioritylevel || undefined,
          reportsTo: row.reportsto || undefined,
          email,
          secondaryEmail: row.secondaryemail || undefined,
          workPhone: row.workphone || row.phone || undefined,
          mobilePhone: row.mobilephone || undefined,
          homePhone: row.homephone || undefined,
          fax: row.fax || undefined,
          workAddress: row.workaddressstreet || row.workaddresscity || row.workaddresscountry
            ? {
                street: row.workaddressstreet || '',
                city: row.workaddresscity || '',
                state: row.workaddressstate || undefined,
                country: row.workaddresscountry || 'Unknown',
                zipCode: row.workaddresszipcode || '',
              }
            : undefined,
          personalAddress: undefined,
          socialProfiles: {
            linkedin: row.linkedin || undefined,
            twitter: row.twitter || undefined,
            facebook: row.facebook || undefined,
            instagram: row.instagram || undefined,
            github: row.github || undefined,
            website: row.website || undefined,
            blog: row.blog || undefined,
          },
          yearsOfExperience: parseCsvNumber(row.yearsofexperience),
          education: undefined,
          skills: row.skills ? row.skills.split('|').map((item) => item.trim()).filter(Boolean) : [],
          interests: row.interests ? row.interests.split('|').map((item) => item.trim()).filter(Boolean) : [],
          languages: row.languages ? row.languages.split('|').map((item) => item.trim()).filter(Boolean) : [],
          influence: parseCsvNumber(row.influence) ?? 5,
          budgetAuthority: parseCsvBoolean(row.budgetauthority) ?? false,
          customerId: row.customerid || '00000000-0000-0000-0000-000000000456',
          customer: undefined,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isClientImported: true,
        });
      });

      if (newContacts.length === 0) {
        toast.error(
          duplicateRows.length > 0
            ? `All CSV rows were duplicates. Duplicate row numbers: ${duplicateRows.join(', ')}.`
            : 'No valid contacts were found in the CSV file.'
        );
        return;
      }

      setImportedContacts((currentContacts) => [...newContacts, ...currentContacts]);
      toast.success(
        `${newContacts.length} contact${newContacts.length > 1 ? 's' : ''} imported.${duplicateRows.length > 0 ? ` ${duplicateRows.length} duplicate row${duplicateRows.length > 1 ? 's were' : ' was'} skipped.` : ''}`
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to import contacts.');
    } finally {
      setIsImporting(false);
    }
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
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={handleImportFile}
          />
          <Button variant="outline" size="sm" onClick={handleImportClick} disabled={isImporting}>
            <Upload className="mr-2 h-4 w-4" />
            {isImporting ? 'Importing...' : 'Import CSV'}
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
            <Download className="mr-2 h-4 w-4" />
            Download Template
          </Button>
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
            onRowClick={(contact) => {
              if (!isImportedContact(contact)) {
                router.push(`/contacts/${contact.id}`);
              }
            }}
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
