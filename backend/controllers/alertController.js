const Alert = require('../models/Alert');
const Sensor = require('../models/Sensor');
const { sendAlertNotifications } = require('../services/notificationService');

// @desc    Get all alerts
// @route   GET /api/alerts
// @access  Public
exports.getAlerts = async (req, res, next) => {
  try {
    const {
      status,
      severity,
      type,
      limit = 50,
      page = 1,
      sort = '-createdAt'
    } = req.query;

    const query = {};

    if (status) query.status = status;
    if (severity) query.severity = severity;
    if (type) query.type = type;

    const alerts = await Alert.find(query)
      .populate('sensor', 'name sensorId location')
      .populate('acknowledgment.acknowledgedBy', 'name email')
      .populate('resolution.resolvedBy', 'name email')
      .limit(parseInt(limit))
      .skip((page - 1) * limit)
      .sort(sort);

    const total = await Alert.countDocuments(query);

    res.status(200).json({
      success: true,
      count: alerts.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: alerts
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single alert
// @route   GET /api/alerts/:id
// @access  Public
exports.getAlert = async (req, res, next) => {
  try {
    const alert = await Alert.findById(req.params.id)
      .populate('sensor')
      .populate('reading')
      .populate('acknowledgment.acknowledgedBy', 'name email')
      .populate('resolution.resolvedBy', 'name email');

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    res.status(200).json({
      success: true,
      data: alert
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new alert
// @route   POST /api/alerts
// @access  Private (Admin, Operator)
exports.createAlert = async (req, res, next) => {
  try {
    const alert = await Alert.create(req.body);

    // Send notifications
    await sendAlertNotifications(alert);

    // Emit socket event
    if (global.io) {
      global.io.emit('alert:new', alert);
    }

    res.status(201).json({
      success: true,
      data: alert
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update alert
// @route   PUT /api/alerts/:id
// @access  Private (Admin, Operator)
exports.updateAlert = async (req, res, next) => {
  try {
    let alert = await Alert.findById(req.params.id);

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    alert = await Alert.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    // Emit socket event
    if (global.io) {
      global.io.emit('alert:updated', alert);
    }

    res.status(200).json({
      success: true,
      data: alert
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Acknowledge alert
// @route   PUT /api/alerts/:id/acknowledge
// @access  Private
exports.acknowledgeAlert = async (req, res, next) => {
  try {
    const alert = await Alert.findById(req.params.id);

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    if (alert.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Only active alerts can be acknowledged'
      });
    }

    alert.status = 'acknowledged';
    alert.acknowledgment = {
      acknowledgedBy: req.user.id,
      acknowledgedAt: Date.now(),
      notes: req.body.notes
    };

    await alert.save();

    // Emit socket event
    if (global.io) {
      global.io.emit('alert:acknowledged', alert);
    }

    res.status(200).json({
      success: true,
      data: alert
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Resolve alert
// @route   PUT /api/alerts/:id/resolve
// @access  Private (Admin, Operator)
exports.resolveAlert = async (req, res, next) => {
  try {
    const alert = await Alert.findById(req.params.id);

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    alert.status = 'resolved';
    alert.resolution = {
      resolvedBy: req.user.id,
      resolvedAt: Date.now(),
      resolution: req.body.resolution,
      falseAlarm: req.body.falseAlarm || false,
      feedback: req.body.feedback
    };

    await alert.save();

    // Emit socket event
    if (global.io) {
      global.io.emit('alert:resolved', alert);
    }

    res.status(200).json({
      success: true,
      data: alert
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get active alerts
// @route   GET /api/alerts/active
// @access  Public
exports.getActiveAlerts = async (req, res, next) => {
  try {
    const alerts = await Alert.find({ status: 'active' })
      .populate('sensor', 'name sensorId location')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: alerts.length,
      data: alerts
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get alert statistics
// @route   GET /api/alerts/stats
// @access  Public
exports.getAlertStats = async (req, res, next) => {
  try {
    const { days = 30 } = req.query;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const stats = await Alert.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            type: '$type',
            severity: '$severity',
            status: '$status'
          },
          count: { $sum: 1 }
        }
      }
    ]);

    const totalAlerts = await Alert.countDocuments({ createdAt: { $gte: startDate } });
    const activeAlerts = await Alert.countDocuments({ status: 'active' });
    const resolvedAlerts = await Alert.countDocuments({ 
      status: 'resolved',
      createdAt: { $gte: startDate }
    });

    res.status(200).json({
      success: true,
      data: {
        total: totalAlerts,
        active: activeAlerts,
        resolved: resolvedAlerts,
        breakdown: stats
      }
    });
  } catch (error) {
    next(error);
  }
};
