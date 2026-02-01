'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import WorkoutForm from '../components/WorkoutForm';
import Header from '../components/Header';
import { workoutAPI } from '../services/api';

export default function WorkoutsPage() {
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingWorkout, setEditingWorkout] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('fitness-token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchWorkouts();
  }, [router]);

  const fetchWorkouts = async () => {
    try {
      const data = await workoutAPI.getAll();
      setWorkouts(data.workouts);
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching workouts');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWorkout = async (workoutData: any) => {
    try {
      const data = await workoutAPI.create(workoutData);
      setWorkouts(prev => [data.workout, ...prev]); // Add to the top of the list
      return true;
    } catch (err: any) {
      alert(err.message || 'An error occurred while creating workout');
      console.error(err);
      return false;
    }
  };

  const handleUpdateWorkout = async (workoutData: any) => {
    try {
      const data = await workoutAPI.update(editingWorkout._id, workoutData);
      setWorkouts(prev =>
        prev.map(w => w._id === editingWorkout._id ? data.workout : w)
      );
      setEditingWorkout(null);
      return true;
    } catch (err: any) {
      alert(err.message || 'An error occurred while updating workout');
      console.error(err);
      return false;
    }
  };

  const handleDeleteWorkout = async (id: string) => {
    if (!confirm('Are you sure you want to delete this workout?')) {
      return;
    }

    try {
      await workoutAPI.delete(id);
      setWorkouts(prev => prev.filter(w => w._id !== id));
    } catch (err: any) {
      alert(err.message || 'An error occurred while deleting workout');
      console.error(err);
    }
  };

  const handleEditClick = (workout: any) => {
    setEditingWorkout(workout);
  };

  const handleCancelEdit = () => {
    setEditingWorkout(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading workouts...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Workouts" showBackButton={true} />
      <div className="py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Workout Log</h1>
            <p className="mt-2 text-gray-600">Track your exercises and training sessions</p>
          </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            {editingWorkout ? (
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-medium text-gray-900">Edit Workout</h2>
                  <button
                    onClick={handleCancelEdit}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    Cancel
                  </button>
                </div>
                <WorkoutForm
                  onSubmit={handleUpdateWorkout}
                  initialData={editingWorkout}
                  isEditing={true}
                />
              </div>
            ) : (
              <WorkoutForm onSubmit={handleCreateWorkout} />
            )}
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Your Workouts</h2>
              </div>

              {error && (
                <div className="px-6 py-4 bg-red-50 text-red-700">
                  {error}
                </div>
              )}

              {workouts.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <p className="text-gray-500">No workouts logged yet. Start by creating your first workout!</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {workouts.map((workout) => (
                    <div key={workout._id} className="px-6 py-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{workout.exerciseType}</h3>
                          <p className="text-gray-600">
                            {new Date(workout.date).toLocaleDateString()} • {workout.duration} min • {workout.intensity}
                          </p>
                          {workout.notes && (
                            <p className="mt-1 text-gray-500">{workout.notes}</p>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditClick(workout)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteWorkout(workout._id)}
                            className="text-red-600 hover:text-red-900"
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