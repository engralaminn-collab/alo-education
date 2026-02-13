import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  MessageCircle, Clock, CheckCircle, AlertCircle, TrendingUp,
  Calendar, Search, Filter, ArrowRight
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import CounselorMessagingPanel from './CounselorMessagingPanel';

export default function CounselorCommunicationDashboard({ counselorId }) {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const { data: conversations = [] } = useQuery({
    queryKey: ['counselor-conversations', counselorId],
    queryFn: async () => {
      // Get all messages where counselor is involved
      const messages = await base44.entities.DirectMessage.filter({
        sender_id: counselorId,
      });
      
      // Group by conversation
      const grouped = messages.reduce((acc, msg) => {
        if (!acc[msg.conversation_id]) {
          acc[msg.conversation_id] = {
            conversation_id: msg.conversation_id,
            student_id: msg.recipient_id,
            student_name: msg.recipient_name,
            last_message: msg.content,
            last_message_time: msg.created_date,
            unread_count: 0,
            message_count: 0,
            status: 'active',
          };
        }
        acc[msg.conversation_id].message_count++;
        return acc;
      }, {});
      
      return Object.values(grouped);
    },
    enabled: !!counselorId,
  });

  const { data: studentProfiles = [] } = useQuery({
    queryKey: ['student-profiles'],
    queryFn: () => base44.entities.StudentProfile.list(),
  });

  const { data: applications = [] } = useQuery({
    queryKey: ['all-applications'],
    queryFn: () => base44.entities.Application.list(),
  });

  // Calculate statistics
  const stats = {
    totalStudents: conversations.length,
    activeConversations: conversations.filter(c => c.message_count > 0).length,
    unreadMessages: conversations.reduce((sum, c) => sum + (c.unread_count || 0), 0),
    averageResponseTime: '2.5 hours',
  };

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = conv.student_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const getApplicationStatus = (studentId) => {
    const apps = applications.filter(a => a.student_id === studentId);
    if (apps.length === 0) return { status: 'no_app', label: 'No Application' };
    const hasOffers = apps.some(a => a.status.includes('offer'));
    const hasRejections = apps.some(a => a.status === 'rejected');
    if (hasOffers) return { status: 'offer', label: 'Has Offer' };
    if (hasRejections) return { status: 'rejected', label: 'Rejected' };
    return { status: 'in_progress', label: 'In Progress' };
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'offer': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'no_app': return 'bg-slate-100 text-slate-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="grid lg:grid-cols-4 gap-6 min-h-screen bg-slate-50 p-6">
      {/* Left Sidebar - Conversations List */}
      <div className="lg:col-span-1 space-y-4">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Student Communications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-50 p-3 rounded-lg text-center">
                <p className="text-2xl font-bold text-blue-600">{stats.totalStudents}</p>
                <p className="text-xs text-slate-600">Total Students</p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg text-center">
                <p className="text-2xl font-bold text-green-600">{stats.activeConversations}</p>
                <p className="text-xs text-slate-600">Active Chats</p>
              </div>
            </div>

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

            {/* Conversations List */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredConversations.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-8">No conversations</p>
              ) : (
                filteredConversations.map((conv) => {
                  const appStatus = getApplicationStatus(conv.student_id);
                  return (
                    <button
                      key={conv.conversation_id}
                      onClick={() => setSelectedConversation(conv)}
                      className={`w-full p-3 rounded-lg text-left transition-colors ${
                        selectedConversation?.conversation_id === conv.conversation_id
                          ? 'bg-education-blue text-white'
                          : 'bg-white hover:bg-slate-50 border border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{conv.student_name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate">{conv.student_name}</p>
                        </div>
                      </div>
                      <p className={`text-xs truncate mb-2 ${
                        selectedConversation?.conversation_id === conv.conversation_id
                          ? 'text-white/80'
                          : 'text-slate-600'
                      }`}>
                        {conv.last_message}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs ${
                          selectedConversation?.conversation_id === conv.conversation_id
                            ? 'text-white/70'
                            : 'text-slate-500'
                        }`}>
                          {formatDistanceToNow(new Date(conv.last_message_time), { addSuffix: true })}
                        </span>
                        <Badge className={`text-xs ${getStatusColor(appStatus.status)}`}>
                          {appStatus.label}
                        </Badge>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="lg:col-span-3 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <MessageCircle className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Total Messages</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {conversations.reduce((sum, c) => sum + c.message_count, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Avg Response Time</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.averageResponseTime}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Engagement Rate</p>
                  <p className="text-2xl font-bold text-slate-900">94%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Messaging Panel or Placeholder */}
        {selectedConversation ? (
          <CounselorMessagingPanel
            conversationId={selectedConversation.conversation_id}
            studentId={selectedConversation.student_id}
            studentName={selectedConversation.student_name}
            onClose={() => setSelectedConversation(null)}
          />
        ) : (
          <Card className="border-0 shadow-sm h-96 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600">Select a conversation to view messages</p>
            </div>
          </Card>
        )}

        {/* Communication History */}
        {selectedConversation && (
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Student Application Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {applications
                  .filter(a => a.student_id === selectedConversation.student_id)
                  .map(app => (
                    <div key={app.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold text-slate-900">Application Status</p>
                        <Badge className={getStatusColor(app.status)}>
                          {app.status?.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600">Last updated: {format(new Date(app.updated_date), 'PPP')}</p>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}