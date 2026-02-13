import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2 } from 'lucide-react';

export default function ExtracurricularActivities({ activities = [], onChange }) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    activity_name: '',
    category: '',
    role: '',
    duration: '',
    description: ''
  });

  const handleAdd = () => {
    if (formData.activity_name && formData.category) {
      onChange([...activities, { ...formData, id: Date.now() }]);
      setFormData({ activity_name: '', category: '', role: '', duration: '', description: '' });
      setShowForm(false);
    }
  };

  const handleRemove = (id) => {
    onChange(activities.filter(a => a.id !== id));
  };

  const categories = ['Sports', 'Music', 'Drama', 'Volunteer Work', 'Debate', 'Student Leadership', 'Club', 'Community Service', 'Research', 'Other'];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          ⭐ Extracurricular Activities
          <Button onClick={() => setShowForm(!showForm)} size="sm" variant="outline">
            <Plus className="w-4 h-4 mr-1" />
            Add
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Form */}
        {showForm && (
          <div className="border-l-4 border-alo-orange pl-4 space-y-3 p-4 bg-orange-50 rounded">
            <Input
              placeholder="Activity name (e.g., Basketball Team, Debate Club)"
              value={formData.activity_name}
              onChange={(e) => setFormData({ ...formData, activity_name: e.target.value })}
            />
            <Input
              placeholder="Category (e.g., Sports, Volunteer)"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            />
            <Input
              placeholder="Your role/position"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            />
            <Input
              placeholder="Duration (e.g., 2 years, 2018-2020)"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
            />
            <Textarea
              placeholder="Describe your involvement and achievements"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
            <div className="flex gap-2">
              <Button onClick={handleAdd} className="bg-alo-orange hover:bg-orange-600">Save</Button>
              <Button onClick={() => setShowForm(false)} variant="outline">Cancel</Button>
            </div>
          </div>
        )}

        {/* Activities List */}
        {activities.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-4">No activities added yet</p>
        ) : (
          <div className="space-y-3">
            {activities.map(activity => (
              <div key={activity.id} className="flex items-start justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-alo-orange text-white">{activity.category}</Badge>
                    <p className="font-semibold text-slate-900">{activity.activity_name}</p>
                  </div>
                  {activity.role && <p className="text-sm text-slate-700 mt-1">Role: {activity.role}</p>}
                  {activity.duration && <p className="text-xs text-slate-500">{activity.duration}</p>}
                  {activity.description && <p className="text-xs text-slate-600 mt-2">{activity.description}</p>}
                </div>
                <button onClick={() => handleRemove(activity.id)} className="p-1 hover:bg-red-100 rounded transition-colors flex-shrink-0">
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}