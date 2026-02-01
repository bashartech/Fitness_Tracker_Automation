'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { workoutAPI, nutritionAPI, weightAPI, goalAPI, progressAPI } from '../services/api';
import WeightChart from '../components/WeightChart';
import WorkoutChart from '../components/WorkoutChart';
import NutritionChart from '../components/NutritionChart';
import { DashboardProvider } from '../context/DashboardContext';
import FitnessChatbot from '../components/FitnessChatbot';

// Define types for our data
type User = {
  id?: string;
  name?: string;
  email?: string;
  [key: string]: any; // Allow additional properties
};

type Activity = {
  type: string;
  title: string;
  description: string;
  date: string;
  icon: string;
};

type Stats = {
  totalWorkouts: number;
  totalCalories: number;
  totalWeights: number;
  activeGoals: number;
};

type ChartData = {
  weight?: any[];
  workouts?: any[];
  nutrition?: any[];
  [key: string]: any; // Allow additional properties
};

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    totalWorkouts: 0,
    totalCalories: 0,
    totalWeights: 0,
    activeGoals: 0
  });
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [isLoadingActivities, setIsLoadingActivities] = useState(true);
  const [chartData, setChartData] = useState<ChartData>({});
  const [isLoadingCharts, setIsLoadingCharts] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('fitness-token');
    const userData = localStorage.getItem('fitness-user');

    if (!token || !userData) {
      router.push('/login');
      return;
    }

    let isCancelled = false;

    const loadUserData = async () => {
      try {
        const parsedUser = JSON.parse(userData);
        if (!isCancelled) {
          setUser(parsedUser);

          // Fetch stats data
          await Promise.all([
            fetchStats(),
            fetchRecentActivities(),
            fetchChartData()
          ]);
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('fitness-token');
        localStorage.removeItem('fitness-user');
        if (!isCancelled) {
          router.push('/login');
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    loadUserData();

    // Cleanup function
    return () => {
      isCancelled = true;
    };
  }, [router]);

  const fetchStats = async () => {
    try {
      // Fetch all stats in parallel
      const [workoutsRes, nutritionRes, weightsRes, goalsRes] = await Promise.all([
        workoutAPI.getAll(),
        nutritionAPI.getAll(),
        weightAPI.getAll(),
        goalAPI.getAll()
      ]);

      // Calculate stats - handle potential undefined properties safely
      const workouts = Array.isArray(workoutsRes) ? workoutsRes : workoutsRes.workouts || [];
      const nutritionLogs = Array.isArray(nutritionRes) ? nutritionRes : nutritionRes.nutritionLogs || [];
      const weights = Array.isArray(weightsRes) ? weightsRes : weightsRes.weights || [];
      const goals = Array.isArray(goalsRes) ? goalsRes : goalsRes.goals || [];

      const totalWorkouts = workouts.length || 0;

      const totalCalories = nutritionLogs.reduce((sum: number, log: any) =>
        sum + (Number(log.calories) || 0), 0) || 0;

      const totalWeights = weights.length || 0;

      const activeGoals = goals.filter((goal: any) =>
        goal.status === 'in-progress' || goal.status === 'not-started'
      ).length || 0;

      setStats({
        totalWorkouts,
        totalCalories,
        totalWeights,
        activeGoals
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Set default values if there's an error
      setStats({
        totalWorkouts: 0,
        totalCalories: 0,
        totalWeights: 0,
        activeGoals: 0
      });
    }
  };

  const fetchRecentActivities = async () => {
    try {
      setIsLoadingActivities(true);

      // Fetch recent activities from all areas
      const [workoutsRes, nutritionRes, weightsRes, goalsRes] = await Promise.all([
        workoutAPI.getAll(),
        nutritionAPI.getAll(),
        weightAPI.getAll(),
        goalAPI.getAll()
      ]);

      const activities: Activity[] = [];

      // Handle workouts
      const workouts = Array.isArray(workoutsRes) ? workoutsRes : workoutsRes.workouts || [];
      workouts.slice(0, 3).forEach((workout: any) => {
        activities.push({
          type: 'workout',
          title: workout.exerciseType || 'Unknown Exercise',
          description: `${workout.duration || 0} min ${workout.intensity || 'moderate'} intensity`,
          date: workout.date || new Date().toISOString(),
          icon: '💪'
        });
      });

      // Handle nutrition logs
      const nutritionLogs = Array.isArray(nutritionRes) ? nutritionRes : nutritionRes.nutritionLogs || [];
      nutritionLogs.slice(0, 3).forEach((nutrition: any) => {
        activities.push({
          type: 'nutrition',
          title: nutrition.meal || 'Unknown Meal',
          description: `${nutrition.calories || 0} calories`,
          date: nutrition.date || new Date().toISOString(),
          icon: '🥗'
        });
      });

      // Handle weight logs
      const weights = Array.isArray(weightsRes) ? weightsRes : weightsRes.weights || [];
      weights.slice(0, 3).forEach((weight: any) => {
        activities.push({
          type: 'weight',
          title: `${weight.weight || 0} kg`,
          description: 'Weight measurement',
          date: weight.date || new Date().toISOString(),
          icon: '⚖️'
        });
      });

      // Handle goals
      const goals = Array.isArray(goalsRes) ? goalsRes : goalsRes.goals || [];
      goals.slice(0, 3).forEach((goal: any) => {
        activities.push({
          type: 'goal',
          title: goal.title || 'Untitled Goal',
          description: `Status: ${goal.status || 'unknown'}`,
          date: goal.updatedAt || goal.createdAt || new Date().toISOString(),
          icon: '🎯'
        });
      });

      // Sort by date descending and take the 5 most recent
      const sortedActivities = activities
        .sort((a, b) => new Date(b.date || '').getTime() - new Date(a.date || '').getTime())
        .slice(0, 5);

      setRecentActivities(sortedActivities);
    } catch (error) {
      console.error('Error fetching recent activities:', error);
    } finally {
      setIsLoadingActivities(false);
    }
  };

  const fetchChartData = async () => {
    try {
      setIsLoadingCharts(true);

      // Fetch progress data for charts using the API service
      const response = await progressAPI.getData();

      // Handle the response data properly
      setChartData(response.data || response || {});
    } catch (error) {
      console.error('Error fetching chart data:', error);
    } finally {
      setIsLoadingCharts(false);
    }
  };

  const refreshData = async () => {
    // Refresh all data after chatbot operations
    try {
      await Promise.all([
        fetchStats(),
        fetchRecentActivities(),
        fetchChartData()
      ]);
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('fitness-token');
    localStorage.removeItem('fitness-user');
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <>
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-xl font-bold text-indigo-600">Fitness Tracker</span>
              </div>
            </div>
            <div className="flex items-center">
              <div className="ml-3 relative">
                <div className="flex items-center space-x-4">
                  <span className="text-gray-700">Welcome, {user?.name}</span>
                  <button
                    onClick={handleLogout}
                    className="ml-4 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Dashboard</h2>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Link href="/workouts" className="bg-blue-50 p-6 rounded-lg hover:bg-blue-100 transition-colors">
                  <h3 className="text-lg font-medium text-blue-800">Workouts</h3>
                  <p className="mt-2 text-blue-600">Log and track your exercises</p>
                </Link>

                <Link href="/nutrition" className="bg-green-50 p-6 rounded-lg hover:bg-green-100 transition-colors">
                  <h3 className="text-lg font-medium text-green-800">Nutrition</h3>
                  <p className="mt-2 text-green-600">Track your meals and macros</p>
                </Link>

                <Link href="/weights" className="bg-purple-50 p-6 rounded-lg hover:bg-purple-100 transition-colors">
                  <h3 className="text-lg font-medium text-purple-800">Weight Tracking</h3>
                  <p className="mt-2 text-purple-600">Track your weight progress</p>
                </Link>

                <Link href="/goals" className="bg-teal-50 p-6 rounded-lg hover:bg-teal-100 transition-colors">
                  <h3 className="text-lg font-medium text-teal-800">Goals</h3>
                  <p className="mt-2 text-teal-600">Set and track your fitness goals</p>
                </Link>
                <Link href="/progress" className="bg-teal-50 p-6 rounded-lg hover:bg-teal-200 transition-colors">
                  <h3 className="text-lg font-medium text-teal-800">Progress</h3>
                  <p className="mt-2 text-teal-600">Check the progress</p>
                </Link>
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-900">Quick Stats</h3>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Total Workouts</p>
                    <p className="text-2xl text-gray-800 font-bold">{stats.totalWorkouts}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Calories Consumed</p>
                    <p className="text-2xl text-gray-800 font-bold">{stats.totalCalories}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Weight Logs</p>
                    <p className="text-2xl text-gray-800 font-bold">{stats.totalWeights}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Active Goals</p>
                    <p className="text-2xl text-gray-800 font-bold">{stats.activeGoals}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mini Charts */}
          <div className="bg-white overflow-hidden shadow rounded-lg mt-6">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Progress Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="border border-gray-200 rounded-lg p-4 h-64">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Weight Progress</h4>
                  {isLoadingCharts ? (
                    <div className="flex items-center justify-center h-48 text-gray-500">
                      Loading chart...
                    </div>
                  ) : chartData.weight && chartData.weight.length > 0 ? (
                    <WeightChart data={chartData.weight} />
                  ) : (
                    <div className="flex items-center justify-center h-48 text-gray-500 text-sm">
                      No weight data yet
                    </div>
                  )}
                </div>

                <div className="border border-gray-200 rounded-lg p-4 h-64">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Workout Activity</h4>
                  {isLoadingCharts ? (
                    <div className="flex items-center justify-center h-48 text-gray-500">
                      Loading chart...
                    </div>
                  ) : chartData.workouts && chartData.workouts.length > 0 ? (
                    <WorkoutChart data={chartData.workouts} />
                  ) : (
                    <div className="flex items-center justify-center h-48 text-gray-500 text-sm">
                      No workout data yet
                    </div>
                  )}
                </div>

                <div className="border border-gray-200 rounded-lg p-4 h-64">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Nutrition Intake</h4>
                  {isLoadingCharts ? (
                    <div className="flex items-center justify-center h-48 text-gray-500">
                      Loading chart...
                    </div>
                  ) : chartData.nutrition && chartData.nutrition.length > 0 ? (
                    <NutritionChart data={chartData.nutrition} />
                  ) : (
                    <div className="flex items-center justify-center h-48 text-gray-500 text-sm">
                      No nutrition data yet
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activities */}
          <div className="bg-white overflow-hidden shadow rounded-lg mt-6">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activities</h3>
              {isLoadingActivities ? (
                <div className="text-center py-4 text-gray-500">
                  Loading recent activities...
                </div>
              ) : recentActivities.length > 0 ? (
                <div className="space-y-4">
                  {recentActivities.map((activity, index) => (
                    <div key={index} className="flex items-start border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                      <span className="text-xl mr-3">{activity.icon}</span>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900">{activity.title}</h4>
                        <p className="text-sm text-gray-500">{activity.description}</p>
                        <p className="text-xs text-gray-800 mt-1">
                          {new Date(activity.date || '').toLocaleDateString()} at{' '}
                          {new Date(activity.date || '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  No recent activities yet. Start by logging your workouts, nutrition, or weight!
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
    {/* Floating Chatbot - Positioned independently of content */}
   <DashboardProvider onRefresh={refreshData}>
   <FitnessChatbot />
   </DashboardProvider>
    {/* <div className="fixed bottom-6 right-6 z-[9999]">
      <FloatingChatbot onRefresh={refreshData} />
    </div> */}
  </>
  )
}