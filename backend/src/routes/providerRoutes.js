const express = require('express');
const router = express.Router();
const providerController = require('../controllers/providerController');
const { protect, authorize } = require('../middleware/auth');

router.get('/search', providerController.searchProviders);
router.get('/admin/pending', protect, authorize('admin'), providerController.listPendingProviders);
router.put('/admin/:id/verify', protect, authorize('admin'), providerController.approveProvider);

router.post('/register', protect, providerController.registerProvider);
router.get('/profile/me', protect, providerController.getMyProviderProfile);
router.put('/profile/me', protect, providerController.updateProvider);
router.get('/profile/me/pricing', protect, providerController.getPricing);
router.put('/profile/me/pricing', protect, providerController.updatePricing);
router.put('/availability', protect, providerController.updateAvailability);

router.get('/:id', providerController.getProviderById);

module.exports = router;
