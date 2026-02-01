const Weight = require('../models/Weight');

// @desc    Create new weight log
// @route   POST /api/weights
// @access  Private
const createWeightLog = async (req, res) => {
  try {
    const weightData = {
      ...req.body,
      userId: req.user.id
    };

    const weight = await Weight.create(weightData);

    res.status(201).json({
      success: true,
      message: 'Weight log created successfully',
      weight
    });
  } catch (error) {
    console.error('Error creating weight log:', error);

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

// @desc    Get user's weight logs
// @route   GET /api/weights
// @access  Private
const getUserWeightLogs = async (req, res) => {
  try {
    const weights = await Weight.find({ userId: req.user.id })
      .sort({ date: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: weights.length,
      weights
    });
  } catch (error) {
    console.error('Error fetching weight logs:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Get single weight log
// @route   GET /api/weights/:id
// @access  Private
const getWeightLog = async (req, res) => {
  try {
    const weight = await Weight.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!weight) {
      return res.status(404).json({
        success: false,
        message: 'Weight log not found or you do not have permission to access it'
      });
    }

    res.status(200).json({
      success: true,
      weight
    });
  } catch (error) {
    console.error('Error fetching weight log:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid weight log ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Update weight log
// @route   PUT /api/weights/:id
// @access  Private
const updateWeightLog = async (req, res) => {
  try {
    const weight = await Weight.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!weight) {
      return res.status(404).json({
        success: false,
        message: 'Weight log not found or you do not have permission to update it'
      });
    }

    const updatedWeight = await Weight.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      message: 'Weight log updated successfully',
      weight: updatedWeight
    });
  } catch (error) {
    console.error('Error updating weight log:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid weight log ID'
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

// @desc    Delete weight log
// @route   DELETE /api/weights/:id
// @access  Private
const deleteWeightLog = async (req, res) => {
  try {
    const weight = await Weight.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!weight) {
      return res.status(404).json({
        success: false,
        message: 'Weight log not found or you do not have permission to delete it'
      });
    }

    await Weight.deleteOne({ _id: req.params.id });

    res.status(200).json({
      success: true,
      message: 'Weight log deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting weight log:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid weight log ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

module.exports = {
  createWeightLog,
  getUserWeightLogs,
  getWeightLog,
  updateWeightLog,
  deleteWeightLog
};