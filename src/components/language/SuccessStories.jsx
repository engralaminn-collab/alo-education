import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const stories = [
  {
    title: 'UK Student – IELTS Success',
    destination: 'United Kingdom',
    test: 'IELTS',
    content: 'Required IELTS 6.5 for UK undergraduate admission. Achieved IELTS 7.0 with ALO guidance and secured visa approval.',
    result: 'IELTS 7.0 ✓'
  },
  {
    title: 'Australia Student – PTE Route',
    destination: 'Australia',
    test: 'PTE Academic',
    content: 'Struggled with IELTS writing. Switched to PTE with ALO counselling and achieved required score within 1 month.',
    result: 'PTE 65+ ✓'
  },
  {
    title: 'Canada Student – Duolingo Success',
    destination: 'Canada',
    test: 'Duolingo English Test',
    content: 'Applied late for intake. Used Duolingo English Test and received offer letter successfully.',
    result: 'Duolingo 120+ ✓'
  },
  {
    title: 'UK Visa – IELTS UKVI',
    destination: 'United Kingdom',
    test: 'IELTS UKVI',
    content: 'Required IELTS UKVI for visa compliance. ALO guided correct test selection and documentation, visa approved smoothly.',
    result: 'Visa Approved ✓'
  }
];

export default function SuccessStories() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Student Success Stories</h2>
        <p className="text-lg text-slate-600">Real students, real results, real success with ALO Education</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {stories.map((story, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            viewport={{ once: true }}
          >
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all h-full">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <CardTitle className="text-lg text-slate-900 mb-2">{story.title}</CardTitle>
                    <Badge className="bg-education-blue text-white">{story.destination}</Badge>
                  </div>
                  <Badge className="bg-alo-orange text-white">{story.test}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-slate-600">{story.content}</p>
                
                <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <span className="font-semibold text-emerald-900">{story.result}</span>
                </div>

                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}