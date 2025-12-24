import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle2, Clock, FileText, Fingerprint, 
  AlertCircle, XCircle, ChevronRight, Calendar 
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const VISA_STAGES = [
  { value: 'not_started', label: 'Not Started', icon: Clock, color: 'text-slate-500' },
  { value: 'documents_gathering', label: 'Documents Gathering', icon: FileText, color: 'text-blue-500' },
  { value: 'documents_ready', label: 'Documents Ready', icon: CheckCircle2, color: 'text-green-500' },
  { value: 'submitted', label: 'Visa Submitted', icon: FileText, color: 'text-indigo-500' },
  { value: 'biometrics_scheduled', label: 'Biometrics Scheduled', icon: Calendar, color: 'text-purple-500' },
  { value: 'biometrics_completed', label: 'Biometrics Completed', icon: Fingerprint, color: 'text-purple-600' },
  { value: 'decision_pending', label: 'Decision Pending', icon: Clock, color: 'text-orange-500' },
  { value: 'approved', label: 'Visa Approved', icon: CheckCircle2, color: 'text-green-600' },
  { value: 'rejected', label: 'Visa Rejected', icon: XCircle, color: 'text-red-600' },
];

export default function VisaTracker({ application, isStudent = false }) {
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [newStage, setNewStage] = useState('');
  const [notes, setNotes] = useState('');
  const [biometricsDate, setBiometricsDate] = useState('');
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: documents = [] } = useQuery({
    queryKey: ['visa-documents', application?.id],
    queryFn: () => base44.entities.Document.filter({ 
      application_id: application?.id,
      document_type: 'visa_documents'
    }),
    enabled: !!application?.id,
  });

  const updateVisaStageMutation = useMutation({
    mutationFn: async ({ stage, notes, biometrics_date }) => {
      const updateData = {
        visa_status: stage,
        counsellor_notes: `${application.counsellor_notes || ''}\n[${format(new Date(), 'PPpp')}] Visa stage updated to: ${VISA_STAGES.find(s => s.value === stage)?.label}\nNotes: ${notes}`,
      };

      if (stage === 'approved') {
        updateData.visa_decision_date = new Date().toISOString().split('T')[0];
      }
      
      if (biometrics_date) {
        updateData.biometrics_date = biometrics_date;
      }

      return base44.entities.Application.update(application.id, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['application', application.id] });
      setShowUpdateForm(false);
      setNotes('');
      setNewStage('');
      toast.success('Visa status updated successfully!');
    },
  });

  const currentStageIndex = VISA_STAGES.findIndex(s => s.value === application?.visa_status);
  const CurrentStageIcon = VISA_STAGES[currentStageIndex]?.icon || Clock;

  // Check for expiring documents
  const expiringDocuments = documents.filter(doc => {
    if (doc.expiry_date) {
      const daysUntilExpiry = Math.floor((new Date(doc.expiry_date) - new Date()) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
    }
    return false;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            Visa Application Tracker
            <CurrentStageIcon className={`w-5 h-5 ${VISA_STAGES[currentStageIndex]?.color}`} />
          </span>
          {!isStudent && (
            <Button
              size="sm"
              onClick={() => setShowUpdateForm(!showUpdateForm)}
              style={{ backgroundColor: '#F37021' }}
            >
              Update Status
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Document Expiry Warnings */}
        {expiringDocuments.length > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
              <div>
                <p className="font-semibold text-orange-900 mb-2">Document Expiry Alert</p>
                {expiringDocuments.map(doc => (
                  <p key={doc.id} className="text-sm text-orange-700">
                    • {doc.name} expires on {format(new Date(doc.expiry_date), 'PPP')}
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Update Form (Counselor Only) */}
        {showUpdateForm && !isStudent && (
          <div className="bg-slate-50 rounded-lg p-4 space-y-4 border">
            <div>
              <Label>New Stage *</Label>
              <select
                value={newStage}
                onChange={(e) => setNewStage(e.target.value)}
                className="w-full mt-2 px-3 py-2 border rounded-md"
              >
                <option value="">Select stage...</option>
                {VISA_STAGES.map(stage => (
                  <option key={stage.value} value={stage.value}>{stage.label}</option>
                ))}
              </select>
            </div>

            {(newStage === 'biometrics_scheduled' || newStage === 'biometrics_completed') && (
              <div>
                <Label>Biometrics Date</Label>
                <Input
                  type="date"
                  value={biometricsDate}
                  onChange={(e) => setBiometricsDate(e.target.value)}
                  className="mt-2"
                />
              </div>
            )}

            <div>
              <Label>Notes</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any relevant notes..."
                className="mt-2"
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowUpdateForm(false);
                  setNewStage('');
                  setNotes('');
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => updateVisaStageMutation.mutate({ 
                  stage: newStage, 
                  notes,
                  biometrics_date: biometricsDate 
                })}
                disabled={!newStage || updateVisaStageMutation.isPending}
                className="flex-1"
                style={{ backgroundColor: '#0066CC' }}
              >
                Update Stage
              </Button>
            </div>
          </div>
        )}

        {/* Timeline */}
        <div className="space-y-4">
          {VISA_STAGES.map((stage, index) => {
            const StageIcon = stage.icon;
            const isCompleted = index < currentStageIndex;
            const isCurrent = index === currentStageIndex;
            const isUpcoming = index > currentStageIndex;

            return (
              <div key={stage.value} className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isCompleted
                        ? 'bg-green-100 text-green-600'
                        : isCurrent
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    <StageIcon className="w-5 h-5" />
                  </div>
                  {index < VISA_STAGES.length - 1 && (
                    <div
                      className={`w-0.5 h-12 ${
                        isCompleted ? 'bg-green-200' : 'bg-slate-200'
                      }`}
                    />
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex items-center gap-3">
                    <h4
                      className={`font-semibold ${
                        isCurrent ? 'text-blue-600' : isCompleted ? 'text-slate-900' : 'text-slate-400'
                      }`}
                    >
                      {stage.label}
                    </h4>
                    {isCurrent && (
                      <Badge className="bg-blue-100 text-blue-700">Current</Badge>
                    )}
                    {isCompleted && (
                      <Badge className="bg-green-100 text-green-700">Completed</Badge>
                    )}
                  </div>
                  {isCurrent && application?.counsellor_notes && (
                    <p className="text-sm text-slate-600 mt-2">
                      {application.counsellor_notes.split('\n').slice(-2).join('\n')}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Biometrics Info */}
        {application?.biometrics_date && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Fingerprint className="w-5 h-5 text-purple-600" />
              <div>
                <p className="font-semibold text-purple-900">Biometrics Appointment</p>
                <p className="text-sm text-purple-700">
                  {format(new Date(application.biometrics_date), 'PPP')}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}