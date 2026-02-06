import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, BookOpen, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createPageUrl } from '@/utils';

export default function HeroWithCourseFinder({
  title = "Your Future Starts Here",
  subtitle = "Guiding you to global opportunities.",
  description = "We don't just advise, we commit.",
  tagline = "Your Trusted Partner for Studying Abroad",
  country = null,
  showCountryFilter = true,
  showDegreeFilter = true,
  onConsultationClick = null,
  backgroundImage = null,
  backgroundGradient = "from-education-blue via-blue-900 to-blue-800"
}) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(country || '');
  const [selectedDegree, setSelectedDegree] = useState('');

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(createPageUrl('CourseFinderResults'), {
        state: {
          searchQuery,
          country: selectedCountry,
          degreeLevel: selectedDegree
        }
      });
    }
  };

  const handleConsultation = () => {
    if (onConsultationClick) {
      onConsultationClick();
    } else {
      navigate(createPageUrl('BookConsultation'));
    }
  };

  const countries = [
    { value: 'uk', label: 'United Kingdom' },
    { value: 'usa', label: 'United States' },
    { value: 'canada', label: 'Canada' },
    { value: 'australia', label: 'Australia' },
    { value: 'dubai', label: 'Dubai' },
    { value: 'ireland', label: 'Ireland' },
    { value: 'newzealand', label: 'New Zealand' },
  ];

  const degrees = [
    { value: 'foundation', label: 'Foundation' },
    { value: 'undergraduate', label: 'Undergraduate' },
    { value: 'postgraduate', label: 'Postgraduate' },
    { value: 'phd', label: 'PhD' },
    { value: 'diploma', label: 'Diploma' },
  ];

  return (
    <div
      className={`relative min-h-[600px] md:min-h-[700px] flex items-center justify-center overflow-hidden bg-gradient-to-br ${backgroundGradient}`}
      style={backgroundImage ? { backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
    >
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/40"></div>

      <div className="relative z-10 w-full px-4 max-w-5xl mx-auto">
        {/* Tagline */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-300/50 bg-blue-500/20 backdrop-blur-sm">
            <div className="w-2 h-2 rounded-full bg-blue-300"></div>
            <span className="text-sm font-semibold text-blue-100">{tagline}</span>
          </div>
        </div>

        {/* Main Heading */}
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white text-center mb-8 leading-tight">
          {title}
        </h1>

        {/* Search Bar */}
        <div className="mx-auto max-w-2xl mb-12">
          <div className="relative">
            <Input
              placeholder="Search universities, courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full h-12 pl-4 pr-4 text-base border-2 border-blue-300/30 bg-white/90 backdrop-blur-sm rounded-lg focus:border-blue-400"
            />
            <Search className="absolute right-4 top-3.5 w-5 h-5 text-slate-400" />
          </div>
        </div>

        {/* Secondary Text */}
        <div className="text-center mb-12 space-y-2">
          <p className="text-2xl md:text-3xl font-bold text-white">in the</p>
          <p className="text-4xl md:text-5xl font-bold text-white">& More</p>
          <p className="text-xl text-blue-100">{subtitle}</p>
          <p className="text-base text-blue-200">{description}</p>
        </div>

        {/* Filters and CTA */}
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-center flex-wrap">
          {showCountryFilter && (
            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
              <SelectTrigger className="md:w-48 h-12 bg-white/90 backdrop-blur-sm border-blue-300/30 rounded-lg">
                <MapPin className="w-4 h-4 text-slate-600 mr-2" />
                <SelectValue placeholder="Country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={null}>All Countries</SelectItem>
                {countries.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {showDegreeFilter && (
            <Select value={selectedDegree} onValueChange={setSelectedDegree}>
              <SelectTrigger className="md:w-48 h-12 bg-white/90 backdrop-blur-sm border-blue-300/30 rounded-lg">
                <BookOpen className="w-4 h-4 text-slate-600 mr-2" />
                <SelectValue placeholder="Degree Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={null}>All Levels</SelectItem>
                {degrees.map((d) => (
                  <SelectItem key={d.value} value={d.value}>
                    {d.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Button
            onClick={handleConsultation}
            className="h-12 bg-white text-education-blue hover:bg-blue-50 font-bold text-base flex items-center gap-2 px-6"
          >
            Book Free Consultation
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Search Button (Mobile) */}
        <div className="flex justify-center mt-6 md:hidden">
          <Button
            onClick={handleSearch}
            disabled={!searchQuery.trim()}
            className="bg-alo-orange hover:bg-orange-600 text-white font-bold h-12 px-8"
          >
            Search Courses
          </Button>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-300/50 to-transparent"></div>
    </div>
  );
}