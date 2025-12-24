import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// This function runs automatically every 7 days via cron
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Check if we need to run an update (every 7 days)
    const logs = await base44.asServiceRole.entities.DataUpdateLog.list('-created_date', 1);
    const lastUpdate = logs[0];
    
    if (lastUpdate) {
      const daysSince = (Date.now() - new Date(lastUpdate.created_date).getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysSince < 7) {
        return Response.json({
          skipped: true,
          message: `Last update was ${Math.floor(daysSince)} days ago. Will run again in ${Math.ceil(7 - daysSince)} days.`,
          nextUpdate: new Date(new Date(lastUpdate.created_date).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()
        });
      }
    }
    
    // Trigger the actual update function
    const updateResponse = await base44.asServiceRole.functions.invoke('updateUniversityCourseData', {});
    
    return Response.json({
      success: true,
      message: 'Scheduled update completed',
      result: updateResponse
    });
    
  } catch (error) {
    return Response.json({ 
      success: false,
      error: error.message 
    }, { status: 500 });
  }
});