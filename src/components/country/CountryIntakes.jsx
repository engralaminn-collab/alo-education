import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, CheckCircle } from 'lucide-react';

export default function CountryIntakes({ intakes }) {
  const intakeList = intakes || [
    { month: 'January', description: 'Winter intake - Ideal for students who missed September intake' },
    { month: 'May', description: 'Summer intake - Limited programs available' },
    { month: 'September', description: 'Fall intake - Main intake with most programs available' }
  ];

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {intakeList.map((intake, index) => (
        <Card key={index} className="border-2 hover:border-education-blue transition-all">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-alo-orange/10 flex items-center justify-center">
              <Calendar className="text-alo-orange" size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{intake.month}</h3>
            <p className="text-sm text-gray-600">{intake.description}</p>
            <CheckCircle className="mx-auto mt-4 text-green-500" size={20} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}