const Nutrition = require('../models/Nutrition');

// @desc    Create new nutrition log
// @route   POST /api/nutrition
// @access  Private
const createNutritionLog = async (req, res) => {
  try {
    // Add user ID to the nutrition data
    const nutritionData = {
      ...req.body,
      userId: req.user.id
    };

    // Create the nutrition log
    const nutrition = await Nutrition.create(nutritionData);

    res.status(201).json({
      success: true,
      message: 'Nutrition log created successfully',
      nutrition
    });
  } catch (error) {
    console.error('Error creating nutrition log:', error);

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

// @desc    Get user's nutrition logs
// @route   GET /api/nutrition
// @access  Private
const getUserNutritionLogs = async (req, res) => {
  try {
    // Get nutrition logs for the authenticated user, sorted by date (newest first)
    const nutritionLogs = await Nutrition.find({ userId: req.user.id })
      .sort({ date: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: nutritionLogs.length,
      nutritionLogs
    });
  } catch (error) {
    console.error('Error fetching nutrition logs:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Get single nutrition log
// @route   GET /api/nutrition/:id
// @access  Private
const getNutritionLog = async (req, res) => {
  try {
    const nutrition = await Nutrition.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!nutrition) {
      return res.status(404).json({
        success: false,
        message: 'Nutrition log not found or you do not have permission to access it'
      });
    }

    res.status(200).json({
      success: true,
      nutrition
    });
  } catch (error) {
    console.error('Error fetching nutrition log:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid nutrition log ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Update nutrition log
// @route   PUT /api/nutrition/:id
// @access  Private
const updateNutritionLog = async (req, res) => {
  try {
    const nutrition = await Nutrition.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!nutrition) {
      return res.status(404).json({
        success: false,
        message: 'Nutrition log not found or you do not have permission to update it'
      });
    }

    // Update the nutrition log
    const updatedNutrition = await Nutrition.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      message: 'Nutrition log updated successfully',
      nutrition: updatedNutrition
    });
  } catch (error) {
    console.error('Error updating nutrition log:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid nutrition log ID'
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

// @desc    Delete nutrition log
// @route   DELETE /api/nutrition/:id
// @access  Private
const deleteNutritionLog = async (req, res) => {
  try {
    const nutrition = await Nutrition.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!nutrition) {
      return res.status(404).json({
        success: false,
        message: 'Nutrition log not found or you do not have permission to delete it'
      });
    }

    await Nutrition.deleteOne({ _id: req.params.id });

    res.status(200).json({
      success: true,
      message: 'Nutrition log deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting nutrition log:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid nutrition log ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

module.exports = {
  createNutritionLog,
  getUserNutritionLogs,
  getNutritionLog,
  updateNutritionLog,
  deleteNutritionLog
};