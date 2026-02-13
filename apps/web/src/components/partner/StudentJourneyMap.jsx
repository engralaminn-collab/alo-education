import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserPlus, MessageSquare, FileText, CheckCircle, GraduationCap, ArrowRight } from 'lucide-react';

export default function StudentJourneyMap({ partnerId }) {
  const { data: referrals = [] } = useQuery({
    queryKey: ['partner-referrals-journey', partnerId],
    queryFn: () => base44.entities.PartnerReferral.filter({ partner_id: partnerId }),
    enabled: !!partnerId
  });

  // Journey stages
  const stages = [
    { key: 'submitted', label: 'Submitted', icon: UserPlus, color: 'bg-blue-100 text-blue-700' },
    { key: 'contacted', label: 'Contacted', icon: MessageSquare, color: 'bg-purple-100 text-purple-700' },
    { key: 'qualified', label: 'Qualified', icon: FileText, color: 'bg-amber-100 text-amber-700' },
    { key: 'converted', label: 'Converted', icon: CheckCircle, color: 'bg-green-100 text-green-700' },
    { key: 'enrolled', label: 'Enrolled', icon: GraduationCap, color: 'bg-emerald-100 text-emerald-700' }
  ];

  // Calculate counts for each stage
  const stageCounts = stages.map(stage => ({
    ...stage,
    count: referrals.filter(r => r.status === stage.key).length
  }));

  const totalReferrals = referrals.length;
  const conversionRate = totalReferrals > 0 
    ? ((referrals.filter(r => r.status === 'enrolled').length / totalReferrals) * 100).toFixed(1)
    : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Student Journey Funnel</CardTitle>
          <Badge variant="outline">
            {conversionRate}% conversion rate
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {/* Desktop View */}
        <div className="hidden md:flex items-center justify-between">
          {stageCounts.map((stage, index) => {
            const percentage = totalReferrals > 0 ? ((stage.count / totalReferrals) * 100).toFixed(0) : 0;
            const Icon = stage.icon;
            
            return (
              <React.Fragment key={stage.key}>
                <div className="flex-1">
                  <div className="text-center space-y-3">
                    <div className={`mx-auto w-16 h-16 rounded-full ${stage.color} flex items-center justify-center`}>
                      <Icon className="w-8 h-8" />
                    </div>
                    <div>
                      <p className="font-semibold text-lg">{stage.count}</p>
                      <p className="text-sm text-slate-600">{stage.label}</p>
                      <p className="text-xs text-slate-400">{percentage}%</p>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mt-4 bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-full ${stage.color.split(' ')[0]}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
                
                {index < stageCounts.length - 1 && (
                  <ArrowRight className="w-6 h-6 text-slate-300 mx-2" />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Mobile View */}
        <div className="md:hidden space-y-4">
          {stageCounts.map((stage) => {
            const percentage = totalReferrals > 0 ? ((stage.count / totalReferrals) * 100).toFixed(0) : 0;
            const Icon = stage.icon;
            
            return (
              <div key={stage.key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full ${stage.color} flex items-center justify-center`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium">{stage.label}</p>
                      <p className="text-sm text-slate-500">{stage.count} students</p>
                    </div>
                  </div>
                  <Badge>{percentage}%</Badge>
                </div>
                <div className="bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-full ${stage.color.split(' ')[0]}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        {totalReferrals > 0 && (
          <div className="mt-6 p-4 bg-slate-50 rounded-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-education-blue">{totalReferrals}</p>
                <p className="text-sm text-slate-600">Total Referrals</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {referrals.filter(r => r.status === 'enrolled').length}
                </p>
                <p className="text-sm text-slate-600">Enrolled</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-600">
                  {referrals.filter(r => ['submitted', 'contacted', 'qualified'].includes(r.status)).length}
                </p>
                <p className="text-sm text-slate-600">In Progress</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">
                  {referrals.filter(r => r.status === 'lost').length}
                </p>
                <p className="text-sm text-slate-600">Lost</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}