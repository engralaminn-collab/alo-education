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
import { Search, MapPin, Star, Users, DollarSign, Filter, X, ArrowRight, Grid, List, GraduationCap, ArrowUpDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';
import Footer from '@/components/landing/Footer';
import CompareUniversities from '@/components/universities/CompareUniversities';
import TrendingAnalysis from '@/components/discovery/TrendingAnalysis';

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
  const [degreeLevel, setDegreeLevel] = useState('all');
  const [fieldOfStudy, setFieldOfStudy] = useState('all');
  const [sortBy, setSortBy] = useState('ranking');
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Read URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('q')) setSearchQuery(params.get('q'));
    if (params.get('country')) setSelectedCountry(params.get('country'));
  }, []);

  const { data: universities = [], isLoading } = useQuery({
    queryKey: ['universities'],
    queryFn: () => base44.entities.University.filter({ status: 'active' }),
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: () => base44.entities.Course.list(),
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
                          uni.city?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCountry = selectedCountry === 'all' || 
                           uni.country?.toLowerCase().includes(selectedCountry.toLowerCase());
    const matchesTuition = (!uni.tuition_range_min || uni.tuition_range_min >= tuitionRange[0]) &&
                           (!uni.tuition_range_max || uni.tuition_range_max <= tuitionRange[1]);
    const matchesRanking = rankingFilter === 'all' ||
                           (rankingFilter === 'top50' && uni.ranking <= 50) ||
                           (rankingFilter === 'top100' && uni.ranking <= 100) ||
                           (rankingFilter === 'top200' && uni.ranking <= 200);
    
    // QS and Times ranking filters
    const matchesQsRanking = !uni.qs_ranking || 
                            (uni.qs_ranking >= qsRankingRange[0] && uni.qs_ranking <= qsRankingRange[1]);
    const matchesTimesRanking = !uni.times_ranking || 
                                (uni.times_ranking >= timesRankingRange[0] && uni.times_ranking <= timesRankingRange[1]);
    
    // Student population filter
    const matchesStudentPop = !uni.student_population || 
                             (uni.student_population >= studentPopRange[0] && uni.student_population <= studentPopRange[1]);
    
    // Filter by degree level - check if university has courses with this degree level
    const matchesDegreeLevel = degreeLevel === 'all' || 
                               courses.some(course => 
                                 course.university_id === uni.id && 
                                 course.level === degreeLevel
                               );
    
    // Filter by field of study - check if university offers courses in this field
    const matchesFieldOfStudy = fieldOfStudy === 'all' || 
                                courses.some(course => 
                                  course.university_id === uni.id && 
                                  course.subject_area === fieldOfStudy
                                );
    
    return matchesSearch && matchesCountry && matchesTuition && matchesRanking && 
           matchesQsRanking && matchesTimesRanking && matchesStudentPop &&
           matchesDegreeLevel && matchesFieldOfStudy;
  }).sort((a, b) => {
    // Sort functionality
    if (sortBy === 'ranking') {
      return (a.ranking || 9999) - (b.ranking || 9999);
    } else if (sortBy === 'name') {
      return (a.name || '').localeCompare(b.name || '');
    } else if (sortBy === 'fees-low') {
      return (a.tuition_range_min || 0) - (b.tuition_range_min || 0);
    } else if (sortBy === 'fees-high') {
      return (b.tuition_range_min || 0) - (a.tuition_range_min || 0);
    }
    return 0;
  });

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCountry('all');
    setTuitionRange([0, 100000]);
    setQsRankingRange([0, 500]);
    setTimesRankingRange([0, 500]);
    setStudentPopRange([0, 100000]);
    setRankingFilter('all');
    setDegreeLevel('all');
    setFieldOfStudy('all');
  };

  const hasActiveFilters = searchQuery || selectedCountry !== 'all' || 
                           tuitionRange[0] > 0 || tuitionRange[1] < 100000 || 
                           qsRankingRange[0] > 0 || qsRankingRange[1] < 500 ||
                           timesRankingRange[0] > 0 || timesRankingRange[1] < 500 ||
                           studentPopRange[0] > 0 || studentPopRange[1] < 100000 ||
                           rankingFilter !== 'all' || degreeLevel !== 'all' || 
                           fieldOfStudy !== 'all';

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
        <label className="text-sm font-medium text-slate-700 mb-2 block">Degree Level</label>
        <Select value={degreeLevel} onValueChange={setDegreeLevel}>
          <SelectTrigger>
            <SelectValue placeholder="All levels" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="foundation">Foundation</SelectItem>
            <SelectItem value="bachelor">Bachelor's</SelectItem>
            <SelectItem value="master">Master's</SelectItem>
            <SelectItem value="phd">PhD</SelectItem>
            <SelectItem value="diploma">Diploma</SelectItem>
            <SelectItem value="certificate">Certificate</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700 mb-2 block">Field of Study</label>
        <Select value={fieldOfStudy} onValueChange={setFieldOfStudy}>
          <SelectTrigger>
            <SelectValue placeholder="All fields" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Fields</SelectItem>
            <SelectItem value="business">Business</SelectItem>
            <SelectItem value="engineering">Engineering</SelectItem>
            <SelectItem value="computer_science">Computer Science</SelectItem>
            <SelectItem value="medicine">Medicine</SelectItem>
            <SelectItem value="arts">Arts</SelectItem>
            <SelectItem value="law">Law</SelectItem>
            <SelectItem value="science">Science</SelectItem>
            <SelectItem value="social_sciences">Social Sciences</SelectItem>
            <SelectItem value="education">Education</SelectItem>
            <SelectItem value="hospitality">Hospitality</SelectItem>
            <SelectItem value="architecture">Architecture</SelectItem>
            <SelectItem value="other">Other</SelectItem>
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
      <section className="bg-gradient-to-br from-slate-900 to-slate-800 py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Explore Universities
            </h1>
            <p className="text-xl text-slate-300">
              Discover {universities.length}+ world-class institutions across the globe
            </p>
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
                  <Badge variant="secondary" className="bg-emerald-50 text-emerald-600">
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
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
              <p className="text-slate-600">
                Showing <span className="font-semibold text-slate-900">{filteredUniversities.length}</span> universities
              </p>
              <div className="flex items-center gap-3">
                {/* Sort Dropdown */}
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48">
                    <ArrowUpDown className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ranking">Ranking (Best First)</SelectItem>
                    <SelectItem value="name">Name (A-Z)</SelectItem>
                    <SelectItem value="fees-low">Fees (Low to High)</SelectItem>
                    <SelectItem value="fees-high">Fees (High to Low)</SelectItem>
                  </SelectContent>
                </Select>
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
                      <Card className={`group overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-300 ${
                        viewMode === 'list' ? 'flex flex-row' : ''
                      } ${selectedForCompare.some(u => u.id === uni.id) ? 'ring-2 ring-emerald-500' : ''}`}>
                        <div className="absolute top-3 right-3 z-10">
                          <input
                            type="checkbox"
                            checked={selectedForCompare.some(u => u.id === uni.id)}
                            onChange={(e) => {
                              e.stopPropagation();
                              if (e.target.checked) {
                                setSelectedForCompare([...selectedForCompare, uni]);
                              } else {
                                setSelectedForCompare(selectedForCompare.filter(u => u.id !== uni.id));
                              }
                            }}
                            className="w-5 h-5 rounded border-slate-300 text-emerald-500 cursor-pointer"
                            title="Select for comparison"
                          />
                        </div>
                        <Link to={createPageUrl('UniversityDetails') + `?id=${uni.id}`} className="flex-1">
                          <div className={`relative overflow-hidden ${
                            viewMode === 'list' ? 'w-48 h-36 shrink-0' : 'h-48'
                          }`}>
                            <img
                              src={uni.cover_image || `https://images.unsplash.com/photo-1562774053-701939374585?w=800`}
                              alt={uni.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 to-transparent" />
                            {uni.ranking && (
                              <Badge className="absolute top-3 left-3 bg-emerald-500 text-white border-0">
                                <Star className="w-3 h-3 mr-1" />
                                #{uni.ranking}
                              </Badge>
                            )}
                          </div>
                          <CardContent className={`${viewMode === 'list' ? 'flex-1 p-4' : 'p-5'}`}>
                            <h3 className="font-bold text-lg text-slate-900 mb-2 group-hover:text-emerald-600 transition-colors">
                              {uni.university_name}
                            </h3>
                            <div className="flex items-center text-slate-500 text-sm mb-3">
                              <MapPin className="w-4 h-4 mr-1" />
                              {uni.city}, {uni.country}
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              {uni.student_population && (
                                <div className="flex items-center text-slate-500">
                                  <Users className="w-4 h-4 mr-1" />
                                  {uni.student_population.toLocaleString()}
                                </div>
                              )}
                              {uni.tuition_range_min && (
                                <div className="flex items-center text-emerald-600 font-medium">
                                  <DollarSign className="w-4 h-4" />
                                  {uni.tuition_range_min.toLocaleString()}+
                                </div>
                              )}
                            </div>
                            <Button className="w-full mt-4 bg-slate-900 hover:bg-slate-800 group/btn">
                              View Details
                              <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                            </Button>
                            </CardContent>
                            </Link>
                            </Card>
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

      <Footer />
    </div>
  );
}