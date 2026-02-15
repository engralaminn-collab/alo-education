import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { UserPlus, Mail, Shield, Activity, Trash2, Edit2, MoreVertical } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

export default function TeamManagement({ partnerId }) {
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('standard');
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: teamMembers = [] } = useQuery({
    queryKey: ['team-members', partnerId],
    queryFn: async () => {
      const roles = await base44.entities.StaffRole.filter({ 
        partner_organization_id: partnerId,
        role: 'partner'
      });
      
      const userIds = roles.map(r => r.user_id);
      const users = await Promise.all(
        userIds.map(id => base44.entities.User.filter({ id }).then(u => u[0]))
      );
      
      return roles.map(role => ({
        ...role,
        user: users.find(u => u?.id === role.user_id)
      }));
    },
    enabled: !!partnerId
  });

  const { data: activityLogs = [] } = useQuery({
    queryKey: ['team-activity', partnerId],
    queryFn: async () => {
      const logs = await base44.entities.CounselorInteraction.list();
      const teamUserIds = teamMembers.map(m => m.user_id);
      return logs.filter(log => teamUserIds.includes(log.counselor_id)).slice(0, 50);
    },
    enabled: teamMembers.length > 0
  });

  const inviteTeamMember = useMutation({
    mutationFn: async () => {
      await base44.users.inviteUser(inviteEmail, 'user');
      
      const newUser = await base44.entities.User.filter({ email: inviteEmail });
      if (newUser[0]) {
        await base44.entities.StaffRole.create({
          user_id: newUser[0].id,
          role: 'partner',
          partner_organization_id: partnerId,
          partner_access_level: inviteRole,
          is_active: true
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      toast.success('Team member invited successfully!');
      setInviteEmail('');
      setInviteRole('standard');
      setIsInviteOpen(false);
    },
    onError: (error) => {
      toast.error('Failed to invite team member: ' + error.message);
    }
  });

  const updateMemberRole = useMutation({
    mutationFn: async ({ roleId, newAccessLevel }) => {
      await base44.entities.StaffRole.update(roleId, { 
        partner_access_level: newAccessLevel 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      toast.success('Member role updated');
    }
  });

  const removeMember = useMutation({
    mutationFn: async (roleId) => {
      await base44.entities.StaffRole.update(roleId, { is_active: false });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      toast.success('Team member removed');
    }
  });

  const getAccessLevelBadge = (level) => {
    const config = {
      super_admin: { color: 'bg-purple-100 text-purple-800', label: 'Super Admin' },
      counselor: { color: 'bg-blue-100 text-blue-800', label: 'Counselor' },
      standard: { color: 'bg-slate-100 text-slate-800', label: 'Standard' }
    };
    const { color, label } = config[level] || config.standard;
    return <Badge className={color}>{label}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Team Management</CardTitle>
              <p className="text-sm text-slate-600 mt-1">Manage your partner organization team</p>
            </div>
            <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
              <DialogTrigger asChild>
                <Button className="bg-education-blue">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Invite Member
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Invite Team Member</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Email Address</label>
                    <Input
                      type="email"
                      placeholder="email@example.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Access Level</label>
                    <Select value={inviteRole} onValueChange={setInviteRole}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard - View only</SelectItem>
                        <SelectItem value="counselor">Counselor - Full CRM access</SelectItem>
                        <SelectItem value="super_admin">Super Admin - Full control</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    onClick={() => inviteTeamMember.mutate()}
                    disabled={!inviteEmail || inviteTeamMember.isPending}
                    className="w-full"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Send Invitation
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* Team Members Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Team Members ({teamMembers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Access Level</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teamMembers.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">{member.user?.full_name || 'N/A'}</TableCell>
                  <TableCell>{member.user?.email}</TableCell>
                  <TableCell>{getAccessLevelBadge(member.partner_access_level)}</TableCell>
                  <TableCell>
                    <Badge variant={member.is_active ? 'default' : 'secondary'}>
                      {member.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {new Date(member.created_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => updateMemberRole.mutate({ 
                          roleId: member.id, 
                          newAccessLevel: 'counselor' 
                        })}>
                          <Shield className="w-4 h-4 mr-2" />
                          Change Role
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => removeMember.mutate(member.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Activity Log */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Recent Team Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {activityLogs.slice(0, 10).map((log) => {
              const member = teamMembers.find(m => m.user_id === log.counselor_id);
              return (
                <div key={log.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-education-blue text-white flex items-center justify-center text-sm font-semibold">
                    {member?.user?.full_name?.charAt(0) || '?'}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{member?.user?.full_name || 'Team Member'}</p>
                    <p className="text-sm text-slate-600">{log.interaction_type}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {new Date(log.created_date).toLocaleString()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}