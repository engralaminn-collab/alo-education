import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (user?.role !== 'admin') {
            return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
        }

        // Fetch all students
        const students = await base44.asServiceRole.entities.StudentProfile.list();
        const communications = await base44.asServiceRole.entities.CommunicationHistory.list();
        const applications = await base44.asServiceRole.entities.Application.list();
        const documents = await base44.asServiceRole.entities.Document.list();

        const results = [];

        for (const student of students) {
            // Calculate engagement score (0-50)
            const studentComms = communications.filter(c => c.student_id === student.id);
            const recentComms = studentComms.filter(c => {
                const commDate = new Date(c.created_date);
                const daysSince = (Date.now() - commDate.getTime()) / (1000 * 60 * 60 * 24);
                return daysSince <= 30;
            });
            
            const lastComm = studentComms.sort((a, b) => 
                new Date(b.created_date) - new Date(a.created_date)
            )[0];
            
            const daysSinceLastContact = lastComm ? 
                (Date.now() - new Date(lastComm.created_date).getTime()) / (1000 * 60 * 60 * 24) : 999;

            let engagementScore = 0;
            if (recentComms.length >= 5) engagementScore += 20;
            else if (recentComms.length >= 3) engagementScore += 15;
            else if (recentComms.length >= 1) engagementScore += 10;

            if (daysSinceLastContact <= 7) engagementScore += 15;
            else if (daysSinceLastContact <= 14) engagementScore += 10;
            else if (daysSinceLastContact <= 30) engagementScore += 5;

            const positiveComms = studentComms.filter(c => c.sentiment === 'positive').length;
            if (positiveComms >= 3) engagementScore += 15;
            else if (positiveComms >= 1) engagementScore += 10;

            engagementScore = Math.min(50, engagementScore);

            // Calculate profile score (0-30)
            const profileCompleteness = student.profile_completeness || 0;
            const profileScore = (profileCompleteness / 100) * 30;

            // Calculate intent score (0-20)
            const studentApps = applications.filter(a => a.student_id === student.id);
            const studentDocs = documents.filter(d => d.student_id === student.id);
            
            let intentScore = 0;
            if (studentApps.length > 0) intentScore += 10;
            if (studentDocs.length >= 3) intentScore += 5;
            if (student.target_intake) intentScore += 5;

            intentScore = Math.min(20, intentScore);

            // Total score
            const totalScore = Math.round(engagementScore + profileScore + intentScore);
            
            // Grade
            let grade = 'F';
            if (totalScore >= 80) grade = 'A';
            else if (totalScore >= 65) grade = 'B';
            else if (totalScore >= 50) grade = 'C';
            else if (totalScore >= 35) grade = 'D';

            // AI Recommendation
            let recommendedAction = '';
            if (totalScore >= 80) {
                recommendedAction = 'High priority - Ready to convert. Schedule university applications.';
            } else if (totalScore >= 65) {
                recommendedAction = 'Good lead - Continue engagement. Share course recommendations.';
            } else if (totalScore >= 50) {
                recommendedAction = 'Warm lead - Needs nurturing. Send educational content.';
            } else if (totalScore >= 35) {
                recommendedAction = 'Cold lead - Low engagement. Consider re-engagement campaign.';
            } else {
                recommendedAction = 'Inactive - Very low engagement. Mark for follow-up or archive.';
            }

            // Create or update lead score
            const existingScores = await base44.asServiceRole.entities.LeadScore.filter({ 
                student_id: student.id 
            });

            const scoreData = {
                student_id: student.id,
                total_score: totalScore,
                engagement_score: engagementScore,
                profile_score: profileScore,
                intent_score: intentScore,
                grade,
                last_engagement_date: lastComm?.created_date || null,
                days_since_last_contact: Math.round(daysSinceLastContact),
                communication_count: studentComms.length,
                application_count: studentApps.length,
                scoring_factors: {
                    recent_communications: recentComms.length,
                    positive_sentiment_count: positiveComms,
                    profile_completeness: profileCompleteness,
                    has_applications: studentApps.length > 0,
                    documents_uploaded: studentDocs.length
                },
                recommended_action: recommendedAction,
                last_calculated: new Date().toISOString()
            };

            if (existingScores.length > 0) {
                await base44.asServiceRole.entities.LeadScore.update(existingScores[0].id, scoreData);
            } else {
                await base44.asServiceRole.entities.LeadScore.create(scoreData);
            }

            results.push({
                student: `${student.first_name} ${student.last_name}`,
                score: totalScore,
                grade
            });
        }

        return Response.json({ 
            success: true, 
            processed: results.length,
            results: results.slice(0, 10)
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});