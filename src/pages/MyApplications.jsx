import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowRight, Clock, CheckCircle, XCircle, AlertCircle, 
  FileText, Calendar, Building2, GraduationCap, Upload, Eye, Download
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import Footer from '@/components/landing/Footer';
import DocumentUploadModal from '@/components/applications/DocumentUploadModal';

const statusConfig = {
  draft: { label: 'Draft', color: 'bg-slate-100 text-slate-700', icon: FileText },
  documents_pending: { label: 'Documents Pending', color: 'bg-amber-100 text-amber-700', icon: AlertCircle },
  under_review: { label: 'Under Review', color: 'bg-blue-100 text-blue-700', icon: Clock },
  submitted_to_university: { label: 'Submitted', color: 'bg-purple-100 text-purple-700', icon: Building2 },
  conditional_offer: { label: 'Conditional Offer', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
  unconditional_offer: { label: 'Unconditional Offer', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  visa_processing: { label: 'Visa Processing', color: 'bg-cyan-100 text-cyan-700', icon: Clock },
  enrolled: { label: 'Enrolled', color: 'bg-emerald-500 text-white', icon: GraduationCap },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700', icon: XCircle },
  withdrawn: { label: 'Withdrawn', color: 'bg-slate-100 text-slate-500', icon: XCircle },
};

export default function MyApplications() {
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadingForApp, setUploadingForApp] = useState(null);

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: studentProfile } = useQuery({
    queryKey: ['student-profile', user?.email],
    queryFn: async () => {
      const profiles = await base44.entities.StudentProfile.filter({ email: user?.email });
      return profiles[0];
    },
    enabled: !!user?.email,
  });

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ['my-applications', studentProfile?.id],
    queryFn: () => base44.entities.Application.filter({ student_id: studentProfile?.id }, '-created_date'),
    enabled: !!studentProfile?.id,
  });

  const { data: universities = [] } = useQuery({
    queryKey: ['universities-for-applications'],
    queryFn: () => base44.entities.University.list(),
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['courses-for-applications'],
    queryFn: () => base44.entities.Course.list(),
  });

  const { data: documents = [] } = useQuery({
    queryKey: ['application-documents', studentProfile?.id],
    queryFn: () => base44.entities.Document.filter({ student_id: studentProfile?.id }),
    enabled: !!studentProfile?.id,
  });

  const universityMap = universities.reduce((acc, uni) => {
    acc[uni.id] = uni;
    return acc;
  }, {});

  const courseMap = courses.reduce((acc, course) => {
    acc[course.id] = course;
    return acc;
  }, {});

  const activeApplications = applications.filter(a => 
    !['rejected', 'withdrawn', 'enrolled'].includes(a.status)
  );
  const completedApplications = applications.filter(a => a.status === 'enrolled');
  const closedApplications = applications.filter(a => 
    ['rejected', 'withdrawn'].includes(a.status)
  );

  const handleUploadDocument = (application) => {
    setUploadingForApp(application);
    setShowUploadModal(true);
  };

  const getApplicationDocuments = (appId) => {
    return documents.filter(doc => doc.application_id === appId);
  };

  const getUpcomingDeadlines = () => {
    const now = new Date();
    return applications
      .filter(app => app.offer_deadline && new Date(app.offer_deadline) > now)
      .sort((a, b) => new Date(a.offer_deadline) - new Date(b.offer_deadline))
      .slice(0, 3);
  };

  const calculateProgress = (application) => {
    if (!application.milestones) return 0;
    const milestones = Object.values(application.milestones);
    const completed = milestones.filter(m => m?.completed).length;
    return Math.round((completed / milestones.length) * 100);
  };

  const ApplicationCard = ({ application }) => {
    const university = universityMap[application.university_id];
    const course = courseMap[application.course_id];
    const statusInfo = statusConfig[application.status] || statusConfig.draft;
    const StatusIcon = statusInfo.icon;
    const appDocuments = getApplicationDocuments(application.id);
    const progress = calculateProgress(application);

    const milestones = [
      { key: 'documents_submitted', label: 'Documents Submitted' },
      { key: 'application_submitted', label: 'Application Submitted' },
      { key: 'offer_received', label: 'Offer Received' },
      { key: 'visa_applied', label: 'Visa Applied' },
      { key: 'visa_approved', label: 'Visa Approved' },
      { key: 'enrolled', label: 'Enrolled' }
    ];

    const completedMilestones = milestones.filter(
      m => application.milestones?.[m.key]?.completed
    ).length;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="border-0 shadow-sm hover:shadow-lg transition-all">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                {university?.logo ? (
                  <img src={university.logo} alt="" className="w-12 h-12 object-contain" />
                ) : (
                  <Building2 className="w-8 h-8 text-slate-400" />
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-lg mb-1" style={{ color: 'var(--alo-blue)' }}>
                      {course?.course_title || 'Course'}
                    </h3>
                    <p className="text-slate-600 text-sm">
                      {university?.university_name || 'University'} • {university?.country}
                    </p>
                  </div>
                  <Badge className={statusInfo.color}>
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {statusInfo.label}
                  </Badge>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600">Progress</span>
                    <span className="font-semibold" style={{ color: 'var(--alo-blue)' }}>{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm text-slate-500">
                    Applied: {application.applied_date ? new Date(application.applied_date).toLocaleDateString() : 'Not submitted'}
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <FileText className="w-4 h-4" style={{ color: 'var(--alo-blue)' }} />
                    <span className="font-semibold" style={{ color: 'var(--alo-blue)' }}>
                      {appDocuments.length} docs
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUploadDocument(application)}
                    className="flex-1"
                  >
                    <Upload className="w-4 h-4 mr-1" />
                    Upload
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedApplication(application)}
                    className="flex-1"
                    style={{ borderColor: 'var(--alo-blue)', color: 'var(--alo-blue)' }}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="py-16" style={{ background: 'linear-gradient(135deg, var(--alo-blue) 0%, #004999 100%)' }}>
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              My Applications
            </h1>
            
            {/* Quick Stats */}
            <div className="grid md:grid-cols-4 gap-4 mt-8">
              <Card className="bg-white/10 backdrop-blur border-0">
                <CardContent className="p-4">
                  <div className="text-white/80 text-sm mb-1">Total Applications</div>
                  <div className="text-3xl font-bold text-white">{applications.length}</div>
                </CardContent>
              </Card>
              <Card className="bg-white/10 backdrop-blur border-0">
                <CardContent className="p-4">
                  <div className="text-white/80 text-sm mb-1">In Progress</div>
                  <div className="text-3xl font-bold text-white">
                    {activeApplications.length}
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white/10 backdrop-blur border-0">
                <CardContent className="p-4">
                  <div className="text-white/80 text-sm mb-1">Offers Received</div>
                  <div className="text-3xl font-bold text-white">
                    {applications.filter(a => a.status === 'conditional_offer' || a.status === 'unconditional_offer').length}
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white/10 backdrop-blur border-0">
                <CardContent className="p-4">
                  <div className="text-white/80 text-sm mb-1">Documents</div>
                  <div className="text-3xl font-bold text-white">{documents.length}</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-6 py-10">
        {isLoading ? (
          <div className="grid md:grid-cols-2 gap-6">
            {[1, 2, 3].map(i => (
              <Card key={i} className="animate-pulse border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="h-6 bg-slate-200 rounded w-2/3 mb-4" />
                  <div className="h-4 bg-slate-200 rounded w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : applications.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-12 text-center">
              <GraduationCap className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-slate-900 mb-2">No Applications Yet</h2>
              <p className="text-slate-500 mb-6">
                Start your study abroad journey by finding the perfect course for you.
              </p>
              <Link to={createPageUrl('Courses')}>
                <Button className="text-white" style={{ backgroundColor: 'var(--alo-orange)' }}>
                  Find Courses
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Applications List */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="active">
                <TabsList className="mb-6">
                  <TabsTrigger value="active">Active ({activeApplications.length})</TabsTrigger>
                  <TabsTrigger value="completed">Completed ({completedApplications.length})</TabsTrigger>
                  <TabsTrigger value="closed">Closed ({closedApplications.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="active" className="space-y-4">
                  {activeApplications.map(app => (
                    <ApplicationCard key={app.id} application={app} />
                  ))}
                  {activeApplications.length === 0 && (
                    <p className="text-center text-slate-500 py-8">No active applications</p>
                  )}
                </TabsContent>

                <TabsContent value="completed" className="space-y-4">
                  {completedApplications.map(app => (
                    <ApplicationCard key={app.id} application={app} />
                  ))}
                  {completedApplications.length === 0 && (
                    <p className="text-center text-slate-500 py-8">No completed applications</p>
                  )}
                </TabsContent>

                <TabsContent value="closed" className="space-y-4">
                  {closedApplications.map(app => (
                    <ApplicationCard key={app.id} application={app} />
                  ))}
                  {closedApplications.length === 0 && (
                    <p className="text-center text-slate-500 py-8">No closed applications</p>
                  )}
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar - Deadlines and Documents */}
            <div className="lg:col-span-1 space-y-6">
              {/* Upcoming Deadlines */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="w-5 h-5" style={{ color: 'var(--alo-orange)' }} />
                    Upcoming Deadlines
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {getUpcomingDeadlines().length === 0 ? (
                    <p className="text-sm text-slate-500">No upcoming deadlines</p>
                  ) : (
                    <div className="space-y-3">
                      {getUpcomingDeadlines().map((app) => {
                        const university = universityMap[app.university_id];
                        const daysLeft = Math.ceil((new Date(app.offer_deadline) - new Date()) / (1000 * 60 * 60 * 24));
                        return (
                          <div key={app.id} className="p-3 bg-amber-50 rounded-lg">
                            <div className="font-semibold text-sm mb-1" style={{ color: 'var(--alo-blue)' }}>
                              {university?.university_name}
                            </div>
                            <div className="text-xs text-slate-600 mb-1">
                              Deadline: {new Date(app.offer_deadline).toLocaleDateString()}
                            </div>
                            <Badge className="bg-amber-100 text-amber-700 text-xs">
                              <Clock className="w-3 h-3 mr-1" />
                              {daysLeft} days left
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Milestones - Only show when application selected */}
              {selectedApplication && (
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Application Milestones</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedApplication(null)}
                      >
                        ×
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { key: 'documents_submitted', label: 'Documents Submitted', icon: FileText },
                        { key: 'application_submitted', label: 'Application Submitted', icon: CheckCircle },
                        { key: 'offer_received', label: 'Offer Received', icon: CheckCircle },
                        { key: 'visa_applied', label: 'Visa Applied', icon: Clock },
                        { key: 'visa_approved', label: 'Visa Approved', icon: CheckCircle },
                        { key: 'enrolled', label: 'Enrolled', icon: GraduationCap }
                      ].map((milestone, idx) => {
                        const Icon = milestone.icon;
                        const completed = selectedApplication.milestones?.[milestone.key]?.completed;
                        return (
                          <div key={milestone.key} className="flex items-start gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                              completed ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'
                            }`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-sm">{milestone.label}</div>
                              {completed && selectedApplication.milestones[milestone.key].date && (
                                <div className="text-xs text-slate-500">
                                  {new Date(selectedApplication.milestones[milestone.key].date).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Documents Section */}
              {selectedApplication && (
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="w-5 h-5" style={{ color: 'var(--alo-blue)' }} />
                      Documents ({getApplicationDocuments(selectedApplication.id).length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={() => handleUploadDocument(selectedApplication)}
                      className="w-full mb-4 text-white"
                      style={{ backgroundColor: 'var(--alo-orange)' }}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Document
                    </Button>
                    
                    <div className="space-y-2">
                      {getApplicationDocuments(selectedApplication.id).map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <div className="flex items-center gap-2 flex-1">
                            <FileText className="w-4 h-4" style={{ color: 'var(--alo-blue)' }} />
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium truncate">{doc.name}</div>
                              <div className="text-xs text-slate-500 capitalize">{doc.document_type.replace(/_/g, ' ')}</div>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                              <Button variant="ghost" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </a>
                            <a href={doc.file_url} download>
                              <Button variant="ghost" size="sm">
                                <Download className="w-4 h-4" />
                              </Button>
                            </a>
                          </div>
                        </div>
                      ))}
                      {getApplicationDocuments(selectedApplication.id).length === 0 && (
                        <p className="text-sm text-slate-500 text-center py-4">No documents uploaded yet</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Document Upload Modal */}
      <DocumentUploadModal
        open={showUploadModal}
        onClose={() => {
          setShowUploadModal(false);
          setUploadingForApp(null);
        }}
        applicationId={uploadingForApp?.id}
        studentId={studentProfile?.id}
      />

      <Footer />
    </div>
  );
}