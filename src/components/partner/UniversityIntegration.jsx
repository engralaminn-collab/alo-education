import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Link2, Upload, CheckCircle, AlertCircle, FileText } from 'lucide-react';

export default function UniversityIntegration({ application }) {
  const [apiConfig, setApiConfig] = useState({
    university_id: '',
    api_endpoint: '',
    api_key: '',
    integration_type: 'manual'
  });

  const [offerLetter, setOfferLetter] = useState({
    type: 'conditional',
    issue_date: '',
    expiry_date: '',
    tuition_fee: '',
    conditions: '',
    file_url: ''
  });

  const universities = [
    { id: '1', name: 'University of Oxford', has_api: true },
    { id: '2', name: 'University of Cambridge', has_api: true },
    { id: '3', name: 'Imperial College London', has_api: false },
    { id: '4', name: 'UCL', has_api: false },
    { id: '5', name: 'University of Manchester', has_api: true },
  ];

  const handleAPITest = () => {
    toast.success('API connection successful');
  };

  const handleOfferLetterUpload = () => {
    toast.success('Offer letter uploaded successfully');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="w-5 h-5" style={{ color: '#0066CC' }} />
            University System Integration
          </CardTitle>
          <CardDescription>
            Configure direct integration with university application systems
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={apiConfig.integration_type} className="space-y-6">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger 
                value="api" 
                onClick={() => setApiConfig({...apiConfig, integration_type: 'api'})}
              >
                API Integration
              </TabsTrigger>
              <TabsTrigger 
                value="manual"
                onClick={() => setApiConfig({...apiConfig, integration_type: 'manual'})}
              >
                Manual Update
              </TabsTrigger>
            </TabsList>

            <TabsContent value="api" className="space-y-4">
              <div>
                <Label>Select University *</Label>
                <Select 
                  value={apiConfig.university_id}
                  onValueChange={(v) => setApiConfig({...apiConfig, university_id: v})}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select university" />
                  </SelectTrigger>
                  <SelectContent>
                    {universities.filter(u => u.has_api).map((uni) => (
                      <SelectItem key={uni.id} value={uni.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{uni.name}</span>
                          <Badge className="ml-2 bg-green-100 text-green-800">API Available</Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>API Endpoint</Label>
                <Input
                  value={apiConfig.api_endpoint}
                  onChange={(e) => setApiConfig({...apiConfig, api_endpoint: e.target.value})}
                  placeholder="https://api.university.edu/applications"
                  className="mt-2"
                />
              </div>

              <div>
                <Label>API Key</Label>
                <Input
                  type="password"
                  value={apiConfig.api_key}
                  onChange={(e) => setApiConfig({...apiConfig, api_key: e.target.value})}
                  placeholder="Enter university API key"
                  className="mt-2"
                />
              </div>

              <div className="flex gap-3">
                <Button onClick={handleAPITest} variant="outline">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Test Connection
                </Button>
                <Button style={{ backgroundColor: '#0066CC', color: 'white' }}>
                  Save Configuration
                </Button>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg mt-4">
                <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  API Integration Benefits
                </h4>
                <ul className="text-sm text-slate-600 space-y-1">
                  <li>• Real-time application status updates</li>
                  <li>• Automatic offer letter retrieval</li>
                  <li>• Instant CAS document access</li>
                  <li>• Reduced manual data entry</li>
                </ul>
              </div>
            </TabsContent>

            <TabsContent value="manual" className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-lg mb-4">
                <h4 className="font-semibold text-slate-900 mb-2">Manual Update Process</h4>
                <p className="text-sm text-slate-600">
                  For universities without API integration, manually update application status and upload offer documents here.
                </p>
              </div>

              <div>
                <Label>Application Status</Label>
                <Select defaultValue="submitted">
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="submitted">Submitted to University</SelectItem>
                    <SelectItem value="under_review">Under Review</SelectItem>
                    <SelectItem value="conditional_offer">Conditional Offer</SelectItem>
                    <SelectItem value="unconditional_offer">Unconditional Offer</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Offer Type</Label>
                <Select 
                  value={offerLetter.type}
                  onValueChange={(v) => setOfferLetter({...offerLetter, type: v})}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="conditional">Conditional Offer</SelectItem>
                    <SelectItem value="unconditional">Unconditional Offer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Issue Date</Label>
                  <Input
                    type="date"
                    value={offerLetter.issue_date}
                    onChange={(e) => setOfferLetter({...offerLetter, issue_date: e.target.value})}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Expiry Date</Label>
                  <Input
                    type="date"
                    value={offerLetter.expiry_date}
                    onChange={(e) => setOfferLetter({...offerLetter, expiry_date: e.target.value})}
                    className="mt-2"
                  />
                </div>
              </div>

              <div>
                <Label>Tuition Fee</Label>
                <Input
                  type="number"
                  value={offerLetter.tuition_fee}
                  onChange={(e) => setOfferLetter({...offerLetter, tuition_fee: e.target.value})}
                  placeholder="Enter amount"
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Offer Letter Document</Label>
                <div className="mt-2 border-2 border-dashed rounded-lg p-8 text-center">
                  <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-sm text-slate-600 mb-4">Upload offer letter PDF</p>
                  <Button variant="outline">
                    <Upload className="w-4 h-4 mr-2" />
                    Choose File
                  </Button>
                </div>
              </div>

              <Button 
                onClick={handleOfferLetterUpload}
                className="w-full"
                style={{ backgroundColor: '#F37021', color: '#000000' }}
              >
                Update Offer Details
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* CAS Management */}
      <Card>
        <CardHeader>
          <CardTitle>CAS Document Management</CardTitle>
          <CardDescription>
            Manage Confirmation of Acceptance for Studies (CAS) documents
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>CAS Number</Label>
            <Input placeholder="Enter CAS reference number" className="mt-2" />
          </div>

          <div>
            <Label>CAS Issue Date</Label>
            <Input type="date" className="mt-2" />
          </div>

          <div>
            <Label>CAS Document</Label>
            <div className="mt-2 border-2 border-dashed rounded-lg p-6 text-center">
              <FileText className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <p className="text-sm text-slate-600 mb-3">Upload CAS document PDF</p>
              <Button variant="outline" size="sm">
                <Upload className="w-4 h-4 mr-2" />
                Upload CAS
              </Button>
            </div>
          </div>

          <Button className="w-full" style={{ backgroundColor: '#0066CC', color: 'white' }}>
            Save CAS Details
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}