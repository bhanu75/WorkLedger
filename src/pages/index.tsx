

import { useEffect } from 'react';
import TodaySummary from '@/components/TodaySummary';
import Timeline from '@/components/Timeline';
import FAB from '@/components/FAB';
import { useRunningSession } from '@/hooks/useRunningSession';
import { useTodaySessions } from '@/hooks/useTodaySessions';
import { SessionService } from '@/lib/idb';
import toast from 'react-hot-toast';
import Head from 'next/head';

export default function HomePage() {
  const { 
    runningSession, 
    currentDuration, 
    isRunning, 
    startSession, 
    stopSession 
  } = useRunningSession();
  
  const { 
    sessions, 
    loading, 
    addSession, 
    updateSession, 
    removeSession,
    refreshSessions 
  } = useTodaySessions();

  const handleStartSession = async (type: any, note = '') => {
    try {
      const session = await startSession(type, note);
      addSession(session);
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} started!`);
    } catch (error) {
      toast.error('Failed to start session');
    }
  };

  const handleStopSession = async () => {
    try {
      const stopped = await stopSession();
      if (stopped) {
        updateSession(stopped.id, stopped);
        toast.success('Session stopped!');
      }
    } catch (error) {
      toast.error('Failed to stop session');
    }
  };

  const handleUpdateSession = async (sessionId: string, updates: any) => {
    try {
      await SessionService.update(sessionId, updates);
      updateSession(sessionId, updates);
      toast.success('Session updated!');
    } catch (error) {
      toast.error('Failed to update session');
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      await SessionService.delete(sessionId);
      removeSession(sessionId);
      toast.success('Session deleted!');
    } catch (error) {
      toast.error('Failed to delete session');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Time Tracker</title>
      </Head>

      <div className="space-y-6">
        <TodaySummary 
          sessions={sessions} 
          runningDuration={currentDuration} 
        />
        
        <Timeline
          sessions={sessions}
          onUpdateSession={handleUpdateSession}
          onDeleteSession={handleDeleteSession}
        />
        
        <FAB
          isRunning={isRunning}
          onStart={handleStartSession}
          onStop={handleStopSession}
        />
      </div>
    </>
  );
}
