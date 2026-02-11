import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Moon, Sun } from 'lucide-react';

export default function AfterHoursSettings() {
  const now = new Date();
  const bangladeshHours = (now.getUTCHours() + 6) % 24;
  const isAfterHours = bangladeshHours >= 18 || bangladeshHours < 10;

  return (
    <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-900">
          <Clock className="w-6 h-6" />
          After-Hours Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-white rounded-lg">
          <div className="flex items-center gap-3">
            {isAfterHours ? (
              <Moon className="w-6 h-6 text-slate-600" />
            ) : (
              <Sun className="w-6 h-6 text-amber-500" />
            )}
            <div>
              <p className="font-semibold text-slate-900">Current Status</p>
              <p className="text-sm text-slate-600">
                Bangladesh Time: {bangladeshHours}:00
              </p>
            </div>
          </div>
          <Badge className={isAfterHours ? 'bg-slate-700' : 'bg-green-600'}>
            {isAfterHours ? 'Auto-Reply Active' : 'Live Support'}
          </Badge>
        </div>

        <div className="bg-white rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Sun className="w-5 h-5 text-amber-500" />
            <div>
              <p className="font-semibold text-slate-900 text-sm">Office Hours</p>
              <p className="text-sm text-slate-600">10:00 AM - 6:00 PM</p>
              <p className="text-xs text-slate-500">Live counselor support, AI auto-assignment</p>
            </div>
          </div>

          <div className="h-px bg-slate-200" />

          <div className="flex items-center gap-2">
            <Moon className="w-5 h-5 text-slate-600" />
            <div>
              <p className="font-semibold text-slate-900 text-sm">After Hours</p>
              <p className="text-sm text-slate-600">6:00 PM - 10:00 AM</p>
              <p className="text-xs text-slate-500">Auto-reply sent, manual assignment next morning</p>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm text-amber-900 font-semibold mb-1">⚙️ Auto-Reply Message:</p>
          <p className="text-xs text-amber-800">
            "Thank you for contacting ALO Education! Our counselors are offline. We'll respond at 10:00 AM."
          </p>
        </div>
      </CardContent>
    </Card>
  );
}