import { useState } from 'react';
import { Edit3, Trash2, Clock, MoreVertical, Save, X } from 'lucide-react';
import { Session } from '@/lib/idb';
import { formatDuration } from '@/lib/timeUtils';
import { motion, AnimatePresence } from 'framer-motion';

interface SessionCardProps {
  session: Session;
  onUpdate: (sessionId: string, updates: Partial<Session>) => void;
  onDelete: (sessionId: string) => void;
}

// Helper function to format time
const formatTime = (timestamp: string) => {
  return new Date(timestamp).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

// Activity type configs with better visibility
const ACTIVITY_CONFIGS = {
  work: { 
    label: 'Work', 
    icon: '💼', 
    bgColor: 'bg-green-50 dark:bg-green-900/20', 
    borderColor: 'border-green-200 dark:border-green-800',
    textColor: 'text-green-800 dark:text-green-200',
    dotColor: 'bg-green-500'
  },
  break: { 
    label: 'Break', 
    icon: '☕', 
    bgColor: 'bg-orange-50 dark:bg-orange-900/20', 
    borderColor: 'border-orange-200 dark:border-orange-800',
    textColor: 'text-orange-800 dark:text-orange-200',
    dotColor: 'bg-orange-500'
  },
  lunch: { 
    label: 'Lunch', 
    icon: '🍽️', 
    bgColor: 'bg-blue-50 dark:bg-blue-900/20', 
    borderColor: 'border-blue-200 dark:border-blue-800',
    textColor: 'text-blue-800 dark:text-blue-200',
    dotColor: 'bg-blue-500'
  },
  dinner: { 
    label: 'Dinner', 
    icon: '🍽️', 
    bgColor: 'bg-purple-50 dark:bg-purple-900/20', 
    borderColor: 'border-purple-200 dark:border-purple-800',
    textColor: 'text-purple-800 dark:text-purple-200',
    dotColor: 'bg-purple-500'
  },
  tech: { 
    label: 'Tech Issue', 
    icon: '🔧', 
    bgColor: 'bg-red-50 dark:bg-red-900/20', 
    borderColor: 'border-red-200 dark:border-red-800',
    textColor: 'text-red-800 dark:text-red-200',
    dotColor: 'bg-red-500'
  }
};

export default function SessionCard({ session, onUpdate, onDelete }: SessionCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [editData, setEditData] = useState({
    type: session.type,
    note: session.note || '',
    start_ts: session.start_ts,
    end_ts: session.end_ts || new Date().toISOString()
  });

  const config = ACTIVITY_CONFIGS[session.type as keyof typeof ACTIVITY_CONFIGS] || ACTIVITY_CONFIGS.work;
  const startTime = formatTime(session.start_ts);
  const endTime = session.end_ts ? formatTime(session.end_ts) : 'Running...';
  const duration = session.duration_ms ? formatDuration(session.duration_ms) : '0m';

  const handleSave = () => {
    const startMs = new Date(editData.start_ts).getTime();
    const endMs = new Date(editData.end_ts).getTime();
    const duration_ms = endMs - startMs;

    onUpdate(session.id, {
      ...editData,
      duration_ms: duration_ms > 0 ? duration_ms : null
    });
    setIsEditing(false);
    setShowActions(false);
  };

  const handleCancel = () => {
    setEditData({
      type: session.type,
      note: session.note || '',
      start_ts: session.start_ts,
      end_ts: session.end_ts || new Date().toISOString()
    });
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this session?')) {
      onDelete(session.id);
    }
    setShowActions(false);
  };

  return (
    <motion.div 
      layout
      className={`relative rounded-xl border p-4 ${config.bgColor} ${config.borderColor} transition-all duration-200`}
    >
      {/* Timeline dot */}
      <div className="absolute left-0 top-6 w-1 h-8 rounded-full bg-gray-200 dark:bg-gray-700">
        <div className={`w-3 h-3 rounded-full ${config.dotColor} absolute -left-1 top-2`} />
      </div>

      <div className="ml-6">
        {isEditing ? (
          <div className="space-y-4">
            {/* Edit form */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Activity Type
              </label>
              <select
                value={editData.type}
                onChange={(e) => setEditData(prev => ({ ...prev, type: e.target.value as Session['type'] }))}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                {Object.entries(ACTIVITY_CONFIGS).map(([key, config]) => (
                  <option key={key} value={key}>
                    {config.icon} {config.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Start Time
                </label>
                <input
                  type="datetime-local"
                  value={editData.start_ts.slice(0, 16)}
                  onChange={(e) => setEditData(prev => ({ ...prev, start_ts: e.target.value + ':00.000Z' }))}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  End Time
                </label>
                <input
                  type="datetime-local"
                  value={editData.end_ts.slice(0, 16)}
                  onChange={(e) => setEditData(prev => ({ ...prev, end_ts: e.target.value + ':00.000Z' }))}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Note (optional)
              </label>
              <input
                type="text"
                value={editData.note}
                onChange={(e) => setEditData(prev => ({ ...prev, note: e.target.value }))}
                placeholder="Add a note..."
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>

            {/* Edit actions */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={handleSave}
                className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors"
              >
                <Save size={14} />
                Save
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center gap-1 px-3 py-1.5 bg-gray-500 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors"
              >
                <X size={14} />
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div>
            {/* Session info */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{config.icon}</span>
                  <span className={`font-semibold ${config.textColor}`}>
                    {config.label}
                  </span>
                  <span className={`text-lg font-bold ${config.textColor}`}>
                    {duration}
                  </span>
                </div>
                
                <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 mb-1">
                  <Clock size={14} />
                  <span>{startTime} - {endTime}</span>
                </div>

                {session.note && (
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 italic">
                    &ldquo;{session.note}&rdquo;
                  </p>
                )}
              </div>

              {/* Action button with better visibility */}
              <div className="relative">
                <button
                  onClick={() => setShowActions(!showActions)}
                  className="p-1.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 shadow-sm"
                  aria-label="Session actions"
                >
                  <MoreVertical size={16} />
                </button>

                {/* Action menu */}
                <AnimatePresence>
                  {showActions && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10 min-w-[120px]"
                    >
                      <button
                        onClick={() => {
                          setIsEditing(true);
                          setShowActions(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <Edit3 size={14} />
                        Edit
                      </button>
                      <button
                        onClick={handleDelete}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close actions */}
      {showActions && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setShowActions(false)}
        />
      )}
    </motion.div>
  );
}
