const express = require('express');
const router = express.Router();

router.use('/auth', require('./authRoutes'));
router.use('/providers', require('./providerRoutes'));
router.use('/bookings', require('./bookingRoutes'));
router.use('/reviews', require('./reviewRoutes'));
router.use('/admin', require('./adminRoutes'));
router.use('/locations', require('./locationRoutes'));
router.use('/notifications', require('./notificationRoutes'));

router.get('/health', (req, res) => {
  res.json({ success: true, message: 'PujaSetu API is running', version: '1.0.0' });
});

module.exports = router;
