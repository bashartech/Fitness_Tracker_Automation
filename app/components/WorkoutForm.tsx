'use client';

import { useState } from 'react';

interface WorkoutFormProps {
  onSubmit: (workoutData: any) => void;
  initialData?: any;
  isEditing?: boolean;
}

export default function WorkoutForm({ onSubmit, initialData, isEditing = false }: WorkoutFormProps) {
  const [formData, setFormData] = useState({
    exerciseType: initialData?.exerciseType || '',
    duration: initialData?.duration || '',
    intensity: initialData?.intensity || 'Medium',
    date: initialData?.date || new Date().toISOString().split('T')[0],
    notes: initialData?.notes || ''
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

    if (!formData.exerciseType.trim()) {
      newErrors.exerciseType = 'Exercise type is required';
    }

    if (!formData.duration) {
      newErrors.duration = 'Duration is required';
    } else if (isNaN(Number(formData.duration)) || Number(formData.duration) <= 0) {
      newErrors.duration = 'Duration must be a positive number';
    }

    if (!formData.intensity) {
      newErrors.intensity = 'Intensity is required';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
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
      const submitData = {
        ...formData,
        duration: Number(formData.duration)
      };

      await onSubmit(submitData);

      // Reset form after successful submission (only for new entries)
      if (!isEditing) {
        setFormData({
          exerciseType: '',
          duration: '',
          intensity: 'Medium',
          date: new Date().toISOString().split('T')[0],
          notes: ''
        });
      }
    } catch (error) {
      console.error('Error submitting workout:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm border  border-gray-200">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">
        {isEditing ? 'Edit Workout' : 'Log New Workout'}
      </h3>

      <div className="space-y-4">
        <div>
          <label htmlFor="exerciseType" className="block text-sm font-medium text-gray-700 mb-1">
            Exercise Type *
          </label>
          <input
            type="text"
            id="exerciseType"
            name="exerciseType"
            value={formData.exerciseType}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none text-gray-800 focus:ring-2 ${
              errors.exerciseType ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'
            }`}
            placeholder="e.g., Running, Push-ups, Squats"
          />
          {errors.exerciseType && (
            <p className="mt-1 text-sm text-red-600">{errors.exerciseType}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
              Duration (minutes) *
            </label>
            <input
              type="number"
              id="duration"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              min="1"
              className={`w-full text-gray-800 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                errors.duration ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'
              }`}
              placeholder="e.g., 30"
            />
            {errors.duration && (
              <p className="mt-1 text-sm text-red-600">{errors.duration}</p>
            )}
          </div>

          <div>
            <label htmlFor="intensity" className="block text-sm font-medium text-gray-700 mb-1">
              Intensity *
            </label>
            <select
              id="intensity"
              name="intensity"
              value={formData.intensity}
              onChange={handleChange}
              className={`w-full px-3 text-gray-800 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                errors.intensity ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'
              }`}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
            {errors.intensity && (
              <p className="mt-1 text-sm text-red-600">{errors.intensity}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
            Date *
          </label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className={`w-full px-3 text-gray-800 py-2 border rounded-md focus:outline-none focus:ring-2 ${
              errors.date ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'
            }`}
          />
          {errors.date && (
            <p className="mt-1 text-sm text-red-600">{errors.date}</p>
          )}
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            className="w-full text-gray-800 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Additional notes about your workout..."
          />
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? (isEditing ? 'Updating...' : 'Logging...') : (isEditing ? 'Update Workout' : 'Log Workout')}
          </button>
        </div>
      </div>
    </form>
  );
}