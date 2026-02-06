import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import CRMLayout from '@/components/crm/CRMLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  Handshake, TrendingUp, DollarSign, Users, 
  Plus, Search, Building2, CheckCircle, Clock, AlertCircle
} from 'lucide-react';
import AddPartnershipModal from '@/components/crm/AddPartnershipModal';
import PartnershipDetailPanel from '@/components/crm/PartnershipDetailPanel';
import PartnershipPerformanceMetrics from '@/components/crm/PartnershipPerformanceMetrics';
import PartnershipAnalyticsDashboard from '@/components/crm/PartnershipAnalyticsDashboard';
import { toast } from 'sonner';

export default function CRMPartnerships() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUniversity, setSelectedUniversity] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const queryClient = useQueryClient();

  const { data: universities = [] } = useQuery({
    queryKey: ['universities-partnerships'],
    queryFn: () => base44.entities.University.list()
  });

  const { data: agreements = [] } = useQuery({
    queryKey: ['partnership-agreements'],
    queryFn: () => base44.entities.UniversityAgreement.list('-created_date')
  });

  const { data: contacts = [] } = useQuery({
    queryKey: ['university-contacts'],
    queryFn: () => base44.entities.UniversityContact.list()
  });

  const { data: applications = [] } = useQuery({
    queryKey: ['applications-partnerships'],
    queryFn: () => base44.entities.Application.list()
  });

  // Calculate partnership metrics
  const activeAgreements = agreements.filter(a => a.status === 'active');
  const expiringAgreements = agreements.filter(a => {
    if (!a.end_date || a.status !== 'active') return false;
    const daysUntil = (new Date(a.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return daysUntil > 0 && daysUntil <= 90;
  });

  const totalCommissionRate = activeAgreements.reduce((sum, a) => sum + (a.commission_rate || 0), 0);
  const avgCommissionRate = activeAgreements.length > 0 ? (totalCommissionRate / activeAgreements.length).toFixed(1) : 0;

  const universitiesWithPartnerships = new Set(activeAgreements.map(a => a.university_id));

  const checkRenewals = async () => {
    try {
      const response = await base44.functions.invoke('checkPartnershipRenewals');
      toast.success(`Found ${response.data.renewalsFound} renewal alerts. ${response.data.emailsSent} emails sent.`);
    } catch (error) {
      toast.error('Failed to check renewals');
    }
  };

  const filteredUniversities = universities.filter(u => 
    u.university_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.country?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <CRMLayout
      title="University Partnerships"
      actions={
        <div className="flex gap-3">
          <Button onClick={checkRenewals} variant="outline" className="border-orange-600 text-orange-600">
            <AlertCircle className="w-4 h-4 mr-2" />
            Check Renewals
          </Button>
          <Button onClick={() => setShowAddModal(true)} className="bg-blue-600">
            <Plus className="w-4 h-4 mr-2" />
            New Partnership
          </Button>
        </div>
      }
    >
      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Active Partnerships</p>
                <p className="text-3xl font-bold text-blue-600">{activeAgreements.length}</p>
              </div>
              <Handshake className="w-10 h-10 text-blue-600/20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Partner Universities</p>
                <p className="text-3xl font-bold text-purple-600">{universitiesWithPartnerships.size}</p>
              </div>
              <Building2 className="w-10 h-10 text-purple-600/20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Avg Commission Rate</p>
                <p className="text-3xl font-bold text-green-600">{avgCommissionRate}%</p>
              </div>
              <DollarSign className="w-10 h-10 text-green-600/20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Expiring Soon</p>
                <p className="text-3xl font-bold text-orange-600">{expiringAgreements.length}</p>
              </div>
              <Clock className="w-10 h-10 text-orange-600/20" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="agreements">Agreements</TabsTrigger>
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="mt-6">
          <PartnershipAnalyticsDashboard 
            agreements={agreements}
            applications={applications}
            universities={universities}
          />
        </TabsContent>

        <TabsContent value="overview" className="mt-6 space-y-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search universities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUniversities.map(university => {
              const uniAgreements = agreements.filter(a => a.university_id === university.id);
              const activeAgreement = uniAgreements.find(a => a.status === 'active');
              const uniContacts = contacts.filter(c => c.university_id === university.id);
              const uniApplications = applications.filter(a => a.university_id === university.id);

              return (
                <Card 
                  key={university.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setSelectedUniversity(university)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-slate-900 mb-1">
                          {university.university_name}
                        </h3>
                        <p className="text-sm text-slate-600">{university.country}</p>
                      </div>
                      {activeAgreement && (
                        <Badge className="bg-green-600">Active</Badge>
                      )}
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Agreements</span>
                        <span className="font-semibold">{uniAgreements.length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Contacts</span>
                        <span className="font-semibold">{uniContacts.length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Applications</span>
                        <span className="font-semibold">{uniApplications.length}</span>
                      </div>
                      {activeAgreement?.commission_rate && (
                        <div className="flex items-center justify-between pt-2 border-t">
                          <span className="text-slate-600">Commission</span>
                          <span className="font-bold text-green-600">{activeAgreement.commission_rate}%</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="agreements" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Partnership Agreements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {agreements.map(agreement => {
                  const university = universities.find(u => u.id === agreement.university_id);
                  const daysUntilExpiry = agreement.end_date 
                    ? Math.ceil((new Date(agreement.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                    : null;
                  const isExpiring = daysUntilExpiry && daysUntilExpiry > 0 && daysUntilExpiry <= 90;

                  return (
                    <div key={agreement.id} className="p-4 border rounded-lg bg-slate-50">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-900">{agreement.agreement_title}</h4>
                          <p className="text-sm text-slate-600">{university?.university_name}</p>
                        </div>
                        <div className="flex gap-2">
                          {isExpiring && (
                            <Badge className="bg-orange-600">
                              <Clock className="w-3 h-3 mr-1" />
                              Expires in {daysUntilExpiry}d
                            </Badge>
                          )}
                          <Badge className={
                            agreement.status === 'active' ? 'bg-green-600' :
                            agreement.status === 'expired' ? 'bg-red-600' :
                            agreement.status === 'pending' ? 'bg-yellow-600' :
                            'bg-slate-600'
                          }>
                            {agreement.status}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-slate-500 text-xs">Type</p>
                          <p className="font-semibold capitalize">{agreement.agreement_type}</p>
                        </div>
                        {agreement.commission_rate && (
                          <div>
                            <p className="text-slate-500 text-xs">Commission</p>
                            <p className="font-semibold text-green-600">{agreement.commission_rate}%</p>
                          </div>
                        )}
                        <div>
                          <p className="text-slate-500 text-xs">End Date</p>
                          <p className="font-semibold">
                            {agreement.end_date ? new Date(agreement.end_date).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {agreements.length === 0 && (
                  <div className="text-center py-12 text-slate-500">
                    <Handshake className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p>No agreements yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contacts" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>University Contacts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {contacts.map(contact => {
                  const university = universities.find(u => u.id === contact.university_id);

                  return (
                    <div key={contact.id} className="p-4 border rounded-lg bg-slate-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-slate-900">{contact.contact_name}</h4>
                            {contact.is_primary && (
                              <Badge className="bg-blue-600 text-xs">Primary</Badge>
                            )}
                          </div>
                          <p className="text-sm text-slate-600">{university?.university_name}</p>
                          <p className="text-xs text-slate-500 mt-1">{contact.position} • {contact.department}</p>
                        </div>
                        <div className="text-right text-sm">
                          <p className="text-slate-600">{contact.email}</p>
                          {contact.phone && (
                            <p className="text-slate-600">{contact.phone}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {contacts.length === 0 && (
                  <div className="text-center py-12 text-slate-500">
                    <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p>No contacts yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="mt-6">
          <PartnershipPerformanceMetrics 
            agreements={agreements}
            applications={applications}
            universities={universities}
          />
        </TabsContent>
      </Tabs>

      {selectedUniversity && (
        <PartnershipDetailPanel
          university={selectedUniversity}
          onClose={() => setSelectedUniversity(null)}
        />
      )}

      <AddPartnershipModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        universities={universities}
      />
    </CRMLayout>
  );
}