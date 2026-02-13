import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from 'lucide-react';

export default function AcademicAchievements({ achievements = [], onChange }) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    achievement_type: 'test_score',
    title: '',
    score: '',
    date: '',
    details: ''
  });

  const handleAdd = () => {
    if (formData.title && formData.score) {
      onChange([...achievements, { ...formData, id: Date.now() }]);
      setFormData({ achievement_type: 'test_score', title: '', score: '', date: '', details: '' });
      setShowForm(false);
    }
  };

  const handleRemove = (id) => {
    onChange(achievements.filter(a => a.id !== id));
  };

  const typeLabels = {
    test_score: 'Test Score',
    gpa: 'GPA',
    award: 'Award',
    certification: 'Certification',
    competition: 'Competition'
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          🏆 Academic Achievements
          <Button onClick={() => setShowForm(!showForm)} size="sm" variant="outline">
            <Plus className="w-4 h-4 mr-1" />
            Add
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Form */}
        {showForm && (
          <div className="border-l-4 border-education-blue pl-4 space-y-3 p-4 bg-blue-50 rounded">
            <Select value={formData.achievement_type} onValueChange={(val) => setFormData({ ...formData, achievement_type: val })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="test_score">Test Score</SelectItem>
                <SelectItem value="gpa">GPA</SelectItem>
                <SelectItem value="award">Award</SelectItem>
                <SelectItem value="certification">Certification</SelectItem>
                <SelectItem value="competition">Competition</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="Title (e.g., IELTS, SAT, GRE)"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
            <Input
              placeholder="Score/Result"
              value={formData.score}
              onChange={(e) => setFormData({ ...formData, score: e.target.value })}
            />
            <Input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
            <Input
              placeholder="Additional details"
              value={formData.details}
              onChange={(e) => setFormData({ ...formData, details: e.target.value })}
            />
            <div className="flex gap-2">
              <Button onClick={handleAdd} className="bg-education-blue hover:bg-blue-700">Save</Button>
              <Button onClick={() => setShowForm(false)} variant="outline">Cancel</Button>
            </div>
          </div>
        )}

        {/* Achievements List */}
        {achievements.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-4">No achievements added yet</p>
        ) : (
          <div className="space-y-3">
            {achievements.map(achievement => (
              <div key={achievement.id} className="flex items-start justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-education-blue">{typeLabels[achievement.achievement_type]}</Badge>
                    <p className="font-semibold text-slate-900">{achievement.title}</p>
                  </div>
                  <p className="text-sm font-bold text-alo-orange mt-1">{achievement.score}</p>
                  {achievement.date && <p className="text-xs text-slate-500">{new Date(achievement.date).toLocaleDateString()}</p>}
                  {achievement.details && <p className="text-xs text-slate-600 mt-1">{achievement.details}</p>}
                </div>
                <button onClick={() => handleRemove(achievement.id)} className="p-1 hover:bg-red-100 rounded transition-colors">
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