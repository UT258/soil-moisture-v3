const Sensor = require('../models/Sensor');

// @desc    Get all sensors
// @route   GET /api/sensors
// @access  Public
exports.getSensors = async (req, res, next) => {
  try {
    const { 
      terrain, 
      status, 
      health, 
      limit = 100,
      page = 1,
      sort = '-createdAt' 
    } = req.query;

    const query = {};

    if (terrain) query['location.terrain'] = terrain;
    if (status) query['status.isOnline'] = status === 'online';
    if (health) query['status.health'] = health;

    const sensors = await Sensor.find(query)
      .populate('assignedTo', 'name email')
      .limit(parseInt(limit))
      .skip((page - 1) * limit)
      .sort(sort);

    const total = await Sensor.countDocuments(query);

    res.status(200).json({
      success: true,
      count: sensors.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: sensors
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single sensor
// @route   GET /api/sensors/:id
// @access  Public
exports.getSensor = async (req, res, next) => {
  try {
    const sensor = await Sensor.findById(req.params.id)
      .populate('assignedTo', 'name email phone');

    if (!sensor) {
      return res.status(404).json({
        success: false,
        message: 'Sensor not found'
      });
    }

    res.status(200).json({
      success: true,
      data: sensor
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new sensor
// @route   POST /api/sensors
// @access  Private (Admin, Operator)
exports.createSensor = async (req, res, next) => {
  try {
    // Add user to req.body
    req.body.assignedTo = req.user.id;

    const sensor = await Sensor.create(req.body);

    // Emit socket event
    if (global.io) {
      global.io.emit('sensor:created', sensor);
    }

    res.status(201).json({
      success: true,
      data: sensor
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update sensor
// @route   PUT /api/sensors/:id
// @access  Private (Admin, Operator)
exports.updateSensor = async (req, res, next) => {
  try {
    let sensor = await Sensor.findById(req.params.id);

    if (!sensor) {
      return res.status(404).json({
        success: false,
        message: 'Sensor not found'
      });
    }

    sensor = await Sensor.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    // Emit socket event
    if (global.io) {
      global.io.emit('sensor:updated', sensor);
    }

    res.status(200).json({
      success: true,
      data: sensor
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete sensor
// @route   DELETE /api/sensors/:id
// @access  Private (Admin)
exports.deleteSensor = async (req, res, next) => {
  try {
    const sensor = await Sensor.findById(req.params.id);

    if (!sensor) {
      return res.status(404).json({
        success: false,
        message: 'Sensor not found'
      });
    }

    await sensor.deleteOne();

    // Emit socket event
    if (global.io) {
      global.io.emit('sensor:deleted', { id: req.params.id });
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get sensors within radius
// @route   GET /api/sensors/radius/:lng/:lat/:distance
// @access  Public
exports.getSensorsInRadius = async (req, res, next) => {
  try {
    const { lng, lat, distance } = req.params;

    // Calculate radius in radians
    // Divide distance by radius of Earth (6378 km)
    const radius = distance / 6378;

    const sensors = await Sensor.find({
      'location.coordinates': {
        $geoWithin: { $centerSphere: [[lng, lat], radius] }
      }
    });

    res.status(200).json({
      success: true,
      count: sensors.length,
      data: sensors
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update sensor status (for IoT devices)
// @route   PUT /api/sensors/:sensorId/status
// @access  Public (with sensor authentication)
exports.updateSensorStatus = async (req, res, next) => {
  try {
    const { sensorId } = req.params;
    const { battery, signal, health, faults } = req.body;

    const sensor = await Sensor.findOne({ sensorId });

    if (!sensor) {
      return res.status(404).json({
        success: false,
        message: 'Sensor not found'
      });
    }

    // Update status
    sensor.status.lastSeen = Date.now();
    sensor.status.isOnline = true;
    
    if (battery) sensor.status.battery = battery;
    if (signal) sensor.status.signal = signal;
    if (health) sensor.status.health = health;
    if (faults) sensor.status.faults = faults;

    await sensor.save();

    // Emit socket event
    if (global.io) {
      global.io.emit('sensor:status', {
        sensorId: sensor.sensorId,
        status: sensor.status
      });
    }

    res.status(200).json({
      success: true,
      data: sensor.status
    });
  } catch (error) {
    next(error);
  }
};
