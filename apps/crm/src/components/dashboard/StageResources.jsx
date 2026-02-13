import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, BookOpen, Video, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

const resourcesByStage = {
  profile: [
    { title: 'Profile Completion Guide', type: 'guide', icon: BookOpen },
    { title: 'How to Choose Your Study Destination', type: 'article', icon: FileText },
    { title: 'Understanding Your Career Goals', type: 'guide', icon: BookOpen },
  ],
  courses: [
    { title: 'Course Selection Tips', type: 'guide', icon: BookOpen },
    { title: 'Understanding Entry Requirements', type: 'article', icon: FileText },
    { title: 'Comparing Universities', type: 'guide', icon: BookOpen },
  ],
  apply: [
    { title: 'How to Write a Strong SOP', type: 'guide', icon: BookOpen },
    { title: 'Application Checklist', type: 'article', icon: FileText },
    { title: 'Common Application Mistakes', type: 'guide', icon: BookOpen },
  ],
  documents: [
    { title: 'Document Requirements by Country', type: 'guide', icon: BookOpen },
    { title: 'Getting Your Documents Verified', type: 'article', icon: FileText },
    { title: 'Document Translation Services', type: 'guide', icon: BookOpen },
  ],
  offer: [
    { title: 'Understanding Offer Letters', type: 'guide', icon: BookOpen },
    { title: 'Accepting Your Offer', type: 'article', icon: FileText },
    { title: 'Scholarship Opportunities', type: 'guide', icon: BookOpen },
  ],
  visa: [
    { title: 'Visa Application Process', type: 'guide', icon: BookOpen },
    { title: 'Required Visa Documents', type: 'article', icon: FileText },
    { title: 'Visa Interview Preparation', type: 'video', icon: Video },
  ],
  enrolled: [
    { title: 'Pre-Departure Checklist', type: 'guide', icon: BookOpen },
    { title: 'Accommodation Guide', type: 'article', icon: FileText },
    { title: 'First Week Survival Guide', type: 'video', icon: Video },
  ],
};

const countrySpecificResources = {
  'UK': [
    { title: 'Top 5 Things to Pack for the UK', type: 'guide' },
    { title: 'UK Student Visa Guide', type: 'article' },
    { title: 'Understanding UK Culture', type: 'video' },
    { title: 'Healthcare for International Students', type: 'guide' },
  ],
  'United Kingdom': [
    { title: 'Top 5 Things to Pack for the UK', type: 'guide' },
    { title: 'UK Student Visa Guide', type: 'article' },
    { title: 'Understanding UK Culture', type: 'video' },
    { title: 'Healthcare for International Students', type: 'guide' },
  ],
  'USA': [
    { title: 'Living in the USA: Student Guide', type: 'guide' },
    { title: 'F-1 Visa Requirements', type: 'article' },
    { title: 'Cultural Adjustment Tips', type: 'video' },
    { title: 'Part-time Work for Students', type: 'guide' },
  ],
  'United States': [
    { title: 'Living in the USA: Student Guide', type: 'guide' },
    { title: 'F-1 Visa Requirements', type: 'article' },
    { title: 'Cultural Adjustment Tips', type: 'video' },
    { title: 'Part-time Work for Students', type: 'guide' },
  ],
  'Canada': [
    { title: 'Cultural Etiquette Guide for Canada', type: 'guide' },
    { title: 'Study Permit Application', type: 'article' },
    { title: 'Finding Accommodation in Canada', type: 'guide' },
    { title: 'Winter Survival Tips', type: 'video' },
  ],
  'Australia': [
    { title: 'Living Down Under: Student Guide', type: 'guide' },
    { title: 'Australian Student Visa', type: 'article' },
    { title: 'Work Rights for Students', type: 'guide' },
    { title: 'Beach Safety & Aussie Culture', type: 'video' },
  ],
  'Ireland': [
    { title: 'Student Life in Ireland', type: 'guide' },
    { title: 'Irish Student Visa Process', type: 'article' },
    { title: 'Exploring Irish Culture', type: 'video' },
    { title: 'Cost of Living Guide', type: 'guide' },
  ],
  'Germany': [
    { title: 'Studying in Germany: Complete Guide', type: 'guide' },
    { title: 'German Student Visa', type: 'article' },
    { title: 'Learning Basic German', type: 'video' },
    { title: 'Public Transport Guide', type: 'guide' },
  ],
};

export default function StageResources({ currentStage, country }) {
  const stageKey = currentStage === 0 ? 'profile' :
                   currentStage === 1 ? 'courses' :
                   currentStage === 2 ? 'apply' :
                   currentStage === 3 ? 'documents' :
                   currentStage === 4 ? 'offer' :
                   currentStage === 5 ? 'visa' : 'enrolled';

  const stageResources = resourcesByStage[stageKey] || [];
  const countryResources = country && countrySpecificResources[country] ? countrySpecificResources[country] : [];
  
  const allResources = [...stageResources, ...countryResources];

  if (allResources.length === 0) return null;

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Resources for Your Journey</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {allResources.map((resource, index) => {
            const Icon = resource.icon || FileText;
            const typeColor = resource.type === 'guide' ? 'bg-blue-100 text-blue-700' :
                            resource.type === 'video' ? 'bg-purple-100 text-purple-700' :
                            'bg-emerald-100 text-emerald-700';
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center group-hover:bg-slate-200 transition-colors">
                    <Icon className="w-4 h-4 text-slate-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-slate-900 text-sm">{resource.title}</h4>
                  </div>
                  <Badge variant="outline" className={`${typeColor} text-xs capitalize`}>
                    {resource.type}
                  </Badge>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}