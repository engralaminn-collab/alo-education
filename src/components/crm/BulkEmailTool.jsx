import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Mail, Send, Users, Filter, CheckCircle } from 'lucide-react';
import { toast } from "sonner";
import { motion } from 'framer-motion';

export default function BulkEmailTool({ students }) {
  const [filters, setFilters] = useState({
    status: 'all',
    country: 'all',
    degreeLevel: 'all',
  });
  const [emailData, setEmailData] = useState({
    subject: '',
    body: '',
  });
  const [sent, setSent] = useState(false);

  const sendBulkEmail = useMutation({
    mutationFn: async ({ recipients, subject, body }) => {
      const promises = recipients.map(student =>
        base44.integrations.Core.SendEmail({
          to: student.email,
          subject: subject,
          body: body.replace('{{name}}', student.first_name || 'Student'),
        })
      );
      return Promise.all(promises);
    },
    onSuccess: () => {
      setSent(true);
      toast.success('Emails sent successfully!');
      setTimeout(() => setSent(false), 3000);
    },
    onError: () => {
      toast.error('Failed to send emails');
    },
  });

  const filteredStudents = students.filter(student => {
    if (filters.status !== 'all' && student.status !== filters.status) return false;
    if (filters.country !== 'all' && !student.preferred_countries?.includes(filters.country)) return false;
    if (filters.degreeLevel !== 'all' && student.preferred_degree_level !== filters.degreeLevel) return false;
    return true;
  });

  const handleSend = () => {
    if (!emailData.subject || !emailData.body) {
      toast.error('Please fill in subject and message');
      return;
    }
    if (filteredStudents.length === 0) {
      toast.error('No students match the selected filters');
      return;
    }
    sendBulkEmail.mutate({
      recipients: filteredStudents,
      subject: emailData.subject,
      body: emailData.body,
    });
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="w-5 h-5" style={{ color: '#0B5ED7' }} />
          Bulk Email Campaign
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Filters */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-slate-400" />
            <h3 className="font-semibold text-slate-900">Target Audience</h3>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label>Student Status</Label>
              <Select value={filters.status} onValueChange={(v) => setFilters({...filters, status: v})}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="new_lead">New Leads</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="qualified">Qualified</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Country Interest</Label>
              <Select value={filters.country} onValueChange={(v) => setFilters({...filters, country: v})}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Countries</SelectItem>
                  <SelectItem value="United Kingdom">UK</SelectItem>
                  <SelectItem value="United States">USA</SelectItem>
                  <SelectItem value="Canada">Canada</SelectItem>
                  <SelectItem value="Australia">Australia</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Degree Level</Label>
              <Select value={filters.degreeLevel} onValueChange={(v) => setFilters({...filters, degreeLevel: v})}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="bachelor">Bachelor's</SelectItem>
                  <SelectItem value="master">Master's</SelectItem>
                  <SelectItem value="phd">PhD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4 p-3 bg-blue-50 rounded-lg">
            <Users className="w-5 h-5" style={{ color: '#0B5ED7' }} />
            <span className="font-semibold" style={{ color: '#0B5ED7' }}>
              {filteredStudents.length} students selected
            </span>
          </div>
        </div>

        {/* Email Content */}
        <div>
          <h3 className="font-semibold text-slate-900 mb-4">Email Content</h3>
          <div className="space-y-4">
            <div>
              <Label>Subject *</Label>
              <Input
                value={emailData.subject}
                onChange={(e) => setEmailData({...emailData, subject: e.target.value})}
                placeholder="Exciting study abroad opportunities..."
                className="mt-2"
              />
            </div>
            <div>
              <Label>Message * (Use {'{{name}}'} for personalization)</Label>
              <Textarea
                value={emailData.body}
                onChange={(e) => setEmailData({...emailData, body: e.target.value})}
                placeholder="Hi {{name}},&#10;&#10;We have exciting news about..."
                rows={8}
                className="mt-2"
              />
            </div>
          </div>
        </div>

        {sent ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="p-6 bg-green-50 rounded-xl text-center"
          >
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
            <h3 className="font-bold text-green-900 mb-1">Emails Sent Successfully!</h3>
            <p className="text-green-700">Sent to {filteredStudents.length} students</p>
          </motion.div>
        ) : (
          <Button
            onClick={handleSend}
            disabled={sendBulkEmail.isPending || filteredStudents.length === 0}
            className="w-full text-white"
            style={{ backgroundColor: '#0B5ED7' }}
          >
            {sendBulkEmail.isPending ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Sending to {filteredStudents.length} students...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send to {filteredStudents.length} Students
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}