'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { communicationAPI } from '@/lib/api/super-admin-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'react-hot-toast';
import { Send, Bell } from 'lucide-react';
import { useState } from 'react';

export default function CommunicationsPage() {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('info');
  const [targetType, setTargetType] = useState('all');

  const { data: announcements } = useQuery({
    queryKey: ['communications', 'announcements'],
    queryFn: () => communicationAPI.getAllAnnouncements(),
  });

  const createAnnouncementMutation = useMutation({
    mutationFn: communicationAPI.createAnnouncement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communications'] });
      toast.success('Announcement created');
      setTitle('');
      setMessage('');
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Communication Center</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Create Announcement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div>
                <Textarea placeholder="Message" value={message} onChange={(e) => setMessage(e.target.value)} rows={4} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={targetType} onValueChange={setTargetType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Organizations</SelectItem>
                    <SelectItem value="tier">Specific Tier</SelectItem>
                    <SelectItem value="specific">Specific Orgs</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                className="w-full"
                onClick={() => createAnnouncementMutation.mutate({ title, message, type, targetType })}
                disabled={!title || !message}
              >
                <Send className="h-4 w-4 mr-2" />
                Send Announcement
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Announcements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {announcements?.map((announcement: any) => (
                <div key={announcement.id} className="p-3 border rounded-lg">
                  <p className="font-medium">{announcement.title}</p>
                  <p className="text-sm text-muted-foreground mt-1">{announcement.message}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(announcement.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

