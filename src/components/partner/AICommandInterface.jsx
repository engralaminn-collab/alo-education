import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AICommandInterface({ partnerId }) {
  const [command, setCommand] = useState('');
  const [result, setResult] = useState(null);

  const executeCommand = useMutation({
    mutationFn: async (commandText) => {
      // Use AI to parse the command and determine what needs to be updated
      const aiResponse = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an AI assistant for a partner management system. Parse this command and determine what action to take:

Command: "${commandText}"

Available actions:
1. Update partner referral data
2. Update commission information
3. Update lead status
4. Generate reports
5. Update partner organization details

Response format (JSON):
{
  "action": "update_referral|update_commission|update_lead|generate_report|update_partner",
  "entity": "entity_name",
  "filters": {filter_criteria},
  "updates": {update_values},
  "description": "What will be done"
}`,
        response_json_schema: {
          type: "object",
          properties: {
            action: { type: "string" },
            entity: { type: "string" },
            filters: { type: "object" },
            updates: { type: "object" },
            description: { type: "string" }
          }
        }
      });

      // Execute the parsed action
      let executionResult = { success: false, message: '', details: null };

      switch (aiResponse.action) {
        case 'update_referral':
          const referrals = await base44.entities.PartnerReferral.filter({
            partner_id: partnerId,
            ...aiResponse.filters
          });
          
          for (const ref of referrals) {
            await base44.entities.PartnerReferral.update(ref.id, aiResponse.updates);
          }
          
          executionResult = {
            success: true,
            message: `Updated ${referrals.length} referral(s)`,
            details: aiResponse
          };
          break;

        case 'update_commission':
          const commissions = await base44.entities.Commission.filter({
            partner_id: partnerId,
            ...aiResponse.filters
          });
          
          for (const comm of commissions) {
            await base44.entities.Commission.update(comm.id, aiResponse.updates);
          }
          
          executionResult = {
            success: true,
            message: `Updated ${commissions.length} commission(s)`,
            details: aiResponse
          };
          break;

        case 'update_lead':
          const students = await base44.entities.StudentProfile.filter({
            source: `partner_${partnerId}`,
            ...aiResponse.filters
          });
          
          for (const student of students) {
            await base44.entities.StudentProfile.update(student.id, aiResponse.updates);
          }
          
          executionResult = {
            success: true,
            message: `Updated ${students.length} lead(s)`,
            details: aiResponse
          };
          break;

        case 'generate_report':
          executionResult = {
            success: true,
            message: 'Report generation initiated',
            details: aiResponse
          };
          break;

        default:
          executionResult = {
            success: false,
            message: 'Command not recognized or unsupported',
            details: aiResponse
          };
      }

      return executionResult;
    },
    onSuccess: (data) => {
      setResult(data);
      if (data.success) {
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    },
    onError: (error) => {
      setResult({
        success: false,
        message: error.message,
        details: null
      });
      toast.error('Failed to execute command');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!command.trim()) return;
    executeCommand.mutate(command);
  };

  const exampleCommands = [
    'Mark all pending commissions as approved',
    'Update referral source to "Email Campaign" for leads from last week',
    'Change status to "contacted" for all submitted leads',
    'Set commission eligible to true for all enrolled students'
  ];

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-sm bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-6 h-6" />
            <h3 className="text-xl font-bold">AI Command Interface</h3>
          </div>
          <p className="text-sm opacity-90">
            Use natural language to update partner data, manage leads, and perform bulk operations
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Enter Command</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              placeholder="e.g., Update all pending commissions to approved status..."
              rows={4}
              className="resize-none"
            />
            
            <Button 
              type="submit" 
              disabled={executeCommand.isPending || !command.trim()}
              className="w-full bg-education-blue"
            >
              {executeCommand.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Execute Command
                </>
              )}
            </Button>
          </form>

          {/* Example Commands */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-700">Example commands:</p>
            <div className="flex flex-wrap gap-2">
              {exampleCommands.map((example, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="cursor-pointer hover:bg-slate-100"
                  onClick={() => setCommand(example)}
                >
                  {example}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Result Display */}
      {result && (
        <Card className={result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              {result.success ? (
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              )}
              <div className="flex-1">
                <h4 className={`font-semibold mb-1 ${result.success ? 'text-green-900' : 'text-red-900'}`}>
                  {result.success ? 'Success' : 'Failed'}
                </h4>
                <p className={result.success ? 'text-green-700' : 'text-red-700'}>
                  {result.message}
                </p>
                {result.details && (
                  <div className="mt-3 p-3 bg-white rounded border">
                    <p className="text-sm text-slate-600 mb-1">
                      <strong>Action:</strong> {result.details.description}
                    </p>
                    {result.details.updates && (
                      <p className="text-xs text-slate-500 mt-1">
                        <strong>Updates:</strong> {JSON.stringify(result.details.updates)}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Safety Notice */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5" />
            <div>
              <p className="text-sm text-amber-900 font-medium">Super Admin Access</p>
              <p className="text-xs text-amber-700 mt-1">
                These commands can update multiple records at once. Always verify your command before executing.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}