import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default markers not showing
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function UniversitiesMap({ universities }) {
  const universitiesWithLocation = universities.filter(
    uni => uni.location?.latitude && uni.location?.longitude
  );

  if (universitiesWithLocation.length === 0) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="py-16 text-center">
          <MapPin className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-900 mb-2">No Location Data</h3>
          <p className="text-slate-500">Universities don't have location information yet</p>
        </CardContent>
      </Card>
    );
  }

  // Calculate center based on universities
  const avgLat = universitiesWithLocation.reduce((sum, uni) => sum + uni.location.latitude, 0) / universitiesWithLocation.length;
  const avgLng = universitiesWithLocation.reduce((sum, uni) => sum + uni.location.longitude, 0) / universitiesWithLocation.length;

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-600" />
          Universities Map
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[500px] rounded-lg overflow-hidden">
          <MapContainer
            center={[avgLat, avgLng]}
            zoom={4}
            scrollWheelZoom={false}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {universitiesWithLocation.map((uni) => (
              <Marker
                key={uni.id}
                position={[uni.location.latitude, uni.location.longitude]}
              >
                <Popup>
                  <div className="min-w-[200px]">
                    <div className="flex items-center gap-2 mb-2">
                      {uni.logo && (
                        <img
                          src={uni.logo}
                          alt={uni.university_name}
                          className="w-10 h-10 object-contain"
                        />
                      )}
                      <h3 className="font-bold text-sm">{uni.university_name}</h3>
                    </div>
                    <p className="text-xs text-slate-600 mb-1">
                      <MapPin className="w-3 h-3 inline mr-1" />
                      {uni.city}, {uni.country}
                    </p>
                    {uni.ranking && (
                      <p className="text-xs text-slate-600 mb-2">
                        Ranking: #{uni.ranking}
                      </p>
                    )}
                    <Link to={createPageUrl('UniversityDetailsPage') + `?id=${uni.id}`}>
                      <Button size="sm" className="w-full">
                        View Details
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </CardContent>
    </Card>
  );
}