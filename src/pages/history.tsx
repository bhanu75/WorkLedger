
import Head from 'next/head';
import { useState, useEffect } from 'react';
import { Session, SessionService } from '@/lib/idb';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, subDays, addDays, startOfDay, endOfDay } from 'date-fns';
import { zonedTimeToUtc } from 'date-fns-tz';
import Timeline from '@/components/Timeline';
import TodaySummary from '@/components/TodaySummary';

export default function HistoryPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSessionsForDate = async (date: Date) => {
    setLoading(true);
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    const startLocal = startOfDay(date);
    const endLocal = endOfDay(date);
    
    const startUtc = zonedTimeToUtc(startLocal, timeZone).toISOString();
    const endUtc = zonedTimeToUtc(endLocal, timeZone).toISOString();
    
    const daySessions = await SessionService.getByDateRange(startUtc, endUtc);
    setSessions(daySessions.sort((a, b) => 
      new Date(a.start_ts).getTime() - new Date(b.start_ts).getTime()
    ));
    setLoading(false);
  };

  useEffect(() => {
    loadSessionsForDate(selectedDate);
  }, [selectedDate]);

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = direction === 'prev' 
      ? subDays(selectedDate, 1)
      : addDays(selectedDate, 1);
    setSelectedDate(newDate);
  };

  const isToday = format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

  return (
    <>
      <Head>
        <title>History - Time Tracker</title>
      </Head>

      <div className="space-y-6">
        {/* Date Navigation */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigateDate('prev')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            
            <div className="flex items-center gap-2">
              <Calendar size={20} className="text-gray-600" />
              <h1 className="text-lg font-semibold">
                {isToday ? 'Today' : format(selectedDate, 'MMM d, yyyy')}
              </h1>
            </div>
            
            <button
              onClick={() => navigateDate('next')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={isToday}
            >
              <ChevronRight size={20} className={isToday ? 'text-gray-300' : ''} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          </div>
        ) : (
          <>
            <TodaySummary sessions={sessions} runningDuration={0} />
            <Timeline
              sessions={sessions}
              onUpdateSession={() => {}}
              onDeleteSession={() => {}}
            />
          </>
        )}
      </div>
    </>
  );
}
