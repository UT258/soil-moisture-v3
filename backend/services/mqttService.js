const mqtt = require('mqtt');
const Reading = require('../models/Reading');
const Sensor = require('../models/Sensor');

let mqttClient = null;

// Connect to MQTT broker
exports.connect = () => {
  const brokerUrl = process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883';
  
  mqttClient = mqtt.connect(brokerUrl, {
    username: process.env.MQTT_USERNAME,
    password: process.env.MQTT_PASSWORD,
    clientId: `soil-moisture-server-${Math.random().toString(16).slice(3)}`,
    clean: true,
    reconnectPeriod: 5000
  });

  mqttClient.on('connect', () => {
    console.log('✅ MQTT broker connected');
    
    // Subscribe to sensor topics
    mqttClient.subscribe('sensors/+/data', (err) => {
      if (err) {
        console.error('MQTT subscription error:', err);
      } else {
        console.log('📡 Subscribed to sensor data topics');
      }
    });

    mqttClient.subscribe('sensors/+/status', (err) => {
      if (err) {
        console.error('MQTT subscription error:', err);
      }
    });
  });

  mqttClient.on('message', async (topic, message) => {
    try {
      const payload = JSON.parse(message.toString());
      const topicParts = topic.split('/');
      const sensorId = topicParts[1];
      const messageType = topicParts[2];

      if (messageType === 'data') {
        await handleSensorData(sensorId, payload);
      } else if (messageType === 'status') {
        await handleSensorStatus(sensorId, payload);
      }
    } catch (error) {
      console.error('MQTT message processing error:', error);
    }
  });

  mqttClient.on('error', (error) => {
    console.error('MQTT error:', error);
  });

  mqttClient.on('offline', () => {
    console.log('⚠️ MQTT broker offline');
  });

  mqttClient.on('reconnect', () => {
    console.log('🔄 MQTT reconnecting...');
  });
};

// Handle sensor data messages
const handleSensorData = async (sensorId, data) => {
  try {
    const sensor = await Sensor.findOne({ sensorId });
    
    if (!sensor) {
      console.error(`Sensor not found: ${sensorId}`);
      return;
    }

    // Create reading through API (reuse logic)
    const readingController = require('../controllers/readingController');
    const req = {
      body: {
        sensorId,
        data: data.readings || data,
        deviceInfo: data.device || {}
      }
    };

    const res = {
      status: (code) => ({
        json: (response) => {
          if (code === 201) {
            console.log(`✅ Reading created for sensor ${sensorId}`);
          }
        }
      })
    };

    await readingController.createReading(req, res, (error) => {
      if (error) console.error('Reading creation error:', error);
    });
  } catch (error) {
    console.error('Handle sensor data error:', error);
  }
};

// Handle sensor status messages
const handleSensorStatus = async (sensorId, status) => {
  try {
    const sensor = await Sensor.findOne({ sensorId });
    
    if (!sensor) {
      return;
    }

    sensor.status.lastSeen = Date.now();
    sensor.status.isOnline = true;
    
    if (status.battery) sensor.status.battery = status.battery;
    if (status.signal) sensor.status.signal = status.signal;
    if (status.health) sensor.status.health = status.health;

    await sensor.save();

    // Emit socket update
    if (global.io) {
      global.io.emit('sensor:status', {
        sensorId,
        status: sensor.status
      });
    }
  } catch (error) {
    console.error('Handle sensor status error:', error);
  }
};

// Publish message to MQTT topic
exports.publish = (topic, message) => {
  if (mqttClient && mqttClient.connected) {
    mqttClient.publish(topic, JSON.stringify(message), { qos: 1 });
  }
};

// Disconnect from MQTT broker
exports.disconnect = () => {
  if (mqttClient) {
    mqttClient.end();
  }
};
