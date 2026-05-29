const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));

router.get('/dashboard', adminController.getDashboardStats);
router.get('/users', adminController.getAllUsers);
router.get('/bookings', adminController.getAllBookings);
router.patch('/users/:id/toggle', adminController.toggleUserActive);

module.exports = router;
