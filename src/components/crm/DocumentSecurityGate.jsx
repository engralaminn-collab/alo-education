import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Eye, Download, AlertTriangle, Lock } from 'lucide-react';
import { toast } from 'sonner';

export default function DocumentSecurityGate({ document, studentId }) {
  const [user, setUser] = useState(null);

  useQuery({
    queryKey: ['current-user-doc-security'],
    queryFn: async () => {
      const u = await base44.auth.me();
      setUser(u);
      return u;
    }
  });

  const handleView = () => {
    if (!document.file_url) {
      toast.error('No file available');
      return;
    }
    
    // Log access
    base44.entities.DocumentAccessLog?.create({
      document_id: document.id,
      accessed_by: user?.id,
      access_type: 'view',
      accessed_at: new Date().toISOString()
    }).catch(() => {});

    window.open(document.file_url, '_blank');
  };

  const handleDownload = async () => {
    if (user?.role !== 'admin') {
      toast.error('Download restricted to managers only');
      return;
    }

    // Log download
    await base44.entities.DocumentAccessLog?.create({
      document_id: document.id,
      accessed_by: user?.id,
      access_type: 'download',
      accessed_at: new Date().toISOString()
    }).catch(() => {});

    const link = document.createElement('a');
    link.href = document.file_url;
    link.download = document.name;
    link.click();
    
    toast.success('Download started (logged for audit)');
  };

  const isManager = user?.role === 'admin';

  return (
    <Card className="border-2 border-purple-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-purple-600" />
            <div>
              <p className="font-semibold text-slate-900">{document.name}</p>
              <p className="text-xs text-slate-600 capitalize">{document.document_type?.replace(/_/g, ' ')}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleView}
              className="gap-1"
            >
              <Eye className="w-4 h-4" />
              View
            </Button>
            {isManager ? (
              <Button
                size="sm"
                onClick={handleDownload}
                className="gap-1 bg-purple-600 hover:bg-purple-700"
              >
                <Download className="w-4 h-4" />
                Download
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                disabled
                className="gap-1"
              >
                <Lock className="w-4 h-4" />
                Locked
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}