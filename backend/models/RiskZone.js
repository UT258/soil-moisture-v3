const mongoose = require('mongoose');

const riskZoneSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  geometry: {
    type: {
      type: String,
      enum: ['Polygon', 'MultiPolygon'],
      required: true
    },
    coordinates: {
      type: [[[Number]]], // Array of polygon coordinates
      required: true
    }
  },
  center: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: [Number] // [longitude, latitude]
  },
  riskLevel: {
    current: {
      type: String,
      enum: ['safe', 'low', 'moderate', 'high', 'critical'],
      default: 'safe'
    },
    predicted: {
      type: String,
      enum: ['safe', 'low', 'moderate', 'high', 'critical']
    },
    history: [{
      level: String,
      timestamp: Date,
      reason: String
    }]
  },
  terrainType: {
    type: String,
    enum: ['mountain', 'agricultural', 'coastal', 'urban', 'forest', 'other'],
    required: true
  },
  characteristics: {
    soilType: String,
    averageSlope: Number,
    elevation: {
      min: Number,
      max: Number,
      average: Number
    },
    vegetation: String,
    drainage: String
  },
  sensors: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sensor'
  }],
  statistics: {
    averageMoisture: Number,
    moistureRange: {
      min: Number,
      max: Number
    },
    trendDirection: {
      type: String,
      enum: ['increasing', 'stable', 'decreasing']
    },
    lastUpdate: Date
  },
  thresholds: {
    moisture: {
      safe: { type: Number, default: 30 },
      warning: { type: Number, default: 50 },
      danger: { type: Number, default: 70 },
      critical: { type: Number, default: 85 }
    }
  },
  population: {
    estimatedCount: Number,
    households: Number,
    vulnerableGroups: Number
  },
  infrastructure: [{
    type: {
      type: String,
      enum: ['road', 'bridge', 'building', 'power_line', 'dam', 'other']
    },
    name: String,
    criticality: String
  }],
  alerts: {
    active: {
      type: Number,
      default: 0
    },
    total: {
      type: Number,
      default: 0
    },
    lastAlert: Date
  },
  communityFeedback: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    type: {
      type: String,
      enum: ['confirmation', 'false_alarm', 'concern', 'observation']
    },
    message: String,
    location: {
      type: { type: String, enum: ['Point'] },
      coordinates: [Number]
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    verified: Boolean
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  monitoringEnabled: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Geospatial indexes
riskZoneSchema.index({ geometry: '2dsphere' });
riskZoneSchema.index({ 'center.coordinates': '2dsphere' });
riskZoneSchema.index({ 'riskLevel.current': 1 });
riskZoneSchema.index({ terrainType: 1 });

module.exports = mongoose.model('RiskZone', riskZoneSchema);
