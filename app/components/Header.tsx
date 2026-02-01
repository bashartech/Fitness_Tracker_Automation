'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface HeaderProps {
  title: string;
  showBackButton?: boolean;
}

export default function Header({ title, showBackButton = true }: HeaderProps) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('fitness-token');
    localStorage.removeItem('fitness-user');
    router.push('/login');
  };

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {showBackButton && (
              <div className="flex-shrink-0 flex items-center mr-4">
                <Link href="/dashboard" className="text-indigo-600 hover:text-indigo-800 text-sm md:text-base">
                  ← Back to Dashboard
                </Link>
              </div>
            )}
            <div className="flex-shrink-0 flex items-center">
              <span className="text-lg sm:text-xl font-bold text-indigo-600">Fitness Tracker</span>
            </div>
          </div>
          <div className="flex items-center">
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}