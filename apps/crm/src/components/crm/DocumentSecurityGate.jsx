import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Shield, Share2, Eye, Download, Clock } from 'lucide-react';

export default function DocumentSecurityGate({ document, studentName }) {
  const [shareEmail, setShareEmail] = useState('');
  const [expiryHours, setExpiryHours] = useState(24);

  const shareDocument = useMutation({
    mutationFn: async ({ email, hours }) => {
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + hours);

      // Create access log
      const user = await base44.auth.me();
      await base44.entities.DocumentAccessLog.create({
        document_id: document.id,
        accessed_by: user.id,
        accessed_by_type: user.role === 'admin' ? 'counselor' : 'student',
        access_type: 'share',
        shared_with: email,
        access_granted_by: user.id,
        expires_at: expiryDate.toISOString()
      });

      return { success: true, expires_at: expiryDate };
    },
    onSuccess: (data) => {
      toast.success(`Document shared successfully. Access expires in ${expiryHours} hours.`);
      setShareEmail('');
    },
    onError: () => {
      toast.error('Failed to share document');
    }
  });

  const logAccess = useMutation({
    mutationFn: async (accessType) => {
      const user = await base44.auth.me();
      await base44.entities.DocumentAccessLog.create({
        document_id: document.id,
        accessed_by: user.id,
        accessed_by_type: user.role === 'admin' ? 'counselor' : 'student',
        access_type: accessType
      });
    }
  });

  const handleView = () => {
    logAccess.mutate('view');
    window.open(document.file_url, '_blank');
  };

  const handleDownload = () => {
    logAccess.mutate('download');
    const link = document.createElement('a');
    link.href = document.file_url;
    link.download = document.name;
    link.click();
  };

  const handleShare = () => {
    if (!shareEmail) {
      toast.error('Please enter an email address');
      return;
    }
    shareDocument.mutate({ email: shareEmail, hours: expiryHours });
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Shield className="w-5 h-5 text-blue-600" />
          Secure Document Access
        </CardTitle>
        <CardDescription>
          {document.document_type} - {studentName}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Actions */}
        <div className="flex gap-2">
          <Button onClick={handleView} variant="outline" className="flex-1">
            <Eye className="w-4 h-4 mr-2" />
            View
          </Button>
          <Button onClick={handleDownload} variant="outline" className="flex-1">
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>

        {/* Share Section */}
        <div className="border-t pt-4">
          <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <Share2 className="w-4 h-4" />
            Share Securely
          </h4>
          
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Share with (email)</Label>
              <Input
                type="email"
                value={shareEmail}
                onChange={(e) => setShareEmail(e.target.value)}
                placeholder="partner@university.edu"
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-xs">Access Expires In</Label>
              <div className="flex gap-2 mt-1">
                {[24, 48, 72, 168].map(hours => (
                  <Button
                    key={hours}
                    size="sm"
                    variant={expiryHours === hours ? 'default' : 'outline'}
                    onClick={() => setExpiryHours(hours)}
                    className="flex-1"
                  >
                    <Clock className="w-3 h-3 mr-1" />
                    {hours === 168 ? '1 week' : `${hours}h`}
                  </Button>
                ))}
              </div>
            </div>

            <Button
              onClick={handleShare}
              disabled={shareDocument.isPending || !shareEmail}
              className="w-full bg-education-blue"
            >
              <Share2 className="w-4 h-4 mr-2" />
              {shareDocument.isPending ? 'Sharing...' : 'Share Document'}
            </Button>
          </div>
        </div>

        {/* Document Info */}
        <div className="border-t pt-4 text-xs text-gray-600 space-y-1">
          <p>Status: <Badge variant={document.status === 'approved' ? 'default' : 'outline'}>{document.status}</Badge></p>
          <p>Uploaded: {new Date(document.created_date).toLocaleDateString()}</p>
          {document.expiry_date && (
            <p className="text-amber-600">Expires: {new Date(document.expiry_date).toLocaleDateString()}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}