import React, { useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

// This component monitors application stage changes and creates tasks automatically
export default function AutomatedTaskTrigger() {
  const { data: applications = [] } = useQuery({
    queryKey: ['applications-for-triggers'],
    queryFn: () => base44.entities.Application.list('-updated_date', 100),
    refetchInterval: 60000, // Check every minute
  });

  const { data: templates = [] } = useQuery({
    queryKey: ['task-templates-active'],
    queryFn: () => base44.entities.TaskTemplate.filter({ is_active: true }),
  });

  const { data: studentProfiles = [] } = useQuery({
    queryKey: ['student-profiles-for-triggers'],
    queryFn: () => base44.entities.StudentProfile.list(),
  });

  useEffect(() => {
    if (!applications.length || !templates.length) return;
    
    const checkAndCreateTasks = async () => {
      for (const app of applications) {
        const student = studentProfiles.find(s => s.id === app.student_id);
        if (!student) continue;

        // Find templates that match this application stage
        const matchingTemplates = templates.filter(t => {
          const stageMatch = t.trigger_stage === app.status;
          const scoreMatch = !t.trigger_lead_score_min || 
            ((student.lead_score_adjustment || 0) >= t.trigger_lead_score_min);
          return stageMatch && scoreMatch;
        });

        for (const template of matchingTemplates) {
          // Check if task already exists for this app and template
          const existingTasks = await base44.entities.Task.filter({
            application_id: app.id,
            title: template.name,
            status: 'pending'
          });

          if (existingTasks.length === 0) {
            // Create task
            const dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + (template.due_days_offset || 3));

            const taskData = {
              title: template.name,
              description: template.description,
              type: template.type,
              student_id: app.student_id,
              application_id: app.id,
              assigned_to: template.auto_assign ? student.counselor_id : null,
              priority: template.priority,
              status: 'pending',
              due_date: dueDate.toISOString().split('T')[0],
            };

            await base44.entities.Task.create(taskData);

            // Create notification for counselor
            if (student.counselor_id) {
              await base44.entities.Notification.create({
                user_id: student.counselor_id,
                type: 'task_assigned',
                title: 'New Task Assigned',
                message: `${template.name} for ${student.first_name} ${student.last_name}`,
                link_page: 'CRMTasks',
                link_id: app.student_id,
                priority: template.priority,
              });
            }
          }
        }
      }
    };

    checkAndCreateTasks();
  }, [applications, templates, studentProfiles]);

  return null; // This is a background component
}