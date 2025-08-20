import { useState } from 'react';
import { Play, Square, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Session } from '@/lib/idb';
import { SESSION_TYPES } from '@/lib/timeUtils';

interface FABProps {
  isRunning: boolean;
  onStart: (type: Session['type'], note?: string) => void;
  onStop: () => void;
}

export default function FAB({ isRunning, onStart, onStop }: FABProps) {
  const [showQuickActions, setShowQuickActions] = useState(false);

  const quickActions = [
    { type: 'break' as const, label: 'Break', icon: '☕' },
    { type: 'lunch' as const, label: 'Lunch', icon: '🍽️' },
    { type: 'tech' as const, label: 'Tech Issue', icon: '🔧' },
  ];

  const handleFABClick = () => {
    if (isRunning) {
      onStop();
    } else if (showQuickActions) {
      setShowQuickActions(false);
    } else {
      onStart('work');
    }
  };

  const handleFABDoubleClick = () => {
    if (!isRunning) {
      setShowQuickActions(!showQuickActions);
    }
  };

  return (
    <div className="fixed bottom-24 right-6 z-50">
      {/* Quick Actions */}
      <AnimatePresence>
        {showQuickActions && !isRunning && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mb-4 space-y-2"
          >
            {quickActions.map((action) => (
              <motion.button
                key={action.type}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: 0.1 }}
                onClick={() => {
                  onStart(action.type);
                  setShowQuickActions(false);
                }}
                className="flex items-center gap-3 bg-white shadow-lg rounded-full px-4 py-3 border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <span className="text-lg">{action.icon}</span>
                <span className="text-sm font-medium">{action.label}</span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main FAB */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleFABClick}
        onDoubleClick={handleFABDoubleClick}
        className={`w-16 h-16 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 ${
          isRunning 
            ? 'bg-red-500 hover:bg-red-600' 
            : 'bg-primary-500 hover:bg-primary-600'
        }`}
      >
        {isRunning ? (
          <Square className="text-white" size={24} fill="currentColor" />
        ) : showQuickActions ? (
          <ChevronUp className="text-white" size={24} />
        ) : (
          <Play className="text-white" size={24} fill="currentColor" />
        )}
      </motion.button>

      {/* Backdrop */}
      {showQuickActions && (
        <div
          className="fixed inset-0 bg-black bg-opacity-20 -z-10"
          onClick={() => setShowQuickActions(false)}
        />
      )}
    </div>
  );
}
