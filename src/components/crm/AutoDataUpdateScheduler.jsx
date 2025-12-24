import React, { useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

export default function AutoDataUpdateScheduler() {
  const { data: lastLog } = useQuery({
    queryKey: ['last-update-check'],
    queryFn: async () => {
      const logs = await base44.entities.DataUpdateLog.list('-created_date', 1);
      return logs[0];
    },
    refetchInterval: 60 * 60 * 1000, // Check every hour
  });

  useEffect(() => {
    const checkAndSchedule = async () => {
      if (!lastLog) {
        // No updates yet, trigger first update
        console.log('No previous updates found, scheduling first update...');
        return;
      }

      const daysSince = (Date.now() - new Date(lastLog.created_date).getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysSince >= 7) {
        console.log(`${Math.floor(daysSince)} days since last update. Auto-update will trigger soon...`);
        // The scheduleDataUpdate function will handle the actual update
        try {
          await base44.functions.invoke('scheduleDataUpdate', {});
        } catch (error) {
          console.error('Auto-update failed:', error);
        }
      }
    };

    // Check on mount and every 24 hours
    checkAndSchedule();
    const interval = setInterval(checkAndSchedule, 24 * 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [lastLog]);

  // This component runs in background, no UI
  return null;
}