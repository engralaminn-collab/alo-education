import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, Image } from 'lucide-react';

export default function PartnerDownloads() {
  const downloads = [
    {
      id: 1,
      name: 'Partner Agreement Template',
      type: 'PDF',
      icon: FileText,
      description: 'Standard partner agreement document'
    },
    {
      id: 2,
      name: 'Marketing Brochure',
      type: 'PDF',
      icon: FileText,
      description: 'ALO Education marketing materials'
    },
    {
      id: 3,
      name: 'University Logos Pack',
      type: 'ZIP',
      icon: Image,
      description: 'Approved university logos for marketing'
    },
    {
      id: 4,
      name: 'Student Application Guide',
      type: 'PDF',
      icon: FileText,
      description: 'Complete guide for student applications'
    },
    {
      id: 5,
      name: 'Fee Structure 2024',
      type: 'PDF',
      icon: FileText,
      description: 'Current university fee structures'
    },
    {
      id: 6,
      name: 'Partner Portal User Guide',
      type: 'PDF',
      icon: FileText,
      description: 'How to use the partner portal effectively'
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Downloads</CardTitle>
        <CardDescription>
          Download approved marketing materials and university documents
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-4">
          {downloads.map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.id} className="border hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#0066CC20' }}>
                      <Icon className="w-6 h-6" style={{ color: '#0066CC' }} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-900 mb-1">{item.name}</h4>
                      <p className="text-sm text-slate-600 mb-3">{item.description}</p>
                      <Button size="sm" variant="outline" style={{ borderColor: '#F37021', color: '#F37021' }}>
                        <Download className="w-4 h-4 mr-2" />
                        Download {item.type}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}