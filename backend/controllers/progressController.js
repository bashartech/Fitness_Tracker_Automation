const Workout = require('../models/Workout');
const Nutrition = require('../models/Nutrition');
const Weight = require('../models/Weight');
const Goal = require('../models/Goal');

// @desc    Get user's progress data for charts
// @route   GET /api/progress/data
// @access  Private
const getProgressData = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get weight data for weight chart
    const weightData = await Weight.find({ userId })
      .sort({ date: 1 })
      .select('weight date');

    // Get workout data for workout chart
    const allWorkouts = await Workout.find({ userId: req.user.id }).sort({ date: 1 });
    const workoutData = allWorkouts.reduce((acc, workout) => {
      const dateStr = new Date(workout.date).toISOString().split('T')[0]; // Format: YYYY-MM-DD
      if (!acc[dateStr]) {
        acc[dateStr] = { _id: dateStr, count: 0, totalDuration: 0 };
      }
      acc[dateStr].count++;
      acc[dateStr].totalDuration += workout.duration || 0;
      return acc;
    }, {});
    const workoutDataArray = Object.values(workoutData).sort((a, b) => new Date(a._id) - new Date(b._id));

    // Get nutrition data for calorie chart
    const allNutrition = await Nutrition.find({ userId: req.user.id }).sort({ date: 1 });
    const nutritionData = allNutrition.reduce((acc, nutrition) => {
      const dateStr = new Date(nutrition.date).toISOString().split('T')[0]; // Format: YYYY-MM-DD
      if (!acc[dateStr]) {
        acc[dateStr] = {
          _id: dateStr,
          totalCalories: 0,
          totalProtein: 0,
          totalCarbs: 0,
          totalFats: 0
        };
      }
      acc[dateStr].totalCalories += nutrition.calories || 0;
      acc[dateStr].totalProtein += nutrition.protein || 0;
      acc[dateStr].totalCarbs += nutrition.carbs || 0;
      acc[dateStr].totalFats += nutrition.fats || 0;
      return acc;
    }, {});
    const nutritionDataArray = Object.values(nutritionData).sort((a, b) => new Date(a._id) - new Date(b._id));

    // Get goal completion data
    const goalData = await Goal.find({ userId })
      .select('title status createdAt completedAt');

    res.status(200).json({
      success: true,
      data: {
        weight: weightData,
        workouts: workoutDataArray,
        nutrition: nutritionDataArray,
        goals: goalData
      }
    });
  } catch (error) {
    console.error('Error fetching progress data:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

module.exports = { getProgressData };