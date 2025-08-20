
import { Session } from '@/lib/idb';
import { formatAMPM, formatDuration, SESSION_TYPES, getCurrentRunningDuration } from '@/lib/timeUtils';
import { MoreVertical, Edit, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface SessionCardProps {
  session: Session;
  onUpdate: (sessionId: string, updates: Partial<Session>) => void;
  onDelete: (sessionId: string) => void;
}

export default function SessionCard({ session, onUpdate, onDelete }: SessionCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [liveData, setLiveData] = useState(session);

  const typeConfig = SESSION_TYPES[session.type];
  const isRunning = !session.end_ts;

  // Update running session duration live
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      const currentDuration = getCurrentRunningDuration(session.start_ts);
      setLiveData(prev => ({ ...prev, duration_ms: currentDuration }));
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, session.start_ts]);

  const duration = isRunning 
    ? (liveData.duration_ms || 0)
    : (session.duration_ms || 0);

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
    >
      <div className="flex">
        {/* Color Strip */}
        <div className={`w-1 ${typeConfig.color}`} />
        
        {/* Main Content */}
        <div className="flex-1 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-lg">{typeConfig.icon}</span>
              <div>
                <div className="font-medium text-gray-900">
                  {typeConfig.label}
                  {isRunning && (
                    <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                      Running
                    </span>
                  )}
                </div>
                {session.note && (
                  <div className="text-sm text-gray-600 mt-1">{session.note}</div>
                )}
              </div>
            </div>
            
            <div className="text-right">
              <div className="font-semibold text-gray-900">
                {formatDuration(duration)}
              </div>
              <div className="text-sm text-gray-500">
                {formatAMPM(session.start_ts)}
                {session.end_ts && ` - ${formatAMPM(session.end_ts)}`}
              </div>
            </div>
          </div>
        </div>

        {/* Menu Button */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-4 text-gray-400 hover:text-gray-600"
          >
            <MoreVertical size={20} />
          </button>
          
          {showMenu && (
            <div className="absolute right-2 top-12 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]">
              <button
                onClick={() => {
                  setShowMenu(false);
                  // TODO: Open edit modal
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
              >
                <Edit size={16} />
                Edit
              </button>
              <button
                onClick={() => {
                  setShowMenu(false);
                  onDelete(session.id);
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 text-red-600 flex items-center gap-2"
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
