import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from 'lucide-react';

export default function WhatsAppIntegration() {
  return (
    <Card className="border-2 border-dashed border-amber-300 bg-amber-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-amber-900">
          <AlertCircle className="w-5 h-5" />
          WhatsApp Integration Not Available
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-amber-800 mb-4">
          WhatsApp Business API integration requires backend functions to be enabled. 
          This feature allows counselors to send application updates, document requests, and notes directly via WhatsApp.
        </p>
        <div className="space-y-2">
          <p className="text-sm font-medium text-amber-900">To enable WhatsApp:</p>
          <ol className="text-sm text-amber-800 list-decimal list-inside space-y-1 ml-2">
            <li>Go to your app Settings in the Base44 dashboard</li>
            <li>Enable Backend Functions</li>
            <li>Return here to set up WhatsApp Business API</li>
          </ol>
        </div>
        <Button variant="outline" className="w-full mt-4 border-amber-600 text-amber-900 hover:bg-amber-100" disabled>
          Backend Functions Required
        </Button>
      </CardContent>
    </Card>
  );
}