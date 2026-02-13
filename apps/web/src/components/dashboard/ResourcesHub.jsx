import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, FileText, HelpCircle, ExternalLink, 
  DollarSign, Globe, Plane, Home, GraduationCap,
  AlertCircle, CheckCircle, TrendingUp
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const getResourcesByStage = (status) => {
  const resourceMap = {
    new_lead: {
      title: 'Getting Started',
      articles: [
        { title: 'How to Choose the Right University', category: 'Guide', icon: GraduationCap },
        { title: 'Understanding Study Abroad Costs', category: 'Financial', icon: DollarSign },
        { title: 'Required Documents Checklist', category: 'Application', icon: FileText },
      ],
      priority: 'Start by completing your profile and exploring universities.'
    },
    contacted: {
      title: 'Exploring Options',
      articles: [
        { title: 'Country Comparison Guide', category: 'Guide', icon: Globe },
        { title: 'Scholarship Opportunities', category: 'Financial', icon: DollarSign },
        { title: 'English Proficiency Tests: IELTS vs TOEFL', category: 'Test Prep', icon: BookOpen },
      ],
      priority: 'Take your time researching universities and preparing test scores.'
    },
    qualified: {
      title: 'Application Preparation',
      articles: [
        { title: 'Writing a Strong Personal Statement', category: 'Application', icon: FileText },
        { title: 'How to Request Letters of Recommendation', category: 'Application', icon: FileText },
        { title: 'Application Timeline & Deadlines', category: 'Guide', icon: AlertCircle },
      ],
      priority: 'Focus on preparing your application documents and meeting deadlines.'
    },
    in_progress: {
      title: 'Application Submitted',
      articles: [
        { title: 'What to Do While Waiting for Offers', category: 'Guide', icon: TrendingUp },
        { title: 'Preparing for University Interviews', category: 'Application', icon: BookOpen },
        { title: 'Understanding Conditional vs Unconditional Offers', category: 'Guide', icon: CheckCircle },
      ],
      priority: 'Stay patient and prepare for potential interviews or additional requirements.'
    },
    applied: {
      title: 'Awaiting Decision',
      articles: [
        { title: 'How to Respond to Offer Letters', category: 'Guide', icon: CheckCircle },
        { title: 'Visa Application Process Overview', category: 'Visa', icon: Plane },
        { title: 'Accommodation Options for Students', category: 'Living', icon: Home },
      ],
      priority: 'Start researching visa requirements and accommodation options.'
    },
    enrolled: {
      title: 'Pre-Departure',
      articles: [
        { title: 'Pre-Departure Checklist', category: 'Travel', icon: Plane },
        { title: 'Opening a Bank Account Abroad', category: 'Living', icon: DollarSign },
        { title: 'Cultural Adjustment Tips', category: 'Living', icon: Globe },
      ],
      priority: 'Prepare for your departure and plan your arrival.'
    }
  };

  return resourceMap[status] || resourceMap.new_lead;
};

const getCountryResources = (countries) => {
  const countryGuides = {
    'uk': [
      { title: 'UK Student Visa Guide (Tier 4)', url: 'https://www.gov.uk/student-visa', icon: Plane },
      { title: 'NHS & Health Insurance for Students', url: 'https://www.nhs.uk/using-the-nhs/healthcare-abroad/apply-for-a-free-uk-global-health-insurance-card-ghic/', icon: AlertCircle },
      { title: 'Cost of Living in UK Cities', category: 'Financial', icon: DollarSign },
    ],
    'usa': [
      { title: 'F-1 Student Visa Application', url: 'https://travel.state.gov/content/travel/en/us-visas/study/student-visa.html', icon: Plane },
      { title: 'Working in the US on Student Visa', category: 'Work', icon: DollarSign },
      { title: 'Understanding US University System', category: 'Guide', icon: GraduationCap },
    ],
    'canada': [
      { title: 'Canada Study Permit Application', url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada.html', icon: Plane },
      { title: 'Post-Graduation Work Permit (PGWP)', category: 'Work', icon: DollarSign },
      { title: 'Healthcare Coverage in Canada', category: 'Living', icon: AlertCircle },
    ],
    'australia': [
      { title: 'Australian Student Visa (Subclass 500)', url: 'https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500', icon: Plane },
      { title: 'Working While Studying in Australia', category: 'Work', icon: DollarSign },
      { title: 'Australian Education System Overview', category: 'Guide', icon: GraduationCap },
    ],
    'ireland': [
      { title: 'Ireland Student Visa Requirements', category: 'Visa', icon: Plane },
      { title: 'Living Costs in Ireland', category: 'Financial', icon: DollarSign },
      { title: 'Stay Back Options After Study', category: 'Work', icon: Globe },
    ],
    'new zealand': [
      { title: 'New Zealand Student Visa Guide', category: 'Visa', icon: Plane },
      { title: 'Accommodation Guide for Students', category: 'Living', icon: Home },
      { title: 'Part-Time Work Opportunities', category: 'Work', icon: DollarSign },
    ]
  };

  if (!countries || countries.length === 0) return [];
  
  const mainCountry = countries[0].toLowerCase();
  return countryGuides[mainCountry] || [];
};

const financialResources = [
  { title: 'Top Scholarships for International Students', category: 'Scholarship', icon: DollarSign },
  { title: 'Understanding Tuition Payment Plans', category: 'Financial', icon: DollarSign },
  { title: 'Education Loans & Financing Options', category: 'Financial', icon: DollarSign },
  { title: 'Budgeting for Your First Year', category: 'Financial', icon: DollarSign },
  { title: 'How to Apply for Financial Aid', category: 'Scholarship', icon: FileText },
];

const faqs = [
  {
    question: 'How long does the application process take?',
    answer: 'Typically 2-4 months from submission to decision, depending on the university and intake period.'
  },
  {
    question: 'Can I work while studying?',
    answer: 'Most countries allow students to work part-time (usually 20 hours/week during term). Check your visa conditions.'
  },
  {
    question: 'What English test score do I need?',
    answer: 'Most universities require IELTS 6.0-7.0 or TOEFL 80-100. Requirements vary by course and level.'
  },
  {
    question: 'When should I apply?',
    answer: 'Ideally 6-12 months before your intended start date to allow time for processing, visa, and preparation.'
  },
  {
    question: 'What happens if my application is rejected?',
    answer: 'You can reapply to the same or different universities. We\'ll help you understand the reasons and improve your application.'
  },
];

const externalLinks = [
  { name: 'QS World Rankings', url: 'https://www.topuniversities.com/university-rankings', icon: TrendingUp },
  { name: 'Times Higher Education', url: 'https://www.timeshighereducation.com/', icon: TrendingUp },
  { name: 'Study Portals', url: 'https://www.studyportals.com/', icon: Globe },
  { name: 'IELTS Official', url: 'https://www.ielts.org/', icon: BookOpen },
  { name: 'TOEFL Official', url: 'https://www.ets.org/toefl', icon: BookOpen },
];

export default function ResourcesHub({ studentProfile }) {
  const [expandedFaq, setExpandedFaq] = useState(null);

  const stageResources = getResourcesByStage(studentProfile?.status);
  const countryResources = getCountryResources(studentProfile?.preferred_countries);

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-emerald-600" />
          Your Resource Hub
        </CardTitle>
        <CardDescription>
          Personalized guides and resources for your study abroad journey
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="journey" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="journey">Journey</TabsTrigger>
            <TabsTrigger value="country">Country</TabsTrigger>
            <TabsTrigger value="financial">Financial</TabsTrigger>
            <TabsTrigger value="faq">FAQs</TabsTrigger>
          </TabsList>

          {/* Journey Stage Resources */}
          <TabsContent value="journey" className="space-y-4">
            <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
              <h4 className="font-semibold text-emerald-900 mb-2">{stageResources.title}</h4>
              <p className="text-sm text-emerald-700">{stageResources.priority}</p>
            </div>
            
            <div className="space-y-3">
              {stageResources.articles.map((article, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
                  <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center shrink-0">
                    <article.icon className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <h5 className="font-semibold text-slate-900 text-sm mb-1">{article.title}</h5>
                    <Badge variant="outline" className="text-xs">{article.category}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Country-Specific Resources */}
          <TabsContent value="country" className="space-y-3">
            {countryResources.length > 0 ? (
              <>
                <p className="text-sm text-slate-600 mb-4">
                  Resources for studying in {studentProfile?.preferred_countries?.[0] || 'your chosen country'}
                </p>
                {countryResources.map((resource, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center shrink-0">
                      <resource.icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h5 className="font-semibold text-slate-900 text-sm mb-1">{resource.title}</h5>
                      {resource.category && <Badge variant="outline" className="text-xs">{resource.category}</Badge>}
                    </div>
                    {resource.url && (
                      <a href={resource.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 text-slate-400 hover:text-slate-600" />
                      </a>
                    )}
                  </div>
                ))}
              </>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <Globe className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Complete your profile to see country-specific resources</p>
              </div>
            )}

            {/* External Links */}
            <div className="mt-6">
              <h4 className="font-semibold text-slate-900 mb-3">Helpful Websites</h4>
              <div className="space-y-2">
                {externalLinks.map((link, index) => (
                  <a 
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <link.icon className="w-4 h-4 text-slate-500" />
                      <span className="text-sm font-medium text-slate-900">{link.name}</span>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-400" />
                  </a>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Financial Resources */}
          <TabsContent value="financial" className="space-y-3">
            {financialResources.map((resource, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
                <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center shrink-0">
                  <resource.icon className="w-5 h-5 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h5 className="font-semibold text-slate-900 text-sm mb-1">{resource.title}</h5>
                  <Badge variant="outline" className="text-xs">{resource.category}</Badge>
                </div>
              </div>
            ))}

            <div className="mt-4 p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg border border-amber-200">
              <h4 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Need Financial Guidance?
              </h4>
              <p className="text-sm text-amber-800 mb-3">
                Our counselors can help you explore scholarship opportunities and financing options.
              </p>
              <Link to={createPageUrl('Contact')}>
                <Button size="sm" className="bg-amber-600 hover:bg-amber-700">
                  Book Consultation
                </Button>
              </Link>
            </div>
          </TabsContent>

          {/* FAQs */}
          <TabsContent value="faq" className="space-y-3">
            {faqs.map((faq, index) => (
              <div key={index} className="border border-slate-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <HelpCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span className="font-semibold text-slate-900 text-sm">{faq.question}</span>
                  </div>
                  <div className={`transition-transform ${expandedFaq === index ? 'rotate-180' : ''}`}>
                    <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>
                {expandedFaq === index && (
                  <div className="p-4 bg-white border-t border-slate-200">
                    <p className="text-sm text-slate-600">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}

            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800 mb-3">
                Still have questions? Our team is here to help!
              </p>
              <Link to={createPageUrl('Contact')}>
                <Button size="sm" variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white">
                  Contact Support
                </Button>
              </Link>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}