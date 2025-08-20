import { useState } from 'react';
import { Play, Square, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Session } from '@/lib/idb';

interface FABProps {
  isRunning: boolean;
  onStart: (type: Session['type'], note?: string) => void;
  onStop: () => void;
}

// Enhanced activity options with better visibility
const ACTIVITY_OPTIONS = [
  { 
    type: 'work' as const, 
    label: 'Work Session', 
    icon: '💼', 
    bgColor: 'bg-green-500 hover:bg-green-600',
    description: 'Focus work time'
  },
  { 
    type: 'break' as const, 
    label: 'Short Break', 
    icon: '☕', 
    bgColor: 'bg-orange-500 hover:bg-orange-600',
    description: '5-15 minute break'
  },
  { 
    type: 'lunch' as const, 
    label: 'Lunch Break', 
    icon: '🍽️', 
    bgColor: 'bg-blue-500 hover:bg-blue-600',
    description: 'Meal time'
  },
  { 
    type: 'dinner' as const, 
    label: 'Dinner Break', 
    icon: '🍽️', 
    bgColor: 'bg-purple-500 hover:bg-purple-600',
    description: 'Evening meal'
  },
  { 
    type: 'tech' as const, 
    label: 'Tech Issue', 
    icon: '🔧', 
    bgColor: 'bg-red-500 hover:bg-red-600',
    description: 'Technical problems'
  }
];

export default function FAB({ isRunning, onStart, onStop }: FABProps) {
  const [showOptions, setShowOptions] = useState(false);

  const handleMainAction = () => {
    if (isRunning) {
      onStop();
    } else {
      // If not running, show options or start work directly
      if (showOptions) {
        setShowOptions(false);
      } else {
        onStart('work'); // Quick start work session
      }
    }
  };

  const handleOptionSelect = (type: Session['type']) => {
    onStart(type);
    setShowOptions(false);
  };

  const toggleOptions = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isRunning) {
      setShowOptions(!showOptions);
    }
  };

  return (
    <>
      {/* Backdrop */}
      {showOptions && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/20 z-40"
          onClick={() => setShowOptions(false)}
        />
      )}

      <div className="fixed bottom-24 right-4 z-50">
        {/* Activity Options */}
        <AnimatePresence>
          {showOptions && !isRunning && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="mb-4 space-y-3"
            >
              {ACTIVITY_OPTIONS.map((option, index) => (
                <motion.button
                  key={option.type}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleOptionSelect(option.type)}
                  className="flex items-center gap-3 bg-white dark:bg-gray-800 shadow-lg rounded-2xl px-4 py-3 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-200 min-w-[200px] group"
                >
                  {/* Activity Icon */}
                  <div className={`w-10 h-10 rounded-xl ${option.bgColor} flex items-center justify-center text-white text-lg transition-all group-hover:scale-110`}>
                    {option.icon}
                  </div>
                  
                  {/* Activity Info */}
                  <div className="text-left flex-1">
                    <div className="font-semibold text-gray-900 dark:text-white text-sm">
                      {option.label}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {option.description}
                    </div>
                  </div>
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main FAB with improved design */}
        <div className="relative">
          {/* Secondary action button (show options) */}
          {!isRunning && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleOptions}
              className={`absolute -top-16 right-0 w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 ${
                showOptions 
                  ? 'bg-gray-500 hover:bg-gray-600 rotate-45' 
                  : 'bg-gray-400 hover:bg-gray-500'
              }`}
            >
              <Plus className="text-white" size={20} />
            </motion.button>
          )}

          {/* Main action button with better alignment */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleMainAction}
            className={`w-16 h-16 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 relative overflow-hidden ${
              isRunning 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-green-500 hover:bg-green-600'
            }`}
          >
            {/* Ripple effect background */}
            {isRunning && (
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 bg-red-400 rounded-full opacity-30"
              />
            )}
            
            {/* Icon with better centering */}
            <div className="relative z-10 flex items-center justify-center">
              {isRunning ? (
                <Square className="text-white" size={24} fill="currentColor" />
              ) : (
                <Play className="text-white ml-0.5" size={26} fill="currentColor" />
              )}
            </div>
          </motion.button>

          {/* Status indicator */}
          {isRunning && (
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white dark:border-gray-900"
            />
          )}
        </div>

        {/* Quick action hint */}
        {!isRunning && !showOptions && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute -top-20 right-0 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs px-3 py-1 rounded-lg whitespace-nowrap pointer-events-none"
          >
            Tap: Start Work • Long press: Options
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-100"></div>
          </motion.div>
        )}
      </div>
    </>
  );
}
