import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users, MessageSquare, TrendingUp, Clock, Plus, Search,
  BookMarked, Calendar, Filter, Loader2, MessageCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import CRMLayout from '@/components/crm/CRMLayout';
import StudentOverviewCard from '@/components/counselor/StudentOverviewCard';
import CounselorTasksWidget from '@/components/counselor/CounselorTasksWidget';
import RecentCommunicationsWidget from '@/components/counselor/RecentCommunicationsWidget';
import ApplicationProgressWidget from '@/components/counselor/ApplicationProgressWidget';

export default function CounselorDashboard() {
  const [searchQuery, setSearchQuery] = useState('');

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: assignedStudents = [] } = useQuery({
    queryKey: ['assigned-students', user?.id],
    queryFn: () => base44.entities.StudentProfile.filter({ counselor_id: user?.id }),
    enabled: !!user?.id,
  });

  const { data: applications = [] } = useQuery({
    queryKey: ['my-applications', user?.id],
    queryFn: async () => {
      const apps = await base44.entities.Application.list();
      const studentIds = assignedStudents.map(s => s.id);
      return apps.filter(a => studentIds.includes(a.student_id));
    },
    enabled: assignedStudents.length > 0,
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['my-messages', user?.id],
    queryFn: () => base44.entities.DirectMessage.filter({ sender_id: user?.id }),
    enabled: !!user?.id,
  });

  const filteredStudents = assignedStudents.filter(student =>
    `${student.first_name} ${student.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    totalStudents: assignedStudents.length,
    activeApplications: applications.filter(a => 
      !['rejected', 'withdrawn', 'enrolled'].includes(a.status)
    ).length,
    unreadMessages: messages.filter(m => !m.is_read).length,
    successRate: applications.length > 0
      ? Math.round(((applications.filter(a => a.status === 'enrolled').length) / applications.length) * 100)
      : 0,
  };

  if (userLoading) {
    return (
      <CRMLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-education-blue" />
        </div>
      </CRMLayout>
    );
  }

  return (
    <CRMLayout>
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Welcome back, {user?.full_name?.split(' ')[0]}!
              </h1>
              <p className="text-slate-600 mt-1">Manage your students and track their progress</p>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => window.open('https://wa.me/', '_blank')}
                className="bg-green-600 hover:bg-green-700 gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </Button>
              <Button className="bg-education-blue hover:bg-blue-700 gap-2">
                <Plus className="w-4 h-4" />
                New Task
              </Button>
            </div>
          </div>

          {/* Key Statistics */}
          <div className="grid md:grid-cols-4 gap-4">
            {[
              {
                icon: Users,
                label: 'Assigned Students',
                value: stats.totalStudents,
                color: 'bg-blue-500',
              },
              {
                icon: TrendingUp,
                label: 'Active Applications',
                value: stats.activeApplications,
                color: 'bg-purple-500',
              },
              {
                icon: MessageSquare,
                label: 'Unread Messages',
                value: stats.unreadMessages,
                color: 'bg-green-500',
              },
              {
                icon: Calendar,
                label: 'Success Rate',
                value: `${stats.successRate}%`,
                color: 'bg-emerald-500',
              },
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="border-0 shadow-sm">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 ${stat.color} rounded-lg`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="text-slate-600 text-sm">{stat.label}</p>
                          <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Tasks & Communications */}
            <div className="lg:col-span-1 space-y-6">
              <CounselorTasksWidget counselorId={user?.id} />
              <RecentCommunicationsWidget counselorId={user?.id} />
            </div>

            {/* Center Column - Students & Applications */}
            <div className="lg:col-span-2 space-y-6">
              {/* Students List */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">My Students</CardTitle>
                  <Badge className="bg-blue-100 text-blue-800">
                    {filteredStudents.length}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <Input
                      placeholder="Search students..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* Students Grid */}
                  {filteredStudents.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-600">
                        {searchQuery ? 'No students match your search' : 'No assigned students yet'}
                      </p>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-4">
                      {filteredStudents.map((student) => (
                        <StudentOverviewCard
                          key={student.id}
                          student={student}
                          applicationCount={applications.filter(a => a.student_id === student.id).length}
                          unreadMessages={messages.filter(
                            m => m.recipient_id === student.id && !m.is_read
                          ).length}
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Application Progress */}
              <ApplicationProgressWidget counselorId={user?.id} />
            </div>
          </div>

          {/* Canned Responses Quick Access */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BookMarked className="w-5 h-5 text-blue-600" />
                Quick Response Templates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 mb-4">
                Save time with pre-built responses for common student queries. Access them anytime while messaging.
              </p>
              <Button variant="outline" className="gap-2">
                <Plus className="w-4 h-4" />
                Manage Templates
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </CRMLayout>
  );
}