const Alert = require('../models/Alert');
const Reading = require('../models/Reading');
const Sensor = require('../models/Sensor');
const { calculateRiskLevel } = require('../utils/analytics');
const { sendAlertNotifications } = require('./notificationService');

let monitoringInterval = null;

// Start alert monitoring
exports.startMonitoring = () => {
  const interval = parseInt(process.env.ALERT_CHECK_INTERVAL) || 300000; // 5 minutes

  console.log(`🚨 Alert monitoring started (interval: ${interval / 1000}s)`);

  monitoringInterval = setInterval(async () => {
    await checkSensorThresholds();
    await checkSensorHealth();
  }, interval);

  // Run immediately on start
  setTimeout(() => {
    checkSensorThresholds();
    checkSensorHealth();
  }, 5000);
};

// Stop alert monitoring
exports.stopMonitoring = () => {
  if (monitoringInterval) {
    clearInterval(monitoringInterval);
    console.log('⏹️ Alert monitoring stopped');
  }
};

// Check sensor readings against thresholds
const checkSensorThresholds = async () => {
  try {
    const sensors = await Sensor.find({ isActive: true, 'status.isOnline': true });

    for (const sensor of sensors) {
      const latestReading = await Reading.findOne({ sensorId: sensor.sensorId })
        .sort('-timestamp')
        .limit(1);

      if (!latestReading) continue;

      const moistureValue = latestReading.data.moisture.value;
      const thresholds = sensor.configuration?.thresholds?.moisture || {};

      // Check if moisture exceeds critical threshold
      if (moistureValue >= (thresholds.critical || 80)) {
        await createAlert({
          type: 'moisture',
          severity: 'critical',
          sensor: sensor._id,
          sensorId: sensor.sensorId,
          location: sensor.location,
          reading: latestReading._id,
          trigger: {
            parameter: 'moisture',
            value: moistureValue,
            threshold: thresholds.critical,
            condition: 'exceeds'
          },
          message: {
            title: 'Critical Moisture Level Detected',
            description: `Sensor ${sensor.name} has detected critical moisture level of ${moistureValue}%. Immediate action required.`,
            actionable: 'Evacuate area, alert authorities, monitor for landslide/flood risk'
          }
        });
      } else if (moistureValue >= (thresholds.high || 60)) {
        await createAlert({
          type: 'moisture',
          severity: 'high',
          sensor: sensor._id,
          sensorId: sensor.sensorId,
          location: sensor.location,
          reading: latestReading._id,
          trigger: {
            parameter: 'moisture',
            value: moistureValue,
            threshold: thresholds.high,
            condition: 'exceeds'
          },
          message: {
            title: 'High Moisture Level Alert',
            description: `Sensor ${sensor.name} has detected high moisture level of ${moistureValue}%. Monitor closely.`,
            actionable: 'Increase monitoring frequency, prepare for potential evacuation'
          }
        });
      }
    }
  } catch (error) {
    console.error('Threshold checking error:', error);
  }
};

// Check sensor health status
const checkSensorHealth = async () => {
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    // Check for offline sensors
    const offlineSensors = await Sensor.find({
      isActive: true,
      'status.isOnline': true,
      'status.lastSeen': { $lt: fiveMinutesAgo }
    });

    for (const sensor of offlineSensors) {
      sensor.status.isOnline = false;
      sensor.status.health = 'offline';
      await sensor.save();

      await createAlert({
        type: 'sensor_fault',
        severity: 'medium',
        sensor: sensor._id,
        sensorId: sensor.sensorId,
        location: sensor.location,
        message: {
          title: 'Sensor Offline',
          description: `Sensor ${sensor.name} (${sensor.sensorId}) has gone offline. Last seen ${sensor.status.lastSeen.toLocaleString()}.`,
          actionable: 'Check sensor connectivity, battery, and physical condition'
        }
      });
    }

    // Check for low battery
    const lowBatterySensors = await Sensor.find({
      isActive: true,
      'status.battery.level': { $lt: 20, $gt: 0 }
    });

    for (const sensor of lowBatterySensors) {
      await createAlert({
        type: 'sensor_fault',
        severity: 'low',
        sensor: sensor._id,
        sensorId: sensor.sensorId,
        location: sensor.location,
        message: {
          title: 'Low Battery Warning',
          description: `Sensor ${sensor.name} battery level is at ${sensor.status.battery.level}%. Recharge or replace soon.`,
          actionable: 'Replace battery or ensure solar charging is functioning'
        }
      });
    }
  } catch (error) {
    console.error('Health checking error:', error);
  }
};

// Create alert (avoid duplicates)
const createAlert = async (alertData) => {
  try {
    // Check if similar active alert already exists
    const existingAlert = await Alert.findOne({
      sensor: alertData.sensor,
      type: alertData.type,
      status: 'active',
      createdAt: { $gte: new Date(Date.now() - 30 * 60 * 1000) } // Within last 30 minutes
    });

    if (existingAlert) {
      return existingAlert; // Don't create duplicate
    }

    const alert = await Alert.create(alertData);

    // Send notifications
    await sendAlertNotifications(alert);

    // Emit socket event
    if (global.io) {
      global.io.emit('alert:new', alert);
    }

    console.log(`🚨 Alert created: ${alert.alertId} - ${alert.message.title}`);

    return alert;
  } catch (error) {
    console.error('Alert creation error:', error);
    throw error;
  }
};
