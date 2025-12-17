import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Mail, MousePointer, CheckCircle } from 'lucide-react';

export default function CampaignPerformance({ campaign, onClose }) {
  const openRate = campaign.recipients > 0 ? ((campaign.opens / campaign.recipients) * 100).toFixed(1) : 0;
  const clickRate = campaign.opens > 0 ? ((campaign.clicks / campaign.opens) * 100).toFixed(1) : 0;
  const conversionRate = campaign.recipients > 0 ? ((campaign.conversions / campaign.recipients) * 100).toFixed(1) : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" style={{ color: '#0066CC' }} />
            Campaign Performance: {campaign.name}
          </CardTitle>
          <Badge className="bg-green-100 text-green-800">SENT</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-4 gap-6 mb-6">
          <div className="p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Mail className="w-5 h-5 text-slate-600" />
              <span className="text-sm text-slate-600">Sent</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{campaign.recipients}</p>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Mail className="w-5 h-5" style={{ color: '#0066CC' }} />
              <span className="text-sm text-slate-600">Opens</span>
            </div>
            <p className="text-2xl font-bold" style={{ color: '#0066CC' }}>{campaign.opens}</p>
            <p className="text-sm text-slate-600">{openRate}% open rate</p>
          </div>

          <div className="p-4 bg-orange-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <MousePointer className="w-5 h-5" style={{ color: '#F37021' }} />
              <span className="text-sm text-slate-600">Clicks</span>
            </div>
            <p className="text-2xl font-bold" style={{ color: '#F37021' }}>{campaign.clicks}</p>
            <p className="text-sm text-slate-600">{clickRate}% click rate</p>
          </div>

          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm text-slate-600">Conversions</span>
            </div>
            <p className="text-2xl font-bold text-green-600">{campaign.conversions}</p>
            <p className="text-sm text-slate-600">{conversionRate}% conversion</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">Open Rate</span>
              <span className="text-sm font-semibold" style={{ color: '#0066CC' }}>{openRate}%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full"
                style={{ width: `${openRate}%`, backgroundColor: '#0066CC' }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">Click Rate</span>
              <span className="text-sm font-semibold" style={{ color: '#F37021' }}>{clickRate}%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full"
                style={{ width: `${clickRate}%`, backgroundColor: '#F37021' }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">Conversion Rate</span>
              <span className="text-sm font-semibold text-green-600">{conversionRate}%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-600 rounded-full"
                style={{ width: `${conversionRate}%` }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}