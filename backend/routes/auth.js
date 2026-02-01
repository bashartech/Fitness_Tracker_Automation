const express = require('express');
const router = express.Router();
const { register, login, getProfile, logout } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.route('/register').post(register);
router.route('/login').post(login);
router.route('/profile').get(protect, getProfile);
router.route('/logout').post(protect, logout);

module.exports = router;