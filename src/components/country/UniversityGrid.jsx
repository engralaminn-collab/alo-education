import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, Calendar, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';

export default function UniversityGrid({ universities = [], country }) {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-blue-600 mb-4 flex items-center justify-center gap-3">
            <span className="text-3xl">{country === 'United Kingdom' ? '🇬🇧' : '🌍'}</span>
            Top Universities in {country}
          </h2>
          <p className="text-xl text-slate-600">Explore premium institutions with excellent graduate outcomes</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {universities.map((uni, index) => (
            <motion.div
              key={uni.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="group border-2 border-blue-200 hover:border-blue-400 hover:shadow-2xl transition-all overflow-hidden h-full">
                {/* University Image */}
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={uni.cover_image || 'https://images.unsplash.com/photo-1562774053-701939374585?w=800'} 
                    alt={uni.university_name || uni.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  
                  {/* Ranking Badge */}
                  {uni.ranking && (
                    <Badge className="absolute top-3 left-3 bg-emerald-500 text-white border-0 shadow-lg">
                      <Star className="w-3 h-3 mr-1" />
                      Rank #{uni.ranking}
                    </Badge>
                  )}
                </div>

                <CardContent className="p-5">
                  {/* University Name */}
                  <h3 className="font-bold text-orange-600 text-lg mb-3 min-h-[3.5rem] line-clamp-2">
                    {uni.university_name || uni.name}
                  </h3>

                  {/* Location */}
                  <div className="flex items-center gap-2 text-slate-600 mb-3">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    <span className="text-sm">{uni.city}</span>
                  </div>

                  {/* Intake */}
                  <div className="flex items-center gap-2 text-slate-600 mb-4">
                    <Calendar className="w-4 h-4 text-purple-600" />
                    <span className="text-sm">
                      <span className="font-medium">Next intake:</span> {uni.intakes || 'Sep, Jan'}
                    </span>
                  </div>

                  {/* CTA Button */}
                  <Link to={createPageUrl('UniversityDetails') + `?id=${uni.id}`}>
                    <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white group/btn">
                      Learn More
                      <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Link to={createPageUrl('Universities') + `?country=${country}`}>
            <Button size="lg" variant="outline" className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white">
              View All {universities.length}+ Universities
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}