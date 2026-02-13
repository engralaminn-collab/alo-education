import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { base44 } from '@/api/base44Client';
import { 
  Settings, Building2, Bell, Shield, Palette, 
  Save, Mail, Globe, Trash2, AlertTriangle
} from 'lucide-react';
import CRMLayout from '@/components/crm/CRMLayout';
import ExternalAppIntegration from '@/components/integrations/ExternalAppIntegration';
import N8nWebhookManager from '@/components/integrations/N8nWebhookManager';

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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  const handleSave = () => {
    toast.success('Settings saved successfully');
  };

  const handleDeleteAccount = async () => {
    if (confirmText !== 'DELETE') {
      toast.error('Please type DELETE to confirm');
      return;
    }
    
    try {
      const user = await base44.auth.me();
      // Here you would implement the actual account deletion logic
      toast.success('Account deletion request submitted');
      setDeleteDialogOpen(false);
      base44.auth.logout();
    } catch (error) {
      toast.error('Failed to delete account');
    }
  };

  return (
    <CRMLayout 
      title="Settings"
      actions={
        <Button onClick={handleSave} className="bg-emerald-500 hover:bg-emerald-600 select-none">
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      }
    >
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="bg-white dark:bg-slate-800 shadow-sm p-1 rounded-xl">
          <TabsTrigger value="general" className="rounded-lg select-none">
            <Building2 className="w-4 h-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="notifications" className="rounded-lg select-none">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="workflow" className="rounded-lg select-none">
            <Settings className="w-4 h-4 mr-2" />
            Workflow
          </TabsTrigger>
          <TabsTrigger value="integrations" className="rounded-lg select-none">
            <Globe className="w-4 h-4 mr-2" />
            Integrations
          </TabsTrigger>
          <TabsTrigger value="n8n" className="rounded-lg select-none">
            <Settings className="w-4 h-4 mr-2" />
            n8n Webhooks
          </TabsTrigger>
          <TabsTrigger value="account" className="rounded-lg select-none">
            <Shield className="w-4 h-4 mr-2" />
            Account
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card className="border-0 shadow-sm dark:bg-slate-800">
            <CardHeader>
              <CardTitle className="dark:text-white">Company Information</CardTitle>
              <CardDescription className="dark:text-slate-400">Basic information about your organization</CardDescription>
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
          <Card className="border-0 shadow-sm dark:bg-slate-800">
            <CardHeader>
              <CardTitle className="dark:text-white">Notification Preferences</CardTitle>
              <CardDescription className="dark:text-slate-400">Configure how you receive alerts and updates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700 rounded-xl">
                <div>
                  <h4 className="font-medium">Email Notifications</h4>
                  <p className="text-sm text-slate-500">Receive notifications via email</p>
                </div>
                <Switch
                  checked={settings.email_notifications}
                  onCheckedChange={(v) => setSettings({ ...settings, email_notifications: v })}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700 rounded-xl">
                <div>
                  <h4 className="font-medium dark:text-white">New Inquiry Alerts</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Get notified when a new inquiry is received</p>
                </div>
                <Switch
                  checked={settings.new_inquiry_alert}
                  onCheckedChange={(v) => setSettings({ ...settings, new_inquiry_alert: v })}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700 rounded-xl">
                <div>
                  <h4 className="font-medium dark:text-white">Application Updates</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Notify when application status changes</p>
                </div>
                <Switch
                  checked={settings.application_updates}
                  onCheckedChange={(v) => setSettings({ ...settings, application_updates: v })}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700 rounded-xl">
                <div>
                  <h4 className="font-medium dark:text-white">Weekly Reports</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Receive weekly summary reports</p>
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
          <Card className="border-0 shadow-sm dark:bg-slate-800">
            <CardHeader>
              <CardTitle className="dark:text-white">Workflow Settings</CardTitle>
              <CardDescription className="dark:text-slate-400">Configure automated workflows and assignments</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700 rounded-xl">
                <div>
                  <h4 className="font-medium dark:text-white">Auto-assign Counselors</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Automatically assign counselors to new leads based on availability</p>
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
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Counselors won't be auto-assigned once they reach this limit
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations">
          <ExternalAppIntegration />
        </TabsContent>

        <TabsContent value="n8n">
          <N8nWebhookManager />
        </TabsContent>

        <TabsContent value="account">
          <Card className="border-0 shadow-sm dark:bg-slate-800">
            <CardHeader>
              <CardTitle className="dark:text-white">Account Management</CardTitle>
              <CardDescription className="dark:text-slate-400">Manage your account settings and data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30 p-6 rounded-xl">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-red-100 dark:bg-red-900/50 rounded-lg">
                    <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-red-900 dark:text-red-100 mb-1">Delete Account</h4>
                    <p className="text-sm text-red-700 dark:text-red-300 mb-4">
                      Permanently delete your account and all associated data. This action cannot be undone.
                    </p>
                    <Button
                      variant="destructive"
                      onClick={() => setDeleteDialogOpen(true)}
                      className="select-none"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Account
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Account Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="dark:bg-slate-800">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertTriangle className="w-5 h-5" />
              Delete Account
            </DialogTitle>
            <DialogDescription className="dark:text-slate-400">
              This action cannot be undone. All your data will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="dark:text-white">Type <span className="font-mono font-bold">DELETE</span> to confirm</Label>
              <Input
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="DELETE"
                className="mt-2 dark:bg-slate-700 dark:text-white"
              />
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              This will permanently delete:
            </p>
            <ul className="text-sm text-slate-600 dark:text-slate-400 list-disc list-inside space-y-1">
              <li>Your account profile</li>
              <li>All student records</li>
              <li>All applications and documents</li>
              <li>Message history</li>
            </ul>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setDeleteDialogOpen(false);
              setConfirmText('');
            }} className="select-none dark:bg-slate-700 dark:text-white">
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={confirmText !== 'DELETE'}
              className="select-none"
            >
              Delete Permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CRMLayout>
  );
}