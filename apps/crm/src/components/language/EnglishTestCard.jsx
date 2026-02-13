import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Clock, Calendar, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function EnglishTestCard({ test }) {
  return (
    <Card className="border-2 border-education-blue bg-white hover:shadow-lg transition-all">
      <CardHeader className="pb-3">
        <h3 className="text-xl font-bold text-alo-orange mb-2">{test.name}</h3>
        <div className="flex flex-wrap gap-2">
          {test.accepted.map(country => (
            <Badge key={country} className="bg-blue-100 text-education-blue">
              {country}
            </Badge>
          ))}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-3">
            <Clock className="w-4 h-4 text-alo-orange" />
            <div>
              <p className="text-slate-600">Duration</p>
              <p className="font-semibold text-slate-900">{test.duration}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Calendar className="w-4 h-4 text-alo-orange" />
            <div>
              <p className="text-slate-600">Results</p>
              <p className="font-semibold text-slate-900">{test.results}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-slate-600">Scoring</span>
            <p className="font-semibold text-slate-900">{test.scoring}</p>
          </div>

          <div className="flex items-center gap-3">
            <DollarSign className="w-4 h-4 text-alo-orange" />
            <div>
              <p className="text-slate-600">Cost</p>
              <p className="font-semibold text-slate-900">{test.cost}</p>
            </div>
          </div>
        </div>

        <p className="text-sm text-slate-600">{test.description}</p>

        <Link to={createPageUrl(test.page)}>
          <Button className="w-full bg-alo-orange hover:bg-orange-600 text-white">
            Learn More
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}