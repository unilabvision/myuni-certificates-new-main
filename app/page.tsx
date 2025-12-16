'use client';

import HeroSection from './components/HeroSection';
import StatsSection from './components/StatsSection';
import PartnersSection from './components/PartnersSection';
import TestimonialsSection from './components/TestimonialsSection';
import CTASection from './components/CTASection';

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-900">
      {/* Hero Section */}
      <HeroSection />
      
      {/* Stats Section */}
      <StatsSection />
      
      {/* Partners Section */}
      <PartnersSection />
      
      {/* Testimonials Section */}
      <TestimonialsSection />
      
      {/* CTA Section */}
      <CTASection />
    </div>
  );
}