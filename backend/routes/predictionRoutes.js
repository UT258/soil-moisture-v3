const express = require('express');
const router = express.Router();

// Placeholder for prediction routes - will integrate with Python ML service

// @desc    Run AI prediction analysis
// @route   POST /api/predictions/analyze
router.post('/analyze', async (req, res) => {
  try {
    // This will call Python ML service
    res.status(200).json({
      success: true,
      message: 'Prediction endpoint - integrate with ML service',
      data: {}
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get prediction history
// @route   GET /api/predictions/history
router.get('/history', async (req, res) => {
  try {
    const Prediction = require('../models/Prediction');
    
    const predictions = await Prediction.find()
      .populate('sensor', 'name sensorId')
      .sort('-createdAt')
      .limit(50);

    res.status(200).json({
      success: true,
      count: predictions.length,
      data: predictions
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
