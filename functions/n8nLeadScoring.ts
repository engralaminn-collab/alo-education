import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * Advanced lead scoring based on multiple factors
 * Returns priority and suggested actions
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const { inquiry_id } = await req.json();

    const inquiries = await base44.asServiceRole.entities.Inquiry.filter({
      id: inquiry_id
    });
    const inquiry = inquiries[0];

    if (!inquiry) {
      return Response.json({ error: 'Inquiry not found' }, { status: 404 });
    }

    let score = 0;
    const factors = [];

    // Country scoring
    const countryScores = {
      'United Kingdom': 30,
      'United States': 25,
      'Canada': 25,
      'Australia': 20,
      'Germany': 15,
      'Ireland': 15
    };
    
    if (countryScores[inquiry.country_of_interest]) {
      const countryScore = countryScores[inquiry.country_of_interest];
      score += countryScore;
      factors.push(`High-demand country: +${countryScore}`);
    }

    // Degree level scoring
    if (inquiry.degree_level === 'master') {
      score += 20;
      factors.push('Master\'s level: +20');
    } else if (inquiry.degree_level === 'bachelor') {
      score += 15;
      factors.push('Bachelor\'s level: +15');
    } else if (inquiry.degree_level === 'phd') {
      score += 25;
      factors.push('PhD level: +25');
    }

    // Contact info completeness
    if (inquiry.phone) {
      score += 10;
      factors.push('Phone provided: +10');
    }
    if (inquiry.message && inquiry.message.length > 50) {
      score += 10;
      factors.push('Detailed message: +10');
    }

    // Field of study scoring
    const highDemandFields = ['business', 'computer_science', 'engineering', 'medicine'];
    if (highDemandFields.includes(inquiry.field_of_study?.toLowerCase())) {
      score += 15;
      factors.push('High-demand field: +15');
    }

    // Urgency check (intake timing)
    const now = new Date();
    const currentMonth = now.getMonth();
    
    // Sep intake urgency (Jun-Aug)
    if (currentMonth >= 5 && currentMonth <= 7) {
      score += 20;
      factors.push('September intake urgency: +20');
    }
    // Jan intake urgency (Oct-Dec)
    else if (currentMonth >= 9 && currentMonth <= 11) {
      score += 15;
      factors.push('January intake urgency: +15');
    }

    // Determine priority
    let priority = 'low';
    let suggestedAction = 'Follow up within 48 hours';
    
    if (score >= 70) {
      priority = 'urgent';
      suggestedAction = 'Contact immediately - High potential';
    } else if (score >= 50) {
      priority = 'high';
      suggestedAction = 'Contact within 6 hours';
    } else if (score >= 30) {
      priority = 'medium';
      suggestedAction = 'Follow up within 24 hours';
    }

    // Update inquiry with score
    await base44.asServiceRole.entities.Inquiry.update(inquiry_id, {
      notes: `Lead Score: ${score} - ${priority.toUpperCase()}\n${factors.join('\n')}\n\n${inquiry.notes || ''}`
    });

    return Response.json({
      success: true,
      inquiry_id: inquiry_id,
      lead_score: score,
      priority: priority,
      factors: factors,
      suggested_action: suggestedAction
    });

  } catch (error) {
    console.error('Lead scoring error:', error);
    return Response.json({ 
      error: error.message,
      success: false 
    }, { status: 500 });
  }
});