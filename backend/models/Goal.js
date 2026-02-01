const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  goalType: {
    type: String,
    required: [true, 'Goal type is required'],
    enum: {
      values: ['lose-weight', 'gain-weight', 'build-muscle', 'run-distance', 'other'],
      message: 'Invalid goal type'
    }
  },
  targetValue: {
    type: String,
    required: [true, 'Target value is required'],
    maxlength: [100, 'Target value cannot exceed 100 characters']
  },
  deadline: {
    type: Date,
    required: [true, 'Deadline is required']
  },
  currentProgress: {
    type: String,
    default: '0',
    maxlength: [100, 'Progress cannot exceed 100 characters']
  },
  status: {
    type: String,
    enum: {
      values: ['not-started', 'in-progress', 'completed', 'missed'],
      message: 'Invalid status'
    },
    default: 'not-started'
  },
  title: {
    type: String,
    required: [true, 'Goal title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  }
}, {
  timestamps: true
});

// Index for efficient querying by user and status
goalSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model('Goal', goalSchema);