'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';
import { progressAPI } from '../services/api';
import WeightChart from '../components/WeightChart';
import WorkoutChart from '../components/WorkoutChart';
import NutritionChart from '../components/NutritionChart';
import ShareModal from '../components/ShareModal';

export default function ProgressPage() {
  const [loading, setLoading] = useState(true);
  const [progressData, setProgressData] = useState<any>({});
  const [error, setError] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('fitness-token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchProgressData();
  }, [router]);

  const fetchProgressData = async () => {
    try {
      const response = await progressAPI.getData();
      setProgressData(response.data);
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching progress data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleShareAchievement = (achievement: string) => {
    setCurrentAchievement(achievement);
    setShowShareModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading progress data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Progress Dashboard" showBackButton={true} />
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Progress Dashboard</h1>
            <p className="mt-2 text-gray-600">Visualize your fitness journey</p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Weight Chart */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Weight Progress</h3>
            {progressData.weight && progressData.weight.length > 0 ? (
              <WeightChart data={progressData.weight} />
            ) : (
              <div className="text-center py-8 text-gray-500">
                No weight data available. Start by logging your weight in the Weight Tracking section.
              </div>
            )}
          </div>

          {/* Workout Chart */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Workout Activity</h3>
            {progressData.workouts && progressData.workouts.length > 0 ? (
              <WorkoutChart data={progressData.workouts} />
            ) : (
              <div className="text-center py-8 text-gray-500">
                No workout data available. Start by logging your workouts in the Workouts section.
              </div>
            )}
          </div>

          {/* Nutrition Chart */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Nutrition Intake</h3>
            {progressData.nutrition && progressData.nutrition.length > 0 ? (
              <NutritionChart data={progressData.nutrition} />
            ) : (
              <div className="text-center py-8 text-gray-500">
                No nutrition data available. Start by logging your meals in the Nutrition section.
              </div>
            )}
          </div>

          {/* Achievement Sharing Section */}
          <div className="bg-white text-black rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl text-black font-semibold text-gray-900 mb-4">Share Achievements</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <button
                onClick={() => handleShareAchievement("Completed my first 5K run!")}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
              >
                <h3 className="font-medium text-gray-900">Running Milestone</h3>
                <p className="text-sm text-gray-600 mt-1">Share your running achievement</p>
              </button>

              <button
                onClick={() => handleShareAchievement("Reached my target weight goal!")}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
              >
                <h3 className="font-medium text-gray-900">Weight Goal</h3>
                <p className="text-sm text-gray-600 mt-1">Share your weight milestone</p>
              </button>

              <button
                onClick={() => handleShareAchievement("Consistently hitting my nutrition targets!")}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
              >
                <h3 className="font-medium text-gray-900">Nutrition</h3>
                <p className="text-sm text-gray-600 mt-1">Share your nutrition success</p>
              </button>
            </div>
          </div>
        </div>
      </div>

      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        achievement={currentAchievement}
      />
    </div>
  );
}