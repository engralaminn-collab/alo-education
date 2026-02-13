import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const tests = [
  {
    name: 'IELTS',
    duration: '2h 45m',
    results: '13 days',
    scoring: 'Band 0–9',
    cost: 'Medium',
    bestFor: 'UK, Australia, Canada'
  },
  {
    name: 'IELTS UKVI',
    duration: '2h 45m',
    results: '13 days',
    scoring: 'Band 0–9',
    cost: 'Slightly Higher',
    bestFor: 'UK Visa'
  },
  {
    name: 'PTE Academic',
    duration: '~2h',
    results: '2–5 days',
    scoring: '10–90',
    cost: 'Medium',
    bestFor: 'Australia, UK'
  },
  {
    name: 'TOEFL iBT',
    duration: '~3h',
    results: '6–10 days',
    scoring: '0–120',
    cost: 'High',
    bestFor: 'USA, Canada'
  },
  {
    name: 'Duolingo English Test',
    duration: '~1h',
    results: '48 hours',
    scoring: '10–160',
    cost: 'Low',
    bestFor: 'Fast Applications'
  },
  {
    name: 'OET',
    duration: '~3h',
    results: '14 days',
    scoring: 'Grade-based',
    cost: 'High',
    bestFor: 'Healthcare Courses'
  }
];

export default function TestComparisonTable() {
  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl">English Tests Comparison</CardTitle>
        <p className="text-slate-600 mt-2">Compare all tests based on duration, results timeline, scoring, cost, and acceptance</p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="bg-education-blue text-white">Test Name</TableHead>
                <TableHead className="bg-education-blue text-white">Duration</TableHead>
                <TableHead className="bg-education-blue text-white">Results</TableHead>
                <TableHead className="bg-education-blue text-white">Scoring</TableHead>
                <TableHead className="bg-education-blue text-white">Cost</TableHead>
                <TableHead className="bg-education-blue text-white">Best For</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tests.map((test, idx) => (
                <TableRow key={idx} className={idx % 2 === 0 ? 'bg-slate-50' : ''}>
                  <TableCell className="font-semibold text-alo-orange">{test.name}</TableCell>
                  <TableCell>{test.duration}</TableCell>
                  <TableCell>{test.results}</TableCell>
                  <TableCell>{test.scoring}</TableCell>
                  <TableCell>{test.cost}</TableCell>
                  <TableCell>{test.bestFor}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}