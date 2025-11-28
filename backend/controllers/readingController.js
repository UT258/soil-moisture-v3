const Reading = require('../models/Reading');
const Sensor = require('../models/Sensor');
const { calculateRiskLevel, detectAnomaly } = require('../utils/analytics');

// @desc    Get all readings
// @route   GET /api/readings
// @access  Public
exports.getReadings = async (req, res, next) => {
  try {
    const {
      sensorId,
      startDate,
      endDate,
      riskLevel,
      limit = 100,
      page = 1,
      sort = '-timestamp'
    } = req.query;

    const query = {};

    if (sensorId) query.sensorId = sensorId;
    if (riskLevel) query['calculated.riskLevel'] = riskLevel;
    
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const readings = await Reading.find(query)
      .populate('sensor', 'name sensorId location')
      .limit(parseInt(limit))
      .skip((page - 1) * limit)
      .sort(sort);

    const total = await Reading.countDocuments(query);

    res.status(200).json({
      success: true,
      count: readings.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: readings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reading by ID
// @route   GET /api/readings/:id
// @access  Public
exports.getReading = async (req, res, next) => {
  try {
    const reading = await Reading.findById(req.params.id)
      .populate('sensor', 'name sensorId location');

    if (!reading) {
      return res.status(404).json({
        success: false,
        message: 'Reading not found'
      });
    }

    res.status(200).json({
      success: true,
      data: reading
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new reading (from IoT sensor)
// @route   POST /api/readings
// @access  Public (with sensor auth)
exports.createReading = async (req, res, next) => {
  try {
    const { sensorId, data, deviceInfo } = req.body;

    // Find sensor
    const sensor = await Sensor.findOne({ sensorId });
    
    if (!sensor) {
      return res.status(404).json({
        success: false,
        message: 'Sensor not found'
      });
    }

    // Calculate risk metrics
    const riskMetrics = calculateRiskLevel(data.moisture.value, sensor);
    
    // Detect anomalies
    const isAnomaly = await detectAnomaly(sensorId, data.moisture.value);

    // Create reading
    const reading = await Reading.create({
      sensor: sensor._id,
      sensorId,
      data,
      calculated: riskMetrics,
      quality: {
        anomaly: isAnomaly
      },
      deviceInfo
    });

    // Update sensor last seen
    sensor.status.lastSeen = Date.now();
    sensor.status.isOnline = true;
    if (deviceInfo?.battery) sensor.status.battery = deviceInfo.battery;
    if (deviceInfo?.signal) sensor.status.signal = deviceInfo.signal;
    await sensor.save();

    // Emit real-time update via socket
    if (global.io) {
      global.io.emit('reading:new', {
        sensorId,
        reading: reading.toObject()
      });
      
      // Emit risk alert if high risk
      if (riskMetrics.riskLevel === 'high' || riskMetrics.riskLevel === 'critical') {
        global.io.emit('risk:alert', {
          sensorId,
          riskLevel: riskMetrics.riskLevel,
          moistureValue: data.moisture.value
        });
      }
    }

    res.status(201).json({
      success: true,
      data: reading
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get readings by sensor
// @route   GET /api/readings/sensor/:sensorId
// @access  Public
exports.getReadingsBySensor = async (req, res, next) => {
  try {
    const { sensorId } = req.params;
    const { 
      startDate, 
      endDate, 
      limit = 100, 
      page = 1 
    } = req.query;

    const query = { sensorId };

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const readings = await Reading.find(query)
      .limit(parseInt(limit))
      .skip((page - 1) * limit)
      .sort('-timestamp');

    const total = await Reading.countDocuments(query);

    res.status(200).json({
      success: true,
      count: readings.length,
      total,
      data: readings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reading statistics
// @route   GET /api/readings/stats/:sensorId
// @access  Public
exports.getReadingStats = async (req, res, next) => {
  try {
    const { sensorId } = req.params;
    const { days = 7 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const stats = await Reading.aggregate([
      {
        $match: {
          sensorId,
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          avgMoisture: { $avg: '$data.moisture.value' },
          minMoisture: { $min: '$data.moisture.value' },
          maxMoisture: { $max: '$data.moisture.value' },
          avgTemperature: { $avg: '$data.temperature.value' },
          count: { $sum: 1 },
          highRiskCount: {
            $sum: {
              $cond: [
                { $in: ['$calculated.riskLevel', ['high', 'critical']] },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: stats[0] || {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get latest readings for all sensors
// @route   GET /api/readings/latest
// @access  Public
exports.getLatestReadings = async (req, res, next) => {
  try {
    const latestReadings = await Reading.aggregate([
      { $sort: { timestamp: -1 } },
      {
        $group: {
          _id: '$sensorId',
          latestReading: { $first: '$$ROOT' }
        }
      },
      { $replaceRoot: { newRoot: '$latestReading' } }
    ]);

    res.status(200).json({
      success: true,
      count: latestReadings.length,
      data: latestReadings
    });
  } catch (error) {
    next(error);
  }
};
