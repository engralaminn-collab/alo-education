import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Circle } from 'lucide-react';

const visaChecklists = {
  uk: [
    { id: 1, task: 'Check visa type requirements (Student Route)', category: 'preparation' },
    { id: 2, task: 'Obtain Confirmation of Acceptance (CAS) from university', category: 'preparation' },
    { id: 3, task: 'Prepare financial documents (28-day bank statement)', category: 'documents' },
    { id: 4, task: 'Get tuberculosis test results', category: 'documents' },
    { id: 5, task: 'Prepare academic documents and English test scores', category: 'documents' },
    { id: 6, task: 'Complete online visa application form', category: 'application' },
    { id: 7, task: 'Pay visa application fee and healthcare surcharge', category: 'application' },
    { id: 8, task: 'Book and attend biometric appointment', category: 'application' },
    { id: 9, task: 'Submit supporting documents', category: 'submission' },
    { id: 10, task: 'Track application status', category: 'submission' },
  ],
  usa: [
    { id: 1, task: 'Receive I-20 form from university', category: 'preparation' },
    { id: 2, task: 'Pay SEVIS fee', category: 'preparation' },
    { id: 3, task: 'Complete DS-160 online form', category: 'application' },
    { id: 4, task: 'Pay visa application fee', category: 'application' },
    { id: 5, task: 'Schedule visa interview at embassy', category: 'application' },
    { id: 6, task: 'Prepare financial documents', category: 'documents' },
    { id: 7, task: 'Gather academic transcripts and test scores', category: 'documents' },
    { id: 8, task: 'Attend visa interview', category: 'submission' },
    { id: 9, task: 'Submit passport for visa stamping', category: 'submission' },
    { id: 10, task: 'Receive passport with visa', category: 'submission' },
  ],
  canada: [
    { id: 1, task: 'Receive Letter of Acceptance from DLI', category: 'preparation' },
    { id: 2, task: 'Create GCKey account', category: 'preparation' },
    { id: 3, task: 'Complete online application (IMM 1294)', category: 'application' },
    { id: 4, task: 'Provide biometrics', category: 'documents' },
    { id: 5, task: 'Submit proof of financial support', category: 'documents' },
    { id: 6, task: 'Medical examination (if required)', category: 'documents' },
    { id: 7, task: 'Police certificate (if required)', category: 'documents' },
    { id: 8, task: 'Pay application fee', category: 'application' },
    { id: 9, task: 'Submit application online', category: 'submission' },
    { id: 10, task: 'Wait for decision letter', category: 'submission' },
  ],
  australia: [
    { id: 1, task: 'Receive Confirmation of Enrolment (CoE)', category: 'preparation' },
    { id: 2, task: 'Arrange Overseas Student Health Cover (OSHC)', category: 'preparation' },
    { id: 3, task: 'Create ImmiAccount', category: 'application' },
    { id: 4, task: 'Complete online visa application (Subclass 500)', category: 'application' },
    { id: 5, task: 'Provide evidence of financial capacity', category: 'documents' },
    { id: 6, task: 'English proficiency test results', category: 'documents' },
    { id: 7, task: 'Health examination', category: 'documents' },
    { id: 8, task: 'Pay visa application fee', category: 'application' },
    { id: 9, task: 'Submit application', category: 'submission' },
    { id: 10, task: 'Await visa decision', category: 'submission' },
  ],
  germany: [
    { id: 1, task: 'Receive university admission letter', category: 'preparation' },
    { id: 2, task: 'Open blocked account (€11,208)', category: 'preparation' },
    { id: 3, task: 'Get health insurance', category: 'preparation' },
    { id: 4, task: 'Complete visa application form', category: 'application' },
    { id: 5, task: 'Prepare academic documents', category: 'documents' },
    { id: 6, task: 'Language proficiency proof', category: 'documents' },
    { id: 7, task: 'Schedule embassy appointment', category: 'application' },
    { id: 8, task: 'Attend visa interview', category: 'submission' },
    { id: 9, task: 'Submit all documents', category: 'submission' },
    { id: 10, task: 'Collect visa', category: 'submission' },
  ],
  ireland: [
    { id: 1, task: 'Receive offer letter from Irish institution', category: 'preparation' },
    { id: 2, task: 'Show proof of fees paid', category: 'preparation' },
    { id: 3, task: 'Demonstrate financial evidence (€10,000)', category: 'documents' },
    { id: 4, task: 'Get private medical insurance', category: 'documents' },
    { id: 5, task: 'Complete online application', category: 'application' },
    { id: 6, task: 'Prepare academic documents', category: 'documents' },
    { id: 7, task: 'English proficiency proof', category: 'documents' },
    { id: 8, task: 'Submit application online', category: 'submission' },
    { id: 9, task: 'Pay visa fee', category: 'application' },
    { id: 10, task: 'Await decision', category: 'submission' },
  ],
  newzealand: [
    { id: 1, task: 'Receive offer of place', category: 'preparation' },
    { id: 2, task: 'Show proof of funds (NZ$20,000/year)', category: 'documents' },
    { id: 3, task: 'Apply online for student visa', category: 'application' },
    { id: 4, task: 'Provide chest X-ray (if required)', category: 'documents' },
    { id: 5, task: 'Police certificate', category: 'documents' },
    { id: 6, task: 'Medical certificate', category: 'documents' },
    { id: 7, task: 'Academic documents and English test', category: 'documents' },
    { id: 8, task: 'Pay application fee', category: 'application' },
    { id: 9, task: 'Submit application', category: 'submission' },
    { id: 10, task: 'Receive visa decision', category: 'submission' },
  ],
};

export default function VisaChecklist({ country, studentProfile }) {
  const [completedTasks, setCompletedTasks] = useState([]);
  const checklist = visaChecklists[country.code] || visaChecklists.uk;

  useEffect(() => {
    const saved = localStorage.getItem(`visa-checklist-${country.code}-${studentProfile?.id}`);
    if (saved) {
      setCompletedTasks(JSON.parse(saved));
    }
  }, [country.code, studentProfile?.id]);

  const toggleTask = (taskId) => {
    const newCompleted = completedTasks.includes(taskId)
      ? completedTasks.filter(id => id !== taskId)
      : [...completedTasks, taskId];
    
    setCompletedTasks(newCompleted);
    localStorage.setItem(`visa-checklist-${country.code}-${studentProfile?.id}`, JSON.stringify(newCompleted));
  };

  const progress = (completedTasks.length / checklist.length) * 100;

  const categories = ['preparation', 'documents', 'application', 'submission'];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Visa Application Checklist - {country.name}</span>
            <span className="text-lg font-bold text-blue-600">{completedTasks.length}/{checklist.length}</span>
          </CardTitle>
          <Progress value={progress} className="h-2" />
        </CardHeader>
        <CardContent className="space-y-6">
          {categories.map(category => {
            const tasks = checklist.filter(t => t.category === category);
            const completed = tasks.filter(t => completedTasks.includes(t.id)).length;
            
            return (
              <div key={category}>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-slate-900 capitalize">{category}</h4>
                  <span className="text-sm text-slate-500">{completed}/{tasks.length}</span>
                </div>
                <div className="space-y-2">
                  {tasks.map(task => (
                    <div
                      key={task.id}
                      onClick={() => toggleTask(task.id)}
                      className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        completedTasks.includes(task.id)
                          ? 'bg-green-50 border-green-200'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <Checkbox
                        checked={completedTasks.includes(task.id)}
                        className="pointer-events-none"
                      />
                      <span className={completedTasks.includes(task.id) ? 'line-through text-slate-500' : 'text-slate-900'}>
                        {task.task}
                      </span>
                      {completedTasks.includes(task.id) && (
                        <CheckCircle className="w-5 h-5 text-green-600 ml-auto" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}