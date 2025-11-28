const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  alertId: {
    type: String,
    unique: true,
    required: true
  },
  type: {
    type: String,
    enum: ['moisture', 'landslide', 'flood', 'avalanche', 'electrical', 'sensor_fault', 'system'],
    required: true
  },
  severity: {
    type: String,
    enum: ['info', 'low', 'medium', 'high', 'critical'],
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['active', 'acknowledged', 'resolved', 'false_alarm'],
    default: 'active',
    index: true
  },
  sensor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sensor'
  },
  sensorId: String,
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: [Number], // [longitude, latitude]
    address: String,
    region: String
  },
  reading: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reading'
  },
  trigger: {
    parameter: String, // e.g., 'moisture', 'temperature'
    value: Number,
    threshold: Number,
    condition: String // e.g., 'exceeds', 'below'
  },
  message: {
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    translations: {
      type: Map,
      of: {
        title: String,
        description: String
      }
    },
    actionable: String // recommended actions
  },
  riskAssessment: {
    probabilityOfDisaster: {
      type: Number,
      min: 0,
      max: 100
    },
    affectedArea: Number, // in km²
    estimatedImpact: String,
    confidenceLevel: Number
  },
  notifications: {
    sent: {
      type: Boolean,
      default: false
    },
    channels: [{
      type: {
        type: String,
        enum: ['email', 'sms', 'push', 'siren', 'dashboard']
      },
      status: String,
      sentAt: Date,
      recipients: [String]
    }],
    failedAttempts: {
      type: Number,
      default: 0
    }
  },
  acknowledgment: {
    acknowledgedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    acknowledgedAt: Date,
    notes: String
  },
  resolution: {
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    resolvedAt: Date,
    resolution: String,
    falseAlarm: Boolean,
    feedback: String
  },
  expiresAt: Date,
  priority: {
    type: Number,
    min: 1,
    max: 10,
    default: 5
  },
  metadata: {
    source: String,
    aiGenerated: Boolean,
    mlModel: String,
    relatedAlerts: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Alert'
    }]
  }
}, {
  timestamps: true
});

// Indexes
alertSchema.index({ alertId: 1 });
alertSchema.index({ status: 1, severity: 1 });
alertSchema.index({ createdAt: -1 });
alertSchema.index({ 'location.coordinates': '2dsphere' });
alertSchema.index({ sensor: 1, createdAt: -1 });

// Auto-generate alertId before saving
alertSchema.pre('save', async function(next) {
  if (!this.alertId) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 7);
    this.alertId = `ALT-${timestamp}-${random}`.toUpperCase();
  }
  next();
});

module.exports = mongoose.model('Alert', alertSchema);
