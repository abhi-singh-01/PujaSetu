const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');

router.post('/send-otp', authController.sendOtpValidation, validate, authController.sendOtp);
router.post('/verify-otp', authController.verifyOtpValidation, validate, authController.verifyOtp);
router.get('/me', protect, authController.getMe);
router.put('/profile', protect, authController.updateProfile);
router.get('/digilocker/url', protect, authController.digiLockerAuthUrl);
router.get('/digilocker/callback', authController.digiLockerCallback);

module.exports = router;
