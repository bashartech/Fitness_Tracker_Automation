const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getProgressData } = require('../controllers/progressController');

router.route('/data').get(protect, getProgressData);

module.exports = router;