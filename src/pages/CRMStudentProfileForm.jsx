import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Save, User, FileText, Award, Briefcase, Globe, FileCheck, Target } from 'lucide-react';
import { toast } from 'sonner';
import CRMLayout from '@/components/crm/CRMLayout';
import AICourseUniversitySuggester from '@/components/crm/AICourseUniversitySuggester';
import StudentDocumentManager from '@/components/crm/StudentDocumentManager';

const countries = ['United Kingdom', 'United States', 'Canada', 'Australia', 'Ireland', 'New Zealand', 'Germany', 'Netherlands'];

export default function CRMStudentProfileForm() {
  const urlParams = new URLSearchParams(window.location.search);
  const studentId = urlParams.get('id');
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['student-profile', studentId],
    queryFn: async () => {
      const profiles = await base44.entities.StudentProfile.filter({ id: studentId });
      return profiles[0] || {};
    },
    enabled: !!studentId,
  });

  const { data: documents = [] } = useQuery({
    queryKey: ['student-documents', studentId],
    queryFn: () => base44.entities.Document.filter({ student_id: studentId }),
    enabled: !!studentId,
  });

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    nationality: '',
    preferred_countries: [],
    current_gpa: '',
    current_course: '',
    current_institution: '',
    has_passport: false,
    has_english_test: 'no',
    has_work_experience: false,
    has_reference: false,
    has_visa: false,
    has_visa_refusal: false,
    has_medical_condition: false,
    has_criminal_offence: false,
    education_records: [{ institute_type: '', institute_name: '', result: '', start_year: '', end_year: '' }],
    work_experiences: [],
    references: [],
    visa_history: [],
    admission_preferences: [],
  });

  React.useEffect(() => {
    if (profile) {
      setFormData({
        ...profile,
        preferred_countries: profile.preferred_countries || [],
        education_records: profile.education_records || [{}],
        work_experiences: profile.work_experiences || [],
        references: profile.references || [],
        visa_history: profile.visa_history || [],
        admission_preferences: profile.admission_preferences || [],
      });
    }
  }, [profile]);

  const updateProfileMutation = useMutation({
    mutationFn: (data) => base44.entities.StudentProfile.update(studentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-profile'] });
      toast.success('Profile updated successfully!');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  };

  const addEducation = () => {
    setFormData({
      ...formData,
      education_records: [...formData.education_records, { institute_type: '', institute_name: '' }]
    });
  };

  const removeEducation = (index) => {
    const updated = [...formData.education_records];
    updated.splice(index, 1);
    setFormData({ ...formData, education_records: updated });
  };

  const updateEducation = (index, field, value) => {
    const updated = [...formData.education_records];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, education_records: updated });
  };

  const addWorkExperience = () => {
    setFormData({
      ...formData,
      work_experiences: [...formData.work_experiences, { company_name: '', designation: '' }]
    });
  };

  const addReference = () => {
    setFormData({
      ...formData,
      references: [...formData.references, { referee_name: '', email: '' }]
    });
  };

  const addVisaHistory = () => {
    setFormData({
      ...formData,
      visa_history: [...formData.visa_history, { country: '', visa_type: '' }]
    });
  };

  const addPreference = () => {
    setFormData({
      ...formData,
      admission_preferences: [...formData.admission_preferences, { study_destination: '', study_level: '' }]
    });
  };

  const toggleCountry = (country) => {
    const current = formData.preferred_countries || [];
    if (current.includes(country)) {
      setFormData({ ...formData, preferred_countries: current.filter(c => c !== country) });
    } else {
      setFormData({ ...formData, preferred_countries: [...current, country] });
    }
  };

  if (isLoading) {
    return <CRMLayout currentPage="Student Profile"><div className="p-6">Loading...</div></CRMLayout>;
  }

  return (
    <CRMLayout currentPage="Student Profile">
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Student Profile Form</h1>
          <p className="text-slate-600">Complete profile with AI-powered suggestions</p>
        </div>

        {/* AI Suggester */}
        <div className="mb-6">
          <AICourseUniversitySuggester formData={formData} />
        </div>

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="personal">
            <TabsList className="mb-6">
              <TabsTrigger value="personal">Personal & Contact</TabsTrigger>
              <TabsTrigger value="academic">Academic Standing</TabsTrigger>
              <TabsTrigger value="preferences">Study Preferences</TabsTrigger>
              <TabsTrigger value="passport">Passport</TabsTrigger>
              <TabsTrigger value="education">Education History</TabsTrigger>
              <TabsTrigger value="tests">Test Scores</TabsTrigger>
              <TabsTrigger value="work">Work Experience</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="lor">LOR/Reference</TabsTrigger>
              <TabsTrigger value="visa">Visa History</TabsTrigger>
              <TabsTrigger value="funding">Funding</TabsTrigger>
            </TabsList>

            {/* Personal & Contact */}
            <TabsContent value="personal">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Personal & Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>First Name*</Label>
                      <Input value={formData.first_name || ''} onChange={(e) => setFormData({...formData, first_name: e.target.value})} required />
                    </div>
                    <div>
                      <Label>Last Name*</Label>
                      <Input value={formData.last_name || ''} onChange={(e) => setFormData({...formData, last_name: e.target.value})} required />
                    </div>
                    <div>
                      <Label>Date of Birth*</Label>
                      <Input type="date" value={formData.date_of_birth || ''} onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})} />
                    </div>
                    <div>
                      <Label>Nationality*</Label>
                      <Input value={formData.nationality || ''} onChange={(e) => setFormData({...formData, nationality: e.target.value})} />
                    </div>
                    <div>
                      <Label>Email*</Label>
                      <Input type="email" value={formData.email || ''} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
                    </div>
                    <div>
                      <Label>Phone*</Label>
                      <Input value={formData.phone || ''} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Academic Standing */}
            <TabsContent value="academic">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-blue-600" />
                    Current Academic Standing
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Current Institution</Label>
                      <Input 
                        value={formData.current_institution || ''} 
                        onChange={(e) => setFormData({...formData, current_institution: e.target.value})} 
                        placeholder="e.g., XYZ University"
                      />
                    </div>
                    <div>
                      <Label>Current Course/Program</Label>
                      <Input 
                        value={formData.current_course || ''} 
                        onChange={(e) => setFormData({...formData, current_course: e.target.value})} 
                        placeholder="e.g., B.Tech Computer Science"
                      />
                    </div>
                    <div>
                      <Label>Current GPA / Score</Label>
                      <Input 
                        type="number"
                        step="0.01"
                        value={formData.current_gpa || ''} 
                        onChange={(e) => setFormData({...formData, current_gpa: e.target.value})} 
                        placeholder="e.g., 3.5 or 85%"
                      />
                    </div>
                    <div>
                      <Label>GPA Scale / Max Score</Label>
                      <Input 
                        value={formData.gpa_scale || ''} 
                        onChange={(e) => setFormData({...formData, gpa_scale: e.target.value})} 
                        placeholder="e.g., 4.0 or 100"
                      />
                    </div>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      <Award className="w-4 h-4 inline mr-1" />
                      This information helps AI suggest the most suitable universities and courses for you.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Study Preferences */}
            <TabsContent value="preferences">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-purple-600" />
                    Study Preferences & Goals
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label className="mb-3 block">Preferred Study Destinations (Multi-select)</Label>
                    <div className="grid md:grid-cols-3 gap-3">
                      {countries.map(country => (
                        <div 
                          key={country}
                          onClick={() => toggleCountry(country)}
                          className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                            formData.preferred_countries?.includes(country)
                              ? 'border-purple-500 bg-purple-50'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Checkbox 
                              checked={formData.preferred_countries?.includes(country)}
                              onCheckedChange={() => toggleCountry(country)}
                            />
                            <span className="text-sm font-medium">{country}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Preferred Degree Level</Label>
                    <Select 
                      value={formData.preferred_degree_level || ''} 
                      onValueChange={(v) => setFormData({...formData, preferred_degree_level: v})}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select degree level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Foundation">Foundation</SelectItem>
                        <SelectItem value="Undergraduate">Undergraduate</SelectItem>
                        <SelectItem value="Postgraduate">Postgraduate</SelectItem>
                        <SelectItem value="PhD">PhD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Preferred Fields of Study (comma-separated)</Label>
                    <Input 
                      value={formData.preferred_fields?.join(', ') || ''} 
                      onChange={(e) => setFormData({
                        ...formData, 
                        preferred_fields: e.target.value.split(',').map(f => f.trim()).filter(Boolean)
                      })} 
                      placeholder="e.g., Computer Science, Business, Engineering"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label>Maximum Budget (USD)</Label>
                    <Input 
                      type="number"
                      value={formData.budget_max || ''} 
                      onChange={(e) => setFormData({...formData, budget_max: parseFloat(e.target.value)})} 
                      placeholder="e.g., 50000"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label>Target Intake</Label>
                    <Input 
                      value={formData.target_intake || ''} 
                      onChange={(e) => setFormData({...formData, target_intake: e.target.value})} 
                      placeholder="e.g., September 2026"
                      className="mt-2"
                    />
                  </div>

                  {formData.admission_preferences.map((pref, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-semibold text-sm">Additional Preference {index + 1}</h4>
                        <Button 
                          type="button" 
                          size="sm" 
                          variant="ghost"
                          onClick={() => {
                            const updated = [...formData.admission_preferences];
                            updated.splice(index, 1);
                            setFormData({...formData, admission_preferences: updated});
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label>Study Destination*</Label>
                          <Input value={pref.study_destination || ''} onChange={(e) => {
                            const updated = [...formData.admission_preferences];
                            updated[index].study_destination = e.target.value;
                            setFormData({...formData, admission_preferences: updated});
                          }} />
                        </div>
                        <div>
                          <Label>Study Level*</Label>
                          <Input value={pref.study_level || ''} onChange={(e) => {
                            const updated = [...formData.admission_preferences];
                            updated[index].study_level = e.target.value;
                            setFormData({...formData, admission_preferences: updated});
                          }} />
                        </div>
                        <div>
                          <Label>Program/Course Title*</Label>
                          <Input value={pref.program_title || ''} onChange={(e) => {
                            const updated = [...formData.admission_preferences];
                            updated[index].program_title = e.target.value;
                            setFormData({...formData, admission_preferences: updated});
                          }} />
                        </div>
                        <div>
                          <Label>Intake</Label>
                          <Input value={pref.intake || ''} onChange={(e) => {
                            const updated = [...formData.admission_preferences];
                            updated[index].intake = e.target.value;
                            setFormData({...formData, admission_preferences: updated});
                          }} />
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <Button type="button" onClick={addPreference} variant="outline" className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Additional Preference
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Passport */}
            <TabsContent value="passport">
              <Card>
                <CardHeader>
                  <CardTitle>Passport Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Checkbox checked={formData.has_passport} onCheckedChange={(checked) => setFormData({...formData, has_passport: checked})} />
                    <Label>Do you have any Passport?</Label>
                  </div>

                  {formData.has_passport && (
                    <div className="grid md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <Label>Passport Number*</Label>
                        <Input value={formData.passport_number || ''} onChange={(e) => setFormData({...formData, passport_number: e.target.value})} />
                      </div>
                      <div>
                        <Label>Place of Issue*</Label>
                        <Input value={formData.passport_place_of_issue || ''} onChange={(e) => setFormData({...formData, passport_place_of_issue: e.target.value})} />
                      </div>
                      <div>
                        <Label>Issue Date*</Label>
                        <Input type="date" value={formData.passport_issue_date || ''} onChange={(e) => setFormData({...formData, passport_issue_date: e.target.value})} />
                      </div>
                      <div>
                        <Label>Expiry Date*</Label>
                        <Input type="date" value={formData.passport_expiry_date || ''} onChange={(e) => setFormData({...formData, passport_expiry_date: e.target.value})} />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Education History */}
            <TabsContent value="education">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Education History
                    </span>
                    <Button type="button" onClick={addEducation} size="sm">
                      <Plus className="w-4 h-4 mr-1" /> Add Education
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {formData.education_records.map((edu, index) => (
                    <div key={index} className="border rounded-lg p-4 relative">
                      {index > 0 && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => removeEducation(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label>Institute Type</Label>
                          <select value={edu.institute_type || ''} onChange={(e) => updateEducation(index, 'institute_type', e.target.value)} className="w-full px-3 py-2 border rounded-md">
                            <option value="">Select</option>
                            <option value="SSC">SSC</option>
                            <option value="HSC">HSC</option>
                            <option value="Diploma">Diploma</option>
                            <option value="Bachelor">Bachelor</option>
                            <option value="Master">Master</option>
                            <option value="PhD">PhD</option>
                          </select>
                        </div>
                        <div>
                          <Label>Institute Name*</Label>
                          <Input value={edu.institute_name || ''} onChange={(e) => updateEducation(index, 'institute_name', e.target.value)} />
                        </div>
                        <div>
                          <Label>Subject/Field</Label>
                          <Input value={edu.subject || ''} onChange={(e) => updateEducation(index, 'subject', e.target.value)} />
                        </div>
                        <div>
                          <Label>Result/GPA*</Label>
                          <Input value={edu.result || ''} onChange={(e) => updateEducation(index, 'result', e.target.value)} placeholder="GPA/CGPA/Percentage" />
                        </div>
                        <div>
                          <Label>Start Year*</Label>
                          <Input type="month" value={edu.start_year || ''} onChange={(e) => updateEducation(index, 'start_year', e.target.value)} />
                        </div>
                        <div>
                          <Label>End Year*</Label>
                          <Input type="month" value={edu.end_year || ''} onChange={(e) => updateEducation(index, 'end_year', e.target.value)} />
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Test Scores */}
            <TabsContent value="tests">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    English Proficiency / Test Scores
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Do you have any English Proficiency Test?</Label>
                    <select value={formData.has_english_test || 'no'} onChange={(e) => setFormData({...formData, has_english_test: e.target.value})} className="w-full px-3 py-2 border rounded-md mt-2">
                      <option value="no">No</option>
                      <option value="yes">Yes</option>
                      <option value="yet_to_receive">Yet to Receive</option>
                      <option value="planning">Planning</option>
                    </select>
                  </div>

                  {formData.has_english_test === 'yes' && (
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label>English Test Name</Label>
                        <select value={formData.english_test_name || ''} onChange={(e) => setFormData({...formData, english_test_name: e.target.value})} className="w-full px-3 py-2 border rounded-md mt-2">
                          <option value="">Select</option>
                          <option value="IELTS">IELTS</option>
                          <option value="IELTS-UKVI">IELTS-UKVI</option>
                          <option value="PTE">PTE</option>
                          <option value="TOEFL">TOEFL</option>
                          <option value="DET">DET (Duolingo)</option>
                        </select>
                      </div>
                      <div>
                        <Label>Overall Score*</Label>
                        <Input value={formData.test_overall_score || ''} onChange={(e) => setFormData({...formData, test_overall_score: e.target.value})} className="mt-2" />
                      </div>
                      <div>
                        <Label>Test Date*</Label>
                        <Input type="date" value={formData.test_date || ''} onChange={(e) => setFormData({...formData, test_date: e.target.value})} className="mt-2" />
                      </div>
                      <div>
                        <Label>Expiration Date</Label>
                        <Input type="date" value={formData.test_expiry || ''} onChange={(e) => setFormData({...formData, test_expiry: e.target.value})} className="mt-2" />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Work Experience */}
            <TabsContent value="work">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Briefcase className="w-5 h-5" />
                      Work Experience
                    </span>
                    <Button type="button" onClick={addWorkExperience} size="sm">
                      <Plus className="w-4 h-4 mr-1" /> Add Experience
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Checkbox checked={formData.has_work_experience} onCheckedChange={(checked) => setFormData({...formData, has_work_experience: checked})} />
                    <Label>Do you have any Work Experience?</Label>
                  </div>

                  {formData.has_work_experience && formData.work_experiences.map((work, index) => (
                    <div key={index} className="border rounded-lg p-4 relative">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="absolute top-2 right-2"
                        onClick={() => {
                          const updated = [...formData.work_experiences];
                          updated.splice(index, 1);
                          setFormData({...formData, work_experiences: updated});
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label>Company Name*</Label>
                          <Input value={work.company_name || ''} onChange={(e) => {
                            const updated = [...formData.work_experiences];
                            updated[index].company_name = e.target.value;
                            setFormData({...formData, work_experiences: updated});
                          }} />
                        </div>
                        <div>
                          <Label>Designation*</Label>
                          <Input value={work.designation || ''} onChange={(e) => {
                            const updated = [...formData.work_experiences];
                            updated[index].designation = e.target.value;
                            setFormData({...formData, work_experiences: updated});
                          }} />
                        </div>
                        <div>
                          <Label>Start Date*</Label>
                          <Input type="date" value={work.start_date || ''} onChange={(e) => {
                            const updated = [...formData.work_experiences];
                            updated[index].start_date = e.target.value;
                            setFormData({...formData, work_experiences: updated});
                          }} />
                        </div>
                        <div>
                          <Label>End Date</Label>
                          <Input type="date" value={work.end_date || ''} onChange={(e) => {
                            const updated = [...formData.work_experiences];
                            updated[index].end_date = e.target.value;
                            setFormData({...formData, work_experiences: updated});
                          }} disabled={work.currently_working} />
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox checked={work.currently_working} onCheckedChange={(checked) => {
                            const updated = [...formData.work_experiences];
                            updated[index].currently_working = checked;
                            if (checked) updated[index].end_date = '';
                            setFormData({...formData, work_experiences: updated});
                          }} />
                          <Label>Currently Working</Label>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Documents */}
            <TabsContent value="documents">
              <StudentDocumentManager studentId={studentId} documents={documents} />
            </TabsContent>

            {/* LOR/Reference */}
            <TabsContent value="lor">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <FileCheck className="w-5 h-5" />
                      Recommendation Letters (LOR)
                    </span>
                    <Button type="button" onClick={addReference} size="sm">
                      <Plus className="w-4 h-4 mr-1" /> Add Reference
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Checkbox checked={formData.has_reference} onCheckedChange={(checked) => setFormData({...formData, has_reference: checked})} />
                    <Label>Do you have any References?</Label>
                  </div>

                  {formData.has_reference && formData.references.map((ref, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label>Referee Name*</Label>
                          <Input value={ref.referee_name || ''} onChange={(e) => {
                            const updated = [...formData.references];
                            updated[index].referee_name = e.target.value;
                            setFormData({...formData, references: updated});
                          }} />
                        </div>
                        <div>
                          <Label>Institution/Company</Label>
                          <Input value={ref.institution || ''} onChange={(e) => {
                            const updated = [...formData.references];
                            updated[index].institution = e.target.value;
                            setFormData({...formData, references: updated});
                          }} />
                        </div>
                        <div>
                          <Label>Email</Label>
                          <Input type="email" value={ref.email || ''} onChange={(e) => {
                            const updated = [...formData.references];
                            updated[index].email = e.target.value;
                            setFormData({...formData, references: updated});
                          }} />
                        </div>
                        <div>
                          <Label>Phone</Label>
                          <Input value={ref.phone || ''} onChange={(e) => {
                            const updated = [...formData.references];
                            updated[index].phone = e.target.value;
                            setFormData({...formData, references: updated});
                          }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Visa History */}
            <TabsContent value="visa">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Globe className="w-5 h-5" />
                      Background & Visa History
                    </span>
                    <Button type="button" onClick={addVisaHistory} size="sm">
                      <Plus className="w-4 h-4 mr-1" /> Add Visa
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Checkbox checked={formData.has_visa} onCheckedChange={(checked) => setFormData({...formData, has_visa: checked})} />
                    <Label>Do you have any Visa?</Label>
                  </div>

                  {formData.has_visa && formData.visa_history.map((visa, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label>Country*</Label>
                          <Input value={visa.country || ''} onChange={(e) => {
                            const updated = [...formData.visa_history];
                            updated[index].country = e.target.value;
                            setFormData({...formData, visa_history: updated});
                          }} />
                        </div>
                        <div>
                          <Label>Visa Type*</Label>
                          <select value={visa.visa_type || ''} onChange={(e) => {
                            const updated = [...formData.visa_history];
                            updated[index].visa_type = e.target.value;
                            setFormData({...formData, visa_history: updated});
                          }} className="w-full px-3 py-2 border rounded-md">
                            <option value="">Select</option>
                            <option value="Student">Student</option>
                            <option value="Tourist">Tourist</option>
                            <option value="Business">Business</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="pt-4 border-t space-y-3">
                    <div className="flex items-center gap-2">
                      <Checkbox checked={formData.has_visa_refusal} onCheckedChange={(checked) => setFormData({...formData, has_visa_refusal: checked})} />
                      <Label>Any Visa Refusal?</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox checked={formData.has_medical_condition} onCheckedChange={(checked) => setFormData({...formData, has_medical_condition: checked})} />
                      <Label>Any Serious Medical Condition?</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox checked={formData.has_criminal_offence} onCheckedChange={(checked) => setFormData({...formData, has_criminal_offence: checked})} />
                      <Label>Any Criminal Offence?</Label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Funding */}
            <TabsContent value="funding">
              <Card>
                <CardHeader>
                  <CardTitle>Study Funding Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Funding Status</Label>
                    <select value={formData.funding_status || ''} onChange={(e) => setFormData({...formData, funding_status: e.target.value})} className="w-full px-3 py-2 border rounded-md mt-2">
                      <option value="">Select</option>
                      <option value="Self">Self-Funded</option>
                      <option value="Loan">Loan Support</option>
                      <option value="Scholarship">Scholarship</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <Label>Sponsor</Label>
                    <select value={formData.sponsor || ''} onChange={(e) => setFormData({...formData, sponsor: e.target.value})} className="w-full px-3 py-2 border rounded-md mt-2">
                      <option value="">Select</option>
                      <option value="Applicant">Applicant</option>
                      <option value="Parents">Parents</option>
                      <option value="Sibling">Sibling</option>
                      <option value="Others">Others</option>
                    </select>
                  </div>
                  <div>
                    <Label>Source of Fund</Label>
                    <Textarea value={formData.source_of_fund || ''} onChange={(e) => setFormData({...formData, source_of_fund: e.target.value})} className="mt-2" />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="mt-6 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => window.history.back()}>
              Cancel
            </Button>
            <Button type="submit" className="px-8 bg-gradient-to-r from-purple-600 to-pink-600">
              <Save className="w-4 h-4 mr-2" />
              Save Profile
            </Button>
          </div>
        </form>
      </div>
    </CRMLayout>
  );
}