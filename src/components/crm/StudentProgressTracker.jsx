import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { 
  Search, TrendingUp, TrendingDown, CheckCircle,
  Clock, AlertTriangle, User
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function StudentProgressTracker({ students, applications }) {
  const [searchQuery, setSearchQuery] = useState('');

  // Calculate progress for each student
  const studentsWithProgress = students.map(student => {
    const studentApps = applications.filter(app => app.student_id === student.id);
    
    // Progress calculation
    let progressScore = 0;
    let progressDetails = [];

    // Profile completeness (30 points)
    const profilePoints = Math.round((student.profile_completeness || 0) * 0.3);
    progressScore += profilePoints;
    progressDetails.push({ 
      item: 'Profile Complete', 
      points: profilePoints, 
      max: 30,
      status: student.profile_completeness >= 80 ? 'complete' : 'pending'
    });

    // Applications started (20 points)
    const appPoints = Math.min(studentApps.length * 5, 20);
    progressScore += appPoints;
    progressDetails.push({ 
      item: 'Applications Started', 
      points: appPoints, 
      max: 20,
      status: studentApps.length > 0 ? 'complete' : 'pending'
    });

    // Applications submitted (20 points)
    const submittedApps = studentApps.filter(app => 
      !['draft', 'documents_pending'].includes(app.status)
    ).length;
    const submitPoints = Math.min(submittedApps * 5, 20);
    progressScore += submitPoints;
    progressDetails.push({ 
      item: 'Applications Submitted', 
      points: submitPoints, 
      max: 20,
      status: submittedApps > 0 ? 'complete' : 'pending'
    });

    // Offers received (20 points)
    const offersReceived = studentApps.filter(app => 
      ['conditional_offer', 'unconditional_offer'].includes(app.status)
    ).length;
    const offerPoints = Math.min(offersReceived * 10, 20);
    progressScore += offerPoints;
    progressDetails.push({ 
      item: 'Offers Received', 
      points: offerPoints, 
      max: 20,
      status: offersReceived > 0 ? 'complete' : 'pending'
    });

    // Enrolled (10 points)
    const enrolled = studentApps.some(app => app.status === 'enrolled');
    const enrollPoints = enrolled ? 10 : 0;
    progressScore += enrollPoints;
    progressDetails.push({ 
      item: 'Enrolled', 
      points: enrollPoints, 
      max: 10,
      status: enrolled ? 'complete' : 'pending'
    });

    // Health status
    let healthStatus = 'good';
    let healthReason = 'On track';
    
    if (progressScore < 30) {
      healthStatus = 'at-risk';
      healthReason = 'Very low progress';
    } else if (progressScore < 50) {
      healthStatus = 'needs-attention';
      healthReason = 'Below expected progress';
    } else if (progressScore >= 80) {
      healthStatus = 'excellent';
      healthReason = 'Excellent progress!';
    }

    return {
      ...student,
      progressScore,
      progressDetails,
      healthStatus,
      healthReason,
      applicationCount: studentApps.length
    };
  });

  // Filter students
  const filteredStudents = studentsWithProgress.filter(student => {
    const fullName = `${student.first_name} ${student.last_name}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase()) || 
           student.email?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Sort by progress (lowest first to see who needs help)
  const sortedStudents = [...filteredStudents].sort((a, b) => a.progressScore - b.progressScore);

  const healthColors = {
    'at-risk': 'bg-red-100 text-red-800 border-red-300',
    'needs-attention': 'bg-orange-100 text-orange-800 border-orange-300',
    'good': 'bg-blue-100 text-blue-800 border-blue-300',
    'excellent': 'bg-emerald-100 text-emerald-800 border-emerald-300'
  };

  const healthIcons = {
    'at-risk': AlertTriangle,
    'needs-attention': Clock,
    'good': CheckCircle,
    'excellent': TrendingUp
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Student Progress Tracker</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{filteredStudents.length} students</Badge>
          </div>
        </div>
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search students by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sortedStudents.map(student => {
            const HealthIcon = healthIcons[student.healthStatus];
            return (
              <Card key={student.id} className={`border-l-4 ${healthColors[student.healthStatus]}`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <HealthIcon className={`w-5 h-5 mt-1 ${
                      student.healthStatus === 'at-risk' ? 'text-red-600' :
                      student.healthStatus === 'needs-attention' ? 'text-orange-600' :
                      student.healthStatus === 'good' ? 'text-blue-600' :
                      'text-emerald-600'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <Link 
                            to={createPageUrl('CRMStudents') + `?id=${student.id}`}
                            className="font-semibold text-slate-900 hover:text-blue-600"
                          >
                            {student.first_name} {student.last_name}
                          </Link>
                          <p className="text-xs text-slate-500">{student.email}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-slate-900">{student.progressScore}%</p>
                          <p className="text-xs text-slate-500">{student.healthReason}</p>
                        </div>
                      </div>

                      <Progress value={student.progressScore} className="h-2 mb-3" />

                      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-3">
                        {student.progressDetails.map((detail, idx) => (
                          <div key={idx} className="text-xs">
                            <div className="flex items-center gap-1">
                              {detail.status === 'complete' ? (
                                <CheckCircle className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Clock className="w-3 h-3 text-slate-400" />
                              )}
                              <span className={detail.status === 'complete' ? 'text-slate-700' : 'text-slate-400'}>
                                {detail.item}
                              </span>
                            </div>
                            <p className={`${detail.status === 'complete' ? 'text-slate-900 font-medium' : 'text-slate-400'}`}>
                              {detail.points}/{detail.max}
                            </p>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <Badge variant="outline" className="text-xs">
                          {student.applicationCount} {student.applicationCount === 1 ? 'application' : 'applications'}
                        </Badge>
                        <Badge variant="outline" className="text-xs capitalize">
                          {student.status || 'new'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {sortedStudents.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              <User className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p>No students found</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}