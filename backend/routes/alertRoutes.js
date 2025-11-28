const express = require('express');
const {
  getAlerts,
  getAlert,
  createAlert,
  updateAlert,
  acknowledgeAlert,
  resolveAlert,
  getActiveAlerts,
  getAlertStats
} = require('../controllers/alertController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router
  .route('/')
  .get(getAlerts)
  .post(protect, authorize('admin', 'operator'), createAlert);

router.route('/active').get(getActiveAlerts);

router.route('/stats').get(getAlertStats);

router
  .route('/:id')
  .get(getAlert)
  .put(protect, authorize('admin', 'operator'), updateAlert);

router.route('/:id/acknowledge').put(protect, acknowledgeAlert);

router.route('/:id/resolve').put(protect, authorize('admin', 'operator'), resolveAlert);

module.exports = router;
