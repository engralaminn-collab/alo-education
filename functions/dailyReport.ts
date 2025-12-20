import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * Generates daily management report and sends to n8n for distribution
 * Call this from n8n CRON at 9 PM daily
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const webhookSecret = Deno.env.get("N8N_WEBHOOK_SECRET");
    const providedSecret = req.headers.get("x-webhook-secret");
    
    if (webhookSecret && providedSecret !== webhookSecret) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Fetch today's data
    const inquiries = await base44.asServiceRole.entities.Inquiry.list();
    const applications = await base44.asServiceRole.entities.Application.list();
    const students = await base44.asServiceRole.entities.StudentProfile.list();
    const counselors = await base44.asServiceRole.entities.Counselor.filter({ status: 'active' });

    // Today's metrics
    const todayInquiries = inquiries.filter(i => 
      new Date(i.created_date) >= today && new Date(i.created_date) < tomorrow
    );
    
    const todayApplications = applications.filter(a => 
      a.applied_date && new Date(a.applied_date) >= today && new Date(a.applied_date) < tomorrow
    );

    const visaApproved = applications.filter(a => 
      a.visa_status === 'approved' && 
      a.milestones?.visa_approved?.date &&
      new Date(a.milestones.visa_approved.date) >= today && 
      new Date(a.milestones.visa_approved.date) < tomorrow
    );

    const offersReceived = applications.filter(a => 
      (a.status === 'conditional_offer' || a.status === 'unconditional_offer') &&
      a.offer_date && new Date(a.offer_date) >= today && new Date(a.offer_date) < tomorrow
    );

    // Counselor performance
    const counselorStats = counselors.map(c => {
      const assignedInquiries = inquiries.filter(i => i.assigned_to === c.user_id);
      const closedToday = assignedInquiries.filter(i => 
        i.status === 'converted' && 
        i.updated_date &&
        new Date(i.updated_date) >= today && 
        new Date(i.updated_date) < tomorrow
      );
      
      return {
        name: c.name,
        total_leads: assignedInquiries.length,
        converted_today: closedToday.length,
        total_students: c.current_students || 0
      };
    });

    // Pending tasks count
    const pendingApplications = applications.filter(a => 
      a.status === 'documents_pending' || a.status === 'under_review'
    );

    const report = {
      date: today.toISOString().split('T')[0],
      summary: {
        new_leads: todayInquiries.length,
        applications_submitted: todayApplications.length,
        offers_received: offersReceived.length,
        visa_approved: visaApproved.length,
        pending_applications: pendingApplications.length,
        total_active_students: students.filter(s => s.status !== 'lost').length
      },
      counselor_performance: counselorStats,
      top_countries: getTopCountries(inquiries),
      urgent_items: {
        pending_documents: pendingApplications.length,
        new_unassigned: inquiries.filter(i => i.status === 'new' && !i.assigned_to).length
      }
    };

    return Response.json({
      success: true,
      report: report
    });

  } catch (error) {
    console.error('Daily report error:', error);
    return Response.json({ 
      error: error.message,
      success: false 
    }, { status: 500 });
  }
});

function getTopCountries(inquiries) {
  const countryCounts = {};
  inquiries.forEach(i => {
    if (i.country_of_interest) {
      countryCounts[i.country_of_interest] = (countryCounts[i.country_of_interest] || 0) + 1;
    }
  });
  
  return Object.entries(countryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([country, count]) => ({ country, count }));
}