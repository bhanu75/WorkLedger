import { useMemo } from 'react';
import { Session } from '@/lib/idb';
import { formatDuration } from '@/lib/timeUtils';
import { Clock, TrendingUp, Coffee, AlertTriangle } from 'lucide-react';

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
      netProductive: totalWork - breakTime,
      sessionCount: sessions.length
    };
  }, [sessions, runningDuration]);

  // Calculate productivity score (0-100)
  const productivityScore = useMemo(() => {
    if (stats.totalWork === 0) return 0;
    const efficiency = stats.netProductive / stats.totalWork;
    const techPenalty = stats.techIssues * 0.1; // 10% penalty per tech issue
    return Math.max(0, Math.min(100, (efficiency * 100) - techPenalty));
  }, [stats]);

  const summaryCards = [
    {
      title: 'Total Work',
      value: formatDuration(stats.totalWork),
      icon: Clock,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-800'
    },
    {
      title: 'Net Productive',
      value: formatDuration(stats.netProductive),
      icon: TrendingUp,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-800'
    },
    {
      title: 'Break Time',
      value: formatDuration(stats.breakTime),
      icon: Coffee,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      borderColor: 'border-orange-200 dark:border-orange-800'
    },
    {
      title: 'Tech Issues',
      value: stats.techIssues.toString(),
      icon: AlertTriangle,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      borderColor: 'border-red-200 dark:border-red-800'
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6 transition-colors">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Today's Summary
        </h2>
        
        {/* Productivity Score */}
        {stats.totalWork > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Productivity</span>
            <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
              productivityScore >= 80 
                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                : productivityScore >= 60
                ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
            }`}>
              {Math.round(productivityScore)}%
            </div>
          </div>
        )}
      </div>

      {/* Summary Grid */}
      <div className="grid grid-cols-2 gap-4">
        {summaryCards.map((card) => (
          <div
            key={card.title}
            className={`p-4 rounded-xl border ${card.bgColor} ${card.borderColor} transition-all hover:shadow-md`}
          >
            <div className="flex items-center justify-between mb-2">
              <card.icon className={`${card.color}`} size={20} />
              <div className={`text-2xl font-bold ${card.color}`}>
                {card.value}
              </div>
            </div>
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {card.title}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Stats */}
      {stats.sessionCount > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>{stats.sessionCount} session{stats.sessionCount !== 1 ? 's' : ''} today</span>
            {stats.totalWork > 0 && (
              <span>
                Avg session: {formatDuration(stats.totalWork / sessions.filter(s => s.type === 'work').length)}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Empty state */}
      {stats.sessionCount === 0 && !runningDuration && (
        <div className="text-center py-8">
          <Clock className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400 text-lg">No sessions yet today</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
            Tap the green button to start tracking your work
          </p>
        </div>
      )}
    </div>
  );
}
