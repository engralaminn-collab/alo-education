import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  GraduationCap, FileText, Plane, Award, 
  ArrowRight, CheckCircle, Users, Building2, Calendar
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import Footer from '@/components/landing/Footer';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const stats = [
  { value: '99.95%', label: 'Visas approved' },
  { value: '100+', label: 'Global offices' },
  { value: '2006', label: 'Established' },
  { value: '250+', label: 'Universities partnered' }
];

const services = [
  {
    name: 'Free Support',
    icon: GraduationCap,
    description: 'Our free service supports international students with applications, personal statement editing, and guidance on required documents and deadlines.',
    countries: ['UK', 'Australia', 'Ireland', 'Canada', 'New Zealand', 'USA', 'Dubai']
  },
  {
    name: 'Premium Application Service',
    icon: Award,
    description: 'Reduce application stress with our Premium Service. We\'ll complete your application, refine your personal statement, and guarantee an offer from at least one university.',
    countries: ['UK', 'Australia', 'Ireland', 'Canada', 'New Zealand', 'USA', 'Dubai']
  },
  {
    name: 'Visa',
    icon: Plane,
    description: 'Get expert support throughout the visa application process, including document preparation and visa application and support.',
    countries: ['UK', 'Australia', 'Ireland', 'Canada', 'New Zealand', 'USA', 'Dubai']
  },
  {
    name: 'Oxbridge',
    icon: Building2,
    description: 'Specialising in Oxford, Cambridge, and other top UK universities, this service prepares you for the rigorous application process, including interview practice, to maximise your chances of success.',
    countries: ['UK']
  },
  {
    name: 'Medicine',
    icon: FileText,
    description: 'Strengthen your application for medicine, dentistry, or veterinary courses with interview practice and expert advice from a doctor on a medical school admissions panel.',
    countries: ['UK']
  },
  {
    name: 'Art and Design',
    icon: Award,
    description: 'Get expert guidance on applying for a creative programme, including portfolio creation advice from a practising art academic.',
    countries: ['UK']
  },
  {
    name: 'PhD',
    icon: GraduationCap,
    description: 'Our PhD Service guides you through crafting a strong proposal and connecting with the right supervisor, ensuring your application stands out.',
    countries: ['UK']
  }
];

const faqs = [
  {
    question: 'How does ALO Education support university applications?',
    answer: 'We provide expert guidance at every stage of the application process, from selecting the right course to reviewing your personal statement and preparing essential documents. Our support helps you submit a strong, competitive application to your chosen university.'
  },
  {
    question: 'Which countries can I apply to with ALO Education\'s support?',
    answer: 'We support applications to the UK, USA, Canada, Australia, Ireland, New Zealand, and Dubai. Our team has extensive knowledge of university systems and requirements in each country.'
  },
  {
    question: 'Can ALO Education assist with visa applications?',
    answer: 'Yes, we provide comprehensive visa support including document preparation, application guidance, and interview preparation to help ensure a smooth visa process.'
  },
  {
    question: 'How do I get started with ALO Education?',
    answer: 'Simply book a free consultation with one of our expert counsellors. We\'ll discuss your goals, assess your profile, and recommend the best path forward for your study abroad journey.'
  }
];

export default function Services() {
  const [selectedCountry, setSelectedCountry] = useState('UK');

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-education-blue via-alo-orange to-education-blue py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center text-white">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-full text-white text-sm font-medium mb-4">
                <GraduationCap className="w-4 h-4" />
                ALO Education Services
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Comprehensive Support You Can Count On
              </h1>
              <p className="text-xl text-white/90">
                Begin your journey to study abroad with ALO Education - The world's most trusted higher education partner
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-6 py-16">
        {/* Stats */}
        <div className="mb-16">
          <h2 className="text-center text-2xl font-semibold text-slate-700 mb-8">
            We've assisted 1.3M+ students achieve their dream of studying abroad
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border-0 shadow-md text-center">
                  <CardContent className="p-6">
                    <div className="text-4xl font-bold text-emerald-600 mb-2">{stat.value}</div>
                    <p className="text-slate-600">{stat.label}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Services Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              University application services
            </h2>
            <p className="text-slate-600 max-w-3xl mx-auto">
              With dedicated one-to-one support, our application services can help you secure an offer from a best-fit course and university. Let us help you take the first step.
            </p>
          </div>

          {/* Country Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {['UK', 'Australia', 'Ireland', 'Canada', 'New Zealand', 'USA', 'Dubai'].map((country) => (
              <Button
                key={country}
                variant={selectedCountry === country ? 'default' : 'outline'}
                onClick={() => setSelectedCountry(country)}
                className={selectedCountry === country ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
              >
                {country}
              </Button>
            ))}
          </div>

          {/* Service Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.filter(service => service.countries.includes(selectedCountry)).map((service, index) => (
              <motion.div
                key={service.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border-0 shadow-md hover:shadow-lg transition-all h-full">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center mb-3">
                      <service.icon className="w-6 h-6 text-emerald-600" />
                    </div>
                    <CardTitle>{service.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 mb-4">{service.description}</p>
                    <Button variant="outline" className="w-full">
                      Learn More
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* FAQs */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">FAQs</h2>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8">
              <p className="text-slate-600 mb-6">
                Find quick answers to common questions about ALO Education services. If you need more information, our counsellors are always available to help.
              </p>
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left font-semibold">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-slate-600">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>

        {/* CTA */}
        <div className="max-w-4xl mx-auto">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-600 to-cyan-600 text-white">
            <CardContent className="p-12 text-center">
              <h2 className="text-3xl font-bold mb-4">
                Take the first step towards studying abroad!
              </h2>
              <Link to={createPageUrl('Contact')}>
                <Button size="lg" className="bg-white text-emerald-600 hover:bg-slate-100">
                  Book free counselling
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}