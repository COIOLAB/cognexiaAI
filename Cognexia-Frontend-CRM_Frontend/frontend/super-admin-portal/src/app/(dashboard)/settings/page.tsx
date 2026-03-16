'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Settings as SettingsIcon, Bell, Shield, Mail, Database } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-gray-500">Manage platform configuration and preferences</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5" />
              General Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Platform Name</label>
              <Input defaultValue="CognexiaAI CRM" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Support Email</label>
              <Input defaultValue="support@cognexiaai.com" className="mt-1" />
            </div>
            <Button>Save Changes</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Email notifications for new organizations</span>
              <input type="checkbox" defaultChecked className="h-4 w-4" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Alert on high error rate</span>
              <input type="checkbox" defaultChecked className="h-4 w-4" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Daily system health reports</span>
              <input type="checkbox" className="h-4 w-4" />
            </div>
            <Button>Update Notifications</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Session Timeout (minutes)</label>
              <Input type="number" defaultValue="60" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Maximum Login Attempts</label>
              <Input type="number" defaultValue="5" className="mt-1" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Require 2FA for super admins</span>
              <input type="checkbox" defaultChecked className="h-4 w-4" />
            </div>
            <Button>Update Security</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">SMTP Host</label>
              <Input defaultValue="smtp.sendgrid.net" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">SMTP Port</label>
              <Input defaultValue="587" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">From Email</label>
              <Input defaultValue="noreply@cognexiaai.com" className="mt-1" />
            </div>
            <Button>Test & Save Email Settings</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Backup & Maintenance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Automatic Backup Schedule</label>
              <select className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2">
                <option>Daily at 2:00 AM</option>
                <option>Every 12 hours</option>
                <option>Weekly</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Backup Retention (days)</label>
              <Input type="number" defaultValue="30" className="mt-1" />
            </div>
            <div className="flex gap-2">
              <Button>Backup Now</Button>
              <Button variant="outline">View Backups</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

