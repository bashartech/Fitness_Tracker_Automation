'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import WeightForm from '../components/WeightForm';
import Header from '../components/Header';
import { weightAPI } from '../services/api';

export default function WeightsPage() {
  const [weights, setWeights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingWeight, setEditingWeight] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('fitness-token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchWeights();
  }, [router]);

  const fetchWeights = async () => {
    try {
      const data = await weightAPI.getAll();
      setWeights(data.weights);
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching weight logs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWeightLog = async (weightData: any) => {
    try {
      const data = await weightAPI.create(weightData);
      setWeights(prev => [data.weight, ...prev]); // Add to the top of the list
      return true;
    } catch (err: any) {
      alert(err.message || 'An error occurred while creating weight log');
      console.error(err);
      return false;
    }
  };

  const handleUpdateWeightLog = async (weightData: any) => {
    try {
      const data = await weightAPI.update(editingWeight._id, weightData);
      setWeights(prev =>
        prev.map(w => w._id === editingWeight._id ? data.weight : w)
      );
      setEditingWeight(null);
      return true;
    } catch (err: any) {
      alert(err.message || 'An error occurred while updating weight log');
      console.error(err);
      return false;
    }
  };

  const handleDeleteWeightLog = async (id: string) => {
    if (!confirm('Are you sure you want to delete this weight log?')) {
      return;
    }

    try {
      await weightAPI.delete(id);
      setWeights(prev => prev.filter(w => w._id !== id));
    } catch (err: any) {
      alert(err.message || 'An error occurred while deleting weight log');
      console.error(err);
    }
  };

  const handleEditClick = (weight: any) => {
    setEditingWeight(weight);
  };

  const handleCancelEdit = () => {
    setEditingWeight(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading weight logs...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Weight Tracking" showBackButton={true} />
      <div className="py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Weight Tracking</h1>
            <p className="mt-2 text-gray-600">Track your weight progress over time</p>
          </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            {editingWeight ? (
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-medium text-gray-900">Edit Weight Log</h2>
                  <button
                    onClick={handleCancelEdit}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    Cancel
                  </button>
                </div>
                <WeightForm
                  onSubmit={handleUpdateWeightLog}
                  initialData={editingWeight}
                  isEditing={true}
                />
              </div>
            ) : (
              <WeightForm onSubmit={handleCreateWeightLog} />
            )}
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Your Weight Logs</h2>
              </div>

              {error && (
                <div className="px-6 py-4 bg-red-50 text-red-700">
                  {error}
                </div>
              )}

              {weights.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <p className="text-gray-500">No weight logs recorded yet. Start by creating your first weight entry!</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {weights.map((weight) => (
                    <div key={weight._id} className="px-6 py-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{weight.weight} kg</h3>
                          <p className="text-gray-600">
                            {new Date(weight.date).toLocaleDateString()}
                          </p>
                          {weight.notes && (
                            <p className="mt-1 text-gray-500">{weight.notes}</p>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditClick(weight)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteWeightLog(weight._id)}
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