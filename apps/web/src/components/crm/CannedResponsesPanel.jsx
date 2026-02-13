import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { BookMarked, Plus, Trash2, Edit2, Copy, MoreVertical } from 'lucide-react';
import { toast } from 'sonner';

const categoryColors = {
  document_request: 'bg-blue-100 text-blue-800',
  application_update: 'bg-purple-100 text-purple-800',
  deadline_reminder: 'bg-red-100 text-red-800',
  course_inquiry: 'bg-green-100 text-green-800',
  visa_guidance: 'bg-cyan-100 text-cyan-800',
  university_inquiry: 'bg-amber-100 text-amber-800',
  payment_reminder: 'bg-orange-100 text-orange-800',
  test_prep: 'bg-indigo-100 text-indigo-800',
  general_support: 'bg-slate-100 text-slate-800',
  congratulations: 'bg-emerald-100 text-emerald-800',
};

export default function CannedResponsesPanel({ counselorId, onSelectResponse }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newResponse, setNewResponse] = useState({
    title: '',
    category: 'general_support',
    content: '',
    shortcuts: [],
  });

  const { data: responses = [], refetch } = useQuery({
    queryKey: ['canned-responses', counselorId],
    queryFn: () => base44.entities.CannedResponse.filter({ counselor_id: counselorId, is_active: true }),
    enabled: !!counselorId,
  });

  const groupedResponses = responses.reduce((acc, resp) => {
    if (!acc[resp.category]) acc[resp.category] = [];
    acc[resp.category].push(resp);
    return acc;
  }, {});

  const handleCreateResponse = async () => {
    if (!newResponse.title || !newResponse.content) {
      toast.error('Please fill in title and content');
      return;
    }

    try {
      await base44.entities.CannedResponse.create({
        ...newResponse,
        counselor_id: counselorId,
        is_personal: true,
      });
      toast.success('Canned response created!');
      setNewResponse({ title: '', category: 'general_support', content: '', shortcuts: [] });
      setIsDialogOpen(false);
      refetch();
    } catch (error) {
      toast.error('Failed to create response');
    }
  };

  const handleDeleteResponse = async (id) => {
    try {
      await base44.entities.CannedResponse.update(id, { is_active: false });
      toast.success('Response deleted');
      refetch();
    } catch (error) {
      toast.error('Failed to delete response');
    }
  };

  const handleSelectResponse = (response) => {
    onSelectResponse(response.content);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-900 flex items-center gap-2">
          <BookMarked className="w-5 h-5 text-blue-600" />
          Quick Responses
        </h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-1" />
              New
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Canned Response</DialogTitle>
              <DialogDescription>
                Set up a template for quick responses to common queries
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-700">Title</label>
                <Input
                  placeholder="e.g., Missing Documents"
                  value={newResponse.title}
                  onChange={(e) => setNewResponse({ ...newResponse, title: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">Category</label>
                <select 
                  className="w-full p-2 border rounded-md text-sm"
                  value={newResponse.category}
                  onChange={(e) => setNewResponse({ ...newResponse, category: e.target.value })}
                >
                  {Object.keys(categoryColors).map(cat => (
                    <option key={cat} value={cat}>{cat.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">Content</label>
                <Textarea
                  placeholder="Use {{name}}, {{university}}, {{course}} for placeholders"
                  value={newResponse.content}
                  onChange={(e) => setNewResponse({ ...newResponse, content: e.target.value })}
                  rows={5}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleCreateResponse} className="bg-blue-600">Create</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Responses by Category */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {Object.entries(groupedResponses).length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-4">No canned responses yet</p>
        ) : (
          Object.entries(groupedResponses).map(([category, resps]) => (
            <div key={category}>
              <p className="text-xs font-semibold text-slate-500 uppercase mb-2">
                {category.replace(/_/g, ' ')}
              </p>
              <div className="space-y-2">
                {resps.map((resp) => (
                  <div key={resp.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-900">{resp.title}</p>
                      </div>
                      <button className="ml-2">
                        <MoreVertical className="w-4 h-4 text-slate-400 hover:text-slate-600" />
                      </button>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2 mb-2">{resp.content}</p>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs"
                        onClick={() => handleSelectResponse(resp)}
                      >
                        <Copy className="w-3 h-3 mr-1" />
                        Use
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs text-red-600 hover:text-red-700"
                        onClick={() => handleDeleteResponse(resp.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}