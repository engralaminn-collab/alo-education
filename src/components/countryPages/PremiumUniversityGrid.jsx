import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, Calendar, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';

export default function PremiumUniversityGrid({ universities = [], title = "All UK Universities" }) {
  return (
    <section className="bg-white py-16">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-blue-600 flex items-center gap-3">
            <span className="text-2xl">🇬🇧</span> {title}
          </h2>
          <Link to={createPageUrl('Universities')}>
            <Button variant="outline" className="text-blue-600 border-blue-600 hover:bg-blue-50">
              View All Universities
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {universities.slice(0, 8).map((uni, index) => (
            <motion.div
              key={uni.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="border-2 border-blue-200 hover:border-blue-400 hover:shadow-2xl transition-all overflow-hidden group h-full">
                {/* University Image */}
                <div className="h-40 overflow-hidden relative">
                  <img 
                    src={uni.cover_image || 'https://images.unsplash.com/photo-1562774053-701939374585?w=800'} 
                    alt={uni.university_name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  {uni.ranking && (
                    <Badge className="absolute top-3 right-3 bg-white text-blue-900 shadow-lg">
                      <Star className="w-3 h-3 mr-1 text-yellow-500" />
                      Rank #{uni.ranking}
                    </Badge>
                  )}
                </div>

                <CardContent className="p-5">
                  <h3 className="font-bold text-orange-600 mb-3 text-lg min-h-[3.5rem] line-clamp-2 group-hover:text-orange-700 transition-colors">
                    {uni.university_name}
                  </h3>
                  
                  <div className="space-y-2 text-sm text-slate-600 mb-4">
                    <p className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      <span>{uni.city}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      <span className="font-medium">Next intake:</span>
                      <span>{uni.intakes || 'September, January'}</span>
                    </p>
                  </div>
                  
                  <Link to={createPageUrl('UniversityDetails') + `?id=${uni.id}`}>
                    <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white group-hover:shadow-lg transition-all">
                      View Details
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}