import { FileQuestion, Users, UserPlus, Inbox, Plus, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon,
}: EmptyStateProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 rounded-full bg-muted p-4">
          {icon || <FileQuestion className="h-8 w-8 text-muted-foreground" />}
        </div>
        <h3 className="mb-2 text-xl font-semibold">{title}</h3>
        <p className="mb-6 max-w-md text-sm text-muted-foreground">{description}</p>
        {actionLabel && onAction && (
          <Button onClick={onAction}>
            <Plus className="mr-2 h-4 w-4" />
            {actionLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export function EmptyCustomerList({ onAddCustomer }: { onAddCustomer: () => void }) {
  return (
    <EmptyState
      icon={<Users className="h-8 w-8 text-muted-foreground" />}
      title="No customers yet"
      description="Get started by adding your first customer. You can import them from a CSV file or add them manually."
      actionLabel="Add Customer"
      onAction={onAddCustomer}
    />
  );
}

export function EmptyContactList({ onAddContact }: { onAddContact: () => void }) {
  return (
    <EmptyState
      icon={<UserPlus className="h-8 w-8 text-muted-foreground" />}
      title="No contacts found"
      description="Start building your contact network by adding contacts. You can add them manually or import from a file."
      actionLabel="Add Contact"
      onAction={onAddContact}
    />
  );
}

export function EmptyActivities() {
  return (
    <EmptyState
      icon={<Inbox className="h-8 w-8 text-muted-foreground" />}
      title="No activities yet"
      description="Activities like calls, meetings, emails, and notes will appear here once you start interacting with this customer."
    />
  );
}

export function EmptySearchResults() {
  return (
    <EmptyState
      icon={<FileQuestion className="h-8 w-8 text-muted-foreground" />}
      title="No results found"
      description="Try adjusting your search or filter criteria to find what you're looking for."
    />
  );
}

export function EmptyStateLeads() {
  return (
    <EmptyState
      icon={<UserPlus className="h-8 w-8 text-muted-foreground" />}
      title="No leads yet"
      description="Start capturing and nurturing leads to grow your sales pipeline. Add leads manually or import them from a file."
    />
  );
}

export function EmptyStateOpportunities() {
  return (
    <EmptyState
      icon={<Target className="h-8 w-8 text-muted-foreground" />}
      title="No opportunities yet"
      description="Create your first sales opportunity to start tracking deals and revenue."
    />
  );
}

export function EmptyOpportunities({ onCreateOpportunity }: { onCreateOpportunity?: () => void }) {
  return (
    <EmptyState
      icon={<Inbox className="h-8 w-8 text-muted-foreground" />}
      title="No opportunities"
      description="Create your first sales opportunity to start tracking deals and revenue."
      actionLabel={onCreateOpportunity ? "Create Opportunity" : undefined}
      onAction={onCreateOpportunity}
    />
  );
}

export function EmptyDocuments({ onUpload }: { onUpload?: () => void }) {
  return (
    <EmptyState
      icon={<Inbox className="h-8 w-8 text-muted-foreground" />}
      title="No documents"
      description="Upload contracts, invoices, proposals, and other important documents related to this customer."
      actionLabel={onUpload ? "Upload Document" : undefined}
      onAction={onUpload}
    />
  );
}
