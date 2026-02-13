import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, MapPin, Calendar, TrendingUp, Search, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';

export default function UniversityGrid({ universities = [], country }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('ranking');
  const [filterCity, setFilterCity] = useState('all');

  // Get unique cities
  const cities = ['all', ...new Set(universities.map(u => u.city).filter(Boolean))];

  // Filter and sort
  let filtered = universities.filter(uni => {
    const matchesSearch = uni.university_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCity = filterCity === 'all' || uni.city === filterCity;
    return matchesSearch && matchesCity;
  });

  // Sort
  if (sortBy === 'ranking') {
    filtered = filtered.sort((a, b) => (a.ranking || 999) - (b.ranking || 999));
  } else if (sortBy === 'name') {
    filtered = filtered.sort((a, b) => a.university_name.localeCompare(b.university_name));
  }

  return (
    <section className="bg-white py-16">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-4xl font-bold text-slate-900 mb-2">Top Universities</h2>
            <p className="text-slate-600 text-lg">
              Explore {universities.length} world-class universities in {country}
            </p>
          </div>
          <Link to={createPageUrl('Universities') + `?country=${country}`}>
            <Button variant="outline" size="lg">
              View All
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-slate-50 p-6 rounded-2xl mb-8">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                placeholder="Search universities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12"
              />
            </div>

            <Select value={filterCity} onValueChange={setFilterCity}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Filter by City" />
              </SelectTrigger>
              <SelectContent>
                {cities.map(city => (
                  <SelectItem key={city} value={city}>
                    {city === 'all' ? 'All Cities' : city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ranking">Ranking</SelectItem>
                <SelectItem value="name">Name (A-Z)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* University Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.slice(0, 12).map((uni, index) => (
            <motion.div
              key={uni.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link to={createPageUrl('UniversityDetails') + `?id=${uni.id}`}>
                <Card className="border-0 shadow-lg hover:shadow-2xl transition-all h-full group overflow-hidden">
                  {/* Cover Image */}
                  {uni.cover_image && (
                    <div className="h-40 overflow-hidden">
                      <img 
                        src={uni.cover_image} 
                        alt={uni.university_name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                  )}

                  <CardContent className="p-5">
                    {/* Logo & Name */}
                    <div className="flex items-start gap-3 mb-4">
                      {uni.logo ? (
                        <img 
                          src={uni.logo} 
                          alt="" 
                          className="w-14 h-14 object-contain rounded-lg bg-slate-50 p-1 flex-shrink-0" 
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-8 h-8 text-slate-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-slate-900 text-base mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
                          {uni.university_name}
                        </h3>
                        {uni.city && (
                          <p className="text-sm text-slate-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {uni.city}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Rankings & Info */}
                    <div className="space-y-2 mb-4">
                      {uni.ranking && (
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-amber-500" />
                          <Badge variant="outline" className="text-xs font-semibold">
                            World Rank #{uni.ranking}
                          </Badge>
                        </div>
                      )}
                      {uni.qs_ranking && (
                        <Badge className="bg-blue-50 text-blue-700 text-xs">
                          QS #{uni.qs_ranking}
                        </Badge>
                      )}
                    </div>

                    {/* Intake */}
                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Calendar className="w-4 h-4" />
                        <span>Intake: {uni.intakes || 'Sep'}</span>
                      </div>
                      <Button size="sm" className="h-8 px-3 text-xs">
                        Apply
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 text-lg">No universities match your criteria</p>
          </div>
        )}

        {filtered.length > 12 && (
          <div className="text-center mt-10">
            <Link to={createPageUrl('Universities') + `?country=${country}`}>
              <Button size="lg" variant="outline">
                View All {filtered.length} Universities
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}