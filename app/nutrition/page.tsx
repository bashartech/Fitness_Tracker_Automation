'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import NutritionForm from '../components/NutritionForm';
import Header from '../components/Header';
import { nutritionAPI } from '../services/api';

export default function NutritionPage() {
  const [nutritionLogs, setNutritionLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingNutrition, setEditingNutrition] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('fitness-token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchNutritionLogs();
  }, [router]);

  const fetchNutritionLogs = async () => {
    try {
      const data = await nutritionAPI.getAll();
      setNutritionLogs(data.nutritionLogs);
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching nutrition logs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNutritionLog = async (nutritionData: any) => {
    try {
      const data = await nutritionAPI.create(nutritionData);
      setNutritionLogs(prev => [data.nutrition, ...prev]); // Add to the top of the list
      return true;
    } catch (err: any) {
      alert(err.message || 'An error occurred while creating nutrition log');
      console.error(err);
      return false;
    }
  };

  const handleUpdateNutritionLog = async (nutritionData: any) => {
    try {
      const data = await nutritionAPI.update(editingNutrition._id, nutritionData);
      setNutritionLogs(prev =>
        prev.map(n => n._id === editingNutrition._id ? data.nutrition : n)
      );
      setEditingNutrition(null);
      return true;
    } catch (err: any) {
      alert(err.message || 'An error occurred while updating nutrition log');
      console.error(err);
      return false;
    }
  };

  const handleDeleteNutritionLog = async (id: string) => {
    if (!confirm('Are you sure you want to delete this nutrition log?')) {
      return;
    }

    try {
      await nutritionAPI.delete(id);
      setNutritionLogs(prev => prev.filter(n => n._id !== id));
    } catch (err: any) {
      alert(err.message || 'An error occurred while deleting nutrition log');
      console.error(err);
    }
  };

  const handleEditClick = (nutrition: any) => {
    setEditingNutrition(nutrition);
  };

  const handleCancelEdit = () => {
    setEditingNutrition(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading nutrition logs...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Nutrition" showBackButton={true} />
      <div className="py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Nutrition Log</h1>
            <p className="mt-2 text-gray-600">Track your meals and nutritional intake</p>
          </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            {editingNutrition ? (
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-medium text-gray-900">Edit Nutrition Log</h2>
                  <button
                    onClick={handleCancelEdit}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    Cancel
                  </button>
                </div>
                <NutritionForm
                  onSubmit={handleUpdateNutritionLog}
                  initialData={editingNutrition}
                  isEditing={true}
                />
              </div>
            ) : (
              <NutritionForm onSubmit={handleCreateNutritionLog} />
            )}
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Your Nutrition Logs</h2>
              </div>

              {error && (
                <div className="px-6 py-4 bg-red-50 text-red-700">
                  {error}
                </div>
              )}

              {nutritionLogs.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <p className="text-gray-500">No nutrition logs recorded yet. Start by creating your first meal log!</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {nutritionLogs.map((nutrition) => (
                    <div key={nutrition._id} className="px-6 py-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{nutrition.meal}</h3>
                          <p className="text-gray-600">
                            {new Date(nutrition.date).toLocaleDateString()}
                          </p>
                          <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-900">
                            <div>
                              <span className="font-medium">Calories:</span> {nutrition.calories}
                            </div>
                            <div>
                              <span className="font-medium">Protein:</span> {nutrition.protein}g
                            </div>
                            <div>
                              <span className="font-medium">Carbs:</span> {nutrition.carbs}g
                            </div>
                            <div>
                              <span className="font-medium">Fats:</span> {nutrition.fats}g
                            </div>
                          </div>
                          {nutrition.notes && (
                            <p className="mt-1 text-gray-500">{nutrition.notes}</p>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditClick(nutrition)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteNutritionLog(nutrition._id)}
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