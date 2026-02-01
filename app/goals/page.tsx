'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import GoalForm from '../components/GoalForm';
import Header from '../components/Header';
import { goalAPI } from '../services/api';

export default function GoalsPage() {
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingGoal, setEditingGoal] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('fitness-token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchGoals();
  }, [router]);

  const fetchGoals = async () => {
    try {
      const data = await goalAPI.getAll();
      setGoals(data.goals);
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching goals');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGoal = async (goalData: any) => {
    try {
      const data = await goalAPI.create(goalData);
      setGoals(prev => [data.goal, ...prev]); // Add to the top of the list
      return true;
    } catch (err: any) {
      alert(err.message || 'An error occurred while creating goal');
      console.error(err);
      return false;
    }
  };

  const handleUpdateGoal = async (goalData: any) => {
    try {
      const data = await goalAPI.update(editingGoal._id, goalData);
      setGoals(prev =>
        prev.map(g => g._id === editingGoal._id ? data.goal : g)
      );
      setEditingGoal(null);
      return true;
    } catch (err: any) {
      alert(err.message || 'An error occurred while updating goal');
      console.error(err);
      return false;
    }
  };

  const handleDeleteGoal = async (id: string) => {
    if (!confirm('Are you sure you want to delete this goal?')) {
      return;
    }

    try {
      await goalAPI.delete(id);
      setGoals(prev => prev.filter(g => g._id !== id));
    } catch (err: any) {
      alert(err.message || 'An error occurred while deleting goal');
      console.error(err);
    }
  };

  const handleUpdateProgress = async (id: string, progress: string) => {
    try {
      const data = await goalAPI.updateProgress(id, { currentProgress: progress });
      setGoals(prev =>
        prev.map(g => g._id === id ? data.goal : g)
      );
    } catch (err: any) {
      alert(err.message || 'An error occurred while updating goal progress');
      console.error(err);
    }
  };

  const handleStartGoal = async (id: string) => {
    try {
      // Update status to 'in-progress' and set initial progress if needed
      const data = await goalAPI.update(id, { status: 'in-progress' });
      setGoals(prev =>
        prev.map(g => g._id === id ? data.goal : g)
      );
    } catch (err: any) {
      alert(err.message || 'An error occurred while starting goal');
      console.error(err);
    }
  };

  const handleCompleteGoal = async (id: string) => {
    try {
      const data = await goalAPI.update(id, { status: 'completed', currentProgress: '100%' }); // or appropriate value
      setGoals(prev =>
        prev.map(g => g._id === id ? data.goal : g)
      );
    } catch (err: any) {
      alert(err.message || 'An error occurred while completing goal');
      console.error(err);
    }
  };

  const handleEditClick = (goal: any) => {
    setEditingGoal(goal);
  };

  const handleCancelEdit = () => {
    setEditingGoal(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading goals...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Fitness Goals" showBackButton={true} />
      <div className="py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Fitness Goals</h1>
            <p className="mt-2 text-gray-600">Set and track your fitness objectives</p>
          </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            {editingGoal ? (
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-medium text-gray-900">Edit Goal</h2>
                  <button
                    onClick={handleCancelEdit}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    Cancel
                  </button>
                </div>
                <GoalForm
                  onSubmit={handleUpdateGoal}
                  initialData={editingGoal}
                  isEditing={true}
                />
              </div>
            ) : (
              <GoalForm onSubmit={handleCreateGoal} />
            )}
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Your Goals</h2>
              </div>

              {error && (
                <div className="px-6 py-4 bg-red-50 text-red-700">
                  {error}
                </div>
              )}

              {goals.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <p className="text-gray-500">No goals set yet. Start by creating your first fitness goal!</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {goals.map((goal) => (
                    <div key={goal._id} className="px-6 py-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{goal.title}</h3>
                          <p className="text-gray-600 capitalize">{goal.goalType.replace('-', ' ')}</p>
                          <div className="mt-2">
                            <p className="text-sm text-gray-600">Target: {goal.targetValue}</p>
                            <p className="text-sm text-gray-600">
                              Deadline: {new Date(goal.deadline).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-gray-600">
                              Progress: {goal.currentProgress || '0'} / {goal.targetValue}
                            </p>
                            <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                              (goal.status || 'not-started') === 'completed' ? 'bg-green-100 text-green-800' :
                              (goal.status || 'not-started') === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                              (goal.status || 'not-started') === 'missed' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {(goal.status || 'not-started').replace('-', ' ')}
                            </span>
                          </div>
                          {goal.description && (
                            <p className="mt-2 text-gray-500 text-sm">{goal.description}</p>
                          )}
                        </div>
                        <div className="flex space-x-2 flex-col">
                          {(!goal.status || goal.status === 'not-started') && (
                            <button
                              onClick={() => handleStartGoal(goal._id)}
                              className="text-green-600 hover:text-green-900 text-sm"
                            >
                              Start
                            </button>
                          )}
                          {goal.status === 'in-progress' && (
                            <button
                              onClick={() => handleCompleteGoal(goal._id)}
                              className="text-blue-600 hover:text-blue-900 text-sm"
                            >
                              Complete
                            </button>
                          )}
                          <button
                            onClick={() => handleEditClick(goal)}
                            className="text-indigo-600 hover:text-indigo-900 text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteGoal(goal._id)}
                            className="text-red-600 hover:text-red-900 text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}