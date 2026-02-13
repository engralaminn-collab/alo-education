import React from 'react';
import { Badge } from "@/components/ui/badge";
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { FileText } from 'lucide-react';

const statusColors = {
  draft: 'bg-slate-100 text-slate-800',
  documents_pending: 'bg-yellow-100 text-yellow-800',
  under_review: 'bg-blue-100 text-blue-800',
  submitted_to_university: 'bg-purple-100 text-purple-800',
  conditional_offer: 'bg-orange-100 text-orange-800',
  unconditional_offer: 'bg-green-100 text-green-800',
  visa_processing: 'bg-cyan-100 text-cyan-800',
  enrolled: 'bg-emerald-100 text-emerald-800',
  rejected: 'bg-red-100 text-red-800',
  withdrawn: 'bg-slate-100 text-slate-800'
};

export default function PartnerApplicationsTable({ applications, students }) {
  const { data: universities = [] } = useQuery({
    queryKey: ['universities'],
    queryFn: () => base44.entities.University.list(),
  });

  const uniMap = universities.reduce((acc, uni) => {
    acc[uni.id] = uni;
    return acc;
  }, {});

  const studentMap = students.reduce((acc, student) => {
    acc[student.id] = student;
    return acc;
  }, {});

  if (applications.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <p className="text-slate-600">No applications yet</p>
        <p className="text-sm text-slate-500">Submit your first student to get started</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b bg-slate-50">
            <th className="text-left p-3 text-sm font-semibold">Student Name</th>
            <th className="text-left p-3 text-sm font-semibold">Destination</th>
            <th className="text-left p-3 text-sm font-semibold">University</th>
            <th className="text-left p-3 text-sm font-semibold">Application Stage</th>
            <th className="text-left p-3 text-sm font-semibold">Current Status</th>
          </tr>
        </thead>
        <tbody>
          {applications.map((app) => {
            const student = studentMap[app.student_id];
            const university = uniMap[app.university_id];
            
            return (
              <tr key={app.id} className="border-b hover:bg-slate-50">
                <td className="p-3">
                  {student?.first_name} {student?.last_name}
                </td>
                <td className="p-3">
                  {university?.country || 'N/A'}
                </td>
                <td className="p-3">
                  {university?.university_name || 'N/A'}
                </td>
                <td className="p-3">
                  <Badge className={statusColors[app.status] || statusColors.draft}>
                    {app.status?.replace(/_/g, ' ')}
                  </Badge>
                </td>
                <td className="p-3">
                  <Badge variant="outline">
                    {app.milestones?.offer_received?.completed ? 'Offer Received' : 
                     app.milestones?.application_submitted?.completed ? 'Submitted' : 
                     'In Progress'}
                  </Badge>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}