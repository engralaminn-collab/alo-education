import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MessageSquare, Phone, GraduationCap, TrendingUp, DollarSign, Briefcase, FileText, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import CountryUniversityGrid from '@/components/country/CountryUniversityGrid';
import CountryCourseGrid from '@/components/country/CountryCourseGrid';
import CountryIntakes from '@/components/country/CountryIntakes';
import CountryFAQ from '@/components/country/CountryFAQ';
import Footer from '@/components/landing/Footer';

export default function StudyInUK() {
  const { data: universities = [] } = useQuery({
    queryKey: ['uk-universities'],
    queryFn: () => base44.entities.University.filter({ country: 'United Kingdom', status: 'active' }),
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['uk-courses'],
    queryFn: () => base44.entities.Course.filter({ country: 'United Kingdom', status: 'open' }),
  });

  const { data: scholarships = [] } = useQuery({
    queryKey: ['uk-scholarships'],
    queryFn: () => base44.entities.Scholarship.filter({ country: 'United Kingdom', status: 'active' }),
  });

  const whyStudyPoints = [
    { icon: GraduationCap, title: 'World-Class Education', description: 'Home to prestigious universities like Oxford, Cambridge, and Imperial College' },
    { icon: TrendingUp, title: 'Global Recognition', description: 'UK degrees are recognized and respected worldwide' },
    { icon: Briefcase, title: 'Work Opportunities', description: 'Post-study work visa for 2-3 years after graduation' },
    { icon: Award, title: 'Research Excellence', description: 'Leading research institutions with cutting-edge facilities' }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="relative h-[500px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-education-blue via-alo-orange to-education-blue opacity-90" />
        <img 
          src="https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1600"
          alt="UK Universities"
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay"
        />
        <div className="relative z-10 text-center text-white px-4 max-w-4xl">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">Study in the United Kingdom</h1>
          <p className="text-xl md:text-2xl mb-8">Experience world-class education in the heart of Europe</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to={createPageUrl('Contact')}>
              <Button size="lg" className="bg-alo-orange hover:bg-alo-orange/90 text-white gap-2">
                <MessageSquare size={20} />
                Book Free Counselling
              </Button>
            </Link>
            <Link to={createPageUrl('Universities') + '?country=United Kingdom'}>
              <Button size="lg" variant="outline" className="bg-white/10 backdrop-blur-sm border-white text-white hover:bg-white hover:text-education-blue">
                Explore Universities
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-16 space-y-20">
        {/* Country Overview */}
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Why Study in the UK?</h2>
          <p className="text-lg text-gray-700 mb-8 leading-relaxed">
            The United Kingdom has been a beacon of academic excellence for centuries. With a rich history of innovation, 
            research, and teaching excellence, UK universities consistently rank among the world's best. From historic 
            institutions to modern campuses, the UK offers diverse opportunities for international students across all 
            disciplines. Experience a multicultural environment, improve your English, and gain a globally recognized degree.
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyStudyPoints.map((point, index) => (
              <Card key={index} className="border-2 hover:border-education-blue transition-all hover:shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-alo-orange/10 flex items-center justify-center">
                    <point.icon className="text-alo-orange" size={32} />
                  </div>
                  <h3 className="font-bold text-lg mb-2">{point.title}</h3>
                  <p className="text-sm text-gray-600">{point.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Education System */}
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">UK Education System</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-education-blue mb-3">Undergraduate (3-4 years)</h3>
                <p className="text-gray-600">Bachelor's degrees focusing on specialized study in your chosen field from day one.</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-education-blue mb-3">Postgraduate (1-2 years)</h3>
                <p className="text-gray-600">Master's programs offering intensive study and research opportunities in 12-24 months.</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-education-blue mb-3">PhD (3-4 years)</h3>
                <p className="text-gray-600">Doctoral research programs with world-leading supervision and facilities.</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Intakes */}
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">UK Intakes</h2>
          <CountryIntakes intakes={[
            { month: 'January', description: 'Spring intake - Limited programs, ideal for those who missed September' },
            { month: 'May', description: 'Summer intake - Very limited availability, mostly for specific courses' },
            { month: 'September', description: 'Main intake - Most programs start, widest choice available' }
          ]} />
        </section>

        {/* Popular Universities */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-900">Popular UK Universities</h2>
            <Link to={createPageUrl('Universities') + '?country=United Kingdom'}>
              <Button variant="outline" className="text-education-blue border-education-blue hover:bg-education-blue hover:text-white">
                View All Universities
              </Button>
            </Link>
          </div>
          <CountryUniversityGrid universities={universities} country="United Kingdom" />
        </section>

        {/* Cost of Study & Living */}
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Cost of Study & Living</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-2 border-alo-orange">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <DollarSign className="text-alo-orange" size={32} />
                  <h3 className="text-xl font-bold">Tuition Fees</h3>
                </div>
                <ul className="space-y-2 text-gray-700">
                  <li>• <strong>Undergraduate:</strong> £10,000 - £26,000/year</li>
                  <li>• <strong>Postgraduate:</strong> £11,000 - £32,000/year</li>
                  <li>• <strong>MBA:</strong> £15,000 - £60,000/year</li>
                </ul>
              </CardContent>
            </Card>
            <Card className="border-2 border-education-blue">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <DollarSign className="text-education-blue" size={32} />
                  <h3 className="text-xl font-bold">Living Costs</h3>
                </div>
                <ul className="space-y-2 text-gray-700">
                  <li>• <strong>Accommodation:</strong> £400 - £1,200/month</li>
                  <li>• <strong>Food & Groceries:</strong> £200 - £300/month</li>
                  <li>• <strong>Transport:</strong> £50 - £100/month</li>
                  <li>• <strong>Total Average:</strong> £800 - £1,500/month</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Work Opportunities */}
        <section className="bg-white rounded-2xl p-8 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <Briefcase className="text-alo-orange" size={40} />
            <h2 className="text-3xl font-bold text-gray-900">Work Opportunities</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-bold text-education-blue mb-3">During Studies</h3>
              <ul className="space-y-2 text-gray-700">
                <li>✓ Work up to 20 hours/week during term time</li>
                <li>✓ Full-time work during holidays</li>
                <li>✓ On-campus employment opportunities</li>
                <li>✓ Internship programs available</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold text-education-blue mb-3">Post-Study Work Visa</h3>
              <ul className="space-y-2 text-gray-700">
                <li>✓ 2 years for Bachelor's/Master's graduates</li>
                <li>✓ 3 years for PhD graduates</li>
                <li>✓ No job offer required</li>
                <li>✓ Path to permanent residency</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Visa Guidance */}
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">UK Student Visa Guide</h2>
          <Card className="bg-gradient-to-br from-education-blue/5 to-alo-orange/5 border-2">
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-bold text-education-blue mb-4 flex items-center gap-2">
                    <FileText size={24} />
                    Required Documents
                  </h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Valid passport</li>
                    <li>• CAS (Confirmation of Acceptance for Studies)</li>
                    <li>• Proof of financial funds</li>
                    <li>• English proficiency certificate</li>
                    <li>• Academic transcripts</li>
                    <li>• TB test certificate (if applicable)</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-education-blue mb-4">Process Timeline</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• <strong>Application:</strong> 3 weeks before travel</li>
                    <li>• <strong>Decision:</strong> 3 weeks (standard)</li>
                    <li>• <strong>Priority:</strong> 5 working days (extra fee)</li>
                    <li>• <strong>Super Priority:</strong> 24 hours (extra fee)</li>
                  </ul>
                  <div className="mt-6">
                    <Link to={createPageUrl('Contact')}>
                      <Button className="bg-alo-orange hover:bg-alo-orange/90 w-full">
                        Get Visa Assistance
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Popular Courses */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-900">Popular Courses in UK</h2>
            <Link to={createPageUrl('Courses') + '?country=United Kingdom'}>
              <Button variant="outline" className="text-education-blue border-education-blue hover:bg-education-blue hover:text-white">
                View All Courses
              </Button>
            </Link>
          </div>
          <CountryCourseGrid courses={courses} universities={universities} country="United Kingdom" />
        </section>

        {/* Scholarships */}
        <section className="bg-gradient-to-br from-alo-orange/10 to-education-blue/10 rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <Award className="text-alo-orange" size={40} />
            <h2 className="text-3xl font-bold text-gray-900">Scholarships & Financial Aid</h2>
          </div>
          <p className="text-lg text-gray-700 mb-6">
            Numerous scholarships are available for international students studying in the UK. From government-funded 
            schemes to university-specific awards, financial support can significantly reduce your study costs.
          </p>
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-4 text-center">
                <h4 className="font-bold text-education-blue mb-2">Chevening Scholarships</h4>
                <p className="text-sm text-gray-600">Full funding for outstanding students</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <h4 className="font-bold text-education-blue mb-2">Commonwealth Scholarships</h4>
                <p className="text-sm text-gray-600">For Commonwealth country students</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <h4 className="font-bold text-education-blue mb-2">University Scholarships</h4>
                <p className="text-sm text-gray-600">Merit & need-based awards</p>
              </CardContent>
            </Card>
          </div>
          <Link to={createPageUrl('ScholarshipFinder') + '?country=United Kingdom'}>
            <Button className="bg-education-blue hover:bg-education-blue/90 w-full md:w-auto">
              Find Scholarships
            </Button>
          </Link>
        </section>

        {/* FAQs */}
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
          <CountryFAQ faqs={[
            {
              question: 'What are the English language requirements?',
              answer: 'Most universities require IELTS 6.0-7.0 or equivalent (TOEFL, PTE). Some accept Duolingo. Requirements vary by program and level.'
            },
            {
              question: 'Can I bring my family on a student visa?',
              answer: 'Yes, if you\'re studying a postgraduate course for 9+ months at RQF level 7 or above, you can bring dependents.'
            },
            {
              question: 'How much money do I need to show for visa?',
              answer: 'You need to show 1 year tuition + 9 months living costs (£1,334/month in London, £1,023/month outside London).'
            },
            {
              question: 'Can I switch from tourist to student visa?',
              answer: 'No, you must apply for a student visa from your home country before traveling to the UK.'
            },
            {
              question: 'Are there work opportunities after graduation?',
              answer: 'Yes! The Graduate Route visa allows you to stay and work in the UK for 2-3 years after completing your degree.'
            }
          ]} />
        </section>

        {/* Sticky CTA */}
        <div className="fixed bottom-6 right-6 z-40 flex gap-3">
          <Link to={createPageUrl('Contact')}>
            <Button size="lg" className="bg-alo-orange hover:bg-alo-orange/90 text-white shadow-2xl gap-2">
              <MessageSquare size={20} />
              Book Free Counselling
            </Button>
          </Link>
        </div>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-education-blue to-alo-orange rounded-2xl p-12 text-center text-white">
          <h2 className="text-4xl font-bold mb-4">Ready to Start Your UK Journey?</h2>
          <p className="text-xl mb-8">Book a free consultation with our expert counselors today</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to={createPageUrl('Contact')}>
              <Button size="lg" className="bg-white text-education-blue hover:bg-white/90 gap-2">
                <MessageSquare size={20} />
                Book Free Counselling
              </Button>
            </Link>
            <a href="tel:+1234567890">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/20">
                <Phone size={20} className="mr-2" />
                Call Now
              </Button>
            </a>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}