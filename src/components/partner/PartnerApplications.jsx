import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search } from 'lucide-react';

export default function PartnerApplications({ applications, students }) {
  const [search, setSearch] = useState('');

  const studentMap = students.reduce((acc, student) => {
    acc[student.id] = student;
    return acc;
  }, {});

  const filteredApplications = applications.filter(app => {
    const student = studentMap[app.student_id];
    if (!student) return false;
    const searchLower = search.toLowerCase();
    return (
      student.first_name?.toLowerCase().includes(searchLower) ||
      student.last_name?.toLowerCase().includes(searchLower) ||
      student.email?.toLowerCase().includes(searchLower)
    );
  });

  const statusColors = {
    draft: 'bg-slate-100 text-slate-800',
    submitted_to_university: 'bg-blue-100 text-blue-800',
    under_review: 'bg-yellow-100 text-yellow-800',
    conditional_offer: 'bg-purple-100 text-purple-800',
    unconditional_offer: 'bg-green-100 text-green-800',
    enrolled: 'bg-emerald-100 text-emerald-800',
    rejected: 'bg-red-100 text-red-800',
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submitted Students</CardTitle>
        <div className="mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by student name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Application Stage</TableHead>
                <TableHead>Current Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredApplications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-slate-500 py-8">
                    No students found
                  </TableCell>
                </TableRow>
              ) : (
                filteredApplications.map((app) => {
                  const student = studentMap[app.student_id];
                  return (
                    <TableRow key={app.id}>
                      <TableCell className="font-medium">
                        {student?.first_name} {student?.last_name}
                      </TableCell>
                      <TableCell>{student?.email}</TableCell>
                      <TableCell>{student?.admission_preferences?.study_destination || 'N/A'}</TableCell>
                      <TableCell>{student?.admission_preferences?.study_level || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge className={statusColors[app.status] || 'bg-slate-100'}>
                          {app.status?.replace(/_/g, ' ').toUpperCase()}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}