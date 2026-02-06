import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building2, Users, FileText, TrendingUp, 
  Mail, Phone, Calendar, DollarSign 
} from 'lucide-react';

export default function PartnershipDetailPanel({ university, onClose }) {
  const { data: agreements = [] } = useQuery({
    queryKey: ['university-agreements', university.id],
    queryFn: () => base44.entities.UniversityAgreement.filter({ university_id: university.id })
  });

  const { data: contacts = [] } = useQuery({
    queryKey: ['university-contacts-detail', university.id],
    queryFn: () => base44.entities.UniversityContact.filter({ university_id: university.id })
  });

  const { data: applications = [] } = useQuery({
    queryKey: ['university-applications', university.id],
    queryFn: () => base44.entities.Application.filter({ university_id: university.id })
  });

  const activeAgreement = agreements.find(a => a.status === 'active');
  const enrolledApplications = applications.filter(a => a.status === 'enrolled');
  const primaryContact = contacts.find(c => c.is_primary);

  return (
    <Dialog open={!!university} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <Building2 className="w-6 h-6 text-blue-600" />
            <div>
              <DialogTitle>{university.university_name}</DialogTitle>
              <p className="text-sm text-slate-600 mt-1">{university.city}, {university.country}</p>
            </div>
          </div>
        </DialogHeader>

        <div className="grid md:grid-cols-4 gap-4 mt-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-slate-600 mb-1">Active Agreements</p>
              <p className="text-2xl font-bold text-blue-600">{agreements.filter(a => a.status === 'active').length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-slate-600 mb-1">Total Applications</p>
              <p className="text-2xl font-bold text-purple-600">{applications.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-slate-600 mb-1">Enrolled Students</p>
              <p className="text-2xl font-bold text-green-600">{enrolledApplications.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-slate-600 mb-1">Contacts</p>
              <p className="text-2xl font-bold text-orange-600">{contacts.length}</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="agreements" className="mt-6">
          <TabsList>
            <TabsTrigger value="agreements">Agreements</TabsTrigger>
            <TabsTrigger value="contacts">Contacts</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="agreements" className="space-y-3 mt-4">
            {agreements.map(agreement => (
              <Card key={agreement.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-slate-900">{agreement.agreement_title}</h4>
                      <p className="text-sm text-slate-600 capitalize">{agreement.agreement_type}</p>
                    </div>
                    <Badge className={agreement.status === 'active' ? 'bg-green-600' : 'bg-slate-600'}>
                      {agreement.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-slate-500 text-xs mb-1">Start Date</p>
                      <p className="font-semibold">{new Date(agreement.start_date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-xs mb-1">End Date</p>
                      <p className="font-semibold">{agreement.end_date ? new Date(agreement.end_date).toLocaleDateString() : 'N/A'}</p>
                    </div>
                    {agreement.commission_rate && (
                      <div>
                        <p className="text-slate-500 text-xs mb-1">Commission</p>
                        <p className="font-bold text-green-600">{agreement.commission_rate}%</p>
                      </div>
                    )}
                  </div>

                  {agreement.terms && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-xs text-slate-500 mb-1">Terms</p>
                      <p className="text-sm text-slate-700">{agreement.terms}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {agreements.length === 0 && (
              <p className="text-center py-8 text-slate-500">No agreements</p>
            )}
          </TabsContent>

          <TabsContent value="contacts" className="space-y-3 mt-4">
            {contacts.map(contact => (
              <Card key={contact.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-slate-900">{contact.contact_name}</h4>
                        {contact.is_primary && (
                          <Badge className="bg-blue-600 text-xs">Primary</Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-600">{contact.position}</p>
                      <p className="text-xs text-slate-500">{contact.department}</p>
                    </div>
                  </div>

                  <div className="space-y-2 mt-3 text-sm">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Mail className="w-4 h-4" />
                      {contact.email}
                    </div>
                    {contact.phone && (
                      <div className="flex items-center gap-2 text-slate-600">
                        <Phone className="w-4 h-4" />
                        {contact.phone}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

            {contacts.length === 0 && (
              <p className="text-center py-8 text-slate-500">No contacts</p>
            )}
          </TabsContent>

          <TabsContent value="performance" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Application Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Total Applications</span>
                    <span className="font-bold">{applications.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Enrolled</span>
                    <span className="font-bold text-green-600">{enrolledApplications.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Success Rate</span>
                    <span className="font-bold text-blue-600">
                      {applications.length > 0 ? ((enrolledApplications.length / applications.length) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {activeAgreement?.commission_rate && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Commission Estimate</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600 mb-3">
                    Based on {enrolledApplications.length} enrolled students at {activeAgreement.commission_rate}% commission
                  </p>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-xs text-green-700 mb-1">Estimated Commission</p>
                    <p className="text-2xl font-bold text-green-600">
                      ${(enrolledApplications.length * 15000 * (activeAgreement.commission_rate / 100)).toLocaleString()}
                    </p>
                    <p className="text-xs text-green-600 mt-1">Approximate based on avg tuition</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}