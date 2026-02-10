import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CheckCircle, Clock, AlertCircle, Loader2, Mail, Phone, ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import Footer from '@/components/landing/Footer';

export default function OnboardingStatus() {
  const { data: onboardings = [], isLoading } = useQuery({
    queryKey: ['university-onboardings'],
    queryFn: async () => {
      return base44.entities.UniversityOnboarding.list();
    },
  });

  const getStatusIcon = (status) => {
    switch(status) {
      case 'approved':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'under_review':
        return <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />;
      case 'rejected':
        return <AlertCircle className="w-6 h-6 text-red-600" />;
      case 'submitted':
        return <Clock className="w-6 h-6 text-yellow-600" />;
      default:
        return <Clock className="w-6 h-6 text-slate-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'under_review':
        return 'bg-blue-100 text-blue-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'submitted':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pt-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-education-blue to-alo-orange text-white py-12">
        <div className="container mx-auto px-6">
          <h1 className="text-4xl font-bold mb-2">Onboarding Status</h1>
          <p className="text-white/90">Track your university onboarding progress</p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12 max-w-4xl">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-education-blue animate-spin" />
          </div>
        ) : onboardings.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-12 text-center">
              <Clock className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No Onboarding Applications</h3>
              <p className="text-slate-600 mb-6">
                Start the onboarding process to join ALO Education's partner network.
              </p>
              <Link to={createPageUrl('UniversityOnboarding')}>
                <Button className="bg-education-blue hover:bg-blue-700">
                  Begin Onboarding
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {onboardings.map((onboarding, idx) => (
              <motion.div
                key={onboarding.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="border-0 shadow-sm hover:shadow-md transition-all">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        {getStatusIcon(onboarding.onboarding_status)}
                        <div>
                          <CardTitle className="text-2xl">{onboarding.university_name}</CardTitle>
                          <p className="text-sm text-slate-600 mt-1">
                            {onboarding.city}, {onboarding.country}
                          </p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(onboarding.onboarding_status)}>
                        {onboarding.onboarding_status?.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    {/* Progress */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-sm font-semibold text-slate-700">Profile Completeness</p>
                        <p className="text-sm font-semibold text-education-blue">
                          {onboarding.completion_percentage}%
                        </p>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-education-blue to-alo-orange h-2 rounded-full transition-all"
                          style={{ width: `${onboarding.completion_percentage}%` }}
                        />
                      </div>
                    </div>

                    {/* Status-specific messages */}
                    {onboarding.onboarding_status === 'submitted' && (
                      <Alert>
                        <Clock className="h-4 w-4" />
                        <AlertDescription>
                          Your application is being reviewed. We'll contact you within 2-3 business days.
                        </AlertDescription>
                      </Alert>
                    )}

                    {onboarding.onboarding_status === 'under_review' && (
                      <Alert>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <AlertDescription>
                          Our team is actively reviewing your profile. We appreciate your patience.
                        </AlertDescription>
                      </Alert>
                    )}

                    {onboarding.onboarding_status === 'approved' && (
                      <Alert className="border-green-200 bg-green-50">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800">
                          Congratulations! Your onboarding has been approved. You can now manage your profile and connect with students.
                        </AlertDescription>
                      </Alert>
                    )}

                    {onboarding.onboarding_status === 'rejected' && (
                      <Alert className="border-red-200 bg-red-50">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-800">
                          {onboarding.review_notes || 'Your application was not approved.'}
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Contact Information */}
                    <div className="grid md:grid-cols-2 gap-6 pt-4 border-t">
                      <div>
                        <p className="text-xs text-slate-500 uppercase font-semibold mb-2">Primary Contact</p>
                        <p className="font-semibold text-slate-900">{onboarding.primary_contact_name}</p>
                        <div className="flex items-center gap-2 text-sm text-slate-600 mt-2">
                          <Mail className="w-4 h-4" />
                          {onboarding.primary_contact_email}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600 mt-1">
                          <Phone className="w-4 h-4" />
                          {onboarding.primary_contact_phone}
                        </div>
                      </div>

                      {onboarding.onboarding_status === 'approved' && (
                        <div className="flex flex-col justify-end gap-2">
                          <Link to={createPageUrl('UniversityPartnerPortal')}>
                            <Button className="w-full bg-education-blue hover:bg-blue-700">
                              Go to Partner Portal
                              <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                          </Link>
                        </div>
                      )}
                    </div>

                    {/* Timeline */}
                    {(onboarding.submitted_date || onboarding.reviewed_date) && (
                      <div className="pt-4 border-t space-y-3">
                        {onboarding.submitted_date && (
                          <div className="flex items-center gap-3 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-slate-600">
                              Submitted: {new Date(onboarding.submitted_date).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        {onboarding.reviewed_date && (
                          <div className="flex items-center gap-3 text-sm">
                            <CheckCircle className="w-4 h-4 text-blue-600" />
                            <span className="text-slate-600">
                              Reviewed: {new Date(onboarding.reviewed_date).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}

            {/* New Application Button */}
            <div className="text-center">
              <Link to={createPageUrl('UniversityOnboarding')}>
                <Button variant="outline" className="gap-2">
                  Add Another University
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}