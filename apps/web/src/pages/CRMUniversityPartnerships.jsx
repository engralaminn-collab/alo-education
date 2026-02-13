import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { 
  Handshake, Users, FileText, MessageSquare, 
  Plus, Edit, Calendar, AlertCircle 
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import CRMLayout from '@/components/crm/CRMLayout';

export default function CRMUniversityPartnerships() {
  const [selectedUniversity, setSelectedUniversity] = useState(null);
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [showAgreementDialog, setShowAgreementDialog] = useState(false);
  const [showInteractionDialog, setShowInteractionDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const queryClient = useQueryClient();

  const { data: universities = [] } = useQuery({
    queryKey: ['universities'],
    queryFn: () => base44.entities.University.list(),
  });

  const { data: contacts = [] } = useQuery({
    queryKey: ['university-contacts'],
    queryFn: () => base44.entities.UniversityContact.list(),
  });

  const { data: agreements = [] } = useQuery({
    queryKey: ['university-agreements'],
    queryFn: () => base44.entities.UniversityAgreement.list(),
  });

  const { data: interactions = [] } = useQuery({
    queryKey: ['university-interactions'],
    queryFn: () => base44.entities.UniversityInteraction.list(),
  });

  const { data: currentUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const saveContactMutation = useMutation({
    mutationFn: (data) => {
      if (editingItem?.id) {
        return base44.entities.UniversityContact.update(editingItem.id, data);
      }
      return base44.entities.UniversityContact.create({ ...data, university_id: selectedUniversity.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['university-contacts'] });
      setShowContactDialog(false);
      setEditingItem(null);
      toast.success('Contact saved!');
    },
  });

  const saveAgreementMutation = useMutation({
    mutationFn: (data) => {
      if (editingItem?.id) {
        return base44.entities.UniversityAgreement.update(editingItem.id, data);
      }
      return base44.entities.UniversityAgreement.create({ 
        ...data, 
        university_id: selectedUniversity.id,
        created_by: currentUser?.email 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['university-agreements'] });
      setShowAgreementDialog(false);
      setEditingItem(null);
      toast.success('Agreement saved!');
    },
  });

  const saveInteractionMutation = useMutation({
    mutationFn: (data) => {
      return base44.entities.UniversityInteraction.create({ 
        ...data, 
        university_id: selectedUniversity.id,
        counselor_id: currentUser?.id 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['university-interactions'] });
      setShowInteractionDialog(false);
      toast.success('Interaction logged!');
    },
  });

  const universityContacts = contacts.filter(c => c.university_id === selectedUniversity?.id);
  const universityAgreements = agreements.filter(a => a.university_id === selectedUniversity?.id);
  const universityInteractions = interactions.filter(i => i.university_id === selectedUniversity?.id)
    .sort((a, b) => new Date(b.interaction_date) - new Date(a.interaction_date));

  // Find expiring agreements
  const expiringAgreements = agreements.filter(a => {
    if (a.end_date && a.status === 'active') {
      const daysUntilExpiry = Math.floor((new Date(a.end_date) - new Date()) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
    }
    return false;
  });

  return (
    <CRMLayout currentPage="University Partnerships">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">University Partnerships</h1>
            <p className="text-slate-600 mt-1">Manage relationships and agreements</p>
          </div>
        </div>

        {expiringAgreements.length > 0 && (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-orange-900">Agreements Expiring Soon</p>
                  {expiringAgreements.map(a => (
                    <p key={a.id} className="text-sm text-orange-700">
                      • {a.agreement_title} expires {format(new Date(a.end_date), 'PPP')}
                    </p>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Universities List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Partner Universities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-[600px] overflow-y-auto">
              {universities.map((uni) => (
                <div
                  key={uni.id}
                  onClick={() => setSelectedUniversity(uni)}
                  className={`p-3 rounded-lg cursor-pointer border transition-colors ${
                    selectedUniversity?.id === uni.id
                      ? 'bg-blue-50 border-blue-300'
                      : 'hover:bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {uni.logo && (
                      <img src={uni.logo} alt={uni.university_name} className="w-10 h-10 object-contain" />
                    )}
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{uni.university_name}</p>
                      <p className="text-xs text-slate-500">{uni.country}</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* University Details */}
          <div className="lg:col-span-2">
            {selectedUniversity ? (
              <Tabs defaultValue="contacts">
                <TabsList className="w-full">
                  <TabsTrigger value="contacts" className="flex-1">
                    <Users className="w-4 h-4 mr-2" />
                    Contacts ({universityContacts.length})
                  </TabsTrigger>
                  <TabsTrigger value="agreements" className="flex-1">
                    <FileText className="w-4 h-4 mr-2" />
                    Agreements ({universityAgreements.length})
                  </TabsTrigger>
                  <TabsTrigger value="interactions" className="flex-1">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Interactions ({universityInteractions.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="contacts" className="space-y-4">
                  <Button onClick={() => { setEditingItem({}); setShowContactDialog(true); }} style={{ backgroundColor: '#F37021' }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Contact
                  </Button>
                  {universityContacts.map((contact) => (
                    <Card key={contact.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold">{contact.contact_name}</h4>
                            <p className="text-sm text-slate-600">{contact.position}</p>
                            <p className="text-sm text-slate-500">{contact.email}</p>
                            {contact.phone && <p className="text-sm text-slate-500">{contact.phone}</p>}
                          </div>
                          <Button size="sm" variant="outline" onClick={() => { setEditingItem(contact); setShowContactDialog(true); }}>
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="agreements" className="space-y-4">
                  <Button onClick={() => { setEditingItem({}); setShowAgreementDialog(true); }} style={{ backgroundColor: '#F37021' }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Agreement
                  </Button>
                  {universityAgreements.map((agreement) => (
                    <Card key={agreement.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold">{agreement.agreement_title}</h4>
                            <p className="text-sm text-slate-600 capitalize">{agreement.agreement_type}</p>
                            <p className="text-sm text-slate-500">
                              {format(new Date(agreement.start_date), 'PPP')} - {agreement.end_date ? format(new Date(agreement.end_date), 'PPP') : 'Ongoing'}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={
                              agreement.status === 'active' ? 'bg-green-100 text-green-700' :
                              agreement.status === 'expired' ? 'bg-red-100 text-red-700' :
                              'bg-slate-100 text-slate-700'
                            }>
                              {agreement.status}
                            </Badge>
                            <Button size="sm" variant="outline" onClick={() => { setEditingItem(agreement); setShowAgreementDialog(true); }}>
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="interactions" className="space-y-4">
                  <Button onClick={() => setShowInteractionDialog(true)} style={{ backgroundColor: '#F37021' }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Log Interaction
                  </Button>
                  {universityInteractions.map((interaction) => (
                    <Card key={interaction.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <MessageSquare className="w-5 h-5 text-blue-600 mt-1" />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold">{interaction.subject}</h4>
                              <Badge variant="outline" className="text-xs capitalize">{interaction.interaction_type}</Badge>
                            </div>
                            <p className="text-sm text-slate-600 mt-1">{interaction.summary}</p>
                            <p className="text-xs text-slate-500 mt-2">
                              {format(new Date(interaction.interaction_date), 'PPpp')}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>
              </Tabs>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Handshake className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600">Select a university to view details</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Contact Dialog */}
        <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingItem?.id ? 'Edit' : 'Add'} Contact</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              saveContactMutation.mutate(Object.fromEntries(formData.entries()));
            }} className="space-y-4">
              <div>
                <Label>Contact Name *</Label>
                <Input name="contact_name" defaultValue={editingItem?.contact_name} required />
              </div>
              <div>
                <Label>Position</Label>
                <Input name="position" defaultValue={editingItem?.position} />
              </div>
              <div>
                <Label>Email *</Label>
                <Input name="email" type="email" defaultValue={editingItem?.email} required />
              </div>
              <div>
                <Label>Phone</Label>
                <Input name="phone" defaultValue={editingItem?.phone} />
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => setShowContactDialog(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" style={{ backgroundColor: '#0066CC' }}>Save</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Agreement Dialog */}
        <Dialog open={showAgreementDialog} onOpenChange={setShowAgreementDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingItem?.id ? 'Edit' : 'Add'} Agreement</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              saveAgreementMutation.mutate(Object.fromEntries(formData.entries()));
            }} className="space-y-4">
              <div>
                <Label>Agreement Title *</Label>
                <Input name="agreement_title" defaultValue={editingItem?.agreement_title} required />
              </div>
              <div>
                <Label>Type *</Label>
                <select name="agreement_type" defaultValue={editingItem?.agreement_type} required className="w-full px-3 py-2 border rounded-md">
                  <option value="">Select...</option>
                  <option value="partnership">Partnership</option>
                  <option value="commission">Commission</option>
                  <option value="scholarship">Scholarship</option>
                  <option value="direct_admission">Direct Admission</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Date *</Label>
                  <Input name="start_date" type="date" defaultValue={editingItem?.start_date} required />
                </div>
                <div>
                  <Label>End Date</Label>
                  <Input name="end_date" type="date" defaultValue={editingItem?.end_date} />
                </div>
              </div>
              <div>
                <Label>Terms</Label>
                <Textarea name="terms" defaultValue={editingItem?.terms} rows={4} />
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => setShowAgreementDialog(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" style={{ backgroundColor: '#0066CC' }}>Save</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Interaction Dialog */}
        <Dialog open={showInteractionDialog} onOpenChange={setShowInteractionDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Log Interaction</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              saveInteractionMutation.mutate({
                ...Object.fromEntries(formData.entries()),
                interaction_date: new Date().toISOString()
              });
            }} className="space-y-4">
              <div>
                <Label>Contact</Label>
                <select name="contact_id" className="w-full px-3 py-2 border rounded-md">
                  <option value="">Select contact...</option>
                  {universityContacts.map(c => (
                    <option key={c.id} value={c.id}>{c.contact_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Type *</Label>
                <select name="interaction_type" required className="w-full px-3 py-2 border rounded-md">
                  <option value="">Select...</option>
                  <option value="call">Call</option>
                  <option value="email">Email</option>
                  <option value="meeting">Meeting</option>
                  <option value="visit">Visit</option>
                </select>
              </div>
              <div>
                <Label>Subject *</Label>
                <Input name="subject" required />
              </div>
              <div>
                <Label>Summary *</Label>
                <Textarea name="summary" required rows={4} />
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => setShowInteractionDialog(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" style={{ backgroundColor: '#0066CC' }}>Save</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </CRMLayout>
  );
}