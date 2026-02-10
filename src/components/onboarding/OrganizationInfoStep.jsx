import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Building2, ChevronRight } from 'lucide-react';

export default function OrganizationInfoStep({ onboarding, onComplete }) {
  const [formData, setFormData] = useState({
    organization_name: onboarding?.organization_info?.organization_name || '',
    contact_person: onboarding?.organization_info?.contact_person || '',
    phone: onboarding?.organization_info?.phone || '',
    website: onboarding?.organization_info?.website || '',
    country: onboarding?.organization_info?.country || '',
    target_markets: onboarding?.organization_info?.target_markets || []
  });

  const [selectedMarket, setSelectedMarket] = useState('');
  
  const popularMarkets = ['USA', 'UK', 'Canada', 'Australia', 'Germany', 'Ireland', 'New Zealand', 'Dubai'];

  const addMarket = (market) => {
    if (!formData.target_markets.includes(market)) {
      setFormData({ ...formData, target_markets: [...formData.target_markets, market] });
    }
    setSelectedMarket('');
  };

  const removeMarket = (market) => {
    setFormData({ 
      ...formData, 
      target_markets: formData.target_markets.filter(m => m !== market) 
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onComplete({ organization_info: formData });
  };

  const isValid = formData.organization_name && formData.contact_person && formData.country;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-education-blue" />
          Tell us about your organization
        </CardTitle>
        <p className="text-sm text-slate-600">
          Help us understand your organization better to tailor the experience
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Organization Name *</Label>
              <Input
                value={formData.organization_name}
                onChange={(e) => setFormData({ ...formData, organization_name: e.target.value })}
                placeholder="ABC Education Consultants"
              />
            </div>
            <div>
              <Label>Contact Person *</Label>
              <Input
                value={formData.contact_person}
                onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                placeholder="John Doe"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Phone Number</Label>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 234 567 8900"
              />
            </div>
            <div>
              <Label>Website</Label>
              <Input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://example.com"
              />
            </div>
          </div>

          <div>
            <Label>Country *</Label>
            <Input
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              placeholder="e.g., Bangladesh, India"
            />
          </div>

          <div>
            <Label>Target Markets</Label>
            <p className="text-xs text-slate-500 mb-2">Select countries where you send students</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {popularMarkets.map(market => (
                <Badge
                  key={market}
                  variant="outline"
                  className="cursor-pointer hover:bg-education-blue hover:text-white"
                  onClick={() => addMarket(market)}
                >
                  + {market}
                </Badge>
              ))}
            </div>
            
            {formData.target_markets.length > 0 && (
              <div className="flex flex-wrap gap-2 p-3 bg-blue-50 rounded-lg">
                {formData.target_markets.map(market => (
                  <Badge key={market} className="bg-education-blue">
                    {market}
                    <button
                      type="button"
                      onClick={() => removeMarket(market)}
                      className="ml-2 hover:text-red-200"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <Button type="submit" disabled={!isValid} className="w-full bg-education-blue">
            Continue
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}