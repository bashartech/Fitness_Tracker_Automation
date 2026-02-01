'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function SharePageContent() {
  const [achievement, setAchievement] = useState('');
  const searchParams = useSearchParams();

  useEffect(() => {
    // Get achievement from URL params
    const achievementParam = searchParams.get('achievement');
    if (achievementParam) {
      setAchievement(decodeURIComponent(achievementParam));
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="text-6xl mb-6">🏆</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Achievement Unlocked!</h1>
          <div className="bg-blue-50 rounded-lg p-6 mb-6">
            <p className="text-xl text-gray-800 font-medium">{achievement || 'Amazing fitness milestone reached!'}</p>
          </div>
          <p className="text-gray-600 mb-6">
            This fitness enthusiast just reached an amazing milestone!
          </p>

          <div className="flex justify-center space-x-4">
            <button
              onClick={() => window.open('https://twitter.com/intent/tweet?text=' + encodeURIComponent(`Check out this amazing fitness achievement: ${achievement}`), '_blank')}
              className="px-6 py-3 bg-blue-400 text-white rounded-lg hover:bg-blue-500"
            >
              Tweet This
            </button>

            <button
              onClick={() => window.history.back()}
              className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
            >
              Back to App
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}