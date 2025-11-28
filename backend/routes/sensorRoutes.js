const express = require('express');
const {
  getSensors,
  getSensor,
  createSensor,
  updateSensor,
  deleteSensor,
  getSensorsInRadius,
  updateSensorStatus
} = require('../controllers/sensorController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router
  .route('/')
  .get(getSensors)
  .post(protect, authorize('admin', 'operator'), createSensor);

router
  .route('/:id')
  .get(getSensor)
  .put(protect, authorize('admin', 'operator'), updateSensor)
  .delete(protect, authorize('admin'), deleteSensor);

router.route('/radius/:lng/:lat/:distance').get(getSensorsInRadius);

router.route('/:sensorId/status').put(updateSensorStatus);

module.exports = router;
