import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, Clock, DollarSign, Calendar, Award, CheckCircle, AlertCircle, Trophy } from 'lucide-react';

const badgeConfig = {
  PREMIUM: { label: 'Premium', className: 'bg-purple-100 text-purple-700' },
  RUSSELL_GROUP: { label: 'Russell Group', className: 'bg-blue-100 text-blue-700' },
  PROFILE_MATCHED: { label: 'Best Match', className: 'bg-green-100 text-green-700' },
  LOW_DEPOSIT: { label: 'Low Deposit', className: 'bg-amber-100 text-amber-700' },
};

const eligibilityConfig = {
  ELIGIBLE: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
  CONDITIONAL: { icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50' },
  NOT_ELIGIBLE: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
};

export default function CourseCard({ course, onViewDetails, onShortlist, onApply }) {
  const eligibilityInfo = eligibilityConfig[course.eligibility?.status] || eligibilityConfig.ELIGIBLE;
  const EligibilityIcon = eligibilityInfo.icon;

  return (
    <Card className="border-0 shadow-sm hover:shadow-lg transition-all duration-300 group overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {/* University Logo */}
          <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden">
            {course.university?.logo_url ? (
              <img 
                src={course.university.logo_url} 
                alt={course.university.name}
                className="w-full h-full object-contain p-2"
              />
            ) : (
              <Building2 className="w-8 h-8 text-slate-400" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-3">
              {course.badges?.map((badge) => {
                const config = badgeConfig[badge];
                return config ? (
                  <Badge key={badge} className={`${config.className} text-xs`}>
                    {config.label}
                  </Badge>
                ) : null;
              })}
            </div>

            {/* Course Title */}
            <h3 className="text-lg font-bold mb-2 group-hover:text-blue-600 transition-colors line-clamp-2" style={{ color: 'var(--alo-blue)' }}>
              {course.courseTitle || course.course_title}
            </h3>

            {/* University Info */}
            <div className="flex items-center text-slate-600 mb-3">
              <Building2 className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">{course.university?.name}</span>
              <span className="mx-2">•</span>
              <span className="text-sm">{course.university?.country}</span>
            </div>

            {/* Rankings */}
            {course.rankings && (
              <div className="flex flex-wrap gap-3 mb-3 text-xs">
                {course.rankings.usNews && (
                  <div className="flex items-center gap-1 text-slate-600">
                    <Trophy className="w-3 h-3" />
                    <span>US News #{course.rankings.usNews}</span>
                  </div>
                )}
                {course.rankings.qsWorld && (
                  <div className="flex items-center gap-1 text-slate-600">
                    <Trophy className="w-3 h-3" />
                    <span>QS World #{course.rankings.qsWorld}</span>
                  </div>
                )}
                {course.rankings.webometricsUK && (
                  <div className="flex items-center gap-1 text-slate-600">
                    <Trophy className="w-3 h-3" />
                    <span>UK #{course.rankings.webometricsUK}</span>
                  </div>
                )}
              </div>
            )}

            {/* Course Details */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 mb-4">
              {course.durationMonths && (
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {Math.floor(course.durationMonths / 12)} years
                </span>
              )}
              {course.intake && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {course.intake.label} Intake
                  <Badge variant="outline" className={`ml-1 ${course.intake.status === 'Open' ? 'text-green-600' : 'text-red-600'}`}>
                    {course.intake.status}
                  </Badge>
                </span>
              )}
              {course.fees?.tuitionYearlyGBP && (
                <span className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />
                  £{course.fees.tuitionYearlyGBP.toLocaleString()}/year
                </span>
              )}
            </div>

            {/* Eligibility Status */}
            {course.eligibility && (
              <div className={`flex items-start gap-2 p-3 rounded-lg ${eligibilityInfo.bg} mb-4`}>
                <EligibilityIcon className={`w-5 h-5 ${eligibilityInfo.color} shrink-0 mt-0.5`} />
                <div className="flex-1">
                  <div className={`font-semibold text-sm ${eligibilityInfo.color}`}>
                    {course.eligibility.status === 'ELIGIBLE' ? 'Eligible' : 
                     course.eligibility.status === 'CONDITIONAL' ? 'Conditionally Eligible' : 'Not Eligible'}
                  </div>
                  <p className="text-xs text-slate-600 mt-1">{course.eligibility.reason}</p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onShortlist?.(course)}
                className="flex-1"
              >
                <Award className="w-4 h-4 mr-1" />
                Shortlist
              </Button>
              <Button
                size="sm"
                onClick={() => onViewDetails?.(course)}
                className="flex-1 text-white"
                style={{ backgroundColor: 'var(--alo-blue)' }}
              >
                View Details
              </Button>
              {course.eligibility?.status === 'ELIGIBLE' && (
                <Button
                  size="sm"
                  onClick={() => onApply?.(course)}
                  className="flex-1 text-white"
                  style={{ backgroundColor: 'var(--alo-orange)' }}
                >
                  Apply Now
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}