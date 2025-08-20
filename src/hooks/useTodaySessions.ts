import { useState, useEffect } from 'react';
import { Session, SessionService } from '@/lib/idb';
import { getTodayRange } from '@/lib/timeUtils';

export function useTodaySessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshSessions = async () => {
    setLoading(true);
    const { start, end } = getTodayRange();
    const todaySessions = await SessionService.getByDateRange(start, end);
    setSessions(todaySessions.sort((a, b) => new Date(a.start_ts).getTime() - new Date(b.start_ts).getTime()));
    setLoading(false);
  };

  useEffect(() => {
    refreshSessions();
  }, []);

  const addSession = (session: Session) => {
    setSessions(prev => [...prev, session].sort((a, b) => 
      new Date(a.start_ts).getTime() - new Date(b.start_ts).getTime()
    ));
  };

  const updateSession = (sessionId: string, updates: Partial<Session>) => {
    setSessions(prev => prev.map(s => 
      s.id === sessionId ? { ...s, ...updates } : s
    ));
  };

  const removeSession = (sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
  };

  return {
    sessions,
    loading,
    refreshSessions,
    addSession,
    updateSession,
    removeSession
  };
}
