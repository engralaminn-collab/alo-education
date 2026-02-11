import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  BookOpen, GraduationCap, FileText, Globe, Award, Shield,
  FileSignature, Calendar, Map, DollarSign, MessageSquare, CheckCircle,
  ArrowRight, Target, Users
} from 'lucide-react';
import Footer from '@/components/landing/Footer';

const resourceCategories = [
  {
    title: 'Student Resources',
    icon: BookOpen,
    color: '#0066CC',
    resources: [
      {
        title: 'Study Abroad Guide',
        description: 'A complete step-by-step overview of the study abroad journey, covering course selection, applications, English tests, visas, and pre-departure preparation.',
        icon: Map,
        links: ['StudyInUK', 'StudyInCanada', 'StudyInUSA', 'StudyInAustralia']
      },
      {
        title: 'Course & University Research',
        description: 'Insights into popular courses, global universities, rankings, intakes, tuition fees, and entry criteria.',
        icon: GraduationCap,
        links: ['Universities', 'Courses']
      },
      {
        title: 'Entry Requirements',
        description: 'Detailed academic and English language requirements based on country, university, and study level.',
        icon: FileText,
        links: ['LanguagePrep']
      },
      {
        title: 'English Language Tests',
        description: 'Guides for IELTS, IELTS UKVI, PTE Academic, Duolingo English Test, TOEFL iBT, OET, and other accepted exams. Includes test format, scoring, duration, costs, and acceptance.',
        icon: Target,
        links: ['LanguagePrep', 'IELTSPrep', 'PTEPrep']
      },
      {
        title: 'Scholarship Information',
        description: 'Information on scholarships, bursaries, tuition discounts, and financial support options offered by universities and partner institutions.',
        icon: Award,
        links: ['ScholarshipFinder']
      },
      {
        title: 'Visa Requirements',
        description: 'Country-specific student visa requirements, documentation checklists, financial guidelines, and visa application steps.',
        icon: Shield,
        links: ['StudyInUK', 'StudyInCanada', 'StudyInUSA', 'StudyInAustralia']
      },
      {
        title: 'SOP & Document Guidance',
        description: 'Resources for preparing Statements of Purpose (SOP), CVs, reference letters, and other essential documents.',
        icon: FileSignature,
        links: []
      },
      {
        title: 'Application Timeline',
        description: 'Recommended timelines for English tests, university applications, visa submission, and departure planning.',
        icon: Calendar,
        links: []
      }
    ]
  },
  {
    title: 'Country Guides',
    icon: Globe,
    color: '#F37021',
    resources: [
      {
        title: 'Study in the UK',
        description: 'University options, course structure, English requirements, tuition fees, scholarships, and visa process.',
        icon: Globe,
        links: ['StudyInUK']
      },
      {
        title: 'Study in Australia',
        description: 'Popular universities, course pathways, English requirements, cost of study, and visa guidelines.',
        icon: Globe,
        links: ['StudyInAustralia']
      },
      {
        title: 'Study in Canada',
        description: 'Study options, English requirements, SDS & non-SDS visa pathways, and cost overview.',
        icon: Globe,
        links: ['StudyInCanada']
      },
      {
        title: 'Study in the USA',
        description: 'University admissions, TOEFL & academic tests, scholarships, and visa overview.',
        icon: Globe,
        links: ['StudyInUSA']
      },
      {
        title: 'Study in Europe',
        description: 'English-taught programs, tuition structure, and visa basics across European countries.',
        icon: Globe,
        links: []
      }
    ]
  },
  {
    title: 'Test Preparation Resources',
    icon: Target,
    color: '#10B981',
    resources: [
      {
        title: 'IELTS Resources',
        description: 'Preparation tips, score requirements, test format, and university acceptance.',
        icon: BookOpen,
        links: ['IELTSPrep', 'LanguagePrep']
      },
      {
        title: 'PTE Resources',
        description: 'PTE exam format, scoring strategy, and preparation guidance.',
        icon: BookOpen,
        links: ['PTEPrep', 'LanguagePrep']
      },
      {
        title: 'Duolingo Test Guide',
        description: 'Test overview, acceptance criteria, and preparation advice.',
        icon: BookOpen,
        links: ['LanguagePrep']
      },
      {
        title: 'TOEFL Guide',
        description: 'Information on TOEFL iBT structure, scoring, and acceptance.',
        icon: BookOpen,
        links: ['LanguagePrep']
      },
      {
        title: 'Academic Tests (GRE, GMAT, SAT, ACT)',
        description: 'Overview of aptitude tests required for undergraduate and postgraduate admissions.',
        icon: BookOpen,
        links: ['LanguagePrep']
      }
    ]
  },
  {
    title: 'Visa & Compliance Resources',
    icon: Shield,
    color: '#8B5CF6',
    resources: [
      {
        title: 'Student Visa FAQs',
        description: 'Common visa-related questions and answers based on destination.',
        icon: MessageSquare,
        links: []
      },
      {
        title: 'Financial Requirement Guidance',
        description: 'Information on bank statements, sponsorship, tuition deposits, and proof of funds.',
        icon: DollarSign,
        links: []
      },
      {
        title: 'Credibility Interview Preparation',
        description: 'Guidance for interviews and compliance checks (where applicable).',
        icon: Users,
        links: []
      },
      {
        title: 'Visa Refusal Prevention',
        description: 'Key reasons for refusals and how to avoid common mistakes.',
        icon: Shield,
        links: []
      }
    ]
  },
  {
    title: 'Student Success & Insights',
    icon: Award,
    color: '#F59E0B',
    resources: [
      {
        title: 'Visa Success Stories',
        description: 'Real student journeys highlighting English test results, admissions, and visa approvals.',
        icon: CheckCircle,
        links: ['TestimonialsPage']
      },
      {
        title: 'Student Reviews & Testimonials',
        description: 'Feedback and experiences from students supported by ALO Education.',
        icon: Users,
        links: ['TestimonialsPage']
      }
    ]
  }
];

export default function Resources() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="relative h-[400px] flex items-center justify-center overflow-hidden bg-gradient-to-br from-education-blue to-alo-orange">
        <div className="relative z-10 text-center text-white px-4 max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Resources</h1>
          <p className="text-xl md:text-2xl mb-6">
            Your complete guide to studying abroad
          </p>
          <p className="text-lg">
            From planning and preparation to visa approval and departure
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Introduction */}
        <section className="mb-16 text-center max-w-3xl mx-auto">
          <p className="text-lg text-gray-700">
            ALO Education's Resources section is designed to help students make informed decisions, 
            understand requirements, and prepare confidently for international education.
          </p>
        </section>

        {/* Resource Categories */}
        <div className="space-y-16">
          {resourceCategories.map((category, catIndex) => {
            const CategoryIcon = category.icon;
            return (
              <section key={catIndex}>
                <div className="flex items-center gap-3 mb-8">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: category.color + '20' }}
                  >
                    <CategoryIcon className="w-6 h-6" style={{ color: category.color }} />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">{category.title}</h2>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {category.resources.map((resource, resIndex) => {
                    const ResourceIcon = resource.icon;
                    const primaryLink = resource.links?.[0];

                    return (
                      <Card 
                        key={resIndex} 
                        className="border-2 hover:shadow-xl transition-all group"
                        style={{ borderColor: category.color }}
                      >
                        <CardHeader>
                          <div className="flex items-start gap-3">
                            <div 
                              className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                              style={{ backgroundColor: category.color + '20' }}
                            >
                              <ResourceIcon className="w-5 h-5" style={{ color: category.color }} />
                            </div>
                            <CardTitle className="text-lg" style={{ color: category.color }}>
                              {resource.title}
                            </CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <p className="text-sm text-gray-600 min-h-[4rem]">
                            {resource.description}
                          </p>

                          {resource.links && resource.links.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-xs font-semibold text-gray-500 uppercase">Quick Links:</p>
                              <div className="flex flex-wrap gap-2">
                                {resource.links.slice(0, 3).map((link, linkIndex) => (
                                  <Link key={linkIndex} to={createPageUrl(link)}>
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      className="text-xs"
                                      style={{ borderColor: category.color, color: category.color }}
                                    >
                                      {link.replace(/([A-Z])/g, ' $1').trim()}
                                      <ArrowRight className="w-3 h-3 ml-1" />
                                    </Button>
                                  </Link>
                                ))}
                              </div>
                            </div>
                          )}

                          {primaryLink && (
                            <Link to={createPageUrl(primaryLink)}>
                              <Button 
                                className="w-full group-hover:gap-3 transition-all"
                                style={{ backgroundColor: category.color }}
                              >
                                Explore More
                                <ArrowRight className="w-4 h-4 ml-2" />
                              </Button>
                            </Link>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>

        {/* Tools & Downloads */}
        <section className="mt-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-cyan-100 flex items-center justify-center">
              <FileText className="w-6 h-6 text-cyan-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Tools & Downloads</h2>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { title: 'Study Cost Calculator', link: null },
              { title: 'Intake Planning Tool', link: null },
              { title: 'Document Checklist', link: null },
              { title: 'English Test Comparison', link: 'LanguagePrep' }
            ].map((tool, index) => (
              <Card key={index} className="border-2 border-cyan-600 hover:shadow-lg transition-all">
                <CardContent className="p-6 text-center">
                  <FileText className="w-10 h-10 text-cyan-600 mx-auto mb-3" />
                  <h3 className="font-bold text-gray-900 mb-2">{tool.title}</h3>
                  {tool.link ? (
                    <Link to={createPageUrl(tool.link)}>
                      <Button variant="outline" size="sm" className="border-cyan-600 text-cyan-600">
                        Access Tool
                      </Button>
                    </Link>
                  ) : (
                    <Button variant="outline" size="sm" disabled>
                      Coming Soon
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mt-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-purple-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">FAQ & Help</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              { title: 'Admission FAQs', icon: GraduationCap, color: '#0066CC' },
              { title: 'Language Test FAQs', icon: Target, color: '#F37021' },
              { title: 'Visa FAQs', icon: Shield, color: '#10B981' },
              { title: 'Pre-departure FAQs', icon: Map, color: '#8B5CF6' }
            ].map((faq, index) => {
              const FaqIcon = faq.icon;
              return (
                <Card key={index} className="border-2 hover:shadow-lg transition-all" style={{ borderColor: faq.color }}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: faq.color + '20' }}>
                        <FaqIcon className="w-5 h-5" style={{ color: faq.color }} />
                      </div>
                      <h3 className="font-bold text-lg" style={{ color: faq.color }}>{faq.title}</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Get answers to common questions about {faq.title.toLowerCase()}.
                    </p>
                    <Link to={createPageUrl('Contact')}>
                      <Button variant="outline" size="sm" style={{ borderColor: faq.color, color: faq.color }}>
                        View FAQs
                        <ArrowRight className="w-3 h-3 ml-2" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* CTA */}
        <section className="mt-16 bg-gradient-to-r from-education-blue to-alo-orange rounded-2xl p-12 text-center text-white">
          <MessageSquare className="w-16 h-16 mx-auto mb-6 opacity-90" />
          <h2 className="text-4xl font-bold mb-4">Not sure which resource applies to you?</h2>
          <p className="text-xl mb-8 opacity-90">
            Our expert counselors will guide you through every step
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to={createPageUrl('Contact')}>
              <Button size="lg" className="bg-white text-education-blue hover:bg-white/90">
                Book Free Counselling
              </Button>
            </Link>
            <Link to={createPageUrl('StudentPortal')}>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/20">
                Student Portal
              </Button>
            </Link>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}