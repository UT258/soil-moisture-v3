const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema({
  predictionId: {
    type: String,
    unique: true,
    required: true
  },
  type: {
    type: String,
    enum: ['landslide', 'flood', 'moisture_trend', 'disaster_risk', 'sensor_failure'],
    required: true
  },
  targetDate: {
    type: Date,
    required: true
  },
  horizon: {
    type: String,
    enum: ['short_term', 'medium_term', 'long_term'], // 24h, 7d, 30d
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: [Number],
    region: String
  },
  sensor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sensor'
  },
  riskZone: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RiskZone'
  },
  input: {
    historicalData: {
      startDate: Date,
      endDate: Date,
      dataPoints: Number
    },
    features: mongoose.Schema.Types.Mixed, // All input features used
    externalData: {
      weather: mongoose.Schema.Types.Mixed,
      satellite: mongoose.Schema.Types.Mixed,
      geological: mongoose.Schema.Types.Mixed
    }
  },
  output: {
    prediction: {
      type: String,
      required: true
    },
    probability: {
      type: Number,
      min: 0,
      max: 100,
      required: true
    },
    confidence: {
      type: Number,
      min: 0,
      max: 100,
      required: true
    },
    riskScore: {
      type: Number,
      min: 0,
      max: 100
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical']
    },
    expectedValue: Number,
    range: {
      min: Number,
      max: Number
    }
  },
  model: {
    name: {
      type: String,
      required: true
    },
    version: String,
    algorithm: String, // 'RandomForest', 'LSTM', 'SVM', etc.
    accuracy: Number,
    trainingDate: Date,
    parameters: mongoose.Schema.Types.Mixed
  },
  validation: {
    status: {
      type: String,
      enum: ['pending', 'validated', 'invalidated'],
      default: 'pending'
    },
    actualOutcome: String,
    accuracyScore: Number,
    validatedAt: Date,
    validatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  alerts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Alert'
  }],
  recommendations: [{
    action: String,
    priority: Number,
    deadline: Date
  }],
  metadata: {
    executionTime: Number, // in milliseconds
    dataQuality: Number,
    notes: String
  }
}, {
  timestamps: true
});

// Indexes
predictionSchema.index({ predictionId: 1 });
predictionSchema.index({ type: 1, targetDate: 1 });
predictionSchema.index({ sensor: 1, createdAt: -1 });
predictionSchema.index({ 'output.severity': 1 });
predictionSchema.index({ 'location.coordinates': '2dsphere' });

// Auto-generate predictionId
predictionSchema.pre('save', async function(next) {
  if (!this.predictionId) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 7);
    this.predictionId = `PRED-${timestamp}-${random}`.toUpperCase();
  }
  next();
});

module.exports = mongoose.model('Prediction', predictionSchema);
