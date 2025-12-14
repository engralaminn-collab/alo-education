import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, GraduationCap, MapPin, Briefcase, Award,
  Users, MessageSquare, Linkedin
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import Footer from '@/components/landing/Footer';

export default function AlumniNetwork() {
  const [searchQuery, setSearchQuery] = useState('');
  const [countryFilter, setCountryFilter] = useState('all');
  const [fieldFilter, setFieldFilter] = useState('all');
  const [mentorshipOnly, setMentorshipOnly] = useState(false);

  const { data: alumni = [], isLoading } = useQuery({
    queryKey: ['alumni'],
    queryFn: () => base44.entities.Alumni.filter({ status: 'approved' }, '-graduation_year'),
  });

  const filteredAlumni = alumni.filter(person => {
    const matchesSearch = person.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         person.university?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCountry = countryFilter === 'all' || person.country === countryFilter;
    const matchesField = fieldFilter === 'all' || person.field_of_study === fieldFilter;
    const matchesMentorship = !mentorshipOnly || person.available_for_mentorship;
    return matchesSearch && matchesCountry && matchesField && matchesMentorship;
  });

  const countries = [...new Set(alumni.map(a => a.country))].filter(Boolean);
  const fields = [...new Set(alumni.map(a => a.field_of_study))].filter(Boolean);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-purple-600 to-indigo-600 py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center text-white">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-80" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Alumni Network</h1>
            <p className="text-xl text-purple-100">
              Connect with graduates who've walked your path. Get advice, mentorship, and insights from those who made it.
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-6 py-12">
        {/* Search & Filters */}
        <Card className="border-0 shadow-lg mb-8">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-5 gap-4">
              <div className="md:col-span-2 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  placeholder="Search by name or university..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={countryFilter} onValueChange={setCountryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Countries" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Countries</SelectItem>
                  {countries.map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={fieldFilter} onValueChange={setFieldFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Fields" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Fields</SelectItem>
                  {fields.map(f => (
                    <SelectItem key={f} value={f} className="capitalize">
                      {f.replace(/_/g, ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant={mentorshipOnly ? 'default' : 'outline'}
                onClick={() => setMentorshipOnly(!mentorshipOnly)}
                className={mentorshipOnly ? 'bg-purple-600' : ''}
              >
                Mentors Only
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="mb-6">
          <p className="text-slate-600">
            Showing <span className="font-semibold text-slate-900">{filteredAlumni.length}</span> alumni
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-20">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : filteredAlumni.length === 0 ? (
          <div className="text-center py-20">
            <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No alumni found</h3>
            <p className="text-slate-500">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAlumni.map((person, index) => (
              <motion.div
                key={person.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="border-0 shadow-sm hover:shadow-xl transition-all h-full">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      {person.photo ? (
                        <img 
                          src={person.photo} 
                          alt={person.full_name}
                          className="w-16 h-16 rounded-full object-cover ring-2 ring-purple-100"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white text-xl font-bold">
                          {person.full_name.charAt(0)}
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-bold text-slate-900 mb-1">{person.full_name}</h3>
                        <p className="text-sm text-slate-500">Class of {person.graduation_year}</p>
                      </div>
                      {person.is_featured && (
                        <Badge className="bg-amber-100 text-amber-700">
                          <Award className="w-3 h-3 mr-1" />
                          Featured
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <GraduationCap className="w-4 h-4 text-purple-500" />
                        <span className="font-medium">{person.degree}</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm text-slate-600">
                        <MapPin className="w-4 h-4 text-purple-500 mt-0.5" />
                        <div>
                          <div className="font-medium">{person.university}</div>
                          <div className="text-xs">{person.country}</div>
                        </div>
                      </div>
                      {person.current_position && (
                        <div className="flex items-start gap-2 text-sm text-slate-600">
                          <Briefcase className="w-4 h-4 text-purple-500 mt-0.5" />
                          <div>
                            <div>{person.current_position}</div>
                            {person.company && <div className="text-xs">{person.company}</div>}
                          </div>
                        </div>
                      )}
                    </div>

                    {person.bio && (
                      <p className="text-sm text-slate-600 line-clamp-3 mb-4">
                        {person.bio}
                      </p>
                    )}

                    {person.available_for_mentorship && (
                      <Badge className="bg-green-100 text-green-700 mb-4">
                        <MessageSquare className="w-3 h-3 mr-1" />
                        Available for Mentorship
                      </Badge>
                    )}

                    <div className="flex gap-2">
                      <Link to={createPageUrl('AlumniProfile') + `?id=${person.id}`} className="flex-1">
                        <Button className="w-full bg-purple-600 hover:bg-purple-700">
                          View Profile
                        </Button>
                      </Link>
                      {person.linkedin_url && (
                        <a href={person.linkedin_url} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" size="icon">
                            <Linkedin className="w-4 h-4" />
                          </Button>
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}