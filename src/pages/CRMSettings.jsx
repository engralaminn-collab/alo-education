import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { 
  Settings, Building2, Bell, Shield, Palette, 
  Save, Mail, Globe
} from 'lucide-react';
import CRMLayout from '@/components/crm/CRMLayout';

export default function CRMSettings() {
  const [settings, setSettings] = useState({
    company_name: 'ALO Education',
    company_email: 'info@aloeducation.com',
    company_phone: '+971 4 123 4567',
    company_address: '123 Education Tower, Business Bay, Dubai, UAE',
    website: 'https://aloeducation.com',
    email_notifications: true,
    new_inquiry_alert: true,
    application_updates: true,
    weekly_reports: true,
    auto_assign_counselor: true,
    max_students_per_counselor: 50,
  });

  const handleSave = () => {
    toast.success('Settings saved successfully');
  };

  return (
    <CRMLayout 
      title="Settings"
      actions={
        <Button onClick={handleSave} className="bg-emerald-500 hover:bg-emerald-600">
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      }
    >
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="bg-white shadow-sm p-1 rounded-xl">
          <TabsTrigger value="general" className="rounded-lg">
            <Building2 className="w-4 h-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="notifications" className="rounded-lg">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="workflow" className="rounded-lg">
            <Settings className="w-4 h-4 mr-2" />
            Workflow
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>Basic information about your organization</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label>Company Name</Label>
                  <Input
                    value={settings.company_name}
                    onChange={(e) => setSettings({ ...settings, company_name: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Website</Label>
                  <Input
                    value={settings.website}
                    onChange={(e) => setSettings({ ...settings, website: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={settings.company_email}
                    onChange={(e) => setSettings({ ...settings, company_email: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input
                    value={settings.company_phone}
                    onChange={(e) => setSettings({ ...settings, company_phone: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label>Address</Label>
                <Input
                  value={settings.company_address}
                  onChange={(e) => setSettings({ ...settings, company_address: e.target.value })}
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Configure how you receive alerts and updates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div>
                  <h4 className="font-medium">Email Notifications</h4>
                  <p className="text-sm text-slate-500">Receive notifications via email</p>
                </div>
                <Switch
                  checked={settings.email_notifications}
                  onCheckedChange={(v) => setSettings({ ...settings, email_notifications: v })}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div>
                  <h4 className="font-medium">New Inquiry Alerts</h4>
                  <p className="text-sm text-slate-500">Get notified when a new inquiry is received</p>
                </div>
                <Switch
                  checked={settings.new_inquiry_alert}
                  onCheckedChange={(v) => setSettings({ ...settings, new_inquiry_alert: v })}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div>
                  <h4 className="font-medium">Application Updates</h4>
                  <p className="text-sm text-slate-500">Notify when application status changes</p>
                </div>
                <Switch
                  checked={settings.application_updates}
                  onCheckedChange={(v) => setSettings({ ...settings, application_updates: v })}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div>
                  <h4 className="font-medium">Weekly Reports</h4>
                  <p className="text-sm text-slate-500">Receive weekly summary reports</p>
                </div>
                <Switch
                  checked={settings.weekly_reports}
                  onCheckedChange={(v) => setSettings({ ...settings, weekly_reports: v })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workflow">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Workflow Settings</CardTitle>
              <CardDescription>Configure automated workflows and assignments</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div>
                  <h4 className="font-medium">Auto-assign Counselors</h4>
                  <p className="text-sm text-slate-500">Automatically assign counselors to new leads based on availability</p>
                </div>
                <Switch
                  checked={settings.auto_assign_counselor}
                  onCheckedChange={(v) => setSettings({ ...settings, auto_assign_counselor: v })}
                />
              </div>

              <div>
                <Label>Maximum Students per Counselor</Label>
                <Input
                  type="number"
                  value={settings.max_students_per_counselor}
                  onChange={(e) => setSettings({ ...settings, max_students_per_counselor: parseInt(e.target.value) })}
                  className="mt-1 w-32"
                />
                <p className="text-sm text-slate-500 mt-1">
                  Counselors won't be auto-assigned once they reach this limit
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </CRMLayout>
  );
}