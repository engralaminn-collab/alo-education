import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  GraduationCap, DollarSign, BookOpen, Calendar, 
  TrendingUp, ArrowRight, CheckCircle, MapPin, Star
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import Footer from '@/components/landing/Footer';

export default function StudyInUK() {
  const [activeTab, setActiveTab] = React.useState('universities');

  const popularUniversities = [
    { name: 'University of Oxford', city: 'Oxford', ranking: 1, intake: 'September 2026' },
    { name: 'University of Cambridge', city: 'Cambridge', ranking: 2, intake: 'October 2026' },
    { name: 'Imperial College London', city: 'London', ranking: 6, intake: 'September 2026' },
    { name: 'University College London', city: 'London', ranking: 9, intake: 'September 2026' },
    { name: 'University of Edinburgh', city: 'Edinburgh', ranking: 22, intake: 'September 2026' },
    { name: 'University of Manchester', city: 'Manchester', ranking: 27, intake: 'September 2026' },
    { name: "King's College London", city: 'London', ranking: 35, intake: 'September 2026' },
    { name: 'University of Warwick', city: 'Coventry', ranking: 67, intake: 'September 2026' }
  ];

  const popularSubjects = [
    'Business', 'Computing', 'Data Science/AI', 'Engineering', 
    'Public Health', 'Nursing', 'Law', 'Finance'
  ];

  const services = [
    'Find the right university and courses',
    'Assess eligibility for your preferred courses',
    'Refine your application documents',
    'Find accommodation and prepare for life in the UK'
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section 
        className="relative py-32 bg-cover bg-center"
        style={{ 
          backgroundImage: 'url(https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1920)',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0, 102, 204, 0.85)' }}></div>
        <div className="relative container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Unlock a world-class education in the UK with expert guidance
            </h1>
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              The UK is home to world-class universities, strong career prospects, and a welcoming community. At ALO Education, we'll guide you every step of the way to studying in the UK– from choosing the right course to building a standout application. You're in good hands.
            </p>
            <Link to={createPageUrl('Contact')}>
              <Button 
                size="lg" 
                className="text-white h-14 px-8 text-lg rounded-lg" 
                style={{ backgroundColor: '#F37021' }}
              >
                Book free counselling
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Why Choose UK */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <Tabs defaultValue="universities" className="w-full">
            <div className="flex justify-center mb-12">
              <TabsList className="bg-slate-100 p-1">
                <TabsTrigger value="universities" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white px-6">
                  Top universities
                </TabsTrigger>
                <TabsTrigger value="campus" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white px-6">
                  Campus and community
                </TabsTrigger>
                <TabsTrigger value="life" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white px-6">
                  Life in the UK
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="universities">
              <div className="max-w-6xl mx-auto">
                <div className="grid md:grid-cols-2 gap-8 items-center mb-12">
                  <img
                    src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600"
                    alt="Students"
                    className="rounded-2xl w-full"
                  />
                  <div>
                    <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--alo-blue)' }}>Top universities</h2>
                    <p className="text-slate-700 leading-relaxed">
                      The UK is home to some of the world's most prestigious and historic universities, with over 160 higher education institutions offering a wealth of academic opportunities. Many are consistently ranked among the best globally, recognised for their research, teaching excellence, and strong industry connections.
                    </p>
                    <p className="text-slate-700 leading-relaxed mt-4">
                      Studying in the UK means joining a tradition of academic distinction that has produced influential thinkers, leaders, and Nobel laureates.
                    </p>
                  </div>
                </div>

                {/* Popular Universities Grid */}
                <div className="mb-12">
                  <h3 className="text-2xl font-bold mb-8 text-center" style={{ color: 'var(--alo-blue)' }}>
                    Popular Universities in the UK
                  </h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {popularUniversities.map((uni, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                      >
                        <Card className="h-full border-2 transition-all duration-300 hover:shadow-lg group" 
                          style={{ borderColor: 'var(--alo-blue)' }}
                          onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--alo-orange)'}
                          onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--alo-blue)'}
                        >
                          <CardContent className="p-6 flex flex-col h-full">
                            <h4 className="font-bold text-lg mb-3 min-h-[3.5rem]" style={{ color: 'var(--alo-orange)' }}>
                              {uni.name}
                            </h4>
                            <div className="space-y-2 mb-4 flex-grow">
                              <div className="flex items-center gap-2 text-sm text-slate-600">
                                <MapPin className="w-4 h-4" style={{ color: 'var(--alo-blue)' }} />
                                <span>{uni.city}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Star className="w-4 h-4 text-amber-500" />
                                <span className="font-semibold" style={{ color: 'var(--alo-blue)' }}>
                                  World Rank #{uni.ranking}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-slate-600">
                                <Calendar className="w-4 h-4" style={{ color: 'var(--alo-blue)' }} />
                                <span>Next Intake: {uni.intake}</span>
                              </div>
                            </div>
                            <Link to={createPageUrl('Universities') + '?search=' + encodeURIComponent(uni.name)}>
                              <Button 
                                className="w-full text-white font-semibold transition-all"
                                style={{ backgroundColor: 'var(--alo-orange)' }}
                              >
                                APPLY NOW
                              </Button>
                            </Link>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="text-center">
                  <Link to={createPageUrl('Universities') + '?country=United Kingdom'}>
                    <Button size="lg" style={{ backgroundColor: 'var(--alo-blue)' }} className="text-white font-semibold">
                      View All Universities <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="campus">
              <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-3xl font-bold mb-4">Campus and community</h2>
                <p className="text-slate-700 leading-relaxed">
                  UK universities offer vibrant campus life with world-class facilities, diverse student communities, and countless opportunities for personal and professional growth.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="life">
              <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-3xl font-bold mb-4">Life in the UK</h2>
                <p className="text-slate-700 leading-relaxed">
                  Experience rich cultural heritage, modern cities, and a welcoming environment for international students with excellent public transport and healthcare systems.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Everything You Need */}
      <section className="py-16" style={{ backgroundColor: '#9EE64E' }}>
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold mb-6">
              Everything you need to study in the UK—guided by experts
            </h2>
            <div className="grid md:grid-cols-2 gap-12 items-start">
              <div>
                <p className="text-lg mb-6">
                  Building your future in the UK may feel overwhelming, but with the right support, you'll be ready for every step of the journey. From start to finish, we're here to guide you. Here's how we can help:
                </p>
              </div>
              <div className="space-y-4">
                {services.map((service, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 flex-shrink-0" style={{ color: '#0066CC' }} />
                    <span className="font-medium">{service}</span>
                  </div>
                ))}
                <Link to={createPageUrl('Contact')}>
                  <Button 
                    className="mt-6 text-white h-12 px-6 rounded-lg" 
                    style={{ backgroundColor: '#E50046' }}
                  >
                    Book free counselling <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16" style={{ backgroundColor: '#9EE64E' }}>
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-4">
            Take the first step towards studying abroad!
          </h2>
          <Link to={createPageUrl('Contact')}>
            <Button 
              size="lg" 
              className="text-white h-14 px-8 text-lg rounded-lg mt-4" 
              style={{ backgroundColor: '#E50046' }}
            >
              Book free counselling <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}