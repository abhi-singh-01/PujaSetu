const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');

router.get('/states', locationController.getStates);
router.get('/states/:stateCode/districts', locationController.getDistricts);
router.get('/states/:stateCode/districts/:districtName/cities', locationController.getCities);
router.get('/all', locationController.getAllLocations);

module.exports = router;
