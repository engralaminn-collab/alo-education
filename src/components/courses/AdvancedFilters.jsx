import React from 'react';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";

export default function AdvancedFilters({ filters, onFilterChange }) {
  const updateFilter = (key, value) => {
    onFilterChange({ ...filters, [key]: value });
  };

  return (
    <div className="space-y-6">
      {/* English Test */}
      <div>
        <Label className="text-sm font-medium mb-2 block">English Test</Label>
        <Select 
          value={filters.englishTestType} 
          onValueChange={(v) => updateFilter('englishTestType', v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select test type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="IELTS">IELTS</SelectItem>
            <SelectItem value="PTE">PTE</SelectItem>
            <SelectItem value="TOEFL">TOEFL</SelectItem>
            <SelectItem value="DET">Duolingo (DET)</SelectItem>
            <SelectItem value="OIETC">OIETC</SelectItem>
            <SelectItem value="LANGUAGECERT">LanguageCert</SelectItem>
            <SelectItem value="MOI">MOI Available</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* English Scores */}
      {filters.englishTestType && filters.englishTestType !== 'MOI' && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm mb-2 block">Overall Score</Label>
            <Input 
              type="number" 
              step="0.5"
              value={filters.englishOverall || ''} 
              onChange={(e) => updateFilter('englishOverall', parseFloat(e.target.value))}
              placeholder="6.5"
            />
          </div>
          <div>
            <Label className="text-sm mb-2 block">Min Score</Label>
            <Input 
              type="number" 
              step="0.5"
              value={filters.englishMin || ''} 
              onChange={(e) => updateFilter('englishMin', parseFloat(e.target.value))}
              placeholder="6.0"
            />
          </div>
        </div>
      )}

      {/* Academic Qualification */}
      <div>
        <Label className="text-sm font-medium mb-2 block">Academic Qualification</Label>
        <Select 
          value={filters.academicQualification} 
          onValueChange={(v) => updateFilter('academicQualification', v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select qualification" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Class XII">Class XII</SelectItem>
            <SelectItem value="Bachelors">Bachelor's Degree</SelectItem>
            <SelectItem value="Masters">Master's Degree</SelectItem>
            <SelectItem value="Diploma">Diploma</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Academic Score */}
      <div>
        <Label className="text-sm font-medium mb-2 block">Academic Score (%)</Label>
        <Input 
          type="number" 
          value={filters.academicScore || ''} 
          onChange={(e) => updateFilter('academicScore', e.target.value)}
          placeholder="75"
        />
      </div>

      {/* Tuition Fee Range */}
      <div>
        <Label className="text-sm font-medium mb-2 block">
          Max Tuition Fee (£{(filters.maxTuition || 50000).toLocaleString()})
        </Label>
        <Slider
          min={0}
          max={50000}
          step={1000}
          value={[filters.maxTuition || 50000]}
          onValueChange={([v]) => updateFilter('maxTuition', v)}
          className="mb-2"
        />
      </div>

      {/* Quick Filters */}
      <div className="space-y-3 pt-3 border-t">
        <div className="flex items-center gap-2">
          <Checkbox 
            id="russell-group"
            checked={filters.russellGroupOnly || false}
            onCheckedChange={(checked) => updateFilter('russellGroupOnly', checked)}
          />
          <label htmlFor="russell-group" className="text-sm cursor-pointer">
            Russell Group Only
          </label>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox 
            id="moi-acceptable"
            checked={filters.moiAcceptableOnly || false}
            onCheckedChange={(checked) => updateFilter('moiAcceptableOnly', checked)}
          />
          <label htmlFor="moi-acceptable" className="text-sm cursor-pointer">
            Accepts MOI
          </label>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox 
            id="low-deposit"
            checked={filters.lowDepositOnly || false}
            onCheckedChange={(checked) => updateFilter('lowDepositOnly', checked)}
          />
          <label htmlFor="low-deposit" className="text-sm cursor-pointer">
            Low Deposit Available
          </label>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox 
            id="scholarship"
            checked={filters.scholarshipOnly || false}
            onCheckedChange={(checked) => updateFilter('scholarshipOnly', checked)}
          />
          <label htmlFor="scholarship" className="text-sm cursor-pointer">
            Scholarship Available
          </label>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox 
            id="premium"
            checked={filters.premiumOnly || false}
            onCheckedChange={(checked) => updateFilter('premiumOnly', checked)}
          />
          <label htmlFor="premium" className="text-sm cursor-pointer">
            Premium Universities Only
          </label>
        </div>
      </div>
    </div>
  );
}