const mongoose = require('mongoose');

const readingSchema = new mongoose.Schema({
  sensor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sensor',
    required: true,
    index: true
  },
  sensorId: {
    type: String,
    required: true,
    index: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  data: {
    moisture: {
      value: {
        type: Number,
        required: true,
        min: 0,
        max: 100
      },
      unit: {
        type: String,
        default: '%'
      },
      depth: Number // in cm
    },
    temperature: {
      value: Number,
      unit: {
        type: String,
        default: '°C'
      }
    },
    humidity: {
      value: Number,
      unit: {
        type: String,
        default: '%'
      }
    },
    soilConductivity: {
      value: Number,
      unit: {
        type: String,
        default: 'dS/m'
      }
    },
    pH: {
      value: Number
    },
    rainfall: {
      value: Number,
      unit: {
        type: String,
        default: 'mm'
      }
    }
  },
  calculated: {
    riskLevel: {
      type: String,
      enum: ['safe', 'low', 'moderate', 'high', 'critical'],
      default: 'safe'
    },
    riskScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    trend: {
      type: String,
      enum: ['increasing', 'stable', 'decreasing'],
      default: 'stable'
    },
    changeRate: Number, // percentage change per hour
    predictedThresholdBreach: Date
  },
  quality: {
    reliability: {
      type: Number,
      min: 0,
      max: 100,
      default: 100
    },
    validated: {
      type: Boolean,
      default: false
    },
    anomaly: {
      type: Boolean,
      default: false
    },
    notes: String
  },
  deviceInfo: {
    battery: Number,
    signal: Number,
    firmware: String
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
readingSchema.index({ sensor: 1, timestamp: -1 });
readingSchema.index({ sensorId: 1, timestamp: -1 });
readingSchema.index({ 'calculated.riskLevel': 1, timestamp: -1 });
readingSchema.index({ timestamp: -1 });

// TTL index to auto-delete old readings (optional - keep 1 year)
// readingSchema.index({ timestamp: 1 }, { expireAfterSeconds: 31536000 });

module.exports = mongoose.model('Reading', readingSchema);
