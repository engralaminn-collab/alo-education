import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import CRMLayout from '@/components/crm/CRMLayout';

export default function CRMDataUpdates() {
  const [updating, setUpdating] = useState(false);
  const queryClient = useQueryClient();

  const { data: updateLogs = [] } = useQuery({
    queryKey: ['data-update-logs'],
    queryFn: () => base44.entities.DataUpdateLog.list('-created_date', 20),
  });

  const { data: universities = [] } = useQuery({
    queryKey: ['universities-data-check'],
    queryFn: () => base44.entities.University.list('-last_data_update', 10),
  });

  const triggerUpdate = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('updateUniversityCourseData', {});
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(`Update completed! ${data.summary.universities_updated} universities and ${data.summary.courses_updated} courses updated.`);
      queryClient.invalidateQueries({ queryKey: ['data-update-logs'] });
      queryClient.invalidateQueries({ queryKey: ['universities-data-check'] });
      setUpdating(false);
    },
    onError: (error) => {
      toast.error('Update failed: ' + error.message);
      setUpdating(false);
    },
  });

  const handleUpdate = async () => {
    setUpdating(true);
    toast.info('Starting data update... This may take several minutes.');
    triggerUpdate.mutate();
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'failed': return <XCircle className="w-5 h-5 text-red-600" />;
      case 'running': return <Clock className="w-5 h-5 text-blue-600 animate-spin" />;
      default: return <Clock className="w-5 h-5 text-slate-400" />;
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      running: 'bg-blue-100 text-blue-700',
      completed: 'bg-green-100 text-green-700',
      failed: 'bg-red-100 text-red-700',
    };
    return <Badge className={styles[status]}>{status}</Badge>;
  };

  const lastUpdate = updateLogs[0];
  const daysSinceUpdate = lastUpdate ? 
    Math.floor((Date.now() - new Date(lastUpdate.created_date).getTime()) / (1000 * 60 * 60 * 24)) : 
    null;

  return (
    <CRMLayout currentPage="Data Updates">
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">University & Course Data Updates</h1>
          <p className="text-slate-600">Automatically refresh data every 7 days</p>
        </div>

        {/* Update Status Banner */}
        <Card className="mb-6" style={{ borderColor: daysSinceUpdate >= 7 ? '#F37021' : '#0066CC', borderWidth: '2px' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {daysSinceUpdate >= 7 ? (
                  <AlertCircle className="w-8 h-8 text-orange-600" />
                ) : (
                  <CheckCircle className="w-8 h-8 text-green-600" />
                )}
                <div>
                  <h3 className="text-lg font-semibold">
                    {daysSinceUpdate >= 7 ? 'Update Required' : 'Data Up to Date'}
                  </h3>
                  <p className="text-sm text-slate-600">
                    {lastUpdate ? (
                      <>Last updated {daysSinceUpdate} days ago on {new Date(lastUpdate.created_date).toLocaleDateString()}</>
                    ) : (
                      'No updates performed yet'
                    )}
                  </p>
                </div>
              </div>
              <Button
                onClick={handleUpdate}
                disabled={updating}
                className="px-6"
                style={{ backgroundColor: '#F37021' }}
              >
                {updating ? (
                  <>
                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-5 h-5 mr-2" />
                    Update Now
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Updates Summary */}
        {lastUpdate && (
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Universities Updated</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold" style={{ color: '#0066CC' }}>
                  {lastUpdate.universities_updated}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Courses Updated</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold" style={{ color: '#0066CC' }}>
                  {lastUpdate.courses_updated}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Errors</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-red-600">
                  {lastUpdate.errors?.length || 0}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Recently Updated Universities */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Recently Updated Universities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {universities.slice(0, 5).map(uni => (
                <div key={uni.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {uni.logo && <img src={uni.logo} alt="" className="w-10 h-10 object-contain" />}
                    <div>
                      <p className="font-semibold">{uni.university_name}</p>
                      <p className="text-sm text-slate-600">{uni.city}, {uni.country}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Last Updated</p>
                    <p className="text-sm font-medium">
                      {uni.last_data_update ? 
                        new Date(uni.last_data_update).toLocaleDateString() : 
                        'Never'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Update History */}
        <Card>
          <CardHeader>
            <CardTitle>Update History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {updateLogs.map(log => (
                <div key={log.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(log.status)}
                      <div>
                        <p className="font-semibold">
                          {new Date(log.started_at).toLocaleString()}
                        </p>
                        <p className="text-sm text-slate-600">
                          {log.universities_updated} universities, {log.courses_updated} courses updated
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(log.status)}
                  </div>
                  
                  {log.errors && log.errors.length > 0 && (
                    <div className="mt-3 p-3 bg-red-50 rounded-lg">
                      <p className="text-sm font-semibold text-red-900 mb-2">
                        {log.errors.length} Errors
                      </p>
                      <div className="space-y-1">
                        {log.errors.slice(0, 3).map((error, index) => (
                          <p key={index} className="text-xs text-red-700">
                            {error.university || error.course}: {error.error}
                          </p>
                        ))}
                        {log.errors.length > 3 && (
                          <p className="text-xs text-red-600">
                            +{log.errors.length - 3} more errors
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {log.completed_at && (
                    <p className="text-xs text-slate-500 mt-2">
                      Duration: {Math.round((new Date(log.completed_at) - new Date(log.started_at)) / 1000 / 60)} minutes
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </CRMLayout>
  );
}