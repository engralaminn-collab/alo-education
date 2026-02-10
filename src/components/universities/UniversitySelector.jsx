import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Plus, X } from 'lucide-react';

export default function UniversitySelector({ universities, selected, onSelect, onRemove, maxSelect = 4 }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = universities.filter(u =>
    u.university_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.country?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const canAdd = selected.length < maxSelect;

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Search universities..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Selected Universities */}
        <Card className="border-2 border-education-blue bg-blue-50">
          <CardContent className="p-4">
            <h3 className="font-semibold text-slate-900 mb-3">
              Selected ({selected.length}/{maxSelect})
            </h3>
            <ScrollArea className="h-48">
              <div className="space-y-2 pr-4">
                {selected.length === 0 ? (
                  <p className="text-sm text-slate-500">Select universities to compare</p>
                ) : (
                  selected.map(uni => (
                    <div
                      key={uni.id}
                      className="flex items-center justify-between gap-2 p-2 bg-white rounded border border-education-blue"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{uni.university_name}</p>
                        <p className="text-xs text-slate-500">{uni.country}</p>
                      </div>
                      <button
                        onClick={() => onRemove(uni.id)}
                        className="p-1 hover:bg-red-100 rounded transition-colors"
                      >
                        <X className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Available Universities */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold text-slate-900 mb-3">Available Universities</h3>
            <ScrollArea className="h-48">
              <div className="space-y-2 pr-4">
                {filtered.length === 0 ? (
                  <p className="text-sm text-slate-500">No universities found</p>
                ) : (
                  filtered
                    .filter(u => !selected.find(s => s.id === u.id))
                    .map(uni => (
                      <button
                        key={uni.id}
                        onClick={() => canAdd && onSelect(uni)}
                        disabled={!canAdd}
                        className={`w-full text-left p-2 rounded border transition-all ${
                          canAdd
                            ? 'border-slate-200 hover:border-education-blue hover:bg-blue-50 cursor-pointer'
                            : 'border-slate-100 opacity-50 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">{uni.university_name}</p>
                            <p className="text-xs text-slate-500">{uni.country}</p>
                          </div>
                          {uni.qs_ranking && (
                            <Badge className="bg-blue-100 text-blue-800 text-xs flex-shrink-0">
                              #{uni.qs_ranking}
                            </Badge>
                          )}
                        </div>
                      </button>
                    ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {!canAdd && (
        <p className="text-sm text-amber-600 flex items-center gap-2">
          ⚠️ Maximum {maxSelect} universities can be compared
        </p>
      )}
    </div>
  );
}