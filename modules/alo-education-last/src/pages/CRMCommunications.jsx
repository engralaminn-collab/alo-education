import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Brain, MessageSquare, TrendingUp, AlertTriangle, Search } from 'lucide-react';
import CRMLayout from '@/components/crm/CRMLayout';
import CommunicationParser from '@/components/crm/CommunicationParser';
import CommunicationTimeline from '@/components/crm/CommunicationTimeline';

export default function CRMCommunications() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);

  const { data: history = [] } = useQuery({
    queryKey: ['all-communication-history'],
    queryFn: () => base44.entities.CommunicationHistory.list('-created_date', 200),
  });

  const { data: students = [] } = useQuery({
    queryKey: ['comm-students'],
    queryFn: () => base44.entities.StudentProfile.list(),
  });

  // Analytics
  const totalCommunications = history.length;
  const urgentCount = history.filter(h => h.ai_analysis?.sentiment === 'urgent' || h.ai_analysis?.priority_level === 'urgent').length;
  const negativeCount = history.filter(h => h.ai_analysis?.sentiment === 'negative').length;
  const followUpNeeded = history.filter(h => h.ai_analysis?.requires_follow_up && h.tasks_created?.length === 0).length;

  // Get student communication stats
  const studentStats = students.map(student => {
    const studentComms = history.filter(h => h.student_id === student.id);
    const avgSentiment = studentComms.reduce((sum, h) => {
      if (h.ai_analysis?.sentiment === 'positive') return sum + 1;
      if (h.ai_analysis?.sentiment === 'negative') return sum - 1;
      return sum;
    }, 0) / Math.max(studentComms.length, 1);

    return {
      ...student,
      commCount: studentComms.length,
      avgSentiment,
      lastCommDate: studentComms[0]?.created_date
    };
  }).filter(s => s.commCount > 0)
    .sort((a, b) => b.commCount - a.commCount);

  const filteredStudents = studentStats.filter(s => 
    searchQuery === '' || 
    `${s.first_name} ${s.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <CRMLayout title="AI Communication Monitoring">
      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Communications</p>
                <p className="text-3xl font-bold text-purple-600">{totalCommunications}</p>
              </div>
              <MessageSquare className="w-10 h-10 text-purple-200" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Urgent</p>
                <p className="text-3xl font-bold text-orange-600">{urgentCount}</p>
              </div>
              <AlertTriangle className="w-10 h-10 text-orange-200" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Negative Sentiment</p>
                <p className="text-3xl font-bold text-red-600">{negativeCount}</p>
              </div>
              <TrendingUp className="w-10 h-10 text-red-200" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Needs Follow-up</p>
                <p className="text-3xl font-bold text-blue-600">{followUpNeeded}</p>
              </div>
              <Brain className="w-10 h-10 text-blue-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Tabs defaultValue="students">
            <TabsList>
              <TabsTrigger value="students">By Student</TabsTrigger>
              <TabsTrigger value="timeline">Full Timeline</TabsTrigger>
            </TabsList>

            <TabsContent value="students" className="mt-6">
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search students..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-3">
                {filteredStudents.map(student => (
                  <Card 
                    key={student.id} 
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedStudent(student.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-slate-900">
                            {student.first_name} {student.last_name}
                          </h4>
                          <p className="text-sm text-slate-600">{student.email}</p>
                        </div>
                        <div className="text-right">
                          <Badge className="mb-1">
                            {student.commCount} messages
                          </Badge>
                          <p className="text-xs text-slate-500">
                            {student.avgSentiment > 0.2 ? '😊 Positive' : 
                             student.avgSentiment < -0.2 ? '😟 Negative' : '😐 Neutral'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="timeline" className="mt-6">
              {selectedStudent ? (
                <CommunicationTimeline studentId={selectedStudent} />
              ) : (
                <div className="text-center py-12">
                  <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-600">Select a student to view their communication timeline</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <div>
          <CommunicationParser />
        </div>
      </div>
    </CRMLayout>
  );
}