import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  DollarSign, Award, TrendingDown, CreditCard, 
  Calendar, CheckCircle, Clock, AlertCircle 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function FinancialDashboard({ studentId }) {
  const { data: applications = [] } = useQuery({
    queryKey: ['student-applications-financial', studentId],
    queryFn: () => base44.entities.Application.filter({ student_id: studentId }),
    enabled: !!studentId
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['courses-financial'],
    queryFn: () => base44.entities.Course.list()
  });

  const { data: scholarships = [] } = useQuery({
    queryKey: ['scholarships-financial'],
    queryFn: () => base44.entities.Scholarship.list()
  });

  const courseMap = courses.reduce((acc, c) => { acc[c.id] = c; return acc; }, {});

  // Calculate financial summary
  const financialSummary = applications.reduce((acc, app) => {
    const course = courseMap[app.course_id];
    const tuition = app.tuition_fee || course?.tuition_fee_min || 0;
    const scholarship = app.scholarship_amount || 0;
    
    if (app.status === 'enrolled' || app.status === 'unconditional_offer' || app.status === 'conditional_offer') {
      acc.totalTuition += tuition;
      acc.totalScholarships += scholarship;
      acc.netAmount += (tuition - scholarship);
    }
    
    return acc;
  }, { totalTuition: 0, totalScholarships: 0, netAmount: 0 });

  const activeApplications = applications.filter(app => 
    ['unconditional_offer', 'conditional_offer', 'enrolled'].includes(app.status)
  );

  return (
    <div className="space-y-6">
      {/* Financial Overview Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Total Tuition</p>
                <p className="text-2xl font-bold text-slate-900">
                  ${financialSummary.totalTuition.toLocaleString()}
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-500">Across {activeApplications.length} programs</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Award className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Scholarships</p>
                <p className="text-2xl font-bold text-green-600">
                  ${financialSummary.totalScholarships.toLocaleString()}
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-500">Total funding secured</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Net Amount</p>
                <p className="text-2xl font-bold text-slate-900">
                  ${financialSummary.netAmount.toLocaleString()}
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-500">After scholarships</p>
          </CardContent>
        </Card>
      </div>

      {/* Application-wise Financial Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Breakdown by Application</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activeApplications.map(app => {
              const course = courseMap[app.course_id];
              const tuition = app.tuition_fee || course?.tuition_fee_min || 0;
              const scholarship = app.scholarship_amount || 0;
              const net = tuition - scholarship;
              const discountPercentage = tuition > 0 ? ((scholarship / tuition) * 100).toFixed(0) : 0;

              return (
                <div key={app.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-slate-900">{course?.course_title}</h4>
                      <p className="text-sm text-slate-600">{course?.level}</p>
                    </div>
                    <Badge className={
                      app.status === 'enrolled' ? 'bg-green-600' :
                      app.status === 'unconditional_offer' ? 'bg-emerald-500' :
                      'bg-yellow-500'
                    }>
                      {app.status.replace(/_/g, ' ')}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-2 bg-slate-50 rounded">
                      <p className="text-xs text-slate-500 mb-1">Tuition Fee</p>
                      <p className="font-bold text-slate-900">${tuition.toLocaleString()}</p>
                    </div>
                    <div className="p-2 bg-green-50 rounded">
                      <p className="text-xs text-slate-500 mb-1">Scholarship</p>
                      <p className="font-bold text-green-600">${scholarship.toLocaleString()}</p>
                    </div>
                    <div className="p-2 bg-blue-50 rounded">
                      <p className="text-xs text-slate-500 mb-1">Net Amount</p>
                      <p className="font-bold text-blue-600">${net.toLocaleString()}</p>
                    </div>
                  </div>

                  {scholarship > 0 && (
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-600">Scholarship Coverage</span>
                        <span className="font-semibold text-green-600">{discountPercentage}%</span>
                      </div>
                      <Progress value={parseFloat(discountPercentage)} className="h-2" />
                    </div>
                  )}

                  {app.offer_deadline && (
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Calendar className="w-3 h-3" />
                      Payment deadline: {new Date(app.offer_deadline).toLocaleDateString()}
                    </div>
                  )}
                </div>
              );
            })}

            {activeApplications.length === 0 && (
              <div className="text-center py-8">
                <DollarSign className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No active applications with offers yet</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Available Scholarships */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Available Scholarships</CardTitle>
            <Link to={createPageUrl('ScholarshipFinder')}>
              <Button variant="outline" size="sm">Explore More</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {scholarships.slice(0, 3).map(scholarship => (
              <div key={scholarship.id} className="p-3 border rounded-lg flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <Award className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h5 className="font-medium text-slate-900">{scholarship.name}</h5>
                    <p className="text-sm text-slate-600">{scholarship.provider}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Up to ${scholarship.amount?.toLocaleString()}
                    </p>
                  </div>
                </div>
                <Button size="sm" variant="outline">Apply</Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payment Status & Reminders */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Payment Status & Reminders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {activeApplications.filter(app => app.offer_deadline).map(app => {
              const course = courseMap[app.course_id];
              const daysUntilDeadline = Math.ceil(
                (new Date(app.offer_deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
              );
              const isUrgent = daysUntilDeadline <= 7;

              return (
                <div key={app.id} className={`p-3 rounded-lg ${isUrgent ? 'bg-red-50 border border-red-200' : 'bg-slate-50'}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-2">
                      {isUrgent ? (
                        <AlertCircle className="w-4 h-4 text-red-600 mt-0.5" />
                      ) : (
                        <Clock className="w-4 h-4 text-blue-600 mt-0.5" />
                      )}
                      <div>
                        <p className="font-medium text-sm text-slate-900">{course?.course_title}</p>
                        <p className="text-xs text-slate-600 mt-1">
                          {isUrgent ? `⚠️ ${daysUntilDeadline} days left` : `${daysUntilDeadline} days until deadline`}
                        </p>
                      </div>
                    </div>
                    <Badge className={isUrgent ? 'bg-red-600' : 'bg-blue-600'}>
                      {new Date(app.offer_deadline).toLocaleDateString()}
                    </Badge>
                  </div>
                </div>
              );
            })}

            {activeApplications.filter(app => app.offer_deadline).length === 0 && (
              <div className="text-center py-4 text-slate-500 text-sm">
                No upcoming payment deadlines
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Financial Planning Resources */}
      <Card className="bg-gradient-to-br from-blue-50 to-purple-50">
        <CardHeader>
          <CardTitle className="text-lg">Need Financial Guidance?</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600 mb-4 text-sm">
            Our counselors can help you plan your finances, explore funding options, and navigate payment schedules.
          </p>
          <Link to={createPageUrl('Contact')}>
            <Button className="bg-education-blue">
              Book Financial Consultation
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}