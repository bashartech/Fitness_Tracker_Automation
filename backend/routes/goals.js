const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createGoal,
  getUserGoals,
  getGoal,
  updateGoal,
  deleteGoal,
  updateGoalProgress
} = require('../controllers/goalController');

router.route('/')
  .post(protect, createGoal)
  .get(protect, getUserGoals);

router.route('/:id')
  .get(protect, getGoal)
  .put(protect, updateGoal)
  .delete(protect, deleteGoal);

router.route('/:id/progress').put(protect, updateGoalProgress);

module.exports = router;