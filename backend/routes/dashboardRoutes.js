const express = require('express');
const Sensor = require('../models/Sensor');
const Reading = require('../models/Reading');
const Alert = require('../models/Alert');
const RiskZone = require('../models/RiskZone');

const router = express.Router();

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
router.get('/stats', async (req, res) => {
  try {
    const [
      totalSensors,
      onlineSensors,
      totalReadings,
      activeAlerts,
      criticalAlerts,
      riskZones
    ] = await Promise.all([
      Sensor.countDocuments(),
      Sensor.countDocuments({ 'status.isOnline': true }),
      Reading.countDocuments(),
      Alert.countDocuments({ status: 'active' }),
      Alert.countDocuments({ status: 'active', severity: 'critical' }),
      RiskZone.countDocuments()
    ]);

    // Get sensor health distribution
    const sensorHealth = await Sensor.aggregate([
      {
        $group: {
          _id: '$status.health',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get recent readings (last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentReadings = await Reading.countDocuments({
      timestamp: { $gte: oneDayAgo }
    });

    // Get average moisture levels by terrain
    const moistureByTerrain = await Reading.aggregate([
      {
        $lookup: {
          from: 'sensors',
          localField: 'sensor',
          foreignField: '_id',
          as: 'sensorData'
        }
      },
      { $unwind: '$sensorData' },
      {
        $group: {
          _id: '$sensorData.location.terrain',
          avgMoisture: { $avg: '$data.moisture.value' },
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        sensors: {
          total: totalSensors,
          online: onlineSensors,
          offline: totalSensors - onlineSensors,
          healthDistribution: sensorHealth
        },
        readings: {
          total: totalReadings,
          last24Hours: recentReadings
        },
        alerts: {
          active: activeAlerts,
          critical: criticalAlerts
        },
        riskZones: riskZones,
        moistureByTerrain
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Get recent activity
// @route   GET /api/dashboard/activity
router.get('/activity', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;

    const [recentAlerts, recentReadings] = await Promise.all([
      Alert.find()
        .populate('sensor', 'name sensorId location')
        .sort('-createdAt')
        .limit(limit),
      Reading.find()
        .populate('sensor', 'name sensorId')
        .sort('-timestamp')
        .limit(limit)
    ]);

    res.status(200).json({
      success: true,
      data: {
        alerts: recentAlerts,
        readings: recentReadings
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Get system health
// @route   GET /api/dashboard/health
router.get('/health', async (req, res) => {
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    const sensorsWithIssues = await Sensor.find({
      $or: [
        { 'status.health': { $in: ['warning', 'critical'] } },
        { 'status.battery.level': { $lt: 20 } },
        { 'status.lastSeen': { $lt: fiveMinutesAgo } }
      ]
    }).select('sensorId name status location');

    res.status(200).json({
      success: true,
      data: {
        sensorsWithIssues: sensorsWithIssues,
        issueCount: sensorsWithIssues.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
