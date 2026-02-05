import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { 
  Calendar, AlertCircle, CheckCircle, Clock, Filter, Plus, 
  Bell, TrendingUp, AlertTriangle 
} from 'lucide-react';
import { format, differenceInDays, isBefore, addDays } from 'date-fns';

export default function ApplicationDeadlineManager() {
  const [filterStatus, setFilterStatus] = useState('all');
  const queryClient = useQueryClient();

  const { data: applications = [] } = useQuery({
    queryKey: ['applications-deadlines'],
    queryFn: () => base44.entities.Application.list()
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['courses-deadlines'],
    queryFn: () => base44.entities.Course.list()
  });

  const { data: universities = [] } = useQuery({
    queryKey: ['universities-deadlines'],
    queryFn: () => base44.entities.University.list()
  });

  const { data: students = [] } = useQuery({
    queryKey: ['students-deadlines'],
    queryFn: () => base44.entities.StudentProfile.list()
  });

  const universityMap = universities.reduce((acc, u) => ({ ...acc, [u.id]: u }), {});
  const courseMap = courses.reduce((acc, c) => ({ ...acc, [c.id]: c }), {});
  const studentMap = students.reduce((acc, s) => ({ ...acc, [s.id]: s }), {});

  const updateDeadline = useMutation({
    mutationFn: async ({ appId, deadline }) => {
      return base44.entities.Application.update(appId, { offer_deadline: deadline });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications-deadlines'] });
      toast.success('Deadline updated');
    }
  });

  const getDeadlineStatus = (app) => {
    const course = courseMap[app.course_id];
    const deadline = app.offer_deadline || course?.application_deadline;
    
    if (!deadline) return { status: 'no_deadline', daysLeft: null };
    
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const daysLeft = differenceInDays(deadlineDate, today);
    
    if (isBefore(deadlineDate, today)) {
      return { status: 'overdue', daysLeft };
    } else if (daysLeft <= 7) {
      return { status: 'critical', daysLeft };
    } else if (daysLeft <= 30) {
      return { status: 'upcoming', daysLeft };
    }
    return { status: 'safe', daysLeft };
  };

  const enrichedApplications = applications.map(app => ({
    ...app,
    university: universityMap[app.university_id],
    course: courseMap[app.course_id],
    student: studentMap[app.student_id],
    deadlineInfo: getDeadlineStatus(app)
  }));

  const filteredApps = enrichedApplications.filter(app => {
    if (filterStatus === 'all') return true;
    return app.deadlineInfo.status === filterStatus;
  });

  const sortedApps = [...filteredApps].sort((a, b) => {
    const deadlineA = a.offer_deadline || a.course?.application_deadline;
    const deadlineB = b.offer_deadline || b.course?.application_deadline;
    if (!deadlineA) return 1;
    if (!deadlineB) return -1;
    return new Date(deadlineA) - new Date(deadlineB);
  });

  const stats = {
    overdue: enrichedApplications.filter(a => a.deadlineInfo.status === 'overdue').length,
    critical: enrichedApplications.filter(a => a.deadlineInfo.status === 'critical').length,
    upcoming: enrichedApplications.filter(a => a.deadlineInfo.status === 'upcoming').length,
    safe: enrichedApplications.filter(a => a.deadlineInfo.status === 'safe').length,
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'overdue':
        return <Badge className="bg-red-600 text-white"><AlertCircle className="w-3 h-3 mr-1" />Overdue</Badge>;
      case 'critical':
        return <Badge className="bg-orange-600 text-white"><AlertTriangle className="w-3 h-3 mr-1" />Critical</Badge>;
      case 'upcoming':
        return <Badge className="bg-amber-600 text-white"><Clock className="w-3 h-3 mr-1" />Upcoming</Badge>;
      case 'safe':
        return <Badge className="bg-green-600 text-white"><CheckCircle className="w-3 h-3 mr-1" />On Track</Badge>;
      default:
        return <Badge variant="outline">No Deadline</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-red-600">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
                <div className="text-xs text-slate-600">Overdue</div>
              </div>
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-600">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-orange-600">{stats.critical}</div>
                <div className="text-xs text-slate-600">Critical (≤7 days)</div>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-600">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-amber-600">{stats.upcoming}</div>
                <div className="text-xs text-slate-600">Upcoming (≤30 days)</div>
              </div>
              <Clock className="w-8 h-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-600">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-600">{stats.safe}</div>
                <div className="text-xs text-slate-600">On Track</div>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <Button
              size="sm"
              variant={filterStatus === 'all' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('all')}
            >
              All
            </Button>
            <Button
              size="sm"
              variant={filterStatus === 'overdue' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('overdue')}
              className={filterStatus === 'overdue' ? 'bg-red-600' : ''}
            >
              Overdue
            </Button>
            <Button
              size="sm"
              variant={filterStatus === 'critical' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('critical')}
              className={filterStatus === 'critical' ? 'bg-orange-600' : ''}
            >
              Critical
            </Button>
            <Button
              size="sm"
              variant={filterStatus === 'upcoming' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('upcoming')}
              className={filterStatus === 'upcoming' ? 'bg-amber-600' : ''}
            >
              Upcoming
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Applications List */}
      <Card>
        <CardHeader>
          <CardTitle>Application Deadlines ({sortedApps.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sortedApps.map(app => {
              const deadline = app.offer_deadline || app.course?.application_deadline;
              return (
                <div 
                  key={app.id} 
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-900">
                        {app.student?.first_name} {app.student?.last_name}
                      </h4>
                      <p className="text-sm text-slate-600">
                        {app.course?.course_title}
                      </p>
                      <p className="text-xs text-slate-500">
                        {app.university?.university_name}
                      </p>
                    </div>
                    {getStatusBadge(app.deadlineInfo.status)}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        {deadline ? (
                          <span className={app.deadlineInfo.status === 'overdue' ? 'text-red-600 font-semibold' : ''}>
                            {format(new Date(deadline), 'MMM d, yyyy')}
                          </span>
                        ) : (
                          <span className="text-slate-400">No deadline set</span>
                        )}
                      </div>
                      {app.deadlineInfo.daysLeft !== null && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4 text-slate-400" />
                          <span className={
                            app.deadlineInfo.status === 'overdue' ? 'text-red-600 font-semibold' :
                            app.deadlineInfo.status === 'critical' ? 'text-orange-600 font-semibold' :
                            'text-slate-600'
                          }>
                            {app.deadlineInfo.daysLeft < 0 
                              ? `${Math.abs(app.deadlineInfo.daysLeft)} days overdue`
                              : `${app.deadlineInfo.daysLeft} days left`
                            }
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Input
                        type="date"
                        className="w-40 text-xs h-8"
                        defaultValue={deadline}
                        onChange={(e) => {
                          updateDeadline.mutate({ 
                            appId: app.id, 
                            deadline: e.target.value 
                          });
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}

            {sortedApps.length === 0 && (
              <p className="text-center text-slate-500 py-8">
                No applications match the selected filter
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}