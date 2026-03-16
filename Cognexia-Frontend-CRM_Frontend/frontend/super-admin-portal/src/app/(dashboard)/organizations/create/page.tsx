import { CreateOrganizationForm } from '@/components/organizations/create-organization-form';

export default function CreateOrganizationPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create Organization</h1>
        <p className="text-gray-500">Set up a new organization with admin user</p>
      </div>

      <CreateOrganizationForm />
    </div>
  );
}

