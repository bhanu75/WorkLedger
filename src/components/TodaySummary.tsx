
import { useMemo } from 'react';
import { Session } from '@/lib/idb';
import { formatDuration } from '@/lib/timeUtils';

interface TodaySummaryProps {
  sessions: Session[];
  runningDuration: number;
}

export default function TodaySummary({ sessions, runningDuration }: TodaySummaryProps) {
  const stats = useMemo(() => {
    const completedWork = sessions
      .filter(s => s.type === 'work' && s.duration_ms)
      .reduce((sum, s) => sum + (s.duration_ms || 0), 0);
    
    const totalWork = completedWork + (runningDuration || 0);
    
    const breakTime = sessions
      .filter(s => ['break', 'lunch', 'dinner'].includes(s.type) && s.duration_ms)
      .reduce((sum, s) => sum + (s.duration_ms || 0), 0);
    
    const techIssues = sessions.filter(s => s.type === 'tech').length;
    
    return {
      totalWork,
      breakTime,
      techIssues,
      netProductive: totalWork - breakTime
    };
  }, [sessions, runningDuration]);

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-3">Today&apos;s Summary</h2>

      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {formatDuration(stats.totalWork)}
          </div>
          <div className="text-sm text-gray-600">Total Work</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {formatDuration(stats.netProductive)}
          </div>
          <div className="text-sm text-gray-600">Net Productive</div>
        </div>
        
        <div className="text-center">
          <div className="text-xl font-semibold text-yellow-600">
            {formatDuration(stats.breakTime)}
          </div>
          <div className="text-sm text-gray-600">Break Time</div>
        </div>
        
        <div className="text-center">
          <div className="text-xl font-semibold text-red-600">
            {stats.techIssues}
          </div>
          <div className="text-sm text-gray-600">Tech Issues</div>
        </div>
      </div>
    </div>
  );
}
