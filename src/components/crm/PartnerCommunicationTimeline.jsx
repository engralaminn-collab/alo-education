import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Mail, Phone, Users, Video, Award, Calendar, Plus, FileText } from 'lucide-react';
import { format } from 'date-fns';
import LogPartnerInteractionModal from './LogPartnerInteractionModal';

export default function PartnerCommunicationTimeline({ universityId, university }) {
  const [showLogModal, setShowLogModal] = useState(false);

  const { data: interactions = [], isLoading } = useQuery({
    queryKey: ['universityInteractions', universityId],
    queryFn: () => base44.entities.UniversityInteraction.filter({ university_id: universityId }, '-interaction_date'),
    enabled: !!universityId
  });

  const { data: counselors = [] } = useQuery({
    queryKey: ['counselors'],
    queryFn: () => base44.entities.User.list()
  });

  const interactionIcons = {
    email: Mail,
    phone: Phone,
    meeting: Users,
    webinar: Video,
    conference: Award
  };

  if (isLoading) {
    return <div className="text-center py-8 text-slate-500">Loading interactions...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Communication Timeline</h3>
        <Button onClick={() => setShowLogModal(true)} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Log Interaction
        </Button>
      </div>

      {interactions.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 mb-4">No interactions logged yet</p>
            <Button onClick={() => setShowLogModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Log First Interaction
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {interactions.map((interaction, index) => {
            const Icon = interactionIcons[interaction.interaction_type] || FileText;
            const counselor = counselors.find(c => c.id === interaction.counselor_id);

            return (
              <Card key={interaction.id}>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-slate-900">{interaction.subject}</h4>
                          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                            <span>{counselor?.full_name || 'Unknown'}</span>
                            <span>•</span>
                            <span>{format(new Date(interaction.interaction_date), 'PPP')}</span>
                            <Badge variant="outline" className="ml-2 capitalize">
                              {interaction.interaction_type}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-sm text-slate-600 mb-2">{interaction.summary}</p>
                      
                      {interaction.outcome && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-2">
                          <p className="text-xs font-semibold text-green-800 mb-1">Outcome:</p>
                          <p className="text-sm text-green-700">{interaction.outcome}</p>
                        </div>
                      )}

                      {interaction.follow_up_required && (
                        <div className="flex items-center gap-2 mt-2 p-2 bg-orange-50 border border-orange-200 rounded-lg">
                          <Calendar className="w-4 h-4 text-orange-600" />
                          <span className="text-xs text-orange-700">
                            Follow-up: {interaction.follow_up_date ? format(new Date(interaction.follow_up_date), 'PPP') : 'TBD'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <LogPartnerInteractionModal
        open={showLogModal}
        onClose={() => setShowLogModal(false)}
        university={university}
        counselors={counselors}
      />
    </div>
  );
}