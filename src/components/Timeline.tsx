import { Session } from '@/lib/idb';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Calendar } from 'lucide-react';
import SessionCard from './SessionCard'; // This will be your enhanced SessionCard

interface TimelineProps {
  sessions: Session[];
  onUpdateSession: (sessionId: string, updates: Partial<Session>) => void;
  onDeleteSession: (sessionId: string) => void;
}

export default function Timeline({ sessions, onUpdateSession, onDeleteSession }: TimelineProps) {
  if (sessions.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 transition-colors">
        <div className="text-center">
          <Calendar className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No sessions today
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Tap the green button below to start tracking your work
          </p>
        </div>
      </div>
    );
  }

  // Group sessions by hour for better visual organization
  const groupedSessions = sessions.reduce((groups, session) => {
    const hour = new Date(session.start_ts).getHours();
    const timeRange = `${hour.toString().padStart(2, '0')}:00`;
    
    if (!groups[timeRange]) {
      groups[timeRange] = [];
    }
    groups[timeRange].push(session);
    return groups;
  }, {} as Record<string, Session[]>);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors">
      <div className="flex items-center gap-2 mb-6">
        <Clock className="text-gray-600 dark:text-gray-400" size={20} />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Today&apos;s Timeline
        </h3>
        <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
          {sessions.length} session{sessions.length !== 1 ? 's' : ''}
        </span>
      </div>
      
      <div className="space-y-6">
        <AnimatePresence>
          {Object.entries(groupedSessions).map(([timeRange, groupSessions]) => (
            <motion.div
              key={timeRange}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.2 }}
              className="relative"
            >
              {/* Time marker */}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {timeRange}
                </span>
                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
              </div>

              {/* Sessions in this time range */}
              <div className="space-y-3 ml-5">
                {groupSessions.map((session) => (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <SessionCard
                      session={session}
                      onUpdate={onUpdateSession}
                      onDelete={onDeleteSession}
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Timeline summary */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
          <span>
            First session: {sessions.length > 0 ? new Date(sessions[0].start_ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'}
          </span>
          <span>
            Last session: {sessions.length > 0 ? new Date(sessions[sessions.length - 1].start_ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'}
          </span>
        </div>
      </div>
    </div>
  );
}
