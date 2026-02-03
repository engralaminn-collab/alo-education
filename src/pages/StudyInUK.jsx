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
            className="max-w-4xl"
          >
            <div className="flex items-center gap-4 mb-6">
              <img 
                src="https://flagcdn.com/w80/gb.png" 
                alt="UK Flag" 
                className="w-16 h-12 rounded-lg shadow-lg"
              />
              <h1 className="text-4xl md:text-5xl font-bold text-white">
                Study in the United Kingdom
              </h1>
            </div>
            <p className="text-xl text-blue-100 mb-4">
              The UK is home to world-class universities, strong career prospects, and a welcoming community. 
              We'll guide you every step of the way – from choosing the right course to building a standout application.
            </p>
            <p className="text-lg text-blue-200 mb-8">You're in good hands.</p>
            <div className="flex flex-wrap gap-4">
              <Link to={createPageUrl('Contact')}>
                <Button size="lg" className="bg-white text-blue-900 hover:bg-blue-50">
                  <GraduationCap className="w-5 h-5 mr-2" />
                  Book Free Counselling
                </Button>
              </Link>
              <Link to={createPageUrl('Courses') + '?country=uk'}>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  Find Courses
                  <ArrowRight className="w-5 h-5 ml-2" />
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

      {/* Why Choose UK */}
      <section className="bg-slate-50 py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Why choose the UK for your studies?
          </h2>
          <div className="grid lg:grid-cols-3 gap-8 mt-8">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <Building2 className="w-12 h-12 text-blue-600 mb-4" />
                <h3 className="text-xl font-bold mb-3">Top universities</h3>
                <p className="text-slate-600 mb-4">
                  The UK is home to some of the world's most prestigious and historic universities, 
                  with over 160 higher education institutions offering a wealth of academic opportunities.
                </p>
                <p className="text-sm text-slate-500">
                  Studying in the UK means joining a tradition of academic distinction that has produced 
                  influential thinkers, leaders, and Nobel laureates.
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <GraduationCap className="w-12 h-12 text-emerald-600 mb-4" />
                <h3 className="text-xl font-bold mb-3">World-class education</h3>
                <p className="text-slate-600">
                  With a vast range of disciplines to explore, students benefit from rigorous academic 
                  standards and a truly international learning environment.
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <TrendingUp className="w-12 h-12 text-purple-600 mb-4" />
                <h3 className="text-xl font-bold mb-3">Strong career prospects</h3>
                <p className="text-slate-600">
                  UK qualifications are recognized and respected worldwide, opening doors to excellent 
                  career opportunities globally.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Universities */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-slate-900 mb-3">World-class universities</h2>
          <p className="text-slate-600 mb-8">
            Explore UK universities popular among international students for their course options, 
            student experience, and career prospects after graduation.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {universities.slice(0, 8).map(uni => (
              <Link key={uni.id} to={createPageUrl('UniversityDetails') + `?id=${uni.id}`}>
                <Card className="border-0 shadow hover:shadow-lg transition-shadow h-full">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3 mb-3">
                      {uni.logo ? (
                        <img src={uni.logo} alt="" className="w-12 h-12 object-contain rounded" />
                      ) : (
                        <Building2 className="w-12 h-12 text-slate-300" />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-900 text-sm mb-1 line-clamp-2">
                          {uni.university_name}
                        </h3>
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {uni.city}
                        </p>
                      </div>
                    </div>
                    {uni.ranking && (
                      <Badge variant="outline" className="text-xs mb-2">
                        Ranking: #{uni.ranking}
                      </Badge>
                    )}
                    <p className="text-xs text-slate-600">Next intake: {uni.intakes || 'September'}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
          <div className="text-center">
            <Link to={createPageUrl('Universities') + '?country=United Kingdom'}>
              <Button variant="outline" size="lg">
                View all universities
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Popular Courses */}
      <section className="bg-slate-50 py-16">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-slate-900">Popular Courses in UK</h2>
            <Link to={createPageUrl('Courses') + '?country=United Kingdom'}>
              <Button variant="outline">View All Courses</Button>
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {courses.map(course => (
              <Link key={course.id} to={createPageUrl('CourseDetails') + `?id=${course.id}`}>
                <Card className="border-0 shadow hover:shadow-lg transition-shadow h-full">
                  <CardContent className="p-5">
                    <Badge className="mb-3">{course.level}</Badge>
                    <h3 className="font-semibold text-slate-900 mb-2 line-clamp-2">
                      {course.course_title}
                    </h3>
                    <p className="text-sm text-slate-600 mb-3">{course.subject_area}</p>
                    <div className="space-y-1 text-xs text-slate-500">
                      <p>Duration: {course.duration}</p>
                      {course.tuition_fee_min && (
                        <p className="font-semibold text-blue-600">
                          From £{course.tuition_fee_min.toLocaleString()}/year
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
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
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">Ready to Start Your UK Journey?</h3>
            <p className="text-blue-100 mb-6">
              Get personalized guidance from our expert counselors
            </p>
            <Link to={createPageUrl('Contact')}>
              <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                Book Free Counselling
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