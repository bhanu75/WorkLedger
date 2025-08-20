
import Head from 'next/head';
import { useState, useEffect } from 'react';
import { Session, SessionService } from '@/lib/idb';
import { TrendingUp, Calendar, Download } from 'lucide-react';
import { formatDuration } from '@/lib/timeUtils';

export default function ReportsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllSessions();
  }, []);

  const loadAllSessions = async () => {
    setLoading(true);
    // For now, get last 30 days of data
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const allSessions = await SessionService.getByDateRange(
      thirtyDaysAgo.toISOString(),
      new Date().toISOString()
    );
    setSessions(allSessions);
    setLoading(false);
  };

  const exportData = () => {
    const dataStr = JSON.stringify(sessions, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `time-tracker-export-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const stats = {
    totalSessions: sessions.length,
    totalWork: sessions
      .filter(s => s.type === 'work' && s.duration_ms)
      .reduce((sum, s) => sum + (s.duration_ms || 0), 0),
    totalBreaks: sessions
      .filter(s => ['break', 'lunch', 'dinner'].includes(s.type) && s.duration_ms)
      .reduce((sum, s) => sum + (s.duration_ms || 0), 0),
    techIssues: sessions.filter(s => s.type === 'tech').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Reports - Time Tracker</title>
      </Head>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <button
            onClick={exportData}
            className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            <Download size={16} />
            Export Data
          </button>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={20} className="text-green-600" />
              <span className="text-sm text-gray-600">Total Work</span>
            </div>
            <div className="text-2xl font-bold text-green-600">
              {formatDuration(stats.totalWork)}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar size={20} className="text-blue-600" />
              <span className="text-sm text-gray-600">Sessions</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {stats.totalSessions}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-yellow-600">☕</span>
              <span className="text-sm text-gray-600">Break Time</span>
            </div>
            <div className="text-2xl font-bold text-yellow-600">
              {formatDuration(stats.totalBreaks)}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-red-600">🔧</span>
              <span className="text-sm text-gray-600">Tech Issues</span>
            </div>
            <div className="text-2xl font-bold text-red-600">
              {stats.techIssues}
            </div>
          </div>
        </div>

        {/* Placeholder for charts */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Weekly Trends</h3>
          <div className="h-40 bg-gray-100 rounded-lg flex items-center justify-center">
            <span className="text-gray-500">Charts coming soon...</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Productivity Insights</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Average work session</span>
              <span className="font-medium">
                {stats.totalSessions > 0 
                  ? formatDuration(stats.totalWork / sessions.filter(s => s.type === 'work').length)
                  : '0m'
                }
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Work to break ratio</span>
              <span className="font-medium">
                {stats.totalBreaks > 0 
                  ? `${Math.round(stats.totalWork / stats.totalBreaks * 100) / 100}:1`
                  : 'N/A'
                }
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
