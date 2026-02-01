'use client';

import { useState } from 'react';

interface GoalFormProps {
  onSubmit: (goalData: any) => void;
  initialData?: any;
  isEditing?: boolean;
}

export default function GoalForm({ onSubmit, initialData, isEditing = false }: GoalFormProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    goalType: initialData?.goalType || 'lose-weight',
    targetValue: initialData?.targetValue || '',
    deadline: initialData?.deadline || new Date().toISOString().split('T')[0],
    description: initialData?.description || '',
    currentProgress: initialData?.currentProgress || '0'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Goal title is required';
    }

    if (!formData.goalType) {
      newErrors.goalType = 'Goal type is required';
    }

    if (!formData.targetValue.trim()) {
      newErrors.targetValue = 'Target value is required';
    }

    if (!formData.deadline) {
      newErrors.deadline = 'Deadline is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await onSubmit(formData);

      // Reset form after successful submission (only for new entries)
      if (!isEditing) {
        setFormData({
          title: '',
          goalType: 'lose-weight',
          targetValue: '',
          deadline: new Date().toISOString().split('T')[0],
          description: '',
          currentProgress: '0'
        });
      }
    } catch (error) {
      console.error('Error submitting goal:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">
        {isEditing ? 'Edit Goal' : 'Create New Goal'}
      </h3>

      <div className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Goal Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none text-gray-800 focus:ring-2 ${
              errors.title ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'
            }`}
            placeholder="e.g., Lose 5kg in 2 months"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title}</p>
          )}
        </div>

        <div>
          <label htmlFor="goalType" className="block text-sm font-medium text-gray-700 mb-1">
            Goal Type *
          </label>
          <select
            id="goalType"
            name="goalType"
            value={formData.goalType}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none text-gray-800 focus:ring-2 ${
              errors.goalType ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'
            }`}
          >
            <option value="lose-weight">Lose Weight</option>
            <option value="gain-weight">Gain Weight</option>
            <option value="build-muscle">Build Muscle</option>
            <option value="run-distance">Run Distance</option>
            <option value="other">Other</option>
          </select>
          {errors.goalType && (
            <p className="mt-1 text-sm text-red-600">{errors.goalType}</p>
          )}
        </div>

        <div>
          <label htmlFor="targetValue" className="block text-sm font-medium text-gray-700 mb-1">
            Target Value *
          </label>
          <input
            type="text"
            id="targetValue"
            name="targetValue"
            value={formData.targetValue}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none text-gray-800 focus:ring-2 ${
              errors.targetValue ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'
            }`}
            placeholder="e.g., 5kg, 10 lbs, 10K run"
          />
          {errors.targetValue && (
            <p className="mt-1 text-sm text-red-600">{errors.targetValue}</p>
          )}
        </div>

        <div>
          <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-1">
            Deadline *
          </label>
          <input
            type="date"
            id="deadline"
            name="deadline"
            value={formData.deadline}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none text-gray-800 focus:ring-2 ${
              errors.deadline ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'
            }`}
          />
          {errors.deadline && (
            <p className="mt-1 text-sm text-red-600">{errors.deadline}</p>
          )}
        </div>

        <div>
          <label htmlFor="currentProgress" className="block text-sm font-medium text-gray-700 mb-1">
            Current Progress
          </label>
          <input
            type="text"
            id="currentProgress"
            name="currentProgress"
            value={formData.currentProgress}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none text-gray-800 focus:ring-2 focus:ring-indigo-500"
            placeholder="e.g., 2kg lost so far"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none text-gray-800 focus:ring-2 focus:ring-indigo-500"
            placeholder="Describe your goal in more detail..."
          />
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Goal' : 'Create Goal')}
          </button>
        </div>
      </div>
    </form>
  );
}