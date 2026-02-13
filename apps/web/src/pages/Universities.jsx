import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Search, MapPin, Star, Users, DollarSign, Filter, X, ArrowRight, Grid, List, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';
import Footer from '@/components/landing/Footer';
import CompareUniversities from '@/components/universities/CompareUniversities';
import UniversityComparisonModal from '@/components/universities/UniversityComparisonModal';
import UniversitiesMap from '@/components/universities/UniversitiesMap';

const countries = [
  { value: 'all', label: 'All Countries' },
  { value: 'usa', label: 'United States' },
  { value: 'uk', label: 'United Kingdom' },
  { value: 'canada', label: 'Canada' },
  { value: 'australia', label: 'Australia' },
  { value: 'germany', label: 'Germany' },
  { value: 'france', label: 'France' },
  { value: 'ireland', label: 'Ireland' },
  { value: 'netherlands', label: 'Netherlands' },
];

export default function Universities() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [tuitionRange, setTuitionRange] = useState([0, 100000]);
  const [qsRankingRange, setQsRankingRange] = useState([0, 500]);
  const [timesRankingRange, setTimesRankingRange] = useState([0, 500]);
  const [studentPopRange, setStudentPopRange] = useState([0, 100000]);
  const [rankingFilter, setRankingFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState([]);
  const [showComparison, setShowComparison] = useState(false);
  const [showMap, setShowMap] = useState(false);

  // Read URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('q')) setSearchQuery(params.get('q'));
    if (params.get('country')) setSelectedCountry(params.get('country'));
  }, []);

  const { data: universities = [], isLoading } = useQuery({
    queryKey: ['universities'],
    queryFn: () => base44.entities.University.filter({ status: 'active' }, '-ranking'),
  });

  const { data: scholarships = [] } = useQuery({
    queryKey: ['scholarships'],
    queryFn: () => base44.entities.Scholarship.filter({ status: 'active' }),
  });

  // Update suggestions when search changes
  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      const filtered = universities
        .filter(uni => 
          uni.university_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          uni.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          uni.country?.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 8);
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery, universities]);

  const filteredUniversities = universities.filter(uni => {
    const matchesSearch = uni.university_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          uni.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          uni.city?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCountry = selectedCountry === 'all' || 
                           uni.country?.toLowerCase().includes(selectedCountry.toLowerCase());
    const matchesTuition = (!uni.tuition_range_min || uni.tuition_range_min >= tuitionRange[0]) &&
                           (!uni.tuition_range_max || uni.tuition_range_max <= tuitionRange[1]);
    const matchesRanking = rankingFilter === 'all' ||
                           (rankingFilter === 'top50' && (uni.ranking <= 50 || uni.qs_ranking <= 50)) ||
                           (rankingFilter === 'top100' && (uni.ranking <= 100 || uni.qs_ranking <= 100)) ||
                           (rankingFilter === 'top200' && (uni.ranking <= 200 || uni.qs_ranking <= 200));
    return matchesSearch && matchesCountry && matchesTuition && matchesRanking;
  });

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCountry('all');
    setTuitionRange([0, 100000]);
    setQsRankingRange([0, 500]);
    setTimesRankingRange([0, 500]);
    setStudentPopRange([0, 100000]);
    setRankingFilter('all');
  };

  const hasActiveFilters = searchQuery || selectedCountry !== 'all' || 
                           tuitionRange[0] > 0 || tuitionRange[1] < 100000 || 
                           rankingFilter !== 'all';

  const FiltersContent = () => (
    <div className="space-y-6">
      <div>
        <label className="text-sm font-medium text-slate-700 mb-2 block">Country</label>
        <Select value={selectedCountry} onValueChange={setSelectedCountry}>
          <SelectTrigger>
            <SelectValue placeholder="Select country" />
          </SelectTrigger>
          <SelectContent>
            {countries.map(c => (
              <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700 mb-2 block">World Ranking</label>
        <Select value={rankingFilter} onValueChange={setRankingFilter}>
          <SelectTrigger>
            <SelectValue placeholder="All rankings" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Rankings</SelectItem>
            <SelectItem value="top50">Top 50</SelectItem>
            <SelectItem value="top100">Top 100</SelectItem>
            <SelectItem value="top200">Top 200</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700 mb-4 block">
          Tuition Range: ${tuitionRange[0].toLocaleString()} - ${tuitionRange[1].toLocaleString()}
        </label>
        <Slider
          value={tuitionRange}
          onValueChange={setTuitionRange}
          max={100000}
          step={5000}
          className="mt-2"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700 mb-4 block">
          QS Ranking: {qsRankingRange[0]} - {qsRankingRange[1]}
        </label>
        <Slider
          value={qsRankingRange}
          onValueChange={setQsRankingRange}
          max={500}
          step={10}
          className="mt-2"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700 mb-4 block">
          Times Ranking: {timesRankingRange[0]} - {timesRankingRange[1]}
        </label>
        <Slider
          value={timesRankingRange}
          onValueChange={setTimesRankingRange}
          max={500}
          step={10}
          className="mt-2"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700 mb-4 block">
          Student Population: {studentPopRange[0].toLocaleString()} - {studentPopRange[1].toLocaleString()}
        </label>
        <Slider
          value={studentPopRange}
          onValueChange={setStudentPopRange}
          max={100000}
          step={5000}
          className="mt-2"
        />
      </div>

      <div className="pt-4 border-t border-slate-200">
        <label className="flex items-center gap-3 cursor-pointer">
          <Checkbox 
            checked={scholarshipAvailable} 
            onCheckedChange={setScholarshipAvailable}
          />
          <span className="text-sm font-medium text-slate-700">
            Scholarships Available
          </span>
        </label>
        <p className="text-xs text-slate-500 mt-1 ml-7">
          Show only universities offering scholarships
        </p>
      </div>

      {hasActiveFilters && (
        <Button variant="outline" onClick={clearFilters} className="w-full">
          <X className="w-4 h-4 mr-2" />
          Clear All Filters
        </Button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-education-blue to-slate-900 py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-full text-white text-sm font-medium mb-4">
                <GraduationCap className="w-4 h-4" />
                ALO Education University Search
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Explore Universities
              </h1>
              <p className="text-xl text-slate-300">
                Discover {universities.length}+ world-class institutions across the globe with ALO Education
              </p>
            </motion.div>
          </div>

          {/* Search Bar */}
          <div className="mt-8 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                placeholder="Type university name for suggestions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.length >= 2 && setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                className="pl-12 h-14 bg-white border-0 rounded-xl text-lg"
              />
              
              {/* Type-ahead Suggestions */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50 max-h-96 overflow-y-auto">
                  {suggestions.map((uni) => (
                    <Link
                      key={uni.id}
                      to={createPageUrl('UniversityDetails') + `?id=${uni.id}`}
                      className="flex items-start gap-3 p-3 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0"
                    >
                      <img
                        src={uni.logo || uni.cover_image || 'https://images.unsplash.com/photo-1562774053-701939374585?w=100'}
                        alt={uni.university_name}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900">{uni.university_name}</h4>
                        <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {uni.city}, {uni.country}
                          </span>
                          {uni.ranking && (
                            <span className="flex items-center gap-1">
                              <Star className="w-3 h-3" />
                              #{uni.ranking}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
              <SelectTrigger className="w-full md:w-56 h-14 bg-white border-0 rounded-xl">
                <SelectValue placeholder="All Countries" />
              </SelectTrigger>
              <SelectContent>
                {countries.map(c => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-6 py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block w-72 shrink-0">
            <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-slate-900">Filters</h3>
                {hasActiveFilters && (
                  <Badge variant="secondary" className="bg-education-blue/10 text-education-blue">
                    {filteredUniversities.length} results
                  </Badge>
                )}
              </div>
              <FiltersContent />
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Trending Analysis */}
            <div className="mb-8">
              <TrendingAnalysis type="universities" />
            </div>

            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-slate-600">
                Showing <span className="font-semibold text-slate-900">{filteredUniversities.length}</span> universities
              </p>
              <div className="flex items-center gap-3">
                {selectedForCompare.length > 0 && (
                  <Button
                    onClick={() => setShowComparison(true)}
                    disabled={selectedForCompare.length < 2}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    Compare ({selectedForCompare.length})
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => setShowMap(!showMap)}
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  {showMap ? 'Hide Map' : 'Show Map'}
                </Button>
                {/* Mobile Filter Button */}
                <Sheet open={showFilters} onOpenChange={setShowFilters}>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="lg:hidden">
                      <Filter className="w-4 h-4 mr-2" />
                      Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>Filters</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6">
                      <FiltersContent />
                    </div>
                  </SheetContent>
                </Sheet>

                {/* View Toggle */}
                <div className="hidden md:flex items-center bg-slate-100 rounded-lg p-1">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className={viewMode === 'grid' ? 'bg-white shadow-sm' : ''}
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className={viewMode === 'list' ? 'bg-white shadow-sm' : ''}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Map View */}
            {showMap && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6"
              >
                <UniversitiesMap universities={filteredUniversities} />
              </motion.div>
            )}

            {/* University Grid/List */}
            {isLoading ? (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="h-48 bg-slate-200 rounded-t-xl" />
                    <CardContent className="p-5">
                      <div className="h-6 bg-slate-200 rounded w-3/4 mb-3" />
                      <div className="h-4 bg-slate-200 rounded w-1/2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredUniversities.length === 0 ? (
              <div className="text-center py-20">
                <GraduationCap className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">No universities found</h3>
                <p className="text-slate-500 mb-6">Try adjusting your filters or search query</p>
                <Button onClick={clearFilters}>Clear Filters</Button>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={viewMode}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={viewMode === 'grid' 
                    ? 'grid md:grid-cols-2 xl:grid-cols-3 gap-6'
                    : 'flex flex-col gap-4'
                  }
                >
                  {filteredUniversities.map((uni, index) => (
                    <motion.div
                      key={uni.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link to={createPageUrl('UniversityDetailsPage') + `?id=${uni.id}`}>
                        <Card 
                          className="bg-white border-2 hover:shadow-xl transition-all h-full"
                          style={{ borderColor: '#0066CC' }}
                          onMouseEnter={(e) => e.currentTarget.style.borderColor = '#F37021'}
                          onMouseLeave={(e) => e.currentTarget.style.borderColor = '#0066CC'}
                        >
                          <CardContent className="p-6 text-center">
                            {uni.logo && (
                              <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center bg-white rounded-lg p-2">
                                <img src={uni.logo} alt={uni.university_name} className="w-full h-full object-contain" />
                              </div>
                            )}
                            <h3 className="font-bold text-lg mb-3" style={{ color: '#F37021' }}>
                              {uni.university_name}
                            </h3>
                            
                            {uni.city && (
                              <div className="flex items-center justify-center gap-2 text-slate-600 text-sm mb-2">
                                <MapPin className="w-4 h-4" style={{ color: '#0066CC' }} />
                                <span>{uni.city}, {uni.country}</span>
                              </div>
                            )}
                            
                            {(uni.ranking || uni.qs_ranking) && (
                              <div className="text-sm text-slate-600 mb-2">
                                <span className="font-semibold">Ranking:</span> #{uni.ranking || uni.qs_ranking}
                              </div>
                            )}
                            
                            {uni.intakes && (
                              <div className="text-sm text-slate-600 mb-4">
                                <span className="font-semibold">Next Intake:</span> {uni.intakes}
                              </div>
                            )}
                            
                            <Button 
                              className="w-full font-semibold" 
                              style={{ backgroundColor: '#F37021', color: '#000000' }}
                            >
                              APPLY NOW
                              <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                          </CardContent>
                        </Card>
                      </Link>
                            </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>

      <CompareUniversities 
        selectedUniversities={selectedForCompare}
        onRemove={(id) => setSelectedForCompare(selectedForCompare.filter(u => u.id !== id))}
        onClear={() => setSelectedForCompare([])}
      />

      <UniversityComparisonModal
        universities={selectedForCompare}
        open={showComparison}
        onClose={() => setShowComparison(false)}
      />

      <Footer />
    </div>
  );
}