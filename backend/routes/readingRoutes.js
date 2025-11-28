const express = require('express');
const {
  getReadings,
  getReading,
  createReading,
  getReadingsBySensor,
  getReadingStats,
  getLatestReadings
} = require('../controllers/readingController');

const router = express.Router();

router.route('/').get(getReadings).post(createReading);

router.route('/latest').get(getLatestReadings);

router.route('/:id').get(getReading);

router.route('/sensor/:sensorId').get(getReadingsBySensor);

router.route('/stats/:sensorId').get(getReadingStats);

module.exports = router;
