const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const http = require('http');
const socketIO = require('socket.io');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const sensorRoutes = require('./routes/sensorRoutes');
const readingRoutes = require('./routes/readingRoutes');
const alertRoutes = require('./routes/alertRoutes');
const riskZoneRoutes = require('./routes/riskZoneRoutes');
const predictionRoutes = require('./routes/predictionRoutes');
const userRoutes = require('./routes/userRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

// Import middleware
const errorHandler = require('./middleware/errorHandler');

// Import services
const mqttService = require('./services/mqttService');
const alertService = require('./services/alertService');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
  }
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) * 60 * 1000 || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Socket.io setup
global.io = io;
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);
  
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });

  // Join specific rooms for targeted updates
  socket.on('join-room', (room) => {
    socket.join(room);
    console.log(`Socket ${socket.id} joined room: ${room}`);
  });
});

// Database connection
mongoose.connect(process.env.MONGODB_URI)
.then(() => {
  console.log('✅ MongoDB connected successfully');
  
  // Initialize MQTT service after DB connection
  mqttService.connect();
  
  // Start alert monitoring service
  alertService.startMonitoring();
})
.catch((err) => {
  console.error('❌ MongoDB connection error:', err.message);
  process.exit(1);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/sensors', sensorRoutes);
app.use('/api/readings', readingRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/risk-zones', riskZoneRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Soil Moisture Monitoring System API',
    version: '1.0.0',
    documentation: '/api/docs'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling middleware
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════════════════════════╗
  ║   🌱 Soil Moisture Monitoring System - Backend API       ║
  ║   Server running on port ${PORT}                           ║
  ║   Environment: ${process.env.NODE_ENV || 'development'}                               ║
  ║   URL: http://localhost:${PORT}                            ║
  ╚═══════════════════════════════════════════════════════════╝
  `);
});

module.exports = { app, server, io };
