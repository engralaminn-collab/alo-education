import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  GraduationCap, DollarSign, BookOpen, Calendar, 
  TrendingUp, ArrowRight, CheckCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import Footer from '@/components/landing/Footer';

export default function StudyInUK() {
  const [activeTab, setActiveTab] = React.useState('universities');

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
                    <h2 className="text-3xl font-bold mb-4">Top universities</h2>
                    <p className="text-slate-700 leading-relaxed">
                      The UK is home to some of the world's most prestigious and historic universities, with over 160 higher education institutions offering a wealth of academic opportunities. Many are consistently ranked among the best globally, recognised for their research, teaching excellence, and strong industry connections.
                    </p>
                    <p className="text-slate-700 leading-relaxed mt-4">
                      Studying in the UK means joining a tradition of academic distinction that has produced influential thinkers, leaders, and Nobel laureates.
                    </p>
                  </div>
                </div>
                <div className="text-center">
                  <Link to={createPageUrl('Universities') + '?country=United Kingdom'}>
                    <Button style={{ backgroundColor: '#0066CC' }} className="text-white">
                      View all universities <ArrowRight className="w-4 h-4 ml-2" />
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