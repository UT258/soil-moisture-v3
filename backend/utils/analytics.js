// Calculate risk level based on moisture value and sensor configuration
exports.calculateRiskLevel = (moistureValue, sensor) => {
  const thresholds = sensor.configuration?.thresholds?.moisture || {
    low: 20,
    medium: 40,
    high: 60,
    critical: 80
  };

  let riskLevel = 'safe';
  let riskScore = 0;

  if (moistureValue < thresholds.low) {
    riskLevel = 'safe';
    riskScore = (moistureValue / thresholds.low) * 20;
  } else if (moistureValue < thresholds.medium) {
    riskLevel = 'low';
    riskScore = 20 + ((moistureValue - thresholds.low) / (thresholds.medium - thresholds.low)) * 20;
  } else if (moistureValue < thresholds.high) {
    riskLevel = 'moderate';
    riskScore = 40 + ((moistureValue - thresholds.medium) / (thresholds.high - thresholds.medium)) * 20;
  } else if (moistureValue < thresholds.critical) {
    riskLevel = 'high';
    riskScore = 60 + ((moistureValue - thresholds.high) / (thresholds.critical - thresholds.high)) * 20;
  } else {
    riskLevel = 'critical';
    riskScore = 80 + Math.min(((moistureValue - thresholds.critical) / 20) * 20, 20);
  }

  return {
    riskLevel,
    riskScore: Math.round(riskScore),
    trend: 'stable' // Will be calculated based on historical data
  };
};

// Detect anomalies in sensor readings
exports.detectAnomaly = async (sensorId, currentValue) => {
  const Reading = require('../models/Reading');

  try {
    // Get last 20 readings
    const recentReadings = await Reading.find({ sensorId })
      .sort('-timestamp')
      .limit(20)
      .select('data.moisture.value');

    if (recentReadings.length < 5) {
      return false; // Not enough data
    }

    const values = recentReadings.map(r => r.data.moisture.value);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    // Check if current value is more than 2 standard deviations away
    const zScore = Math.abs((currentValue - mean) / stdDev);
    
    return zScore > 2;
  } catch (error) {
    console.error('Anomaly detection error:', error);
    return false;
  }
};

// Calculate trend direction
exports.calculateTrend = async (sensorId, hours = 6) => {
  const Reading = require('../models/Reading');

  try {
    const startTime = new Date(Date.now() - hours * 60 * 60 * 1000);
    
    const readings = await Reading.find({
      sensorId,
      timestamp: { $gte: startTime }
    }).sort('timestamp').select('data.moisture.value timestamp');

    if (readings.length < 2) {
      return { trend: 'stable', changeRate: 0 };
    }

    const firstValue = readings[0].data.moisture.value;
    const lastValue = readings[readings.length - 1].data.moisture.value;
    const timeDiff = (readings[readings.length - 1].timestamp - readings[0].timestamp) / (1000 * 60 * 60);
    
    const changeRate = ((lastValue - firstValue) / firstValue) * 100 / timeDiff;

    let trend = 'stable';
    if (changeRate > 5) trend = 'increasing';
    else if (changeRate < -5) trend = 'decreasing';

    return {
      trend,
      changeRate: Math.round(changeRate * 100) / 100
    };
  } catch (error) {
    console.error('Trend calculation error:', error);
    return { trend: 'stable', changeRate: 0 };
  }
};

// Predict threshold breach time
exports.predictThresholdBreach = async (sensorId, currentValue, threshold) => {
  const { calculateTrend } = require('./analytics');

  const trendData = await calculateTrend(sensorId, 12);
  
  if (trendData.trend === 'stable' || trendData.changeRate === 0) {
    return null;
  }

  if (currentValue >= threshold) {
    return new Date(); // Already breached
  }

  // Simple linear prediction
  const hoursUntilBreach = (threshold - currentValue) / trendData.changeRate;
  
  if (hoursUntilBreach > 0 && hoursUntilBreach < 72) { // Only predict within 72 hours
    return new Date(Date.now() + hoursUntilBreach * 60 * 60 * 1000);
  }

  return null;
};
