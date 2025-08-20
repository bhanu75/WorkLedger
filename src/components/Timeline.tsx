
import { Session } from '@/lib/idb';
import SessionCard from './SessionCard';
import { motion, AnimatePresence } from 'framer-motion';

interface TimelineProps {
  sessions: Session[];
  onUpdateSession: (sessionId: string, updates: Partial<Session>) => void;
  onDeleteSession: (sessionId: string) => void;
}

export default function Timeline({ sessions, onUpdateSession, onDeleteSession }: TimelineProps) {
  if (sessions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg">No sessions today</div>
        <div className="text-gray-400 text-sm mt-1">Tap the button below to start tracking</div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">Today's Timeline</h3>
      
      <AnimatePresence>
        {sessions.map((session) => (
          <motion.div
            key={session.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.2 }}
          >
            <SessionCard
              session={session}
              onUpdate={onUpdateSession}
              onDelete={onDeleteSession}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
