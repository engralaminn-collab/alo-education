import React, { useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { PenTool, Trash2 } from 'lucide-react';

export default function ESignatureModal({ open, onClose, documentType, documentId, studentId }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const queryClient = useQueryClient();

  const saveSignature = useMutation({
    mutationFn: async () => {
      const canvas = canvasRef.current;
      const signatureData = canvas.toDataURL('image/png');

      return base44.entities.ESignature.create({
        student_id: studentId,
        document_type: documentType,
        document_id: documentId,
        signature_data: signatureData,
        signed_date: new Date().toISOString(),
        status: 'signed'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['signatures'] });
      toast.success('Signature saved successfully');
      onClose();
    }
  });

  const startDrawing = (e) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl dark:bg-slate-800">
        <DialogHeader>
          <DialogTitle className="dark:text-white">Sign Document</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
              Document Type: <strong>{documentType}</strong>
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-500">
              By signing below, you acknowledge and accept the terms of this document.
            </p>
          </div>

          <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-2">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <PenTool className="w-4 h-4" />
                Sign in the box below
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={clearSignature}
                className="select-none dark:bg-slate-700"
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Clear
              </Button>
            </div>
            <canvas
              ref={canvasRef}
              width={700}
              height={200}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              className="w-full border border-slate-200 dark:border-slate-600 rounded bg-white cursor-crosshair"
              style={{ touchAction: 'none' }}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} className="select-none dark:bg-slate-700">
              Cancel
            </Button>
            <Button
              onClick={() => saveSignature.mutate()}
              disabled={saveSignature.isPending}
              className="bg-education-blue select-none"
            >
              Save Signature
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}