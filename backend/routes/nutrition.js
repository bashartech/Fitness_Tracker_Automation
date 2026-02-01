const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createNutritionLog,
  getUserNutritionLogs,
  getNutritionLog,
  updateNutritionLog,
  deleteNutritionLog
} = require('../controllers/nutritionController');

router.route('/')
  .post(protect, createNutritionLog)
  .get(protect, getUserNutritionLogs);

router.route('/:id')
  .get(protect, getNutritionLog)
  .put(protect, updateNutritionLog)
  .delete(protect, deleteNutritionLog);

module.exports = router;