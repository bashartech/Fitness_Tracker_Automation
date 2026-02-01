const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createWeightLog,
  getUserWeightLogs,
  getWeightLog,
  updateWeightLog,
  deleteWeightLog
} = require('../controllers/weightController');

router.route('/')
  .post(protect, createWeightLog)
  .get(protect, getUserWeightLogs);

router.route('/:id')
  .get(protect, getWeightLog)
  .put(protect, updateWeightLog)
  .delete(protect, deleteWeightLog);

module.exports = router;