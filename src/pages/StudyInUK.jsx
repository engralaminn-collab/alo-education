import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  GraduationCap, DollarSign, BookOpen, Calendar, 
  TrendingUp, ArrowRight, CheckCircle, Building2, MapPin
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import Footer from '@/components/landing/Footer';

export default function StudyInUK() {
  const { data: universities = [] } = useQuery({
    queryKey: ['uk-universities'],
    queryFn: async () => {
      const all = await base44.entities.University.filter({ country: 'United Kingdom' }, 'ranking');
      return all;
    }
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['uk-courses'],
    queryFn: async () => {
      const all = await base44.entities.Course.filter({ country: 'United Kingdom' });
      return all.slice(0, 8);
    }
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

  const regions = ['England', 'Scotland', 'Wales', 'Northern Ireland'];
  const popularCities = ['London', 'Manchester', 'Birmingham', 'Leeds', 'Edinburgh', 'Glasgow', 'Cardiff', 'Belfast'];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-900 to-blue-700 py-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-5xl mx-auto text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Unlock a world-class education in the United Kingdom
            </h1>
            <p className="text-xl text-blue-100 mb-4 leading-relaxed">
              with expert guidance from ALO Education Bangladesh
            </p>
            <p className="text-lg text-blue-200 mb-8 max-w-4xl mx-auto">
              The UK is home to top-ranked universities, globally recognised degrees, and excellent career opportunities for international students. From choosing the right course to securing your visa, our smart student portal and CRM-powered counselling system support you at every stage.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to={createPageUrl('Contact')}>
                <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white">
                  Book Free Counselling
                </Button>
              </Link>
              <Link to={createPageUrl('Contact')}>
                <Button size="lg" className="bg-white text-blue-900 hover:bg-blue-50">
                  Apply Online
                </Button>
              </Link>
              <Link to={createPageUrl('StudentPortal')}>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  Student Login
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Quick Navigation */}
      <section className="bg-white border-b">
        <div className="container mx-auto px-6 py-8">
          <h2 className="text-sm font-semibold text-slate-500 mb-4">Quick Navigation</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold text-slate-900 mb-3">Regions</h3>
              <div className="space-y-2">
                {regions.map(region => (
                  <Link key={region} to={createPageUrl('Universities') + `?country=United Kingdom`}>
                    <div className="text-blue-600 hover:text-blue-700 text-sm">{region}</div>
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-3">Popular Cities</h3>
              <div className="grid grid-cols-2 gap-2">
                {popularCities.slice(0, 4).map(city => (
                  <Link key={city} to={createPageUrl('Universities') + `?city=${city}`}>
                    <div className="text-blue-600 hover:text-blue-700 text-sm">{city}</div>
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-3">Resources</h3>
              <div className="space-y-2">
                <Link to={createPageUrl('Universities') + '?country=United Kingdom'}>
                  <div className="text-blue-600 hover:text-blue-700 text-sm">All Universities</div>
                </Link>
                <Link to={createPageUrl('Courses') + '?country=United Kingdom'}>
                  <div className="text-blue-600 hover:text-blue-700 text-sm">All Courses</div>
                </Link>
                <Link to={createPageUrl('Contact')}>
                  <div className="text-blue-600 hover:text-blue-700 text-sm">Apply Now</div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Bangladeshi Students Choose UK */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Why Bangladeshi Students Choose the UK
          </h2>
          <p className="text-lg text-slate-600 mb-8 max-w-4xl">
            Studying in the UK from Bangladesh gives you access to over 160 world-class universities, innovative teaching, and strong graduate employability. UK degrees are shorter and more cost-effective compared to many other countries, allowing students to enter the workforce faster.
          </p>
          
          <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-lg mb-8">
            <h3 className="font-bold text-blue-900 mb-4">Key Benefits:</h3>
            <ul className="grid md:grid-cols-2 gap-3">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <span className="text-slate-700">3-year undergraduate and 1-year master's programs</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <span className="text-slate-700">2-year post-study work visa (Graduate Route)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <span className="text-slate-700">Scholarships for Bangladeshi students</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <span className="text-slate-700">High academic reputation</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <span className="text-slate-700">Multicultural student environment</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Smart Student Portal */}
      <section className="bg-slate-50 py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Our Smart Student Portal for UK Applicants
          </h2>
          <p className="text-lg text-slate-600 mb-8">
            ALO Education provides Bangladeshi students with a digital application experience that most consultancies don't offer.
          </p>
          
          <div className="grid md:grid-cols-3 gap-4">
            {[
              'Online application dashboard',
              'Live application status tracking',
              'Document upload & verification',
              'IELTS waiver checker',
              'Offer letter timeline',
              'CAS progress tracker',
              'Visa checklist & reminders',
              'WhatsApp, SMS & email alerts',
              'Pre-departure training module'
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3 bg-white p-4 rounded-lg shadow-sm">
                <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <span className="text-slate-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cost, Visa & Work */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-slate-900 mb-8">
            Cost, Visa & Work in the UK
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6 text-center">
                <DollarSign className="w-10 h-10 text-blue-600 mx-auto mb-3" />
                <h3 className="font-bold text-slate-900 mb-2">Tuition Fees</h3>
                <p className="text-lg font-semibold text-blue-600">£11,000 – £38,000</p>
                <p className="text-sm text-slate-500">per year</p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6 text-center">
                <DollarSign className="w-10 h-10 text-emerald-600 mx-auto mb-3" />
                <h3 className="font-bold text-slate-900 mb-2">Living Cost</h3>
                <p className="text-lg font-semibold text-emerald-600">£9,000 – £12,000</p>
                <p className="text-sm text-slate-500">per year</p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6 text-center">
                <Clock className="w-10 h-10 text-purple-600 mx-auto mb-3" />
                <h3 className="font-bold text-slate-900 mb-2">Work Rights</h3>
                <p className="text-lg font-semibold text-purple-600">20 hours/week</p>
                <p className="text-sm text-slate-500">during term</p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6 text-center">
                <GraduationCap className="w-10 h-10 text-amber-600 mx-auto mb-3" />
                <h3 className="font-bold text-slate-900 mb-2">Post Study Work</h3>
                <p className="text-lg font-semibold text-amber-600">2 years</p>
                <p className="text-sm text-slate-500">after graduation</p>
              </CardContent>
            </Card>
          </div>
          
          <p className="text-center text-slate-600 mt-6">
            Our CRM system automatically guides students through each visa stage with alerts and counselor follow-ups.
          </p>
        </div>
      </section>

      {/* All UK Universities */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-blue-600 flex items-center gap-3">
              <span className="text-2xl">🇬🇧</span> All UK Universities
            </h2>
            <Link to={createPageUrl('Universities') + '?country=United Kingdom'}>
              <Button variant="outline" className="text-blue-600 border-blue-600 hover:bg-blue-50">
                View All Universities
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {universities.slice(0, 8).map(uni => (
              <Card key={uni.id} className="border-2 border-blue-200 hover:border-blue-400 transition-all overflow-hidden">
                <div className="h-40 overflow-hidden">
                  <img 
                    src={uni.cover_image || 'https://images.unsplash.com/photo-1562774053-701939374585?w=800'} 
                    alt={uni.university_name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-5">
                  <h3 className="font-bold text-orange-600 mb-3 text-lg min-h-[3.5rem]">
                    {uni.university_name}
                  </h3>
                  <div className="space-y-2 text-sm text-slate-600 mb-4">
                    <p className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      {uni.city}
                    </p>
                    {uni.ranking && (
                      <p><span className="font-medium">Ranking:</span> #{uni.ranking}</p>
                    )}
                    <p><span className="font-medium">Next intake:</span> {uni.intakes || 'September, January'}</p>
                  </div>
                  <Link to={createPageUrl('UniversityDetails') + `?id=${uni.id}`}>
                    <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white">
                      Learn More
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Courses */}
      <section className="bg-slate-50 py-16">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-blue-600">Popular Courses in UK</h2>
            <Link to={createPageUrl('Courses') + '?country=United Kingdom'}>
              <Button variant="outline" className="text-blue-600 border-blue-600 hover:bg-blue-50">
                View All Courses
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {courses.map(course => (
              <Card key={course.id} className="border-2 border-blue-200 hover:border-blue-400 transition-all h-full">
                <CardContent className="p-5">
                  <h3 className="font-bold text-orange-600 mb-3 text-lg">
                    {course.course_title}
                  </h3>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge className="bg-blue-600 text-white capitalize">{course.level}</Badge>
                    <Badge variant="outline" className="capitalize">{course.subject_area}</Badge>
                  </div>
                  <div className="space-y-2 text-sm text-slate-600 mb-4">
                    <p><span className="font-medium">Duration:</span> {course.duration || '1-3 years'}</p>
                    {course.tuition_fee_min && (
                      <p className="font-semibold text-blue-600">
                        From £{course.tuition_fee_min.toLocaleString()}/year
                      </p>
                    )}
                  </div>
                  <Link to={createPageUrl('CourseDetails') + `?id=${course.id}`}>
                    <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white">
                      Learn More
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <div className="container mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Tuition Fees */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-6 h-6 text-blue-600" />
                Tuition Fees (International)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-xl">
                <h4 className="font-semibold text-blue-900 mb-2">Undergraduate</h4>
                <p className="text-2xl font-bold text-blue-600">£11,400 – £38,000</p>
                <p className="text-sm text-blue-700">per year (varies by university & subject)</p>
              </div>
              <p className="text-sm text-slate-600">
                Your course pages will show exact fees where available.
              </p>
            </CardContent>
          </Card>

          {/* Entry Requirements */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-emerald-600" />
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

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Intakes */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-6 h-6 text-purple-600" />
                Intakes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="font-medium">January</span>
                  <Badge variant="outline">Limited courses</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <span className="font-medium">September</span>
                  <Badge className="bg-purple-600 text-white">Main Intake</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Popular Subjects */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-amber-600" />
                Popular Subjects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {popularSubjects.map(subject => (
                  <Badge key={subject} className="bg-amber-100 text-amber-700 hover:bg-amber-200">
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
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                  <span className="text-sm font-medium">{service}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <Card className="border-0 shadow-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <CardContent className="p-12 text-center">
            <h3 className="text-3xl font-bold mb-4">Ready to Start Your UK Journey?</h3>
            <p className="text-xl text-blue-100 mb-8">
              Get personalised guidance from certified counsellors in Bangladesh
            </p>
            <Link to={createPageUrl('Contact')}>
              <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white text-lg px-8 py-6">
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