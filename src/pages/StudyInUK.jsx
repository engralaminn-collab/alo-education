import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  GraduationCap, DollarSign, BookOpen, Calendar, 
  TrendingUp, ArrowRight, CheckCircle, MapPin, Trophy
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import Footer from '@/components/landing/Footer';

export default function StudyInUK() {
  const { data: universities = [] } = useQuery({
    queryKey: ['uk-universities'],
    queryFn: () => base44.entities.University.filter({ country: 'United Kingdom', status: 'active' }, '-ranking', 8),
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['uk-courses'],
    queryFn: () => base44.entities.Course.filter({ country: 'United Kingdom', status: 'open' }, '-created_date', 8),
  });

  const popularSubjects = [
    'Business', 'Computing', 'Data Science/AI', 'Engineering', 
    'Public Health', 'Nursing', 'Law', 'Finance'
  ];

  const services = [
    'University selection',
    'Application',
    'Scholarship',
    'CAS support',
    'Interview prep',
    'Visa file',
    'Pre-departure'
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
      {/* Hero */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl"
          >
            <div className="flex items-center gap-4 mb-6">
              <img 
                src="https://flagcdn.com/w80/gb.png" 
                alt="UK Flag" 
                className="w-16 h-12 rounded-lg shadow-lg"
              />
              <h1 className="text-4xl md:text-5xl font-bold" style={{ color: '#0066CC' }}>
                Study in <span style={{ color: '#F37021' }}>the United Kingdom</span>
              </h1>
            </div>
            <p className="text-xl text-slate-700 mb-8">
              World-class universities, globally recognised degrees, and excellent career outcomes.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to={createPageUrl('Contact')}>
                <Button size="lg" style={{ backgroundColor: '#F37021', color: '#000000' }} className="font-bold">
                  <GraduationCap className="w-5 h-5 mr-2" />
                  Book Free Consultation
                </Button>
              </Link>
              <Link to={createPageUrl('Courses') + '?country=United Kingdom'}>
                <Button size="lg" variant="outline" style={{ borderColor: '#0066CC', color: '#0066CC' }}>
                  Find Courses
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </motion.div>
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

        {/* Featured Universities */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold" style={{ color: '#0066CC' }}>Featured UK Universities</h2>
            <Link to={createPageUrl('Universities') + '?country=United Kingdom'}>
              <Button variant="outline" style={{ borderColor: '#0066CC', color: '#0066CC' }}>
                View All Universities
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {universities.map(uni => (
              <Link key={uni.id} to={createPageUrl('UniversityDetailsPage') + `?id=${uni.id}`}>
                <Card className="bg-white border hover:shadow-xl transition-all h-full group" style={{ borderColor: '#0066CC' }} onMouseEnter={(e) => e.currentTarget.style.borderColor = '#F37021'} onMouseLeave={(e) => e.currentTarget.style.borderColor = '#0066CC'}>
                  <CardHeader className="text-center pb-4">
                    {uni.logo && (
                      <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center bg-slate-50 rounded-full p-2">
                        <img src={uni.logo} alt={uni.university_name} className="w-full h-full object-contain" />
                      </div>
                    )}
                    <CardTitle className="text-lg leading-tight" style={{ color: '#F37021' }}>
                      {uni.university_name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    {uni.city && (
                      <div className="flex items-center gap-2 text-slate-600">
                        <MapPin className="w-4 h-4" style={{ color: '#0066CC' }} />
                        <span>{uni.city}</span>
                      </div>
                    )}
                    {uni.ranking && (
                      <div className="flex items-center gap-2 text-slate-600">
                        <Trophy className="w-4 h-4" style={{ color: '#F37021' }} />
                        <span>Ranking: #{uni.ranking}</span>
                      </div>
                    )}
                    {uni.intakes && (
                      <div className="flex items-center gap-2 text-slate-600">
                        <Calendar className="w-4 h-4" style={{ color: '#0066CC' }} />
                        <span>{uni.intakes}</span>
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
                <Card className="bg-white border hover:shadow-xl transition-all h-full group" style={{ borderColor: '#0066CC' }} onMouseEnter={(e) => e.currentTarget.style.borderColor = '#F37021'} onMouseLeave={(e) => e.currentTarget.style.borderColor = '#0066CC'}>
                  <CardHeader>
                    <CardTitle className="text-lg leading-tight group-hover:text-[#F37021] transition-colors" style={{ color: '#F37021' }}>
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
                      Apply Now
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* All UK Universities List */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6" style={{ color: '#0066CC' }}>
            🇬🇧 All UK Universities (Recognised Degree-Awarding Bodies)
          </h2>
          <Card className="bg-white border-0 shadow-lg">
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3">
                {allUKUniversities.map((uni, index) => (
                  <Link 
                    key={index} 
                    to={createPageUrl('Universities') + `?search=${encodeURIComponent(uni)}`}
                    className="flex items-center gap-2 text-slate-700 hover:text-[#F37021] transition-colors"
                  >
                    <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: '#0066CC' }} />
                    <span className="text-sm">{uni}</span>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Entry Requirements & Fees */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-6 h-6" style={{ color: '#F37021' }} />
                Tuition Fees (International)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-xl">
                <h4 className="font-semibold text-slate-900 mb-2">Undergraduate</h4>
                <p className="text-2xl font-bold" style={{ color: '#0066CC' }}>£11,400 – £38,000</p>
                <p className="text-sm text-slate-600">per year (varies by university & subject)</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-6 h-6" style={{ color: '#F37021' }} />
                Entry Requirements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Undergraduate (UG)</h4>
                <ul className="space-y-2 text-slate-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5" />
                    <span>HSC/A-Level/Foundation accepted</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5" />
                    <span>IELTS usually 6.0–6.5 (or equivalent)</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Postgraduate (PG)</h4>
                <ul className="space-y-2 text-slate-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5" />
                    <span>Bachelor degree</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5" />
                    <span>IELTS usually 6.5–7.0 (or equivalent)</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Intakes & Popular Subjects */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-6 h-6" style={{ color: '#F37021' }} />
                Intakes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="font-medium">January</span>
                  <Badge variant="outline">Limited courses</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: '#0066CC20' }}>
                  <span className="font-medium">September</span>
                  <Badge style={{ backgroundColor: '#0066CC', color: 'white' }}>Main Intake</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-6 h-6" style={{ color: '#F37021' }} />
                Popular Subjects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {popularSubjects.map(subject => (
                  <Badge key={subject} className="hover:opacity-80 cursor-pointer" style={{ backgroundColor: '#F37021', color: '#000000' }}>
                    {subject}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Services */}
        <Card className="border-0 shadow-lg mb-12">
          <CardHeader>
            <CardTitle>Services for UK</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
              {services.map(service => (
                <div key={service} className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
                  <CheckCircle className="w-5 h-5" style={{ color: '#0066CC' }} />
                  <span className="text-sm font-medium">{service}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <Card className="border-0 shadow-xl text-white" style={{ backgroundColor: '#0066CC' }}>
          <CardContent className="p-12 text-center">
            <h3 className="text-3xl font-bold mb-4">Ready to Start Your UK Journey?</h3>
            <p className="mb-6 text-white/90 text-lg">
              Get personalized guidance from our expert counselors
            </p>
            <Link to={createPageUrl('Contact')}>
              <Button size="lg" style={{ backgroundColor: '#F37021', color: '#000000' }} className="font-bold">
                Book Free Consultation
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}