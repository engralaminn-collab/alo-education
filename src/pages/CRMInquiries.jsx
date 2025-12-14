import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { 
  Search, Mail, Phone, Calendar, ArrowRight, 
  CheckCircle, XCircle, Clock, User, MessageSquare, Zap
} from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import CRMLayout from '@/components/crm/CRMLayout';
import EnhancedLeadScoring from '@/components/crm/EnhancedLeadScoring';
import { motion, AnimatePresence } from 'framer-motion';

const statusConfig = {
  new: { color: 'bg-emerald-100 text-emerald-700', icon: Clock },
  contacted: { color: 'bg-blue-100 text-blue-700', icon: MessageSquare },
  converted: { color: 'bg-green-100 text-green-700', icon: CheckCircle },
  not_interested: { color: 'bg-slate-100 text-slate-500', icon: XCircle },
};

export default function CRMInquiries() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [convertDialogOpen, setConvertDialogOpen] = useState(false);
  const [notes, setNotes] = useState('');

  const queryClient = useQueryClient();

  const { data: inquiries = [], isLoading } = useQuery({
    queryKey: ['crm-inquiries'],
    queryFn: () => base44.entities.Inquiry.list('-created_date'),
  });

  const { data: counselors = [] } = useQuery({
    queryKey: ['counselors'],
    queryFn: () => base44.entities.Counselor.filter({ status: 'active' }),
  });

  const updateInquiry = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Inquiry.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-inquiries'] });
      toast.success('Inquiry updated');
    },
  });

  const convertToStudent = useMutation({
    mutationFn: async (inquiry) => {
      // Create student profile
      const student = await base44.entities.StudentProfile.create({
        email: inquiry.email,
        first_name: inquiry.name.split(' ')[0],
        last_name: inquiry.name.split(' ').slice(1).join(' '),
        phone: inquiry.phone,
        preferred_countries: inquiry.country_of_interest ? [inquiry.country_of_interest] : [],
        preferred_degree_level: inquiry.degree_level,
        preferred_fields: inquiry.field_of_study ? [inquiry.field_of_study] : [],
        source: 'website',
        status: 'new_lead',
        counselor_id: inquiry.assigned_to,
        notes: inquiry.message,
      });
      
      // Update inquiry status
      await base44.entities.Inquiry.update(inquiry.id, {
        status: 'converted',
        converted_to_student: student.id,
      });
      
      return student;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-inquiries'] });
      queryClient.invalidateQueries({ queryKey: ['crm-students'] });
      setConvertDialogOpen(false);
      setSelectedInquiry(null);
      toast.success('Inquiry converted to student!');
    },
  });

  const filteredInquiries = inquiries.filter(i => {
    const matchesSearch = 
      i.name?.toLowerCase().includes(search.toLowerCase()) ||
      i.email?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || i.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const newCount = inquiries.filter(i => i.status === 'new').length;
  const contactedCount = inquiries.filter(i => i.status === 'contacted').length;
  const convertedCount = inquiries.filter(i => i.status === 'converted').length;

  return (
    <CRMLayout 
      title="Inquiries"
      actions={
        <Link to={createPageUrl('CRMLeadNurturing')}>
          <Button className="bg-purple-600 hover:bg-purple-700">
            <Zap className="w-4 h-4 mr-2" />
            Lead Nurturing
          </Button>
        </Link>
      }
    >
      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <Card className="border-0 shadow-sm bg-emerald-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-600">New</p>
                <p className="text-2xl font-bold text-emerald-700">{newCount}</p>
              </div>
              <Clock className="w-8 h-8 text-emerald-300" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600">Contacted</p>
                <p className="text-2xl font-bold text-blue-700">{contactedCount}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-blue-300" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600">Converted</p>
                <p className="text-2xl font-bold text-green-700">{convertedCount}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-300" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-slate-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Conversion Rate</p>
                <p className="text-2xl font-bold text-slate-700">
                  {inquiries.length > 0 ? Math.round((convertedCount / inquiries.length) * 100) : 0}%
                </p>
              </div>
              <ArrowRight className="w-8 h-8 text-slate-300" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search inquiries..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="converted">Converted</SelectItem>
                <SelectItem value="not_interested">Not Interested</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Inquiry List */}
      <div className="grid gap-4">
        <AnimatePresence>
          {isLoading ? (
            [...Array(5)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-16 bg-slate-100 rounded" />
                </CardContent>
              </Card>
            ))
          ) : filteredInquiries.length === 0 ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-12 text-center">
                <Mail className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No inquiries found</h3>
                <p className="text-slate-500">New inquiries will appear here</p>
              </CardContent>
            </Card>
          ) : (
            filteredInquiries.map((inquiry, index) => {
              const status = statusConfig[inquiry.status] || statusConfig.new;
              const StatusIcon = status.icon;
              
              return (
                <motion.div
                  key={inquiry.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card 
                    className="border-0 shadow-sm hover:shadow-lg transition-all cursor-pointer"
                    onClick={() => setSelectedInquiry(inquiry)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-semibold">
                          {inquiry.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-slate-900">{inquiry.name}</h3>
                            <Badge className={status.color}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {inquiry.status}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                            <span className="flex items-center gap-1">
                              <Mail className="w-4 h-4" />
                              {inquiry.email}
                            </span>
                            {inquiry.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-4 h-4" />
                                {inquiry.phone}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {inquiry.created_date && format(new Date(inquiry.created_date), 'MMM d, yyyy')}
                            </span>
                          </div>
                          {inquiry.message && (
                            <p className="text-slate-600 mt-2 line-clamp-2">{inquiry.message}</p>
                          )}
                        </div>
                        <div className="flex flex-col gap-2">
                          {inquiry.country_of_interest && (
                            <Badge variant="outline" className="capitalize">
                              {inquiry.country_of_interest}
                            </Badge>
                          )}
                          {inquiry.degree_level && (
                            <Badge variant="outline" className="capitalize">
                              {inquiry.degree_level}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* Inquiry Detail Dialog */}
      <Dialog open={!!selectedInquiry && !convertDialogOpen} onOpenChange={(open) => !open && setSelectedInquiry(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Inquiry Details</DialogTitle>
          </DialogHeader>
          {selectedInquiry && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-2xl font-bold text-slate-600">
                  {selectedInquiry.name?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{selectedInquiry.name}</h3>
                  <Badge className={statusConfig[selectedInquiry.status]?.color}>
                    {selectedInquiry.status}
                  </Badge>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span>{selectedInquiry.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span>{selectedInquiry.phone || '-'}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-slate-500">Country Interest:</span>
                    <span className="ml-2 capitalize">{selectedInquiry.country_of_interest || '-'}</span>
                  </div>
                  <div>
                    <span className="text-sm text-slate-500">Degree Level:</span>
                    <span className="ml-2 capitalize">{selectedInquiry.degree_level || '-'}</span>
                  </div>
                </div>
              </div>

              {selectedInquiry.message && (
                <div>
                  <h4 className="font-semibold mb-2">Message</h4>
                  <p className="text-slate-600 bg-slate-50 p-4 rounded-lg">{selectedInquiry.message}</p>
                </div>
              )}

              {/* Lead Scoring */}
              <EnhancedLeadScoring inquiry={selectedInquiry} studentProfile={null} />

              <div>
                <label className="text-sm font-medium">Assign To</label>
                <Select 
                  value={selectedInquiry.assigned_to || ''} 
                  onValueChange={(v) => {
                    updateInquiry.mutate({ 
                      id: selectedInquiry.id, 
                      data: { assigned_to: v } 
                    });
                    setSelectedInquiry({ ...selectedInquiry, assigned_to: v });
                  }}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select counselor" />
                  </SelectTrigger>
                  <SelectContent>
                    {counselors.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <DialogFooter className="flex-col sm:flex-row gap-2">
                {selectedInquiry.status === 'new' && (
                  <Button 
                    variant="outline"
                    onClick={() => {
                      updateInquiry.mutate({ 
                        id: selectedInquiry.id, 
                        data: { status: 'contacted' } 
                      });
                      setSelectedInquiry({ ...selectedInquiry, status: 'contacted' });
                    }}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Mark as Contacted
                  </Button>
                )}
                {selectedInquiry.status !== 'converted' && (
                  <Button 
                    className="bg-emerald-500 hover:bg-emerald-600"
                    onClick={() => setConvertDialogOpen(true)}
                  >
                    <User className="w-4 h-4 mr-2" />
                    Convert to Student
                  </Button>
                )}
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Convert Dialog */}
      <Dialog open={convertDialogOpen} onOpenChange={setConvertDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Convert to Student</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-slate-600">
              This will create a new student profile for <strong>{selectedInquiry?.name}</strong> with their inquiry information.
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConvertDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                className="bg-emerald-500 hover:bg-emerald-600"
                onClick={() => convertToStudent.mutate(selectedInquiry)}
                disabled={convertToStudent.isPending}
              >
                {convertToStudent.isPending ? 'Converting...' : 'Convert'}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </CRMLayout>
  );
}