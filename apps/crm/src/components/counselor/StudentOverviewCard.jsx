import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageCircle, FileText, Calendar } from 'lucide-react';

export default function StudentOverviewCard({ student, applicationCount, unreadMessages }) {
  const profileCompletion = student?.profile_completeness || 0;
  const getCompletionColor = () => {
    if (profileCompletion >= 80) return 'text-green-600';
    if (profileCompletion >= 50) return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <Card className="border-0 shadow-sm hover:shadow-md transition-all">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>{student?.first_name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-slate-900">
                {student?.first_name} {student?.last_name}
              </h3>
              <p className="text-xs text-slate-500">{student?.email}</p>
            </div>
          </div>
          <Badge className="bg-blue-100 text-blue-800">
            {student?.status?.replace(/_/g, ' ')}
          </Badge>
        </div>

        <div className="space-y-3">
          {/* Profile Completion */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-semibold text-slate-700">Profile</p>
              <p className={`text-xs font-bold ${getCompletionColor()}`}>
                {profileCompletion}%
              </p>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5">
              <div
                className="bg-gradient-to-r from-blue-500 to-cyan-500 h-1.5 rounded-full transition-all"
                style={{ width: `${profileCompletion}%` }}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 bg-slate-50 rounded">
              <p className="text-lg font-bold text-slate-900">{applicationCount}</p>
              <p className="text-xs text-slate-600">Apps</p>
            </div>
            <div className="p-2 bg-slate-50 rounded">
              <p className="text-lg font-bold text-slate-900">{unreadMessages}</p>
              <p className="text-xs text-slate-600">Unread</p>
            </div>
            <div className="p-2 bg-slate-50 rounded">
              <p className="text-lg font-bold text-slate-900">
                {student?.preferred_countries?.length || 0}
              </p>
              <p className="text-xs text-slate-600">Countries</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2 pt-2">
            <Button size="sm" variant="outline" className="flex-1 h-8 text-xs gap-1">
              <MessageCircle className="w-3 h-3" />
              Message
            </Button>
            <Button size="sm" variant="outline" className="flex-1 h-8 text-xs gap-1">
              <FileText className="w-3 h-3" />
              Documents
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}