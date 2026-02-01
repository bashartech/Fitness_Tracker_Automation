const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createWorkout,
  getUserWorkouts,
  getWorkout,
  updateWorkout,
  deleteWorkout
} = require('../controllers/workoutController');

router.route('/')
  .post(protect, createWorkout)
  .get(protect, getUserWorkouts);

router.route('/:id')
  .get(protect, getWorkout)
  .put(protect, updateWorkout)
  .delete(protect, deleteWorkout);

module.exports = router;