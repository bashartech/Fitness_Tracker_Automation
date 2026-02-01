const Workout = require('../models/Workout');

// @desc    Create new workout
// @route   POST /api/workouts
// @access  Private
const createWorkout = async (req, res) => {
  try {
    // Add user ID to the workout data
    const workoutData = {
      ...req.body,
      userId: req.user.id
    };

    // Create the workout
    const workout = await Workout.create(workoutData);

    res.status(201).json({
      success: true,
      message: 'Workout created successfully',
      workout
    });
  } catch (error) {
    console.error('Error creating workout:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: messages
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Get user's workouts
// @route   GET /api/workouts
// @access  Private
const getUserWorkouts = async (req, res) => {
  try {
    // Get workouts for the authenticated user, sorted by date (newest first)
    const workouts = await Workout.find({ userId: req.user.id })
      .sort({ date: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: workouts.length,
      workouts
    });
  } catch (error) {
    console.error('Error fetching workouts:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Get single workout
// @route   GET /api/workouts/:id
// @access  Private
const getWorkout = async (req, res) => {
  try {
    const workout = await Workout.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!workout) {
      return res.status(404).json({
        success: false,
        message: 'Workout not found or you do not have permission to access it'
      });
    }

    res.status(200).json({
      success: true,
      workout
    });
  } catch (error) {
    console.error('Error fetching workout:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid workout ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Update workout
// @route   PUT /api/workouts/:id
// @access  Private
const updateWorkout = async (req, res) => {
  try {
    const workout = await Workout.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!workout) {
      return res.status(404).json({
        success: false,
        message: 'Workout not found or you do not have permission to update it'
      });
    }

    // Update the workout
    const updatedWorkout = await Workout.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      message: 'Workout updated successfully',
      workout: updatedWorkout
    });
  } catch (error) {
    console.error('Error updating workout:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid workout ID'
      });
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: messages
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Delete workout
// @route   DELETE /api/workouts/:id
// @access  Private
const deleteWorkout = async (req, res) => {
  try {
    const workout = await Workout.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!workout) {
      return res.status(404).json({
        success: false,
        message: 'Workout not found or you do not have permission to delete it'
      });
    }

    await Workout.deleteOne({ _id: req.params.id });

    res.status(200).json({
      success: true,
      message: 'Workout deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting workout:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid workout ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

module.exports = {
  createWorkout,
  getUserWorkouts,
  getWorkout,
  updateWorkout,
  deleteWorkout
};