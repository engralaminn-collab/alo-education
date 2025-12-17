import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Award, Search, DollarSign, Calendar, ExternalLink, Filter, Sparkles, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import Footer from '@/components/landing/Footer';
import AIScholarshipRecommendations from '@/components/scholarships/AIScholarshipRecommendations';

const typeColors = {
  merit_based: 'bg-blue-100 text-blue-700',
  need_based: 'bg-emerald-100 text-emerald-700',
  sports: 'bg-orange-100 text-orange-700',
  diversity: 'bg-purple-100 text-purple-700',
  country_specific: 'bg-pink-100 text-pink-700',
  subject_specific: 'bg-cyan-100 text-cyan-700',
  other: 'bg-slate-100 text-slate-700',
};

export default function Scholarships() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [showAI, setShowAI] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: studentProfile } = useQuery({
    queryKey: ['student-profile', user?.email],
    queryFn: async () => {
      const profiles = await base44.entities.StudentProfile.filter({ email: user?.email });
      return profiles[0];
    },
    enabled: !!user?.email,
  });

  const { data: scholarships = [], isLoading } = useQuery({
    queryKey: ['scholarships'],
    queryFn: () => base44.entities.Scholarship.filter({ status: 'active' }, '-application_deadline', 100),
  });

  const { data: universities = [] } = useQuery({
    queryKey: ['universities-list'],
    queryFn: () => base44.entities.University.list(),
  });

  const universityMap = universities.reduce((acc, u) => { acc[u.id] = u; return acc; }, {});

  const countries = [...new Set(scholarships.map(s => s.country))].filter(Boolean).sort();
  const types = ['merit_based', 'need_based', 'sports', 'diversity', 'country_specific', 'subject_specific', 'other'];
  const levels = ['Undergraduate', 'Postgraduate', 'PhD', 'Foundation'];

  const filteredScholarships = useMemo(() => {
    return scholarships.filter(scholarship => {
      const matchesSearch = !searchQuery || 
        scholarship.scholarship_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        scholarship.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCountry = selectedCountry === 'all' || scholarship.country === selectedCountry;
      const matchesType = selectedType === 'all' || scholarship.scholarship_type === selectedType;
      const matchesLevel = selectedLevel === 'all' || scholarship.study_level?.includes(selectedLevel);

      return matchesSearch && matchesCountry && matchesType && matchesLevel;
    });
  }, [scholarships, searchQuery, selectedCountry, selectedType, selectedLevel]);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-br from-slate-900 to-emerald-900 py-16">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-sm font-medium mb-4">
              <Award className="w-4 h-4" />
              Fund Your Education
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Scholarship Opportunities
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Discover scholarships that match your profile and aspirations
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {studentProfile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Button
              onClick={() => setShowAI(!showAI)}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {showAI ? 'Hide' : 'Show'} AI Recommendations
            </Button>
          </motion.div>
        )}

        {showAI && studentProfile && (
          <AIScholarshipRecommendations 
            studentProfile={studentProfile}
            scholarships={scholarships}
            universities={universities}
          />
        )}

        <Card className="border-0 shadow-sm mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-emerald-600" />
              Find Scholarships
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                placeholder="Search scholarships..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                <SelectTrigger>
                  <SelectValue placeholder="Country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Countries</SelectItem>
                  {countries.map(country => (
                    <SelectItem key={country} value={country}>{country}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {types.map(type => (
                    <SelectItem key={type} value={type}>
                      {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Study Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  {levels.map(level => (
                    <SelectItem key={level} value={level}>{level}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="mb-4 flex items-center justify-between">
          <p className="text-slate-600">
            <span className="font-bold text-slate-900">{filteredScholarships.length}</span> scholarships found
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredScholarships.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="py-16 text-center">
              <Award className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No scholarships found</h3>
              <p className="text-slate-500">Try adjusting your filters</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredScholarships.map((scholarship, index) => {
              const university = universityMap[scholarship.university_id];
              return (
                <motion.div
                  key={scholarship.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="border-0 shadow-sm hover:shadow-lg transition-all h-full flex flex-col">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <Badge className={typeColors[scholarship.scholarship_type]}>
                          {scholarship.scholarship_type?.replace(/_/g, ' ')}
                        </Badge>
                        <Award className="w-5 h-5 text-emerald-600" />
                      </div>
                      <CardTitle className="text-lg">{scholarship.scholarship_name}</CardTitle>
                      <p className="text-sm text-slate-600">
                        {university?.university_name || scholarship.country}
                      </p>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col">
                      <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                        {scholarship.description}
                      </p>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                          <DollarSign className="w-4 h-4 text-emerald-600" />
                          <span className="font-semibold">
                            {scholarship.amount_type === 'full_tuition' ? 'Full Tuition' : 
                             `${scholarship.currency} ${scholarship.amount?.toLocaleString()}`}
                          </span>
                        </div>
                        {scholarship.application_deadline && (
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Calendar className="w-4 h-4" />
                            <span>Deadline: {format(new Date(scholarship.application_deadline), 'MMM dd, yyyy')}</span>
                          </div>
                        )}
                        {scholarship.study_level && (
                          <div className="flex flex-wrap gap-1">
                            {scholarship.study_level.map(level => (
                              <Badge key={level} variant="outline" className="text-xs">
                                {level}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      {scholarship.eligibility_criteria && (
                        <div className="mb-4">
                          <p className="text-xs font-semibold text-slate-700 mb-1">Eligibility:</p>
                          <p className="text-xs text-slate-600 line-clamp-2">
                            {scholarship.eligibility_criteria}
                          </p>
                        </div>
                      )}

                      <div className="mt-auto space-y-2">
                        {scholarship.renewable && (
                          <div className="flex items-center gap-1 text-xs text-emerald-600">
                            <CheckCircle className="w-3 h-3" />
                            <span>Renewable</span>
                          </div>
                        )}
                        {scholarship.application_link && (
                          <a href={scholarship.application_link} target="_blank" rel="noopener noreferrer" className="block">
                            <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                              Apply Now
                              <ExternalLink className="w-4 h-4 ml-2" />
                            </Button>
                          </a>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}