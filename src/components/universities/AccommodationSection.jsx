import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Home, Wifi, Utensils, Bed, DollarSign, 
  MapPin, Shield, Users2 
} from 'lucide-react';

const accommodationTypes = [
  {
    type: 'On-Campus Halls',
    icon: Home,
    description: 'Traditional university halls with shared facilities',
    features: ['All bills included', 'Close to campus', 'Social community', 'Security 24/7'],
    priceRange: '$150-300/week'
  },
  {
    type: 'Student Apartments',
    icon: Bed,
    description: 'Modern self-contained studio or shared apartments',
    features: ['Private bathroom', 'Kitchen facilities', 'Study space', 'Internet included'],
    priceRange: '$200-400/week'
  },
  {
    type: 'Private Housing',
    icon: MapPin,
    description: 'Off-campus accommodation in the local area',
    features: ['More independence', 'Various locations', 'Flexible contracts', 'Diverse options'],
    priceRange: '$180-350/week'
  },
];

export default function AccommodationSection({ university }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="w-5 h-5 text-blue-600" />
            Student Accommodation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-slate-600 leading-relaxed">
            {university.university_name} offers various accommodation options to suit different 
            preferences and budgets. All options are designed to provide a safe, comfortable, 
            and convenient living environment for international students.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {accommodationTypes.map((acc, idx) => {
              const Icon = acc.icon;
              return (
                <Card key={idx} className="border-2 hover:border-blue-200 transition-colors">
                  <CardContent className="p-4">
                    <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <h4 className="font-bold text-slate-900 mb-2">{acc.type}</h4>
                    <p className="text-sm text-slate-600 mb-4">{acc.description}</p>
                    <div className="space-y-2 mb-4">
                      {acc.features.map((feature, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                          <span className="text-slate-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                    <Badge variant="outline" className="text-blue-700 border-blue-300">
                      <DollarSign className="w-3 h-3 mr-1" />
                      {acc.priceRange}
                    </Badge>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-green-900">Support Services</span>
              </div>
              <ul className="space-y-1 text-sm text-green-700">
                <li>• Dedicated accommodation office</li>
                <li>• 24/7 security and emergency support</li>
                <li>• Maintenance services</li>
                <li>• Housing advice and guidance</li>
              </ul>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users2 className="w-5 h-5 text-purple-600" />
                <span className="font-semibold text-purple-900">Community Life</span>
              </div>
              <ul className="space-y-1 text-sm text-purple-700">
                <li>• Regular social events</li>
                <li>• Common rooms and study areas</li>
                <li>• Multicultural community</li>
                <li>• Resident advisors for support</li>
              </ul>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h4 className="font-semibold text-amber-900 mb-2">Application Tips</h4>
            <ul className="space-y-1 text-sm text-amber-800">
              <li>• Apply early to secure your preferred accommodation</li>
              <li>• Consider proximity to your faculty and campus facilities</li>
              <li>• Budget for additional costs like deposits and utilities</li>
              <li>• Join university housing groups to find flatmates</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}