import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized - Admin access required' }, { status: 403 });
    }

    const payload = await req.json();
    const { 
      report_type, 
      filters = {}, 
      format = 'json',
      date_from,
      date_to 
    } = payload;

    // Fetch all data
    let students = await base44.asServiceRole.entities.StudentProfile.list();
    let applications = await base44.asServiceRole.entities.Application.list();
    const counselors = await base44.asServiceRole.entities.Counselor.list();

    // Apply filters
    if (filters.counselor_id) {
      students = students.filter(s => s.counselor_id === filters.counselor_id);
    }

    if (filters.status) {
      students = students.filter(s => s.status === filters.status);
    }

    if (filters.country) {
      students = students.filter(s => 
        s.preferred_countries?.includes(filters.country)
      );
    }

    if (date_from) {
      students = students.filter(s => 
        new Date(s.created_date) >= new Date(date_from)
      );
    }

    if (date_to) {
      students = students.filter(s => 
        new Date(s.created_date) <= new Date(date_to)
      );
    }

    // Generate report based on type
    let reportData;

    switch (report_type) {
      case 'conversion_analysis':
        const totalStudents = students.length;
        const enrolled = students.filter(s => s.status === 'enrolled').length;
        const conversionRate = totalStudents > 0 ? (enrolled / totalStudents * 100).toFixed(2) : 0;

        reportData = {
          report_name: 'Conversion Analysis',
          generated_at: new Date().toISOString(),
          summary: {
            total_students: totalStudents,
            enrolled_students: enrolled,
            conversion_rate: parseFloat(conversionRate)
          },
          by_status: Object.entries(
            students.reduce((acc, s) => {
              acc[s.status] = (acc[s.status] || 0) + 1;
              return acc;
            }, {})
          ).map(([status, count]) => ({ status, count })),
          by_counselor: counselors.map(c => {
            const counselorStudents = students.filter(s => s.counselor_id === c.id);
            const counselorEnrolled = counselorStudents.filter(s => s.status === 'enrolled').length;
            return {
              counselor_name: c.name,
              total_students: counselorStudents.length,
              enrolled: counselorEnrolled,
              conversion_rate: counselorStudents.length > 0 
                ? parseFloat((counselorEnrolled / counselorStudents.length * 100).toFixed(2))
                : 0
            };
          })
        };
        break;

      case 'pipeline_overview':
        reportData = {
          report_name: 'Pipeline Overview',
          generated_at: new Date().toISOString(),
          pipeline: [
            { stage: 'New Lead', count: students.filter(s => s.status === 'new_lead').length },
            { stage: 'Contacted', count: students.filter(s => s.status === 'contacted').length },
            { stage: 'Qualified', count: students.filter(s => s.status === 'qualified').length },
            { stage: 'In Progress', count: students.filter(s => s.status === 'in_progress').length },
            { stage: 'Applied', count: students.filter(s => s.status === 'applied').length },
            { stage: 'Enrolled', count: students.filter(s => s.status === 'enrolled').length },
            { stage: 'Lost', count: students.filter(s => s.status === 'lost').length }
          ],
          applications_summary: {
            total: applications.length,
            draft: applications.filter(a => a.status === 'draft').length,
            submitted: applications.filter(a => a.status === 'submitted_to_university').length,
            offers: applications.filter(a => 
              a.status === 'conditional_offer' || a.status === 'unconditional_offer'
            ).length
          }
        };
        break;

      case 'country_distribution':
        const countryData = {};
        students.forEach(s => {
          s.preferred_countries?.forEach(country => {
            countryData[country] = (countryData[country] || 0) + 1;
          });
        });

        reportData = {
          report_name: 'Country Distribution',
          generated_at: new Date().toISOString(),
          by_country: Object.entries(countryData)
            .map(([country, count]) => ({ country, count }))
            .sort((a, b) => b.count - a.count)
        };
        break;

      case 'monthly_trends':
        const monthlyData = {};
        students.forEach(s => {
          const month = new Date(s.created_date).toISOString().slice(0, 7); // YYYY-MM
          if (!monthlyData[month]) {
            monthlyData[month] = { total: 0, enrolled: 0 };
          }
          monthlyData[month].total++;
          if (s.status === 'enrolled') monthlyData[month].enrolled++;
        });

        reportData = {
          report_name: 'Monthly Trends',
          generated_at: new Date().toISOString(),
          trends: Object.entries(monthlyData)
            .map(([month, data]) => ({
              month,
              total_students: data.total,
              enrolled: data.enrolled,
              conversion_rate: data.total > 0 
                ? parseFloat((data.enrolled / data.total * 100).toFixed(2))
                : 0
            }))
            .sort((a, b) => a.month.localeCompare(b.month))
        };
        break;

      default:
        return Response.json({ error: 'Invalid report type' }, { status: 400 });
    }

    // Format output
    if (format === 'csv') {
      const csv = convertToCSV(reportData);
      return new Response(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${report_type}_${Date.now()}.csv"`
        }
      });
    }

    return Response.json(reportData);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function convertToCSV(data) {
  // Simple CSV conversion for nested data
  let csv = `Report: ${data.report_name}\nGenerated: ${data.generated_at}\n\n`;
  
  Object.keys(data).forEach(key => {
    if (Array.isArray(data[key])) {
      csv += `\n${key.toUpperCase()}\n`;
      const headers = Object.keys(data[key][0] || {}).join(',');
      csv += headers + '\n';
      data[key].forEach(row => {
        csv += Object.values(row).join(',') + '\n';
      });
    } else if (typeof data[key] === 'object' && key !== 'generated_at' && key !== 'report_name') {
      csv += `\n${key.toUpperCase()}\n`;
      Object.entries(data[key]).forEach(([k, v]) => {
        csv += `${k},${v}\n`;
      });
    }
  });
  
  return csv;
}