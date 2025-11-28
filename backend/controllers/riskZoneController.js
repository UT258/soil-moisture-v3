const RiskZone = require('../models/RiskZone');

// @desc    Get all risk zones
// @route   GET /api/risk-zones
// @access  Public
exports.getRiskZones = async (req, res, next) => {
  try {
    const { riskLevel, terrainType, monitoringEnabled } = req.query;

    const query = {};
    if (riskLevel) query['riskLevel.current'] = riskLevel;
    if (terrainType) query.terrainType = terrainType;
    if (monitoringEnabled !== undefined) query.monitoringEnabled = monitoringEnabled === 'true';

    const riskZones = await RiskZone.find(query)
      .populate('sensors', 'name sensorId status')
      .populate('createdBy', 'name');

    res.status(200).json({
      success: true,
      count: riskZones.length,
      data: riskZones
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single risk zone
// @route   GET /api/risk-zones/:id
// @access  Public
exports.getRiskZone = async (req, res, next) => {
  try {
    const riskZone = await RiskZone.findById(req.params.id)
      .populate('sensors')
      .populate('communityFeedback.user', 'name');

    if (!riskZone) {
      return res.status(404).json({
        success: false,
        message: 'Risk zone not found'
      });
    }

    res.status(200).json({
      success: true,
      data: riskZone
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new risk zone
// @route   POST /api/risk-zones
// @access  Private (Admin, Operator)
exports.createRiskZone = async (req, res, next) => {
  try {
    req.body.createdBy = req.user.id;

    const riskZone = await RiskZone.create(req.body);

    // Emit socket event
    if (global.io) {
      global.io.emit('riskzone:created', riskZone);
    }

    res.status(201).json({
      success: true,
      data: riskZone
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update risk zone
// @route   PUT /api/risk-zones/:id
// @access  Private (Admin, Operator)
exports.updateRiskZone = async (req, res, next) => {
  try {
    let riskZone = await RiskZone.findById(req.params.id);

    if (!riskZone) {
      return res.status(404).json({
        success: false,
        message: 'Risk zone not found'
      });
    }

    riskZone = await RiskZone.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    // Emit socket event
    if (global.io) {
      global.io.emit('riskzone:updated', riskZone);
    }

    res.status(200).json({
      success: true,
      data: riskZone
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete risk zone
// @route   DELETE /api/risk-zones/:id
// @access  Private (Admin)
exports.deleteRiskZone = async (req, res, next) => {
  try {
    const riskZone = await RiskZone.findById(req.params.id);

    if (!riskZone) {
      return res.status(404).json({
        success: false,
        message: 'Risk zone not found'
      });
    }

    await riskZone.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add community feedback
// @route   POST /api/risk-zones/:id/feedback
// @access  Private
exports.addFeedback = async (req, res, next) => {
  try {
    const riskZone = await RiskZone.findById(req.params.id);

    if (!riskZone) {
      return res.status(404).json({
        success: false,
        message: 'Risk zone not found'
      });
    }

    const feedback = {
      user: req.user.id,
      type: req.body.type,
      message: req.body.message,
      location: req.body.location,
      verified: false
    };

    riskZone.communityFeedback.push(feedback);
    await riskZone.save();

    // Emit socket event
    if (global.io) {
      global.io.emit('riskzone:feedback', {
        zoneId: riskZone._id,
        feedback
      });
    }

    res.status(201).json({
      success: true,
      data: riskZone
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get risk zones within bounds
// @route   GET /api/risk-zones/bounds
// @access  Public
exports.getRiskZonesInBounds = async (req, res, next) => {
  try {
    const { minLng, minLat, maxLng, maxLat } = req.query;

    if (!minLng || !minLat || !maxLng || !maxLat) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all bounding box coordinates'
      });
    }

    const riskZones = await RiskZone.find({
      'center.coordinates': {
        $geoWithin: {
          $box: [
            [parseFloat(minLng), parseFloat(minLat)],
            [parseFloat(maxLng), parseFloat(maxLat)]
          ]
        }
      }
    }).populate('sensors', 'name sensorId status');

    res.status(200).json({
      success: true,
      count: riskZones.length,
      data: riskZones
    });
  } catch (error) {
    next(error);
  }
};
