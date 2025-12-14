import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

import Hero from '@/components/landing/Hero';
import AboutUs from '@/components/landing/AboutUs';
import Services from '@/components/landing/Services';
import Team from '@/components/landing/Team';
import PartnerLogos from '@/components/landing/PartnerLogos';
import FeaturedUniversities from '@/components/landing/FeaturedUniversities';
import HowItWorks from '@/components/landing/HowItWorks';
import Destinations from '@/components/landing/Destinations';
import Testimonials from '@/components/landing/Testimonials';
import CTA from '@/components/landing/CTA';
import Footer from '@/components/landing/Footer';

export default function Home() {
  const { data: universities } = useQuery({
    queryKey: ['featured-universities'],
    queryFn: () => base44.entities.University.filter({ is_featured: true, status: 'active' }, '-ranking', 4),
  });

  return (
    <div className="min-h-screen bg-white">
      <Hero />
      <AboutUs />
      <Services />
      <Team />
      <PartnerLogos />
      <FeaturedUniversities universities={universities} />
      <Destinations />
      <Testimonials />
      <CTA />
      <Footer />
    </div>
  );
}