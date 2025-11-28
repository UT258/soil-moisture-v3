const express = require('express');
const {
  getRiskZones,
  getRiskZone,
  createRiskZone,
  updateRiskZone,
  deleteRiskZone,
  addFeedback,
  getRiskZonesInBounds
} = require('../controllers/riskZoneController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/bounds').get(getRiskZonesInBounds);

router
  .route('/')
  .get(getRiskZones)
  .post(protect, authorize('admin', 'operator'), createRiskZone);

router
  .route('/:id')
  .get(getRiskZone)
  .put(protect, authorize('admin', 'operator'), updateRiskZone)
  .delete(protect, authorize('admin'), deleteRiskZone);

router.route('/:id/feedback').post(protect, addFeedback);

module.exports = router;
