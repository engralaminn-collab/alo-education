import React from 'react';
import HeroRotating from '@/components/landing/HeroRotating';
import CourseFinder from '@/components/landing/CourseFinder';
import Destinations from '@/components/landing/Destinations';
import ServicesGrid from '@/components/landing/ServicesGrid';
import SuccessStories from '@/components/landing/SuccessStories';
import Footer from '@/components/landing/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <HeroRotating />
      <CourseFinder />
      <Destinations />
      <ServicesGrid />
      <SuccessStories />
      <Footer />
    </div>
  );
}