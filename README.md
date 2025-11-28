# Soil Moisture Detection for Calamities and Pre-Alert Generation

## Project Overview

An intelligent, next-generation soil moisture monitoring and early warning system that integrates IoT sensors, AI-driven predictive analytics, real-time GIS mapping, and decentralized alert networks for disaster prevention and infrastructure safety.

## Team Members
- Siddhant Kumar Kashyap (2237278)
- Utkarsh Singh (2237294)
- Kalyan Joshi (2237201)
- Tej Pratap Singh (2237292)

**Guide:** Dr. Preeti Bansal  
**Institution:** Chandigarh Engineering College – CGC Landran, Mohali

## Features

### 🌍 Real-Time Monitoring
- Live soil moisture data from distributed sensor network
- Multi-parameter environmental monitoring (temperature, humidity, precipitation)
- Continuous data acquisition with adaptive sampling intervals

### 🤖 AI-Powered Predictions
- Machine Learning models (Random Forest, SVM, LSTM)
- Context-aware risk threshold determination
- Automated pattern recognition and anomaly detection

### 🗺️ Interactive GIS Mapping
- Color-coded risk zone visualization
- Real-time sensor location tracking
- Community feedback integration for map self-correction

### 🚨 Smart Alert System
- Multi-channel notifications (SMS, Email, Web, Mobile)
- Multilingual alert messages
- Threshold-based automated warnings
- Priority-based alert escalation

### ⚡ Node Health Monitoring
- Real-time battery status tracking
- Connectivity diagnostics
- Sensor fault detection and reporting

### 🔋 Autonomous Operation
- Solar-powered sensor nodes
- Low-power LoRaWAN/Zigbee communication
- Edge computing for local processing

## Technology Stack

### Frontend
- **Framework:** React.js with Vite
- **UI Library:** Material-UI (MUI)
- **Mapping:** Leaflet.js / Mapbox GL
- **Charts:** Chart.js / Recharts
- **State Management:** Redux Toolkit
- **Real-time:** Socket.io-client

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT (JSON Web Tokens)
- **Real-time:** Socket.io
- **API Documentation:** Swagger

### AI/ML Integration
- **Language:** Python
- **Libraries:** scikit-learn, TensorFlow, pandas
- **API:** Flask/FastAPI for ML endpoints

### IoT & Communication
- **Protocols:** MQTT, LoRaWAN, HTTP
- **Gateway:** Raspberry Pi / ESP32
- **Cloud:** AWS IoT Core / Azure IoT Hub

## Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (v6 or higher)
- Python 3.9+ (for AI module)
- Git

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd "soil moisture v3"
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Configure environment variables**
   
   Backend (.env):
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/soil-moisture-db
   JWT_SECRET=your_jwt_secret_key
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_email_password
   MAPBOX_TOKEN=your_mapbox_token
   ```

   Frontend (.env):
   ```
   VITE_API_URL=http://localhost:5000/api
   VITE_SOCKET_URL=http://localhost:5000
   VITE_MAPBOX_TOKEN=your_mapbox_token
   ```

4. **Start MongoDB**
   ```bash
   mongod
   ```

5. **Run the application**
   ```bash
   npm run dev
   ```

   - Backend API: http://localhost:5000
   - Frontend: http://localhost:3000

## API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Sensors
- `GET /api/sensors` - List all sensors
- `POST /api/sensors` - Add new sensor
- `GET /api/sensors/:id` - Get sensor details
- `PUT /api/sensors/:id` - Update sensor
- `DELETE /api/sensors/:id` - Remove sensor

### Readings
- `GET /api/readings` - Get sensor readings
- `POST /api/readings` - Add new reading
- `GET /api/readings/sensor/:id` - Get readings by sensor
- `GET /api/readings/stats` - Get statistics

### Alerts
- `GET /api/alerts` - List all alerts
- `POST /api/alerts` - Create alert
- `PUT /api/alerts/:id` - Update alert status
- `GET /api/alerts/active` - Get active alerts

### Risk Zones
- `GET /api/risk-zones` - Get risk zone data
- `POST /api/risk-zones` - Create risk zone
- `PUT /api/risk-zones/:id` - Update risk zone

### Predictions
- `POST /api/predictions/analyze` - Run AI prediction
- `GET /api/predictions/history` - Get prediction history

## User Roles

1. **Admin** - Full system access, user management
2. **Operator** - Sensor management, alert configuration
3. **Public** - View-only access to maps and alerts

## Deployment

### Production Build
```bash
npm run build
```

### Docker Deployment
```bash
docker-compose up -d
```

## Project Structure

```
soil moisture v3/
├── backend/
│   ├── config/          # Configuration files
│   ├── controllers/     # Route controllers
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── middleware/      # Custom middleware
│   ├── services/        # Business logic
│   ├── utils/           # Helper functions
│   └── server.js        # Entry point
├── frontend/
│   ├── public/          # Static assets
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── services/    # API services
│   │   ├── store/       # Redux store
│   │   ├── utils/       # Utilities
│   │   └── App.jsx      # Root component
│   └── index.html
├── ai-module/           # Python ML models
├── docs/                # Documentation
└── package.json
```

## Contributing

This is an academic project. For collaboration inquiries, please contact the team members.

## License

MIT License - See LICENSE file for details

## Acknowledgments

- **Guide:** Dr. Preeti Bansal
- **Institution:** Chandigarh Engineering College, CGC Landran
- **Affiliated to:** PTU, Jalandhar

## Contact

For questions or support, contact the development team through the institution.

---

**Session:** 2022-26  
**Department:** Electronics & Communication Engineering
