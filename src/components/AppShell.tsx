import { ReactNode } from 'react';
import { Home, Clock, BarChart3, Settings } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const router = useRouter();

  const navItems = [
    { href: '/', label: 'Today', icon: Home },
    { href: '/history', label: 'History', icon: Clock },
    { href: '/reports', label: 'Reports', icon: BarChart3 },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 pb-safe-bottom">
        <div className="flex justify-around">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = router.pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'text-primary-600 bg-primary-50' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon size={20} />
                <span className="text-xs mt-1">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
