const mongoose = require('mongoose');

const sensorSchema = new mongoose.Schema({
  sensorId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['capacitive', 'resistive', 'TDR', 'hybrid'],
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    },
    address: String,
    region: String,
    terrain: {
      type: String,
      enum: ['mountain', 'agricultural', 'coastal', 'urban', 'forest', 'other'],
      default: 'other'
    },
    slopeAngle: Number, // in degrees
    elevation: Number // in meters
  },
  specifications: {
    depthCm: {
      type: Number,
      default: 30
    },
    range: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 100 }
    },
    accuracy: Number,
    resolution: Number
  },
  status: {
    isOnline: {
      type: Boolean,
      default: false
    },
    lastSeen: Date,
    battery: {
      level: { type: Number, min: 0, max: 100 },
      voltage: Number,
      isCharging: Boolean,
      solarEnabled: Boolean
    },
    signal: {
      strength: Number, // in dBm
      quality: { type: String, enum: ['excellent', 'good', 'fair', 'poor'] }
    },
    health: {
      type: String,
      enum: ['healthy', 'warning', 'critical', 'offline'],
      default: 'offline'
    },
    faults: [String]
  },
  configuration: {
    samplingInterval: {
      type: Number,
      default: 300 // seconds
    },
    transmissionInterval: {
      type: Number,
      default: 600 // seconds
    },
    thresholds: {
      moisture: {
        low: { type: Number, default: 20 },
        medium: { type: Number, default: 40 },
        high: { type: Number, default: 60 },
        critical: { type: Number, default: 80 }
      },
      temperature: {
        min: { type: Number, default: -10 },
        max: { type: Number, default: 50 }
      }
    },
    adaptiveMode: {
      type: Boolean,
      default: true
    }
  },
  metadata: {
    installationDate: Date,
    lastMaintenance: Date,
    firmware: String,
    hardwareVersion: String,
    manufacturer: String,
    warrantyExpiry: Date
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  notes: String
}, {
  timestamps: true
});

// Geospatial index for location-based queries
sensorSchema.index({ 'location.coordinates': '2dsphere' });
sensorSchema.index({ sensorId: 1 });
sensorSchema.index({ 'status.health': 1 });
sensorSchema.index({ 'location.terrain': 1 });

module.exports = mongoose.model('Sensor', sensorSchema);
