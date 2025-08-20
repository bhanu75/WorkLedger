import { ReactNode, useEffect, useState } from 'react';
import { Home, Clock, BarChart3, Settings, Moon, Sun } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface AppShellProps {
  children: ReactNode;
}

// Theme hook
function useTheme() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check for saved theme or system preference
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = saved === 'dark' || (!saved && prefersDark);
    
    setIsDark(shouldBeDark);
    document.documentElement.classList.toggle('dark', shouldBeDark);
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', newTheme);
  };

  return { isDark, toggleTheme };
}

export default function AppShell({ children }: AppShellProps) {
  const router = useRouter();
  const { isDark, toggleTheme } = useTheme();

  const navItems = [
    { href: '/', label: 'Today', icon: Home },
    { href: '/history', label: 'History', icon: Clock },
    { href: '/reports', label: 'Reports', icon: BarChart3 },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 transition-colors">
      {/* Header with theme toggle */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Work Ledger
          </h1>
          
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {children}
      </main>

      {/* Enhanced Bottom Navigation with better spacing */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-gray-200 dark:border-gray-700 px-2 py-2 pb-safe-bottom">
        <div className="flex justify-around items-center max-w-md mx-auto">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = router.pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center justify-center py-2 px-4 rounded-xl transition-all duration-200 min-w-[70px] ${
                  isActive 
                    ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 scale-105' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                }`}
              >
                <Icon size={22} className="mb-1" />
                <span className="text-xs font-medium">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
