import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Building2, Users, FileText, TrendingUp, MessageSquare, 
  Settings, Award, DollarSign, Phone, Mail, Globe
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function PartnerPortal() {
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: partner } = useQuery({
    queryKey: ['partner-profile', user?.email],
    queryFn: async () => {
      const partners = await base44.entities.Partner.filter({ email: user?.email });
      return partners[0];
    },
    enabled: !!user?.email,
  });

  const { data: inquiries = [] } = useQuery({
    queryKey: ['partner-inquiries', partner?.id],
    queryFn: async () => {
      if (partner?.partner_type === 'university') {
        const universities = await base44.entities.University.filter({ 
          university_name: partner.organization_name 
        });
        if (universities[0]) {
          return await base44.entities.Inquiry.filter({
            country_of_interest: universities[0].country
          }, '-created_date', 50);
        }
      }
      return await base44.entities.Inquiry.list('-created_date', 20);
    },
    enabled: !!partner,
  });

  const { data: applications = [] } = useQuery({
    queryKey: ['partner-applications', partner?.id],
    queryFn: async () => {
      if (partner?.partner_type === 'university') {
        const universities = await base44.entities.University.filter({ 
          university_name: partner.organization_name 
        });
        if (universities[0]) {
          return await base44.entities.Application.filter({
            university_id: universities[0].id
          }, '-created_date');
        }
      }
      return [];
    },
    enabled: !!partner,
  });

  if (userLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <Building2 className="w-16 h-16 mx-auto mb-4 text-slate-400" />
            <h2 className="text-2xl font-bold mb-2">Partner Portal Access Required</h2>
            <p className="text-slate-600 mb-6">Please log in to access the partner portal.</p>
            <Button onClick={() => base44.auth.redirectToLogin()}>
              Log In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <Building2 className="w-16 h-16 mx-auto mb-4 text-slate-400" />
            <h2 className="text-2xl font-bold mb-2">No Partner Profile Found</h2>
            <p className="text-slate-600 mb-6">
              Your account is not associated with a partner organization. Please contact ALO Education to set up your partner profile.
            </p>
            <a href="mailto:partners@aloeducation.com">
              <Button>
                <Mail className="w-4 h-4 mr-2" />
                Contact Us
              </Button>
            </a>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = [
    { 
      label: 'Total Referrals', 
      value: partner.total_referrals || 0, 
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    { 
      label: 'Successful Enrollments', 
      value: partner.successful_enrollments || 0, 
      icon: Award,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    { 
      label: 'Active Applications', 
      value: applications.filter(a => !['enrolled', 'rejected', 'withdrawn'].includes(a.status)).length, 
      icon: FileText,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50'
    },
    { 
      label: 'New Inquiries', 
      value: inquiries.filter(i => i.status === 'new').length, 
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {partner.logo ? (
                <img src={partner.logo} alt={partner.organization_name} className="w-16 h-16 rounded-lg bg-white p-2" />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-white/20 flex items-center justify-center">
                  <Building2 className="w-8 h-8" />
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold">{partner.organization_name}</h1>
                <p className="text-blue-100 capitalize">{partner.partner_type.replace('_', ' ')} Partner</p>
              </div>
            </div>
            <Badge className={`text-lg px-4 py-2 ${
              partner.status === 'active' ? 'bg-green-500' : 
              partner.status === 'pending' ? 'bg-amber-500' : 'bg-slate-500'
            }`}>
              {partner.status}
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="inquiries" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto">
            <TabsTrigger value="inquiries">Student Inquiries</TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          {/* Inquiries Tab */}
          <TabsContent value="inquiries" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Student Inquiries</CardTitle>
                <CardDescription>Students interested in your programs</CardDescription>
              </CardHeader>
              <CardContent>
                {inquiries.length === 0 ? (
                  <p className="text-slate-500 text-center py-8">No inquiries yet</p>
                ) : (
                  <div className="space-y-4">
                    {inquiries.slice(0, 10).map((inquiry) => (
                      <div key={inquiry.id} className="flex items-start justify-between p-4 border rounded-lg hover:bg-slate-50">
                        <div className="flex-1">
                          <h4 className="font-semibold">{inquiry.name}</h4>
                          <p className="text-sm text-slate-600">{inquiry.email} • {inquiry.phone}</p>
                          <p className="text-sm text-slate-600 mt-1">
                            Interested in: {inquiry.degree_level} in {inquiry.field_of_study}
                          </p>
                          {inquiry.message && (
                            <p className="text-sm text-slate-700 mt-2 italic">"{inquiry.message}"</p>
                          )}
                        </div>
                        <div className="text-right">
                          <Badge variant={inquiry.status === 'new' ? 'default' : 'secondary'}>
                            {inquiry.status}
                          </Badge>
                          <p className="text-xs text-slate-500 mt-1">
                            {new Date(inquiry.created_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Applications Tab */}
          <TabsContent value="applications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Applications Status</CardTitle>
                <CardDescription>Track student applications to your institution</CardDescription>
              </CardHeader>
              <CardContent>
                {applications.length === 0 ? (
                  <p className="text-slate-500 text-center py-8">No applications yet</p>
                ) : (
                  <div className="space-y-4">
                    {applications.map((app) => (
                      <div key={app.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50">
                        <div>
                          <p className="font-semibold">Application #{app.id.slice(0, 8)}</p>
                          <p className="text-sm text-slate-600">
                            Applied: {new Date(app.applied_date || app.created_date).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge className="capitalize">{app.status.replace('_', ' ')}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Partner Profile</CardTitle>
                <CardDescription>Your organization details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-slate-700">Organization Name</label>
                    <p className="text-lg">{partner.organization_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">Partner Type</label>
                    <p className="text-lg capitalize">{partner.partner_type.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">Country</label>
                    <p className="text-lg">{partner.country}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">Contact Person</label>
                    <p className="text-lg">{partner.contact_person}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">Email</label>
                    <p className="text-lg flex items-center gap-2">
                      <Mail className="w-4 h-4 text-slate-500" />
                      {partner.email}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">Phone</label>
                    <p className="text-lg flex items-center gap-2">
                      <Phone className="w-4 h-4 text-slate-500" />
                      {partner.phone || 'Not provided'}
                    </p>
                  </div>
                  {partner.website && (
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-slate-700">Website</label>
                      <p className="text-lg flex items-center gap-2">
                        <Globe className="w-4 h-4 text-slate-500" />
                        <a href={partner.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {partner.website}
                        </a>
                      </p>
                    </div>
                  )}
                  {partner.description && (
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-slate-700">About</label>
                      <p className="text-slate-700 mt-1">{partner.description}</p>
                    </div>
                  )}
                  {partner.partner_type === 'education_agent' && partner.commission_rate && (
                    <div>
                      <label className="text-sm font-medium text-slate-700">Commission Rate</label>
                      <p className="text-lg flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-slate-500" />
                        {partner.commission_rate}%
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 mb-4">
                  For any questions or to update your profile, please contact our partner support team.
                </p>
                <div className="flex gap-4">
                  <a href="mailto:partners@aloeducation.com">
                    <Button variant="outline">
                      <Mail className="w-4 h-4 mr-2" />
                      Email Support
                    </Button>
                  </a>
                  <Link to={createPageUrl('Contact')}>
                    <Button variant="outline">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Contact ALO Education
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}