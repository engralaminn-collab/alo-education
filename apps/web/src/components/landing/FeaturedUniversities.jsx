import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Star, Users, ArrowRight, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';

export default function FeaturedUniversities({ universities = [] }) {
  const displayUniversities = universities.length > 0 ? universities : [
    {
      id: 1,
      name: "University of Oxford",
      country: "United Kingdom",
      city: "Oxford",
      ranking: 1,
      logo_url: "https://images.unsplash.com/photo-1580537659466-0a9bfa916a54?w=200",
      cover_image: "https://images.unsplash.com/photo-1580537659466-0a9bfa916a54?w=800",
      acceptance_rate: 17,
      student_population: 24000
    },
    {
      id: 2,
      name: "MIT",
      country: "United States",
      city: "Cambridge",
      ranking: 2,
      logo_url: "https://images.unsplash.com/photo-1564981797816-1043664bf78d?w=200",
      cover_image: "https://images.unsplash.com/photo-1564981797816-1043664bf78d?w=800",
      acceptance_rate: 4,
      student_population: 11500
    },
    {
      id: 3,
      name: "University of Toronto",
      country: "Canada",
      city: "Toronto",
      ranking: 18,
      logo_url: "https://images.unsplash.com/photo-1569982175971-d92b01cf8694?w=200",
      cover_image: "https://images.unsplash.com/photo-1569982175971-d92b01cf8694?w=800",
      acceptance_rate: 43,
      student_population: 97000
    },
    {
      id: 4,
      name: "University of Melbourne",
      country: "Australia",
      city: "Melbourne",
      ranking: 14,
      logo_url: "https://images.unsplash.com/photo-1562774053-701939374585?w=200",
      cover_image: "https://images.unsplash.com/photo-1562774053-701939374585?w=800",
      acceptance_rate: 70,
      student_population: 52000
    }
  ];

  return (
    <section className="py-24 bg-slate-50">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
          <div>
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-alo-orange font-semibold text-sm uppercase tracking-wider"
            >
              Top Destinations
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-bold text-slate-900 mt-2"
            >
              Featured Universities
            </motion.h2>
          </div>
          <Link to={createPageUrl('Universities')}>
            <Button variant="ghost" className="text-education-blue hover:text-education-blue/90 mt-4 md:mt-0">
              View All Universities
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayUniversities.map((uni, index) => (
            <motion.div
              key={uni.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 bg-white">
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={uni.cover_image}
                    alt={uni.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
                  <Badge className="absolute top-4 left-4 bg-education-blue text-white border-0">
                    <Star className="w-3 h-3 mr-1" />
                    Rank #{uni.ranking}
                  </Badge>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-white font-bold text-lg line-clamp-1">{uni.name}</h3>
                    <div className="flex items-center text-white/80 text-sm mt-1">
                      <MapPin className="w-3 h-3 mr-1" />
                      {uni.city}, {uni.country}
                    </div>
                  </div>
                </div>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between text-sm text-slate-600">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-slate-400" />
                      {uni.student_population?.toLocaleString()} students
                    </div>
                    <div className="text-education-blue font-medium">
                      {uni.acceptance_rate}% Accept Rate
                    </div>
                  </div>
                  <Link to={createPageUrl('UniversityDetails') + `?id=${uni.id}`}>
                    <Button className="w-full mt-4 bg-gradient-brand hover:opacity-90 text-white group/btn">
                      Explore
                      <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
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