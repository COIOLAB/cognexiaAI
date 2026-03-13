'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Edit,
  Mail,
  Phone,
  Trash2,
  Globe,
  Linkedin,
  Twitter,
  MapPin,
  Building2,
  AlertCircle,
  Briefcase,
  GraduationCap,
  Award,
  Star,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useContact, useDeleteContact } from '@/hooks/useContacts';
import ClickToCall from '@/components/ClickToCall';
import { useGetTimeline } from '@/hooks/useActivities';
import { useOpportunities } from '@/hooks/useOpportunities';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function ContactDetailPage() {
  const params = useParams();
  const router = useRouter();
  const contactId = params.id as string;

  const { data, isLoading, error } = useContact(contactId);
  const deleteMutation = useDeleteContact();
  const { data: timelineData, isLoading: timelineLoading } = useGetTimeline('contact', contactId, 10);
  const { data: opportunitiesData, isLoading: opportunitiesLoading } = useOpportunities({ page: 1, limit: 50 });

  const contact = data?.data;
  const timeline = (timelineData as any)?.data ?? timelineData ?? [];
  const allOpportunities = (opportunitiesData as any)?.data ?? [];
  const relatedOpportunities = Array.isArray(allOpportunities)
    ? allOpportunities.filter(
        (opp: any) => opp.contactId === contactId || opp.customerId === contact?.customerId,
      )
    : [];

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const handleDelete = () => {
    if (
      confirm(
        `Are you sure you want to delete ${contact?.fullName}? This action cannot be undone.`
      )
    ) {
      deleteMutation.mutate(contactId, {
        onSuccess: () => {
          router.push('/contacts');
        },
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-[600px]" />
      </div>
    );
  }

  if (error || !contact) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-6">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <h2 className="text-2xl font-bold">Contact not found</h2>
        <Button onClick={() => router.push('/contacts')}>Back to Contacts</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Avatar className="h-16 w-16">
            <AvatarFallback className="text-lg">
              {getInitials(contact.firstName, contact.lastName)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{contact.fullName}</h1>
              <Badge
                variant={
                  contact.status === 'active'
                    ? 'default'
                    : contact.status === 'inactive'
                    ? 'secondary'
                    : 'destructive'
                }
                className="capitalize"
              >
                {contact.status}
              </Badge>
              <Badge variant="outline" className="capitalize">
                {contact.type.replace('_', ' ')}
              </Badge>
            </div>
            <p className="text-lg text-muted-foreground">{contact.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.push(`/contacts/${contactId}/edit`)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Quick Contact Actions */}
      <div className="flex flex-col gap-3">
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <a href={`mailto:${contact.email}`}>
              <Mail className="mr-2 h-4 w-4" />
              Email
            </a>
          </Button>
          {contact.socialProfiles?.linkedin && (
            <Button variant="outline" asChild>
              <a href={contact.socialProfiles.linkedin} target="_blank" rel="noopener noreferrer">
                <Linkedin className="mr-2 h-4 w-4" />
                LinkedIn
              </a>
            </Button>
          )}
        </div>
        <ClickToCall defaultNumber={contact.workPhone || contact.mobilePhone || ''} />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activities">Activities</TabsTrigger>
          <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a href={`mailto:${contact.email}`} className="hover:underline">
                      {contact.email}
                    </a>
                  </div>
                  {contact.secondaryEmail && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <a href={`mailto:${contact.secondaryEmail}`} className="hover:underline">
                        {contact.secondaryEmail}
                      </a>
                    </div>
                  )}
                  {contact.workPhone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <a href={`tel:${contact.workPhone}`} className="hover:underline">
                        {contact.workPhone} (Work)
                      </a>
                    </div>
                  )}
                  {contact.mobilePhone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <a href={`tel:${contact.mobilePhone}`} className="hover:underline">
                        {contact.mobilePhone} (Mobile)
                      </a>
                    </div>
                  )}
                </div>

                {contact.workAddress && (
                  <>
                    <Separator />
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div className="text-sm">
                        <p>{contact.workAddress.street}</p>
                        {contact.workAddress.suite && <p>{contact.workAddress.suite}</p>}
                        <p>
                          {contact.workAddress.city}
                          {contact.workAddress.state && `, ${contact.workAddress.state}`}{' '}
                          {contact.workAddress.zipCode}
                        </p>
                        <p>{contact.workAddress.country}</p>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Professional Information */}
            <Card>
              <CardHeader>
                <CardTitle>Professional Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Department</p>
                    <p>{contact.department || '—'}</p>
                  </div>
                  {contact.role && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Role</p>
                      <p className="capitalize">{contact.role.replace('_', ' ')}</p>
                    </div>
                  )}
                  {contact.seniorityLevel && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Seniority</p>
                      <p className="capitalize">{contact.seniorityLevel}</p>
                    </div>
                  )}
                  {contact.reportsTo && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Reports To</p>
                      <p>{contact.reportsTo}</p>
                    </div>
                  )}
                </div>

                <Separator />

                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Influence</p>
                  <div className="flex items-center gap-2">
                    <div className="text-2xl font-bold">{contact.influence}/10</div>
                    <Badge
                      variant={
                        contact.influence >= 7
                          ? 'default'
                          : contact.influence >= 5
                          ? 'secondary'
                          : 'outline'
                      }
                    >
                      {contact.influence >= 7 ? 'High' : contact.influence >= 5 ? 'Medium' : 'Low'}
                    </Badge>
                  </div>
                  {contact.budgetAuthority && (
                    <Badge variant="outline" className="mt-2">
                      <Award className="mr-1 h-3 w-3" />
                      Budget Authority
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Social Profiles */}
            {contact.socialProfiles && (
              <Card>
                <CardHeader>
                  <CardTitle>Social Media</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {contact.socialProfiles.linkedin && (
                    <div className="flex items-center gap-2">
                      <Linkedin className="h-4 w-4 text-muted-foreground" />
                      <a
                        href={contact.socialProfiles.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        LinkedIn Profile
                      </a>
                    </div>
                  )}
                  {contact.socialProfiles.twitter && (
                    <div className="flex items-center gap-2">
                      <Twitter className="h-4 w-4 text-muted-foreground" />
                      <a
                        href={`https://twitter.com/${contact.socialProfiles.twitter}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        {contact.socialProfiles.twitter}
                      </a>
                    </div>
                  )}
                  {contact.socialProfiles.website && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <a
                        href={contact.socialProfiles.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        Personal Website
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Education & Skills */}
            <Card>
              <CardHeader>
                <CardTitle>Education & Expertise</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {contact.education && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <GraduationCap className="h-4 w-4 text-muted-foreground" />
                      <p className="font-medium">Education</p>
                    </div>
                    <div className="ml-6 space-y-1 text-sm">
                      {contact.education.degree && <p>{contact.education.degree}</p>}
                      {contact.education.institution && <p>{contact.education.institution}</p>}
                      {contact.education.fieldOfStudy && (
                        <p className="text-muted-foreground">{contact.education.fieldOfStudy}</p>
                      )}
                    </div>
                  </div>
                )}

                {contact.skills && contact.skills.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">Skills</p>
                      <div className="flex flex-wrap gap-2">
                        {contact.skills.map((skill) => (
                          <Badge key={skill} variant="secondary">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {contact.languages && contact.languages.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">Languages</p>
                      <div className="flex flex-wrap gap-2">
                        {contact.languages.map((language) => (
                          <Badge key={language} variant="outline">
                            {language}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activities">
          <Card>
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
              <CardDescription>Recent interactions and activities</CardDescription>
            </CardHeader>
            <CardContent>
              {timelineLoading ? (
                <div className="text-sm text-muted-foreground">Loading activities...</div>
              ) : Array.isArray(timeline) && timeline.length ? (
                <div className="space-y-3">
                  {timeline.map((activity: any) => (
                    <div key={activity.id} className="rounded-lg border p-3">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{activity.title}</div>
                        <Badge variant="outline">{activity.activityType}</Badge>
                      </div>
                      {activity.description && (
                        <p className="text-sm text-muted-foreground mt-2">{activity.description}</p>
                      )}
                      <div className="text-xs text-muted-foreground mt-2">
                        {activity.performedByName || activity.performedBy} • {new Date(activity.createdAt).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No activity yet.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="opportunities">
          <Card>
            <CardHeader>
              <CardTitle>Related Opportunities</CardTitle>
              <CardDescription>Sales opportunities involving this contact</CardDescription>
            </CardHeader>
            <CardContent>
              {opportunitiesLoading ? (
                <div className="text-sm text-muted-foreground">Loading opportunities...</div>
              ) : relatedOpportunities.length ? (
                <div className="rounded-md border bg-background">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Stage</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Expected Close</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {relatedOpportunities.slice(0, 10).map((opportunity: any) => (
                        <TableRow key={opportunity.id}>
                          <TableCell className="font-medium">{opportunity.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{opportunity.stage?.replace(/_/g, ' ')}</Badge>
                          </TableCell>
                          <TableCell>
                            ${Number(opportunity.amount ?? 0).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            {new Date(opportunity.expectedCloseDate).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No related opportunities found.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
