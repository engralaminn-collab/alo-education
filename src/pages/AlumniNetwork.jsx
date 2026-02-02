import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Users, Search, Briefcase, MapPin, GraduationCap, Linkedin, MessageSquare, Filter, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import Footer from '@/components/landing/Footer';

export default function AlumniNetwork() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const [selectedUniversity, setSelectedUniversity] = useState('all');
  const [mentorsOnly, setMentorsOnly] = useState(false);

  const { data: alumni = [], isLoading } = useQuery({
    queryKey: ['alumni'],
    queryFn: () => base44.entities.Alumni.filter({ status: 'active', is_verified: true }, '-graduation_year', 100),
  });

  const { data: universities = [] } = useQuery({
    queryKey: ['universities-list'],
    queryFn: () => base44.entities.University.list(),
  });

  const universityMap = universities.reduce((acc, u) => { acc[u.id] = u; return acc; }, {});

  const countries = [...new Set(alumni.map(a => a.country))].filter(Boolean).sort();
  const industries = [...new Set(alumni.map(a => a.industry))].filter(Boolean).sort();
  const alumniUniversities = [...new Set(alumni.map(a => a.university_id))].filter(Boolean);

  const filteredAlumni = useMemo(() => {
    return alumni.filter(alum => {
      const matchesSearch = !searchQuery || 
        `${alum.first_name} ${alum.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alum.current_job_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alum.current_company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alum.specializations?.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCountry = selectedCountry === 'all' || alum.country === selectedCountry;
      const matchesIndustry = selectedIndustry === 'all' || alum.industry === selectedIndustry;
      const matchesUniversity = selectedUniversity === 'all' || alum.university_id === selectedUniversity;
      const matchesMentor = !mentorsOnly || alum.willing_to_mentor;

      return matchesSearch && matchesCountry && matchesIndustry && matchesUniversity && matchesMentor;
    });
  }, [alumni, searchQuery, selectedCountry, selectedIndustry, selectedUniversity, mentorsOnly]);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-br from-slate-900 to-blue-900 py-16">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-sm font-medium mb-4">
              <Users className="w-4 h-4" />
              Connect & Learn
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Alumni Network
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Connect with graduates, get advice, and build your professional network
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <Card className="border-0 shadow-sm mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-blue-600" />
              Find Alumni
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                placeholder="Search by name, job title, company, or skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <Select value={selectedUniversity} onValueChange={setSelectedUniversity}>
                <SelectTrigger>
                  <SelectValue placeholder="University" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Universities</SelectItem>
                  {alumniUniversities.map(univId => {
                    const univ = universityMap[univId];
                    return univ ? (
                      <SelectItem key={univId} value={univId}>{univ.university_name}</SelectItem>
                    ) : null;
                  })}
                </SelectContent>
              </Select>

              <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                <SelectTrigger>
                  <SelectValue placeholder="Study Country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Countries</SelectItem>
                  {countries.map(country => (
                    <SelectItem key={country} value={country}>{country}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                <SelectTrigger>
                  <SelectValue placeholder="Industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Industries</SelectItem>
                  {industries.map(industry => (
                    <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="mentors"
                checked={mentorsOnly}
                onChange={(e) => setMentorsOnly(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="mentors" className="text-sm text-slate-700 cursor-pointer">
                Show only alumni open to mentoring
              </label>
            </div>
          </CardContent>
        </Card>

        <div className="mb-4 flex items-center justify-between">
          <p className="text-slate-600">
            <span className="font-bold text-slate-900">{filteredAlumni.length}</span> alumni found
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredAlumni.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="py-16 text-center">
              <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No alumni found</h3>
              <p className="text-slate-500">Try adjusting your filters</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAlumni.map((alum, index) => {
              const university = universityMap[alum.university_id];
              return (
                <motion.div
                  key={alum.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="border-0 shadow-sm hover:shadow-lg transition-all h-full flex flex-col">
                    <CardContent className="p-6 flex flex-col h-full">
                      <div className="flex items-start gap-4 mb-4">
                        <img
                          src={alum.photo || `https://ui-avatars.com/api/?name=${alum.first_name}+${alum.last_name}&background=0066CC&color=fff&size=80`}
                          alt={`${alum.first_name} ${alum.last_name}`}
                          className="w-16 h-16 rounded-full object-cover ring-2 ring-blue-100"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-slate-900 truncate">
                            {alum.first_name} {alum.last_name}
                          </h3>
                          <p className="text-sm text-slate-600 truncate">
                            {alum.current_job_title}
                          </p>
                          {alum.current_company && (
                            <p className="text-xs text-slate-500 truncate">
                              {alum.current_company}
                            </p>
                          )}
                        </div>
                        {alum.willing_to_mentor && (
                          <Star className="w-5 h-5 text-amber-500 fill-amber-500 flex-shrink-0" />
                        )}
                      </div>

                      <div className="space-y-2 mb-4 flex-1">
                        <div className="flex items-start gap-2 text-sm">
                          <GraduationCap className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                          <div className="min-w-0">
                            <p className="font-medium text-slate-900 truncate">{university?.university_name}</p>
                            <p className="text-xs text-slate-600">{alum.course_studied}</p>
                            <p className="text-xs text-slate-500">Class of {alum.graduation_year}</p>
                          </div>
                        </div>

                        {alum.current_location && (
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <MapPin className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">
                              {alum.current_location.city}, {alum.current_location.country}
                            </span>
                          </div>
                        )}

                        {alum.industry && (
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Briefcase className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{alum.industry}</span>
                          </div>
                        )}
                      </div>

                      {alum.specializations && alum.specializations.length > 0 && (
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-1">
                            {alum.specializations.slice(0, 3).map((spec, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {spec}
                              </Badge>
                            ))}
                            {alum.specializations.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{alum.specializations.length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      {alum.bio && (
                        <p className="text-sm text-slate-600 line-clamp-2 mb-4">
                          {alum.bio}
                        </p>
                      )}

                      <div className="flex gap-2 mt-auto">
                        {alum.linkedin_url && (
                          <a href={alum.linkedin_url} target="_blank" rel="noopener noreferrer" className="flex-1">
                            <Button variant="outline" size="sm" className="w-full">
                              <Linkedin className="w-4 h-4 mr-1" />
                              LinkedIn
                            </Button>
                          </a>
                        )}
                        <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700">
                          <MessageSquare className="w-4 h-4 mr-1" />
                          Connect
                        </Button>
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