import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Users, ChevronRight, Plus, X } from 'lucide-react';
import { toast } from 'sonner';

export default function TeamSetupStep({ partnerId, onComplete }) {
  const [teamMembers, setTeamMembers] = useState([]);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  const addMember = () => {
    if (email && name) {
      setTeamMembers([...teamMembers, { email, name }]);
      setEmail('');
      setName('');
      toast.success('Team member added');
    }
  };

  const removeMember = (index) => {
    setTeamMembers(teamMembers.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    // You can integrate with actual invitation logic here
    onComplete();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5 text-education-blue" />
          Set Up Your Team (Optional)
        </CardTitle>
        <p className="text-sm text-slate-600">
          Invite team members to collaborate on your partner portal
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-900 mb-3">
            💡 <strong>Tip:</strong> You can always invite team members later from the Settings page
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label>Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Team member name"
            />
          </div>
          <div>
            <Label>Email</Label>
            <div className="flex gap-2">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
              />
              <Button type="button" onClick={addMember} disabled={!email || !name}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {teamMembers.length > 0 && (
          <div className="space-y-2">
            <Label>Team Members to Invite ({teamMembers.length})</Label>
            {teamMembers.map((member, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-medium">{member.name}</p>
                  <p className="text-sm text-slate-600">{member.email}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeMember(index)}
                >
                  <X className="w-4 h-4 text-red-600" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <Button onClick={handleSubmit} className="w-full bg-education-blue">
          {teamMembers.length > 0 ? `Invite ${teamMembers.length} Member(s) & Continue` : 'Skip & Continue'}
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
}