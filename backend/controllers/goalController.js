const Goal = require('../models/Goal');

// @desc    Create new goal
// @route   POST /api/goals
// @access  Private
const createGoal = async (req, res) => {
  try {
    const goalData = {
      ...req.body,
      userId: req.user.id
    };

    const goal = await Goal.create(goalData);

    res.status(201).json({
      success: true,
      message: 'Goal created successfully',
      goal
    });
  } catch (error) {
    console.error('Error creating goal:', error);

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

// @desc    Get user's goals
// @route   GET /api/goals
// @access  Private
const getUserGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ userId: req.user.id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: goals.length,
      goals
    });
  } catch (error) {
    console.error('Error fetching goals:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Get single goal
// @route   GET /api/goals/:id
// @access  Private
const getGoal = async (req, res) => {
  try {
    const goal = await Goal.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found or you do not have permission to access it'
      });
    }

    res.status(200).json({
      success: true,
      goal
    });
  } catch (error) {
    console.error('Error fetching goal:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid goal ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Update goal
// @route   PUT /api/goals/:id
// @access  Private
const updateGoal = async (req, res) => {
  try {
    const goal = await Goal.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found or you do not have permission to update it'
      });
    }

    const updatedGoal = await Goal.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      message: 'Goal updated successfully',
      goal: updatedGoal
    });
  } catch (error) {
    console.error('Error updating goal:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid goal ID'
      });
    }

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

// @desc    Delete goal
// @route   DELETE /api/goals/:id
// @access  Private
const deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found or you do not have permission to delete it'
      });
    }

    await Goal.deleteOne({ _id: req.params.id });

    res.status(200).json({
      success: true,
      message: 'Goal deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting goal:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid goal ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Update goal progress
// @route   PUT /api/goals/:id/progress
// @access  Private
const updateGoalProgress = async (req, res) => {
  try {
    const { currentProgress } = req.body;

    const goal = await Goal.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found or you do not have permission to update it'
      });
    }

    // Update progress and status based on completion
    const updatedFields = { currentProgress };

    // Update status based on progress
    if (currentProgress === goal.targetValue) {
      updatedFields.status = 'completed';
    } else if (new Date() > goal.deadline && currentProgress !== goal.targetValue) {
      updatedFields.status = 'missed';
    } else {
      updatedFields.status = 'in-progress';
    }

    const updatedGoal = await Goal.findByIdAndUpdate(
      req.params.id,
      updatedFields,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      message: 'Goal progress updated successfully',
      goal: updatedGoal
    });
  } catch (error) {
    console.error('Error updating goal progress:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid goal ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

module.exports = {
  createGoal,
  getUserGoals,
  getGoal,
  updateGoal,
  deleteGoal,
  updateGoalProgress
};