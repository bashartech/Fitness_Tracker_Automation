'use client';

import { useState } from 'react';

interface NutritionFormProps {
  onSubmit: (nutritionData: any) => void;
  initialData?: any;
  isEditing?: boolean;
}

export default function NutritionForm({ onSubmit, initialData, isEditing = false }: NutritionFormProps) {
  const [formData, setFormData] = useState({
    meal: initialData?.meal || '',
    calories: initialData?.calories || '',
    protein: initialData?.protein || '',
    carbs: initialData?.carbs || '',
    fats: initialData?.fats || '',
    date: initialData?.date || new Date().toISOString().split('T')[0],
    notes: initialData?.notes || ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

    if (!formData.meal.trim()) {
      newErrors.meal = 'Meal name is required';
    }

    if (!formData.calories) {
      newErrors.calories = 'Calories are required';
    } else if (isNaN(Number(formData.calories)) || Number(formData.calories) < 0) {
      newErrors.calories = 'Calories must be a non-negative number';
    }

    if (!formData.protein) {
      newErrors.protein = 'Protein is required';
    } else if (isNaN(Number(formData.protein)) || Number(formData.protein) < 0) {
      newErrors.protein = 'Protein must be a non-negative number';
    }

    if (!formData.carbs) {
      newErrors.carbs = 'Carbs are required';
    } else if (isNaN(Number(formData.carbs)) || Number(formData.carbs) < 0) {
      newErrors.carbs = 'Carbs must be a non-negative number';
    }

    if (!formData.fats) {
      newErrors.fats = 'Fats are required';
    } else if (isNaN(Number(formData.fats)) || Number(formData.fats) < 0) {
      newErrors.fats = 'Fats must be a non-negative number';
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
        calories: Number(formData.calories),
        protein: Number(formData.protein),
        carbs: Number(formData.carbs),
        fats: Number(formData.fats)
      };

      await onSubmit(submitData);

      // Reset form after successful submission (only for new entries)
      if (!isEditing) {
        setFormData({
          meal: '',
          calories: '',
          protein: '',
          carbs: '',
          fats: '',
          date: new Date().toISOString().split('T')[0],
          notes: ''
        });
      }
    } catch (error) {
      console.error('Error submitting nutrition log:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">
        {isEditing ? 'Edit Nutrition Log' : 'Log New Meal'}
      </h3>

      <div className="space-y-4">
        <div>
          <label htmlFor="meal" className="block text-sm font-medium text-gray-700 mb-1">
            Meal Name *
          </label>
          <input
            type="text"
            id="meal"
            name="meal"
            value={formData.meal}
            onChange={handleChange}
            className={`w-full text-gray-800 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
              errors.meal ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'
            }`}
            placeholder="e.g., Breakfast, Lunch, Dinner, Snack"
          />
          {errors.meal && (
            <p className="mt-1 text-sm text-red-600">{errors.meal}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label htmlFor="calories" className="block text-sm font-medium text-gray-700 mb-1">
              Calories *
            </label>
            <input
              type="number"
              id="calories"
              name="calories"
              value={formData.calories}
              onChange={handleChange}
              min="0"
              className={`w-full text-gray-800 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                errors.calories ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'
              }`}
              placeholder="e.g., 350"
            />
            {errors.calories && (
              <p className="mt-1 text-sm text-red-600">{errors.calories}</p>
            )}
          </div>

          <div>
            <label htmlFor="protein" className="block text-sm font-medium text-gray-700 mb-1">
              Protein (g) *
            </label>
            <input
              type="number"
              id="protein"
              name="protein"
              value={formData.protein}
              onChange={handleChange}
              min="0"
              className={`w-full text-gray-800 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                errors.protein ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'
              }`}
              placeholder="e.g., 25"
            />
            {errors.protein && (
              <p className="mt-1 text-sm text-red-600">{errors.protein}</p>
            )}
          </div>

          <div>
            <label htmlFor="carbs" className="block text-sm font-medium text-gray-700 mb-1">
              Carbs (g) *
            </label>
            <input
              type="number"
              id="carbs"
              name="carbs"
              value={formData.carbs}
              onChange={handleChange}
              min="0"
              className={`w-full text-gray-800 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                errors.carbs ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'
              }`}
              placeholder="e.g., 45"
            />
            {errors.carbs && (
              <p className="mt-1 text-sm text-red-600">{errors.carbs}</p>
            )}
          </div>

          <div>
            <label htmlFor="fats" className="block text-sm font-medium text-gray-700 mb-1">
              Fats (g) *
            </label>
            <input
              type="number"
              id="fats"
              name="fats"
              value={formData.fats}
              onChange={handleChange}
              min="0"
              className={`w-full text-gray-800 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                errors.fats ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'
              }`}
              placeholder="e.g., 15"
            />
            {errors.fats && (
              <p className="mt-1 text-sm text-red-600">{errors.fats}</p>
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
            className={`w-full text-gray-800 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
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
            placeholder="Additional notes about your meal..."
          />
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? (isEditing ? 'Updating...' : 'Logging...') : (isEditing ? 'Update Log' : 'Log Meal')}
          </button>
        </div>
      </div>
    </form>
  );
}