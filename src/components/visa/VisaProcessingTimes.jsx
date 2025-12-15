import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

const processingData = {
  uk: {
    standard: { time: '3 weeks', fee: '£363', description: 'Standard processing' },
    priority: { time: '5 working days', fee: '£500', description: 'Priority service' },
    super_priority: { time: '24 hours', fee: '£956', description: 'Super priority' },
    tips: [
      'Apply 3 months before course start',
      'Peak times: July-September (longer processing)',
      'Book biometric appointment early',
      'Complete application accurately to avoid delays'
    ]
  },
  usa: {
    standard: { time: '2-4 weeks', fee: '$160', description: 'After interview' },
    expedited: { time: '3-5 days', fee: '$160 + fee', description: 'Expedited processing' },
    tips: [
      'Apply 120 days before program start',
      'Interview wait times vary by location',
      'Peak season: May-August',
      'Be prepared for administrative processing delays'
    ]
  },
  canada: {
    standard: { time: '4-6 weeks', fee: 'CAD $150', description: 'Online application' },
    sds: { time: '20 days', fee: 'CAD $150', description: 'Student Direct Stream' },
    tips: [
      'SDS for students from select countries',
      'Apply after receiving LOA',
      'Biometrics valid for 10 years',
      'Processing faster outside peak season'
    ]
  },
  australia: {
    standard: { time: '4-6 weeks', fee: 'AUD $620', description: 'Subclass 500' },
    tips: [
      'Apply online through ImmiAccount',
      '75% processed within 29 days',
      '90% processed within 2 months',
      'Health examinations can add time'
    ]
  },
  germany: {
    standard: { time: '6-12 weeks', fee: '€75', description: 'National visa' },
    tips: [
      'Book embassy appointment early',
      'Processing varies by embassy',
      'Allow 3 months before departure',
      'Additional time for document verification'
    ]
  },
  ireland: {
    standard: { time: '8 weeks', fee: '€60', description: 'Study visa' },
    tips: [
      'Online application system',
      'Apply from outside Ireland',
      'Processing time varies',
      'Peak times: May-August'
    ]
  },
  newzealand: {
    standard: { time: '4-6 weeks', fee: 'NZD $295', description: 'Student visa' },
    tips: [
      'Online application preferred',
      'Medical and police checks add time',
      'Peak season: November-February',
      'Apply early to allow for delays'
    ]
  },
};

export default function VisaProcessingTimes({ country }) {
  const data = processingData[country.code] || processingData.uk;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            Processing Times - {country.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(data).filter(([key]) => key !== 'tips').map(([key, info]) => (
              <Card key={key} className="border-2 border-blue-100">
                <CardContent className="p-4">
                  <Badge className="mb-3 capitalize">{key.replace(/_/g, ' ')}</Badge>
                  <div className="text-2xl font-bold text-blue-600 mb-2">{info.time}</div>
                  <p className="text-sm text-slate-600 mb-2">{info.description}</p>
                  <div className="text-lg font-semibold text-slate-900">{info.fee}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="border-2 border-amber-200 bg-amber-50">
            <CardContent className="p-6">
              <div className="flex items-start gap-3 mb-4">
                <AlertCircle className="w-6 h-6 text-amber-600 shrink-0" />
                <div>
                  <h4 className="font-bold text-amber-900 mb-2">Important Tips</h4>
                  <ul className="space-y-2">
                    {data.tips.map((tip, idx) => (
                      <li key={idx} className="text-sm text-amber-800 flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-200 bg-green-50">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <TrendingUp className="w-6 h-6 text-green-600 shrink-0" />
                <div>
                  <h4 className="font-bold text-green-900 mb-2">Reduce Processing Time</h4>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>• Submit complete and accurate applications</li>
                    <li>• Provide all required documents at once</li>
                    <li>• Apply during off-peak seasons when possible</li>
                    <li>• Consider expedited/priority services if needed</li>
                    <li>• Respond quickly to any additional document requests</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}