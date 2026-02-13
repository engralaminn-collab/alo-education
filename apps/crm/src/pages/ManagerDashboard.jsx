import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertTriangle, Clock, Users, TrendingUp, 
  MessageSquare, CheckCircle, Shield, Eye, LogOut
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import AfterHoursSettings from '@/components/manager/AfterHoursSettings';

export default function ManagerDashboard() {
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  useQuery({
    queryKey: ['current-user-manager'],
    queryFn: async () => {
      const u = await base44.auth.me();
      if (u?.role !== 'admin') {
        toast.error('Access denied: Manager/Admin access required');
        await base44.auth.logout();
        return null;
      }
      setUser(u);
      return u;
    }
  });

  const { data: allConversations = [] } = useQuery({
    queryKey: ['all-whatsapp-conversations'],
    queryFn: () => base44.entities.WhatsAppConversation.list('-created_date')
  });

  const { data: counselors = [] } = useQuery({
    queryKey: ['all-counselors'],
    queryFn: () => base44.entities.Counselor.list()
  });

  const { data: students = [] } = useQuery({
    queryKey: ['all-students-manager'],
    queryFn: () => base44.entities.StudentProfile.list()
  });

  const assignChatMutation = useMutation({
    mutationFn: async ({ chatId, counselorId }) => {
      await base44.entities.WhatsAppConversation.update(chatId, {
        assigned_counselor_id: counselorId,
        assigned_at: new Date().toISOString(),
        status: 'assigned'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-whatsapp-conversations'] });
      toast.success('Chat assigned successfully');
    }
  });

  const unassignedChats = allConversations.filter(c => !c.assigned_counselor_id);
  const slaBreaches = allConversations.filter(c => c.sla_violated);
  const activeChats = allConversations.filter(c => c.status === 'new' || c.status === 'assigned' || c.status === 'responded');
  
  const overdueChats = allConversations.filter(c => {
    if (c.status === 'resolved' || c.status === 'archived') return false;
    if (!c.first_message_at || c.first_reply_at) return false;
    const waitTime = (Date.now() - new Date(c.first_message_at).getTime()) / 60000;
    return waitTime > 30;
  });

  // Counselor performance
  const counselorStats = counselors.map(counselor => {
    const counselorChats = allConversations.filter(c => c.assigned_counselor_id === counselor.user_id);
    const counselorSLA = counselorChats.filter(c => c.sla_violated);
    const avgResponseTime = counselorChats
      .filter(c => c.response_time_minutes)
      .reduce((sum, c) => sum + c.response_time_minutes, 0) / (counselorChats.length || 1);

    return {
      ...counselor,
      totalChats: counselorChats.length,
      slaBreaches: counselorSLA.length,
      avgResponseTime: Math.round(avgResponseTime)
    };
  });

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-1">Branch Manager Dashboard</h1>
              <p className="text-slate-300">Real-time oversight & team monitoring</p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => base44.auth.logout()}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Alert Banner */}
        {overdueChats.length > 0 && (
          <Card className="mb-6 border-2 border-red-300 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-red-600" />
                <div>
                  <p className="font-bold text-red-900">
                    {overdueChats.length} chats overdue (>30 min SLA)
                  </p>
                  <p className="text-sm text-red-700">Immediate action required</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Key Metrics */}
        <div className="grid md:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <MessageSquare className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <p className="text-3xl font-bold text-blue-600">{activeChats.length}</p>
              <p className="text-sm text-slate-600">Active Chats</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Clock className="w-8 h-8 text-orange-500 mx-auto mb-2" />
              <p className="text-3xl font-bold text-orange-600">{unassignedChats.length}</p>
              <p className="text-sm text-slate-600">Unassigned</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <p className="text-3xl font-bold text-red-600">{overdueChats.length}</p>
              <p className="text-sm text-slate-600">Overdue</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Users className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <p className="text-3xl font-bold text-purple-600">{counselors.length}</p>
              <p className="text-sm text-slate-600">Counselors</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-3xl font-bold text-green-600">{students.length}</p>
              <p className="text-sm text-slate-600">Total Students</p>
            </CardContent>
          </Card>
        </div>

        {/* After-Hours Status */}
        <AfterHoursSettings />

        <Tabs defaultValue="overdue" className="mt-8">
          <TabsList className="grid grid-cols-3 w-full max-w-2xl">
            <TabsTrigger value="overdue">Overdue ({overdueChats.length})</TabsTrigger>
            <TabsTrigger value="unassigned">Unassigned ({unassignedChats.length})</TabsTrigger>
            <TabsTrigger value="performance">Team Performance</TabsTrigger>
          </TabsList>

          {/* Overdue Chats */}
          <TabsContent value="overdue" className="mt-6 space-y-4">
            {overdueChats.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <p className="text-slate-600">No overdue chats - Great job team!</p>
                </CardContent>
              </Card>
            ) : (
              overdueChats.map(chat => {
                const waitTime = Math.floor((Date.now() - new Date(chat.first_message_at).getTime()) / 60000);
                const assignedCounselor = counselors.find(c => c.user_id === chat.assigned_counselor_id);

                return (
                  <Card key={chat.id} className="border-2 border-red-300 bg-red-50/30">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                            <h3 className="font-bold text-slate-900">{chat.student_name || 'Unknown'}</h3>
                            <Badge className="bg-red-600 text-white">
                              {waitTime} min overdue
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-600 mb-2">{chat.student_phone}</p>
                          {assignedCounselor && (
                            <p className="text-sm text-slate-700">
                              Assigned to: <strong>{assignedCounselor.name}</strong>
                            </p>
                          )}
                          <p className="text-xs text-slate-500 mt-2">
                            First message: {format(new Date(chat.first_message_at), 'MMM d, h:mm a')}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>

          {/* Unassigned Chats */}
          <TabsContent value="unassigned" className="mt-6 space-y-4">
            {unassignedChats.map(chat => {
              const [selectedCounselor, setSelectedCounselor] = useState('');

              return (
                <Card key={chat.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-bold text-slate-900 mb-1">{chat.student_name || 'Unknown'}</h3>
                        <p className="text-sm text-slate-600 mb-2">{chat.student_phone}</p>
                        <p className="text-xs text-slate-500">
                          Started: {format(new Date(chat.created_date), 'MMM d, h:mm a')}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Select value={selectedCounselor} onValueChange={setSelectedCounselor}>
                          <SelectTrigger className="w-48">
                            <SelectValue placeholder="Assign counselor" />
                          </SelectTrigger>
                          <SelectContent>
                            {counselors.map(counselor => (
                              <SelectItem key={counselor.id} value={counselor.user_id}>
                                {counselor.name} ({counselor.current_students}/{counselor.max_students})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          size="sm"
                          onClick={() => {
                            if (selectedCounselor) {
                              assignChatMutation.mutate({ chatId: chat.id, counselorId: selectedCounselor });
                            }
                          }}
                          disabled={!selectedCounselor || assignChatMutation.isPending}
                        >
                          Assign
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          {/* Team Performance */}
          <TabsContent value="performance" className="mt-6">
            <div className="grid md:grid-cols-2 gap-6">
              {counselorStats.map(counselor => (
                <Card key={counselor.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="text-lg">{counselor.name}</span>
                      <Badge variant={counselor.is_available ? 'default' : 'outline'}>
                        {counselor.status}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">Students:</span>
                        <span className="font-bold text-slate-900">
                          {counselor.current_students}/{counselor.max_students}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">WhatsApp Chats:</span>
                        <span className="font-bold text-blue-600">{counselor.totalChats}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">Avg Response Time:</span>
                        <span className={`font-bold ${
                          counselor.avgResponseTime <= 15 ? 'text-green-600' :
                          counselor.avgResponseTime <= 30 ? 'text-amber-600' :
                          'text-red-600'
                        }`}>
                          {counselor.avgResponseTime} min
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">SLA Breaches:</span>
                        <span className="font-bold text-red-600">{counselor.slaBreaches}</span>
                      </div>
                      {counselor.success_rate !== undefined && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-600">Success Rate:</span>
                          <span className="font-bold text-green-600">{counselor.success_rate}%</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Security Notice */}
        <Card className="mt-8 border-2 border-purple-200 bg-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-900">
              <Shield className="w-6 h-6" />
              Document Security Policy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-purple-900">
            <p>✅ Students upload documents via secure portal only</p>
            <p>✅ Counselors have view-only access (no download)</p>
            <p>✅ Manager/Admin can download when needed</p>
            <p>⚠️ NO documents via WhatsApp to prevent fraud</p>
            <p>⚠️ All document access logged for audit</p>
          </CardContent>
        </Card>

        {/* After-Hours Auto-Reply Info */}
        <Card className="mt-6 border-2 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Clock className="w-6 h-6" />
              Auto-Reply Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-blue-900">
            <p>🌙 <strong>6:00 PM - 10:00 AM:</strong> Auto-reply active</p>
            <p>☀️ <strong>10:00 AM - 6:00 PM:</strong> Live counselor support</p>
            <p className="text-xs text-blue-700 mt-3">
              Note: Configure auto-reply message in WhatsApp Business API settings
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}