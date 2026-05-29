const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

router.get('/provider/:providerId', reviewController.getProviderReviews);
router.post('/', protect, reviewController.createReview);
router.post('/:id/report', protect, reviewController.reportReview);

module.exports = router;
