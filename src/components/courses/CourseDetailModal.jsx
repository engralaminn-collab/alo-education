import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Building2, ExternalLink, Calendar, Clock, DollarSign, 
  FileText, Trophy, Globe, MapPin, AlertCircle, Award
} from 'lucide-react';
import { toast } from 'sonner';

export default function CourseDetailModal({ course, open, onClose, onApply, onShortlist, onReportIssue }) {
  const [activeTab, setActiveTab] = useState('overview');

  if (!course) return null;

  const handleReportIssue = () => {
    onReportIssue?.(course);
    toast.success('Issue reported. Thank you for your feedback!');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
              {course.university?.logoUrl ? (
                <img src={course.university.logoUrl} alt="" className="w-12 h-12 object-contain" />
              ) : (
                <Building2 className="w-8 h-8 text-slate-400" />
              )}
            </div>
            <div className="flex-1">
              <DialogTitle className="text-2xl mb-2" style={{ color: 'var(--alo-blue)' }}>
                {course.programDetails?.programName || course.courseTitle}
              </DialogTitle>
              <div className="flex items-center gap-2 text-slate-600">
                <Building2 className="w-4 h-4" />
                <span className="font-semibold">{course.university?.name}</span>
                <span>•</span>
                <MapPin className="w-4 h-4" />
                <span>{course.university?.city}, {course.university?.country}</span>
              </div>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="requirements">Requirements</TabsTrigger>
            <TabsTrigger value="fees">Fees & Deadlines</TabsTrigger>
            <TabsTrigger value="university">University</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Quick Facts */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4" style={{ color: 'var(--alo-blue)' }} />
                  <span className="text-sm text-slate-600">Duration</span>
                </div>
                <div className="font-semibold">
                  {Math.floor((course.programDetails?.durationMonths || course.durationMonths || 0) / 12)} years
                </div>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4" style={{ color: 'var(--alo-blue)' }} />
                  <span className="text-sm text-slate-600">Intakes</span>
                </div>
                <div className="font-semibold">
                  {course.programDetails?.intakes?.join(', ') || course.intake?.label || 'N/A'}
                </div>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="w-4 h-4" style={{ color: 'var(--alo-blue)' }} />
                  <span className="text-sm text-slate-600">Campus</span>
                </div>
                <div className="font-semibold">{course.programDetails?.campus || 'Main Campus'}</div>
              </div>
            </div>

            {/* Program URL */}
            {course.programDetails?.programUrl && (
              <div className="p-4 border rounded-lg">
                <a 
                  href={course.programDetails.programUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-blue-600 hover:underline"
                >
                  <Globe className="w-4 h-4" />
                  Visit Official Program Page
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            )}

            {/* Standardized Tests */}
            {course.standardizedTests && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-5 h-5" style={{ color: 'var(--alo-blue)' }} />
                  <h4 className="font-semibold">Standardized Tests</h4>
                </div>
                <p className="text-sm">
                  {course.standardizedTests.required ? 
                    `Required: ${course.standardizedTests.note || 'Please check university website'}` :
                    course.standardizedTests.note || 'No standardized test required'
                  }
                </p>
              </div>
            )}
          </TabsContent>

          {/* Requirements Tab */}
          <TabsContent value="requirements" className="space-y-6">
            {/* English Requirements */}
            {course.englishRequirements && (
              <div>
                <h3 className="font-semibold text-lg mb-4" style={{ color: 'var(--alo-blue)' }}>
                  English Language Requirements
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {course.englishRequirements.ielts && (
                    <div className="p-4 border rounded-lg">
                      <div className="font-semibold mb-2">IELTS</div>
                      <div className="text-sm space-y-1">
                        <div>Overall: <span className="font-semibold">{course.englishRequirements.ielts.overall}</span></div>
                        <div>Min Band: <span className="font-semibold">{course.englishRequirements.ielts.minBand}</span></div>
                      </div>
                    </div>
                  )}
                  {course.englishRequirements.pte && (
                    <div className="p-4 border rounded-lg">
                      <div className="font-semibold mb-2">PTE</div>
                      <div className="text-sm space-y-1">
                        <div>Overall: <span className="font-semibold">{course.englishRequirements.pte.overall}</span></div>
                        <div>Min Band: <span className="font-semibold">{course.englishRequirements.pte.minBand}</span></div>
                      </div>
                    </div>
                  )}
                  {course.englishRequirements.toefl && (
                    <div className="p-4 border rounded-lg">
                      <div className="font-semibold mb-2">TOEFL</div>
                      <div className="text-sm space-y-1">
                        <div>Overall: <span className="font-semibold">{course.englishRequirements.toefl.overall}</span></div>
                        <div>Min Section: <span className="font-semibold">{course.englishRequirements.toefl.minSection}</span></div>
                      </div>
                    </div>
                  )}
                  {course.englishRequirements.det && (
                    <div className="p-4 border rounded-lg">
                      <div className="font-semibold mb-2">Duolingo (DET)</div>
                      <div className="text-sm">
                        Score: <span className="font-semibold">{course.englishRequirements.det.score}</span>
                      </div>
                    </div>
                  )}
                  {course.englishRequirements.moi?.acceptable && (
                    <div className="p-4 border rounded-lg bg-green-50">
                      <div className="font-semibold mb-2">Medium of Instruction (MOI)</div>
                      <div className="text-sm text-green-700">Acceptable</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Academic Entry Requirements */}
            {course.entryRequirements && (
              <div>
                <h3 className="font-semibold text-lg mb-3" style={{ color: 'var(--alo-blue)' }}>
                  Academic Entry Requirements
                </h3>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm leading-relaxed">{course.entryRequirements}</p>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Fees & Deadlines Tab */}
          <TabsContent value="fees" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-5 h-5" style={{ color: 'var(--alo-blue)' }} />
                  <h4 className="font-semibold">Tuition Fee</h4>
                </div>
                <div className="text-2xl font-bold" style={{ color: 'var(--alo-blue)' }}>
                  £{course.programDetails?.tuitionYearlyGBP?.toLocaleString() || course.fees?.tuitionYearlyGBP?.toLocaleString() || 'N/A'}
                </div>
                <div className="text-sm text-slate-600">per year</div>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-5 h-5" style={{ color: 'var(--alo-blue)' }} />
                  <h4 className="font-semibold">Application Fee</h4>
                </div>
                <div className="text-2xl font-bold" style={{ color: 'var(--alo-blue)' }}>
                  £{course.programDetails?.applicationFeeGBP?.toLocaleString() || course.fees?.applicationFeeGBP || 'N/A'}
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5" style={{ color: 'var(--alo-orange)' }} />
                  <h4 className="font-semibold">Application Deadline</h4>
                </div>
                <div className="text-lg font-semibold">
                  {course.programDetails?.applicationDeadline || 'Check university website'}
                </div>
              </div>

              {course.programDetails?.tuitionDepositGBP && (
                <div className="p-4 border rounded-lg bg-amber-50">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-5 h-5" style={{ color: 'var(--alo-orange)' }} />
                    <h4 className="font-semibold">Tuition Deposit</h4>
                  </div>
                  <div className="text-lg font-semibold">
                    £{course.programDetails.tuitionDepositGBP.toLocaleString()}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* University Tab */}
          <TabsContent value="university" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-xl mb-2" style={{ color: 'var(--alo-blue)' }}>
                  {course.university?.name}
                </h3>
                <div className="flex items-center gap-2 text-slate-600">
                  <MapPin className="w-4 h-4" />
                  <span>{course.university?.city}, {course.university?.state}, {course.university?.country}</span>
                </div>
              </div>
              {course.university?.website && (
                <a 
                  href={course.university.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-blue-600 hover:underline"
                >
                  <Globe className="w-4 h-4" />
                  Visit Website
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>

            {/* Rankings */}
            {course.university?.rankings && (
              <div>
                <h4 className="font-semibold mb-3">Rankings</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  {course.university.rankings.usNews && (
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Trophy className="w-5 h-5 text-amber-500" />
                        <span className="font-semibold">US News</span>
                      </div>
                      <div className="text-2xl font-bold">#{course.university.rankings.usNews}</div>
                    </div>
                  )}
                  {course.university.rankings.qsWorld && (
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Trophy className="w-5 h-5 text-amber-500" />
                        <span className="font-semibold">QS World</span>
                      </div>
                      <div className="text-2xl font-bold">#{course.university.rankings.qsWorld}</div>
                    </div>
                  )}
                  {course.university.rankings.webometricsUK && (
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Trophy className="w-5 h-5 text-amber-500" />
                        <span className="font-semibold">Webometrics UK</span>
                      </div>
                      <div className="text-2xl font-bold">#{course.university.rankings.webometricsUK}</div>
                    </div>
                  )}
                  {course.university.rankings.webometricsWorld && (
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Trophy className="w-5 h-5 text-amber-500" />
                        <span className="font-semibold">Webometrics World</span>
                      </div>
                      <div className="text-2xl font-bold">#{course.university.rankings.webometricsWorld}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {course.university?.lastUpdatedOn && (
              <p className="text-sm text-slate-500">
                Last updated: {new Date(course.university.lastUpdatedOn).toLocaleDateString()}
              </p>
            )}
          </TabsContent>
        </Tabs>

        {/* Footer Actions */}
        <div className="flex gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleReportIssue}
            className="flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4" />
            Report Issue
          </Button>
          <Button
            variant="outline"
            onClick={() => onShortlist?.(course)}
            className="flex-1"
          >
            <Award className="w-4 h-4 mr-2" />
            Add to Shortlist
          </Button>
          <Button
            onClick={() => onApply?.(course)}
            className="flex-1 text-white"
            style={{ backgroundColor: 'var(--alo-orange)' }}
          >
            Apply Now
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}