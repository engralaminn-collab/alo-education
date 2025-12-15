import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Video, MapPin, Building2, BookOpen, Dumbbell, 
  Coffee, ExternalLink, Play, Image as ImageIcon 
} from 'lucide-react';

const campusLocations = [
  { name: 'Main Campus', icon: Building2, description: 'Administrative buildings and lecture halls' },
  { name: 'Library', icon: BookOpen, description: 'Modern learning resource center' },
  { name: 'Sports Complex', icon: Dumbbell, description: 'Fitness center and sports facilities' },
  { name: 'Student Union', icon: Coffee, description: 'Social hub and dining areas' },
];

export default function VirtualTourSection({ university }) {
  const [selectedLocation, setSelectedLocation] = useState(null);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="w-5 h-5 text-red-600" />
            Virtual Campus Tour
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg flex items-center justify-center relative overflow-hidden group cursor-pointer">
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
            <div className="relative z-10 text-center">
              <div className="w-20 h-20 rounded-full bg-white/90 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Play className="w-10 h-10 text-red-600 ml-1" />
              </div>
              <p className="text-white font-semibold text-lg">Watch Campus Tour Video</p>
              <p className="text-white/90 text-sm mt-1">Experience {university.university_name}</p>
            </div>
            <div 
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1562774053-701939374585?w=800')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            />
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-4">Explore Campus Locations</h4>
            <div className="grid md:grid-cols-2 gap-4">
              {campusLocations.map((location, idx) => {
                const Icon = location.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedLocation(location.name)}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      selectedLocation === location.name
                        ? 'border-red-500 bg-red-50'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        selectedLocation === location.name ? 'bg-red-100' : 'bg-slate-100'
                      }`}>
                        <Icon className={`w-5 h-5 ${
                          selectedLocation === location.name ? 'text-red-600' : 'text-slate-600'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-slate-900">{location.name}</div>
                        <div className="text-sm text-slate-600">{location.description}</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <Card className="border-2 border-blue-100 overflow-hidden">
              <div className="aspect-video bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center">
                <ImageIcon className="w-12 h-12 text-blue-600" />
              </div>
              <CardContent className="p-4">
                <h4 className="font-semibold text-slate-900 mb-1">Campus Gallery</h4>
                <p className="text-sm text-slate-600 mb-3">Browse photos of campus life</p>
                <Button variant="outline" size="sm" className="w-full">
                  View Gallery
                  <ExternalLink className="w-3 h-3 ml-2" />
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-100 overflow-hidden">
              <div className="aspect-video bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
                <MapPin className="w-12 h-12 text-green-600" />
              </div>
              <CardContent className="p-4">
                <h4 className="font-semibold text-slate-900 mb-1">Interactive Map</h4>
                <p className="text-sm text-slate-600 mb-3">Navigate campus facilities</p>
                <Button variant="outline" size="sm" className="w-full">
                  Open Map
                  <ExternalLink className="w-3 h-3 ml-2" />
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-100 overflow-hidden">
              <div className="aspect-video bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                <Video className="w-12 h-12 text-purple-600" />
              </div>
              <CardContent className="p-4">
                <h4 className="font-semibold text-slate-900 mb-1">360° Tour</h4>
                <p className="text-sm text-slate-600 mb-3">Immersive campus experience</p>
                <Button variant="outline" size="sm" className="w-full">
                  Start Tour
                  <ExternalLink className="w-3 h-3 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>

          {university.website_url && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-900">Official Virtual Tour</p>
                <p className="text-sm text-slate-600">Visit the university's official tour page for more content</p>
              </div>
              <a href={university.website_url} target="_blank" rel="noopener noreferrer">
                <Button>
                  Visit Website
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </a>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}