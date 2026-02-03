import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (user?.role !== 'admin') {
            return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
        }

        // Fetch all unassigned students and counselors
        const students = await base44.asServiceRole.entities.StudentProfile.filter({ 
            status: 'new_lead'
        });
        const counselors = await base44.asServiceRole.entities.Counselor.filter({ 
            status: 'active',
            is_available: true
        });

        if (counselors.length === 0) {
            return Response.json({ 
                success: false, 
                error: 'No available counselors found' 
            }, { status: 400 });
        }

        const assignments = [];

        for (const student of students) {
            // Skip if already assigned
            if (student.counselor_id) continue;

            // Find best matching counselor based on specialization
            let bestMatch = null;
            let bestScore = 0;

            for (const counselor of counselors) {
                let score = 0;
                
                // Match by country preference
                if (counselor.specializations && student.preferred_countries) {
                    const countryMatch = counselor.specializations.some(spec => 
                        student.preferred_countries.includes(spec)
                    );
                    if (countryMatch) score += 10;
                }

                // Match by field preference
                if (counselor.specializations && student.preferred_fields) {
                    const fieldMatch = counselor.specializations.some(spec => 
                        student.preferred_fields.some(field => 
                            spec.toLowerCase().includes(field.toLowerCase())
                        )
                    );
                    if (fieldMatch) score += 5;
                }

                // Prefer counselors with lower workload
                const workloadFactor = Math.max(0, 10 - (counselor.current_students / 5));
                score += workloadFactor;

                // Prefer counselors with higher success rate
                if (counselor.success_rate) {
                    score += (counselor.success_rate / 10);
                }

                if (score > bestScore && counselor.current_students < counselor.max_students) {
                    bestScore = score;
                    bestMatch = counselor;
                }
            }

            // Assign to best match or round-robin if no specialization match
            const assignedCounselor = bestMatch || counselors[assignments.length % counselors.length];

            // Update student
            await base44.asServiceRole.entities.StudentProfile.update(student.id, {
                counselor_id: assignedCounselor.user_id,
                status: 'contacted'
            });

            // Update counselor workload
            await base44.asServiceRole.entities.Counselor.update(assignedCounselor.id, {
                current_students: (assignedCounselor.current_students || 0) + 1
            });

            // Create initial task for counselor
            await base44.asServiceRole.entities.Task.create({
                title: `Initial consultation with ${student.first_name} ${student.last_name}`,
                description: `New lead assigned. Student interested in:\n• Countries: ${student.preferred_countries?.join(', ') || 'Not specified'}\n• Fields: ${student.preferred_fields?.join(', ') || 'Not specified'}\n• Budget: ${student.budget_max || 'Not specified'}\n\nSchedule an introductory call and assess their needs.`,
                type: 'follow_up',
                student_id: student.id,
                assigned_to: assignedCounselor.user_id,
                status: 'pending',
                priority: 'high',
                due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            });

            assignments.push({
                student: `${student.first_name} ${student.last_name}`,
                counselor: assignedCounselor.name,
                match_score: bestScore,
                reason: bestScore > 10 ? 'Specialization match' : 'Workload balanced'
            });
        }

        return Response.json({ 
            success: true,
            assignments_made: assignments.length,
            details: assignments
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});