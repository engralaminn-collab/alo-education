import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

export default function AddPartnershipModal({ open, onClose, universities }) {
  const [activeTab, setActiveTab] = useState('agreement');
  const queryClient = useQueryClient();

  const [agreementData, setAgreementData] = useState({
    university_id: '',
    agreement_title: '',
    agreement_type: 'partnership',
    start_date: '',
    end_date: '',
    commission_rate: '',
    terms: '',
    status: 'active'
  });

  const [contactData, setContactData] = useState({
    university_id: '',
    contact_name: '',
    position: '',
    department: '',
    email: '',
    phone: '',
    is_primary: false
  });

  const createAgreement = useMutation({
    mutationFn: (data) => base44.entities.UniversityAgreement.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partnership-agreements'] });
      toast.success('Partnership agreement created');
      resetForm();
      onClose();
    },
    onError: () => toast.error('Failed to create agreement')
  });

  const createContact = useMutation({
    mutationFn: (data) => base44.entities.UniversityContact.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['university-contacts'] });
      toast.success('Contact added');
      resetForm();
      onClose();
    },
    onError: () => toast.error('Failed to add contact')
  });

  const resetForm = () => {
    setAgreementData({
      university_id: '',
      agreement_title: '',
      agreement_type: 'partnership',
      start_date: '',
      end_date: '',
      commission_rate: '',
      terms: '',
      status: 'active'
    });
    setContactData({
      university_id: '',
      contact_name: '',
      position: '',
      department: '',
      email: '',
      phone: '',
      is_primary: false
    });
    setActiveTab('agreement');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Partnership</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="agreement">Agreement</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
          </TabsList>

          <TabsContent value="agreement" className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-semibold text-slate-900 mb-2 block">University</label>
              <Select value={agreementData.university_id} onValueChange={(value) => setAgreementData({ ...agreementData, university_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select university" />
                </SelectTrigger>
                <SelectContent>
                  {universities.map(uni => (
                    <SelectItem key={uni.id} value={uni.id}>{uni.university_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-900 mb-2 block">Agreement Title</label>
              <Input
                value={agreementData.agreement_title}
                onChange={(e) => setAgreementData({ ...agreementData, agreement_title: e.target.value })}
                placeholder="Partnership Agreement 2026"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-slate-900 mb-2 block">Type</label>
                <Select value={agreementData.agreement_type} onValueChange={(value) => setAgreementData({ ...agreementData, agreement_type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="partnership">Partnership</SelectItem>
                    <SelectItem value="commission">Commission</SelectItem>
                    <SelectItem value="mou">MOU</SelectItem>
                    <SelectItem value="scholarship">Scholarship</SelectItem>
                    <SelectItem value="pathway">Pathway</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-900 mb-2 block">Commission Rate (%)</label>
                <Input
                  type="number"
                  value={agreementData.commission_rate}
                  onChange={(e) => setAgreementData({ ...agreementData, commission_rate: e.target.value })}
                  placeholder="15"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-slate-900 mb-2 block">Start Date</label>
                <Input
                  type="date"
                  value={agreementData.start_date}
                  onChange={(e) => setAgreementData({ ...agreementData, start_date: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-900 mb-2 block">End Date</label>
                <Input
                  type="date"
                  value={agreementData.end_date}
                  onChange={(e) => setAgreementData({ ...agreementData, end_date: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-900 mb-2 block">Terms & Conditions</label>
              <Textarea
                value={agreementData.terms}
                onChange={(e) => setAgreementData({ ...agreementData, terms: e.target.value })}
                rows={4}
                placeholder="Agreement terms..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button
                onClick={() => createAgreement.mutate(agreementData)}
                disabled={!agreementData.university_id || !agreementData.agreement_title || createAgreement.isPending}
                className="bg-blue-600"
              >
                Create Agreement
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="contact" className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-semibold text-slate-900 mb-2 block">University</label>
              <Select value={contactData.university_id} onValueChange={(value) => setContactData({ ...contactData, university_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select university" />
                </SelectTrigger>
                <SelectContent>
                  {universities.map(uni => (
                    <SelectItem key={uni.id} value={uni.id}>{uni.university_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-900 mb-2 block">Contact Name</label>
              <Input
                value={contactData.contact_name}
                onChange={(e) => setContactData({ ...contactData, contact_name: e.target.value })}
                placeholder="John Smith"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-slate-900 mb-2 block">Position</label>
                <Input
                  value={contactData.position}
                  onChange={(e) => setContactData({ ...contactData, position: e.target.value })}
                  placeholder="Admissions Director"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-900 mb-2 block">Department</label>
                <Input
                  value={contactData.department}
                  onChange={(e) => setContactData({ ...contactData, department: e.target.value })}
                  placeholder="International Admissions"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-900 mb-2 block">Email</label>
              <Input
                type="email"
                value={contactData.email}
                onChange={(e) => setContactData({ ...contactData, email: e.target.value })}
                placeholder="contact@university.edu"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-900 mb-2 block">Phone</label>
              <Input
                value={contactData.phone}
                onChange={(e) => setContactData({ ...contactData, phone: e.target.value })}
                placeholder="+1 234 567 8900"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_primary"
                checked={contactData.is_primary}
                onChange={(e) => setContactData({ ...contactData, is_primary: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="is_primary" className="text-sm text-slate-700">Primary Contact</label>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button
                onClick={() => createContact.mutate(contactData)}
                disabled={!contactData.university_id || !contactData.contact_name || !contactData.email || createContact.isPending}
                className="bg-blue-600"
              >
                Add Contact
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}