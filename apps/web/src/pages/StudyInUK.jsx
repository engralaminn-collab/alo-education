import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  GraduationCap, DollarSign, BookOpen, Calendar, 
  TrendingUp, ArrowRight, CheckCircle, MapPin, Trophy, Award
} from 'lucide-react';
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
    queryFn: () => base44.entities.University.filter({ country: 'United Kingdom', status: 'active' }, '-ranking', 8),
  });

  const { data: allUKUniversitiesData = [] } = useQuery({
    queryKey: ['all-uk-universities'],
    queryFn: () => base44.entities.University.filter({ country: 'United Kingdom', status: 'active' }, '-ranking', 200),
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['uk-courses'],
    queryFn: () => base44.entities.Course.filter({ country: 'United Kingdom', status: 'open' }, '-created_date', 8),
  });

  const popularSubjects = [
    'Business', 'Computing', 'Data Science/AI', 'Engineering', 
    'Public Health', 'Nursing', 'Law', 'Finance'
  ];

  const { data: courses2 = [] } = useQuery({
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

  const regions = [
    { name: 'England', link: 'Universities?country=United Kingdom&region=England' },
    { name: 'Scotland', link: 'Universities?country=United Kingdom&region=Scotland' },
    { name: 'Wales', link: 'Universities?country=United Kingdom&region=Wales' },
    { name: 'Northern Ireland', link: 'Universities?country=United Kingdom&region=Northern Ireland' },
  ];

  const cities = [
    'London', 'Manchester', 'Birmingham', 'Leeds', 
    'Edinburgh', 'Glasgow', 'Cardiff', 'Belfast'
  ];

  const allUKUniversities = [
    'Aberystwyth University', 'Anglia Ruskin University', 'Arts University Bournemouth', 'Aston University',
    'Bangor University', 'Bath Spa University', 'University of Bath', 'University of Bedfordshire',
    'Birkbeck, University of London', 'Birmingham City University', 'University of Birmingham', 'University of Bolton',
    'Bournemouth University', 'University of Bradford', 'Brunel University London', 'University of Buckingham',
    'Canterbury Christ Church University', 'Cardiff Metropolitan University', 'Cardiff University', 'University of Central Lancashire (UCLan)',
    'University of Chester', 'University of Chichester', 'City, University of London', 'Coventry University',
    'Cranfield University', 'University of Creative Arts', 'De Montfort University', 'University of Derby',
    'University of Dundee', 'Durham University', 'University of East Anglia', 'University of East London',
    'Edge Hill University', 'University of Edinburgh', 'Edinburgh Napier University', 'University of Essex',
    'University of Exeter', 'University of the Arts London', 'University of Glasgow', 'Glasgow Caledonian University',
    'University of Gloucestershire', 'University of Greenwich', 'Harper Adams University', 'University of Hertfordshire',
    'Heriot-Watt University', 'University of the Highlands and Islands', 'University of Huddersfield', 'University of Hull',
    'Imperial College London', 'University of Kent', "King's College London", 'Kingston University London',
    'Lancaster University', 'University of Leeds', 'Leeds Arts University', 'Leeds Beckett University',
    'University of Leicester', 'University of Lincoln', 'University of Liverpool', 'Liverpool Hope University',
    'Liverpool John Moores University', 'London Metropolitan University', 'London South Bank University', 'Loughborough University',
    'University of Manchester', 'Manchester Metropolitan University', 'Middlesex University', 'University of Newcastle',
    'Newman University', 'University of Northampton', 'Northumbria University', 'Norwich University of the Arts',
    'University of Nottingham', 'Nottingham Trent University', 'The Open University', 'University of Oxford',
    'Oxford Brookes University', 'University of Plymouth', 'University of Portsmouth', 'Queen Margaret University',
    'Queen Mary University of London', "Queen's University Belfast", 'University of Reading', 'Robert Gordon University',
    'Roehampton University', 'Royal Holloway, University of London', 'University of the West of England (UWE Bristol)', 'University of Salford',
    'University of Sheffield', 'Sheffield Hallam University', 'University of South Wales', 'University of Southampton',
    'University of St Andrews', "St Mary's University, Twickenham", 'University of Stirling', 'University of Strathclyde',
    'University of Suffolk', 'University of Sunderland', 'University of Surrey', 'University of Sussex',
    'Swansea University', 'Teesside University', 'University of the West of Scotland', 'Ulster University',
    'University of Wales Trinity Saint David', 'University of Warwick', 'University of Westminster', 'University of Winchester',
    'University of Wolverhampton', 'University of Worcester', 'University of York', 'York St John University'
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero with Background */}
      <section 
        className="relative py-32 bg-cover bg-center"
        style={{
          backgroundImage: 'linear-gradient(rgba(0, 40, 80, 0.85), rgba(0, 40, 80, 0.85)), url(https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1600)',
        }}
      >
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl text-white"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Unlock a world-class education in the UK with expert guidance
            </h1>
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              The UK is home to world-class universities, strong career prospects, and a welcoming community. At ALO Education, we'll guide you every step of the way to studying in the UK– from choosing the right course to building a standout application. You're in good hands.
            </p>
            <Link to={createPageUrl('Contact')}>
              <Button size="lg" style={{ backgroundColor: '#F37021', color: '#000000' }} className="font-bold text-lg px-8 py-6">
                Book free counselling
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-12 bg-gradient-to-b from-slate-900 to-slate-800">
        <div className="container mx-auto px-6">
          <div className="flex flex-wrap gap-4 justify-center items-center">
            <Link to={createPageUrl('Courses') + '?country=United Kingdom'}>
              <Button size="lg" variant="outline" className="bg-white text-slate-900 border-2 hover:bg-slate-100">
                COURSES
              </Button>
            </Link>
            <Link to={createPageUrl('Universities') + '?country=United Kingdom'}>
              <Button size="lg" variant="outline" className="bg-transparent text-white border-2 border-white hover:bg-white/10">
                UNIVERSITIES
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-6 py-16">
        {/* Quick Navigation */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6" style={{ color: '#0066CC' }}>Quick Navigation</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <h3 className="font-semibold mb-3 text-slate-900">Regions</h3>
              <div className="space-y-2">
                {regions.map(region => (
                  <Link key={region.name} to={createPageUrl(region.link)} className="block text-sm hover:text-[#F37021] transition-colors" style={{ color: '#0066CC' }}>
                    {region.name}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-3 text-slate-900">Popular Cities</h3>
              <div className="space-y-2">
                {cities.slice(0, 4).map(city => (
                  <Link key={city} to={createPageUrl('Universities') + `?country=United Kingdom&city=${city}`} className="block text-sm hover:text-[#F37021] transition-colors" style={{ color: '#0066CC' }}>
                    {city}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-3 text-slate-900">More Cities</h3>
              <div className="space-y-2">
                {cities.slice(4).map(city => (
                  <Link key={city} to={createPageUrl('Universities') + `?country=United Kingdom&city=${city}`} className="block text-sm hover:text-[#F37021] transition-colors" style={{ color: '#0066CC' }}>
                    {city}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-3 text-slate-900">Resources</h3>
              <div className="space-y-2">
                <Link to={createPageUrl('Universities') + '?country=United Kingdom'} className="block text-sm hover:text-[#F37021] transition-colors" style={{ color: '#0066CC' }}>All Universities</Link>
                <Link to={createPageUrl('Courses') + '?country=United Kingdom'} className="block text-sm hover:text-[#F37021] transition-colors" style={{ color: '#0066CC' }}>All Courses</Link>
                <Link to={createPageUrl('Contact')} className="block text-sm hover:text-[#F37021] transition-colors" style={{ color: '#0066CC' }}>Apply Now</Link>
              </div>
            </div>
          </div>
        </div>

        {/* Why Choose UK Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Why choose the UK<br />for your studies?
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
              <div>
                <img 
                  src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800" 
                  alt="Students studying" 
                  className="rounded-2xl shadow-2xl"
                />
              </div>
              <div>
                <h3 className="text-3xl font-bold mb-6">Top universities</h3>
                <p className="text-lg text-slate-700 leading-relaxed mb-4">
                  The UK is home to some of the world's most prestigious and historic universities, with over 160 higher education institutions offering a wealth of academic opportunities.
                </p>
                <p className="text-lg text-slate-700 leading-relaxed">
                  Studying in the UK means joining a tradition of academic distinction that has produced influential thinkers, leaders, and Nobel laureates. With a vast range of disciplines to explore, students benefit from rigorous academic standards and a truly international learning environment.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* World-class Universities */}
        <section className="py-16 bg-slate-50">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">World-class universities</h2>
              <p className="text-lg text-slate-600 max-w-3xl mx-auto">
                Explore UK universities popular among international students for their course options, student experience, and career prospects after graduation.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
              {universities.slice(0, 8).map(uni => (
                <Link key={uni.id} to={createPageUrl('UniversityDetailsPage') + `?id=${uni.id}`}>
                  <Card 
                    className="bg-white border-2 hover:shadow-xl transition-all h-full group"
                    style={{ borderColor: '#0066CC' }} 
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = '#F37021'} 
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = '#0066CC'}
                  >
                    <CardHeader className="text-center pb-3">
                      {uni.logo && (
                        <div className="w-20 h-20 mx-auto mb-3 flex items-center justify-center bg-white rounded-lg p-2">
                          <img src={uni.logo} alt={uni.university_name} className="w-full h-full object-contain" />
                        </div>
                      )}
                      <CardTitle className="text-lg leading-tight" style={{ color: '#F37021' }}>
                        {uni.university_name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      {uni.city && (
                        <div className="flex items-center gap-2 text-slate-600">
                          <MapPin className="w-4 h-4" style={{ color: '#0066CC' }} />
                          <span>{uni.city}</span>
                        </div>
                      )}
                      {(uni.ranking || uni.qs_ranking) && (
                        <div className="text-sm text-slate-600">
                          <span className="font-semibold">Ranking:</span> #{uni.ranking || uni.qs_ranking}
                        </div>
                      )}
                      {uni.intakes && (
                        <div className="text-sm text-slate-600">
                          <span className="font-semibold">Next intake:</span> {uni.intakes}
                        </div>
                      )}
                      <Button 
                        className="w-full mt-3 font-semibold" 
                        style={{ backgroundColor: '#F37021', color: '#000000' }}
                      >
                        Learn More
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            <div className="text-center">
              <Link to={createPageUrl('Universities') + '?country=United Kingdom'}>
                <Button size="lg" style={{ backgroundColor: '#0000FF', color: 'white' }} className="font-bold px-8">
                  View all universities
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Popular Courses */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold" style={{ color: '#0066CC' }}>Popular Courses in UK</h2>
            <Link to={createPageUrl('Courses') + '?country=United Kingdom'}>
              <Button variant="outline" style={{ borderColor: '#0066CC', color: '#0066CC' }}>
                View All Courses
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {courses.map(course => (
              <Link key={course.id} to={createPageUrl('CourseDetailsPage') + `?id=${course.id}`}>
                <Card 
                  className="bg-white border-2 hover:shadow-xl transition-all h-full group" 
                  style={{ borderColor: '#0066CC' }} 
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = '#F37021'} 
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = '#0066CC'}
                >
                  <CardHeader>
                    <CardTitle className="text-lg leading-tight" style={{ color: '#F37021' }}>
                      {course.course_title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Badge style={{ backgroundColor: '#0066CC', color: 'white' }}>{course.level}</Badge>
                      {course.subject_area && <Badge variant="outline">{course.subject_area}</Badge>}
                    </div>
                    {course.duration && (
                      <div className="text-slate-600">Duration: {course.duration}</div>
                    )}
                    {course.tuition_fee_min && (
                      <div className="text-slate-600 font-semibold">
                        From £{course.tuition_fee_min.toLocaleString()}/year
                      </div>
                    )}
                    <Button className="w-full mt-4 font-semibold" style={{ backgroundColor: '#F37021', color: '#000000' }}>
                      Learn More
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* All UK Universities List */}
        
        <section className="py-16 bg-white">
          <div className="container mx-auto px-6">
            <CountryUniversityGrid universities={universities} country="United Kingdom" />
          </div>
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