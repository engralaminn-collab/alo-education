import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X, Search, Building2, DollarSign, Trophy, GraduationCap, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function ComparisonTool({ open, onClose, initialItems = [], type = 'university' }) {
  const [selectedItems, setSelectedItems] = useState(initialItems);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: universities = [] } = useQuery({
    queryKey: ['universities-comparison'],
    queryFn: () => base44.entities.University.list(),
    enabled: type === 'university',
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['courses-comparison'],
    queryFn: () => base44.entities.Course.list(),
    enabled: type === 'course',
  });

  const items = type === 'university' ? universities : courses;
  const filteredItems = items.filter(item => {
    const name = type === 'university' ? item.university_name : item.course_title;
    return name?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const addItem = (item) => {
    if (selectedItems.length >= 4) {
      toast.error('Maximum 4 items can be compared');
      return;
    }
    if (selectedItems.find(i => i.id === item.id)) {
      toast.error('Already added');
      return;
    }
    setSelectedItems([...selectedItems, item]);
  };

  const removeItem = (id) => {
    setSelectedItems(selectedItems.filter(i => i.id !== id));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl" style={{ color: 'var(--alo-blue)' }}>
            Compare {type === 'university' ? 'Universities' : 'Courses'}
          </DialogTitle>
        </DialogHeader>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            placeholder={`Search ${type === 'university' ? 'universities' : 'courses'}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Selected Items Pills */}
        {selectedItems.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedItems.map(item => (
              <Badge key={item.id} className="px-3 py-1 flex items-center gap-2" style={{ backgroundColor: 'var(--alo-blue)' }}>
                {type === 'university' ? item.university_name : item.course_title}
                <button onClick={() => removeItem(item.id)}>
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        {selectedItems.length < 2 ? (
          /* Search Results */
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {filteredItems.slice(0, 10).map(item => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer"
                onClick={() => addItem(item)}
              >
                <div className="flex items-center gap-3">
                  <Building2 className="w-5 h-5" style={{ color: 'var(--alo-blue)' }} />
                  <div>
                    <div className="font-semibold">{type === 'university' ? item.university_name : item.course_title}</div>
                    <div className="text-sm text-slate-600">
                      {type === 'university' ? `${item.city}, ${item.country}` : item.university_id}
                    </div>
                  </div>
                </div>
                <Button size="sm" variant="outline">Add</Button>
              </div>
            ))}
          </div>
        ) : (
          /* Comparison Table */
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-semibold" style={{ color: 'var(--alo-blue)' }}>Criteria</th>
                  {selectedItems.map(item => (
                    <th key={item.id} className="p-4">
                      <div className="text-center">
                        <div className="font-semibold mb-2">
                          {type === 'university' ? item.university_name : item.course_title}
                        </div>
                        <Button size="sm" variant="ghost" onClick={() => removeItem(item.id)}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {type === 'university' ? (
                  <>
                    <tr className="border-b">
                      <td className="p-4 font-medium">Location</td>
                      {selectedItems.map(uni => (
                        <td key={uni.id} className="p-4 text-center">{uni.city}, {uni.country}</td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-4 font-medium">QS Ranking</td>
                      {selectedItems.map(uni => (
                        <td key={uni.id} className="p-4 text-center">
                          {uni.qs_ranking ? (
                            <Badge className="bg-amber-100 text-amber-700">
                              <Trophy className="w-3 h-3 mr-1" />
                              #{uni.qs_ranking}
                            </Badge>
                          ) : 'N/A'}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-4 font-medium">Times Ranking</td>
                      {selectedItems.map(uni => (
                        <td key={uni.id} className="p-4 text-center">
                          {uni.times_ranking ? `#${uni.times_ranking}` : 'N/A'}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-4 font-medium">Student Population</td>
                      {selectedItems.map(uni => (
                        <td key={uni.id} className="p-4 text-center">
                          {uni.student_population?.toLocaleString() || 'N/A'}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-4 font-medium">International Students</td>
                      {selectedItems.map(uni => (
                        <td key={uni.id} className="p-4 text-center">
                          {uni.international_students_percent ? `${uni.international_students_percent}%` : 'N/A'}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-4 font-medium">Acceptance Rate</td>
                      {selectedItems.map(uni => (
                        <td key={uni.id} className="p-4 text-center">
                          {uni.acceptance_rate ? `${uni.acceptance_rate}%` : 'N/A'}
                        </td>
                      ))}
                    </tr>
                  </>
                ) : (
                  <>
                    <tr className="border-b">
                      <td className="p-4 font-medium">Level</td>
                      {selectedItems.map(course => (
                        <td key={course.id} className="p-4 text-center">
                          <Badge>{course.level}</Badge>
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-4 font-medium">Duration</td>
                      {selectedItems.map(course => (
                        <td key={course.id} className="p-4 text-center">{course.duration || 'N/A'}</td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-4 font-medium">Tuition Fee</td>
                      {selectedItems.map(course => (
                        <td key={course.id} className="p-4 text-center">
                          {course.tuition_fee_min ? (
                            <div>
                              <DollarSign className="w-4 h-4 inline" />
                              {course.tuition_fee_min.toLocaleString()} - {course.tuition_fee_max?.toLocaleString()}
                            </div>
                          ) : 'N/A'}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-4 font-medium">Intake</td>
                      {selectedItems.map(course => (
                        <td key={course.id} className="p-4 text-center">{course.intake || 'N/A'}</td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-4 font-medium">IELTS Required</td>
                      {selectedItems.map(course => (
                        <td key={course.id} className="p-4 text-center">
                          {course.ielts_required ? (
                            <CheckCircle className="w-5 h-5 text-green-600 mx-auto" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-600 mx-auto" />
                          )}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-4 font-medium">IELTS Overall</td>
                      {selectedItems.map(course => (
                        <td key={course.id} className="p-4 text-center">{course.ielts_overall || 'N/A'}</td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-4 font-medium">Scholarship Available</td>
                      {selectedItems.map(course => (
                        <td key={course.id} className="p-4 text-center">
                          {course.scholarship_available ? (
                            <CheckCircle className="w-5 h-5 text-green-600 mx-auto" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-600 mx-auto" />
                          )}
                        </td>
                      ))}
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex justify-between items-center pt-4 border-t">
          <p className="text-sm text-slate-600">
            {selectedItems.length < 2 
              ? `Select at least 2 items to compare (${selectedItems.length}/4)`
              : `Comparing ${selectedItems.length} items`
            }
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>Close</Button>
            {selectedItems.length >= 2 && (
              <Button onClick={() => setSelectedItems([])} variant="outline">Clear All</Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}