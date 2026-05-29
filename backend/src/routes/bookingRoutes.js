const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.post('/', bookingController.createBooking);
router.get('/', bookingController.getMyBookings);
router.post('/payment/verify', bookingController.verifyPayment);

router.get('/:id', bookingController.getBookingById);
router.get('/:id/completion-otp/status', bookingController.getCompletionOtpStatus);
router.post('/:id/payment/order', bookingController.createPaymentOrder);
router.post(
  '/:id/mark-service-complete',
  authorize('pandit', 'nau'),
  bookingController.markServiceComplete
);
router.post('/:id/verify-completion-otp', bookingController.verifyCompletionOtp);
router.patch('/:id/status', authorize('admin', 'pandit', 'nau'), bookingController.updateBookingStatus);

module.exports = router;
