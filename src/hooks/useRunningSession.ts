import { useState, useEffect } from 'react';
import { Session, SessionService } from '@/lib/idb';
import { getCurrentRunningDuration } from '@/lib/timeUtils';

export function useRunningSession() {
  const [runningSession, setRunningSession] = useState<Session | null>(null);
  const [currentDuration, setCurrentDuration] = useState<number>(0);

  useEffect(() => {
    // Load running session on mount
    SessionService.getRunningSession().then(setRunningSession);
  }, []);

  useEffect(() => {
    if (!runningSession) {
      setCurrentDuration(0);
      return;
    }

    // Update duration every second
    const interval = setInterval(() => {
      setCurrentDuration(getCurrentRunningDuration(runningSession.start_ts));
    }, 1000);

    return () => clearInterval(interval);
  }, [runningSession]);

  const startSession = async (type: Session['type'], note = '') => {
    const session = await SessionService.create({
      type,
      start_ts: new Date().toISOString(),
      end_ts: null,
      duration_ms: null,
      note,
      tags: [],
      project: null,
      manual: false
    });
    setRunningSession(session);
    return session;
  };

  const stopSession = async () => {
    if (!runningSession) return null;
    
    const updated = await SessionService.stopRunning();
    setRunningSession(null);
    setCurrentDuration(0);
    return updated;
  };

  return {
    runningSession,
    currentDuration,
    isRunning: !!runningSession,
    startSession,
    stopSession
  };
}
