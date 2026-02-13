import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, TrendingUp, Calendar, FileText, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function CountryUniversityGrid({ universities, country }) {
  const filteredUniversities = universities
    .filter(u => u.country === country && u.show_on_country_page)
    .slice(0, 8);

  if (filteredUniversities.length === 0) return null;

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {filteredUniversities.map(university => (
        <Card key={university.id} className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-education-blue overflow-hidden">
          <div className="h-32 bg-gradient-to-br from-education-blue to-alo-orange relative overflow-hidden">
            {university.cover_image && (
              <img 
                src={university.cover_image} 
                alt={university.university_name}
                className="w-full h-full object-cover opacity-80"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            {university.logo && (
              <div className="absolute bottom-2 left-2 w-16 h-16 bg-white rounded-lg p-2 shadow-lg">
                <img 
                  src={university.logo} 
                  alt={university.university_name}
                  className="w-full h-full object-contain"
                />
              </div>
            )}
          </div>

          <CardContent className="p-4 space-y-3">
            <h3 className="font-bold text-lg line-clamp-2 min-h-[3.5rem]">
              {university.university_name}
            </h3>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin size={14} className="text-education-blue" />
                <span>{university.city}</span>
              </div>

              {university.qs_ranking && (
                <div className="flex items-center gap-2 text-gray-600">
                  <TrendingUp size={14} className="text-alo-orange" />
                  <span>QS Ranking: #{university.qs_ranking}</span>
                </div>
              )}

              {university.intakes && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar size={14} className="text-education-blue" />
                  <span>Intakes: {university.intakes}</span>
                </div>
              )}

              {university.entry_requirements_summary && (
                <div className="flex items-start gap-2 text-gray-600">
                  <FileText size={14} className="text-alo-orange flex-shrink-0 mt-0.5" />
                  <span className="text-xs line-clamp-2">{university.entry_requirements_summary}</span>
                </div>
              )}
            </div>

            <Link to={createPageUrl('UniversityDetails') + '?id=' + university.id}>
              <Button className="w-full bg-alo-orange hover:bg-alo-orange/90 text-white gap-2 group-hover:gap-3 transition-all">
                View University
                <ArrowRight size={16} />
              </Button>
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}