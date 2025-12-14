import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  GraduationCap, DollarSign, BookOpen, Calendar, 
  TrendingUp, ArrowRight, CheckCircle, Search, Award, MapPin
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import Footer from '@/components/landing/Footer';

export default function StudyInUK() {
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

  const { data: ukUniversities = [] } = useQuery({
    queryKey: ['uk-universities'],
    queryFn: () => base44.entities.University.filter({ country: 'United Kingdom', status: 'active' }, '-ranking', 10),
  });

  const scholarships = [
    {
      title: 'St Leonards Masters Scholarship',
      university: 'University of St Andrews',
      year: 2026,
      description: 'Prestigious scholarship for outstanding master\'s students'
    },
    {
      title: 'Valerie Graeme Smith Scholarship in the Arts',
      university: 'University of St Andrews',
      year: 2026,
      description: 'Supporting excellence in arts and humanities'
    },
    {
      title: 'George McElveen III Scholarship',
      university: 'University of St Andrews',
      year: 2026,
      description: 'Merit-based financial support for international students'
    },
    {
      title: 'The USA Wardlaw Scholarship',
      university: 'University of St Andrews',
      year: 2026,
      description: 'Full tuition scholarship for American students'
    },
    {
      title: 'BA International Honours Scholarship for Excellence',
      university: 'University of St Andrews',
      year: 2026,
      description: 'Recognizing academic excellence in international studies'
    },
    {
      title: 'International Excellence Scholarship',
      university: 'University of St Andrews',
      year: 2026,
      description: 'Supporting top-performing international applicants'
    }
  ];

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
            <p className="text-xl text-blue-100 mb-8">
              World-class universities, globally recognised degrees, and excellent career outcomes.
            </p>
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

        {/* Universities Section */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-slate-900">Top UK Universities</h2>
            <Link to={createPageUrl('Universities') + '?country=united kingdom'}>
              <Button variant="outline">
                View All
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ukUniversities.slice(0, 6).map((uni, index) => (
              <motion.div
                key={uni.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link to={createPageUrl('UniversityDetails') + `?id=${uni.id}`}>
                  <Card className="border-0 shadow-lg hover:shadow-xl transition-all h-full group">
                    <div className="h-48 bg-gradient-to-br from-blue-600 to-blue-700 relative overflow-hidden">
                      {uni.cover_image ? (
                        <img src={uni.cover_image} alt={uni.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <GraduationCap className="w-16 h-16 text-white/30" />
                        </div>
                      )}
                      {uni.ranking && (
                        <Badge className="absolute top-4 right-4 bg-emerald-500 text-white border-0">
                          Rank #{uni.ranking}
                        </Badge>
                      )}
                    </div>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {uni.name}
                      </h3>
                      <div className="flex items-center gap-2 text-slate-500 mb-3">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">{uni.city}</span>
                      </div>
                      {uni.tuition_range_min && (
                        <div className="text-sm text-slate-600">
                          From ${uni.tuition_range_min.toLocaleString()}/year
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Scholarships Section */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Scholarships</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Explore scholarship opportunities at top UK universities
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {scholarships.map((scholarship, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border-2 border-slate-200 hover:border-blue-500 transition-all h-full">
                  <CardContent className="p-6">
                    <div className="text-xs font-semibold text-slate-500 mb-2">
                      {scholarship.university.toUpperCase()}
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">
                      {scholarship.title}
                    </h3>
                    <div className="text-sm text-slate-600 mb-4">
                      <div className="font-medium mb-1">Academic Year: {scholarship.year}</div>
                      <div>{scholarship.description}</div>
                    </div>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                      Learn More
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Resources Section */}
        <div className="mb-16 bg-slate-900 -mx-6 px-6 py-16 rounded-2xl">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">
            Helpful resources for international students
          </h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <Card className="border-0 bg-slate-800 text-white">
              <CardContent className="p-6">
                <div className="text-sm text-slate-400 mb-2">12 Dec 2025</div>
                <h3 className="text-xl font-bold mb-3">Why Study Economics in USA?</h3>
                <p className="text-slate-300 text-sm mb-4">
                  Economics degrees in the USA are designed well. Flexibility in mind, recognizing that students have unique interests and career aspirations.
                </p>
                <Button variant="outline" className="bg-emerald-600 text-white border-0 hover:bg-emerald-700">
                  Read more
                </Button>
              </CardContent>
            </Card>
            <Card className="border-0 bg-slate-800 text-white">
              <CardContent className="p-6">
                <div className="text-sm text-slate-400 mb-2">04 Dec 2025</div>
                <h3 className="text-xl font-bold mb-3">The Top 10 Scottish Universities 2026</h3>
                <p className="text-slate-300 text-sm mb-4">
                  Discover the best offer some of the highest rates of student satisfaction for teaching in the UK, and these top universities bring prestige.
                </p>
                <Button variant="outline" className="bg-emerald-600 text-white border-0 hover:bg-emerald-700">
                  Read more
                </Button>
              </CardContent>
            </Card>
            <Card className="border-0 bg-slate-800 text-white">
              <CardContent className="p-6">
                <div className="text-sm text-slate-400 mb-2">30 Nov 2025</div>
                <h3 className="text-xl font-bold mb-3">Why Does New Zealand Have High Student Satisfaction?</h3>
                <p className="text-slate-300 text-sm mb-4">
                  With its stunning landscapes, supportive communities, and innovative education system, New Zealand offers an experience like no other.
                </p>
                <Button variant="outline" className="bg-emerald-600 text-white border-0 hover:bg-emerald-700">
                  Read more
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

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