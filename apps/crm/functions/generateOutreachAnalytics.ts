import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { startDate, endDate, outreachType } = await req.json();

    // Fetch all outreach records
    const allOutreach = await base44.entities.UniversityOutreach.list('-sent_date', 1000);
    
    // Fetch all appointments
    const allAppointments = await base44.entities.Appointment.list('-appointment_date', 1000);

    // Filter by date and type
    const outreach = allOutreach.filter(o => {
      const sentDate = new Date(o.sent_date);
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      const dateMatch = sentDate >= start && sentDate <= end;
      const typeMatch = !outreachType || o.outreach_type === outreachType;
      
      return dateMatch && typeMatch;
    });

    // Calculate metrics
    const totalSent = outreach.length;
    const responded = outreach.filter(o => o.response_received).length;
    const responseRate = totalSent > 0 ? ((responded / totalSent) * 100).toFixed(2) : 0;

    // Success rate per university
    const byUniversity = {};
    outreach.forEach(o => {
      if (!byUniversity[o.university_id]) {
        byUniversity[o.university_id] = { sent: 0, responded: 0, positive: 0, name: '' };
      }
      byUniversity[o.university_id].sent += 1;
      if (o.response_received) {
        byUniversity[o.university_id].responded += 1;
      }
      if (o.response_sentiment === 'positive') {
        byUniversity[o.university_id].positive += 1;
      }
    });

    const universityMetrics = Object.entries(byUniversity).map(([uniId, data]) => ({
      university_id: uniId,
      total_sent: data.sent,
      responses: data.responded,
      positive_responses: data.positive,
      response_rate: data.sent > 0 ? ((data.responded / data.sent) * 100).toFixed(2) : 0,
      positive_rate: data.responded > 0 ? ((data.positive / data.responded) * 100).toFixed(2) : 0
    }));

    // Response time analysis
    const responseTimes = outreach
      .filter(o => o.response_received && o.sent_date && o.response_date)
      .map(o => {
        const sentTime = new Date(o.sent_date).getTime();
        const responseTime = new Date(o.response_date).getTime();
        const daysDiff = Math.floor((responseTime - sentTime) / (1000 * 60 * 60 * 24));
        return daysDiff;
      });

    const avgResponseTime = responseTimes.length > 0
      ? (responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length).toFixed(2)
      : 0;

    // Meeting conversion
    const meetings = allAppointments.filter(a => {
      const appDate = new Date(a.appointment_date);
      const start = new Date(startDate);
      const end = new Date(endDate);
      return appDate >= start && appDate <= end;
    });

    const meetingConversionRate = totalSent > 0
      ? ((meetings.length / totalSent) * 100).toFixed(2)
      : 0;

    // Outreach by type
    const byType = {};
    outreach.forEach(o => {
      if (!byType[o.outreach_type]) {
        byType[o.outreach_type] = { count: 0, responded: 0 };
      }
      byType[o.outreach_type].count += 1;
      if (o.response_received) {
        byType[o.outreach_type].responded += 1;
      }
    });

    const typeMetrics = Object.entries(byType).map(([type, data]) => ({
      type,
      sent: data.count,
      responses: data.responded,
      response_rate: data.count > 0 ? ((data.responded / data.count) * 100).toFixed(2) : 0
    }));

    // Sentiment distribution
    const sentimentDist = {
      positive: outreach.filter(o => o.response_sentiment === 'positive').length,
      neutral: outreach.filter(o => o.response_sentiment === 'neutral').length,
      negative: outreach.filter(o => o.response_sentiment === 'negative').length,
      no_response: outreach.filter(o => !o.response_received).length
    };

    // Daily trend
    const dailyData = {};
    outreach.forEach(o => {
      const date = new Date(o.sent_date).toISOString().split('T')[0];
      if (!dailyData[date]) {
        dailyData[date] = { sent: 0, responded: 0 };
      }
      dailyData[date].sent += 1;
      if (o.response_received) {
        dailyData[date].responded += 1;
      }
    });

    const trendData = Object.entries(dailyData)
      .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
      .map(([date, data]) => ({
        date,
        sent: data.sent,
        responded: data.responded,
        response_rate: data.sent > 0 ? ((data.responded / data.sent) * 100).toFixed(2) : 0
      }));

    return Response.json({
      summary: {
        total_sent: totalSent,
        total_responded: responded,
        response_rate: parseFloat(responseRate),
        avg_response_time_days: parseFloat(avgResponseTime),
        meetings_scheduled: meetings.length,
        meeting_conversion_rate: parseFloat(meetingConversionRate)
      },
      by_university: universityMetrics,
      by_type: typeMetrics,
      sentiment_distribution: sentimentDist,
      trend: trendData,
      response_times: responseTimes
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});