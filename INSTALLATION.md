# Installation and Setup Guide

## Soil Moisture Detection for Calamities and Pre-Alert Generation

### Project Information
- **Team Members:** Siddhant Kumar Kashyap (2237278), Utkarsh Singh (2237294), Kalyan Joshi (2237201), Tej Pratap Singh (2237292)
- **Guide:** Dr. Preeti Bansal
- **Institution:** Chandigarh Engineering College – CGC Landran, Mohali

---

## Prerequisites

Before you begin, ensure you have the following installed on your system:

### Required Software
- **Node.js** (v18.0.0 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v6.0 or higher) - [Download](https://www.mongodb.com/try/download/community)
- **Git** - [Download](https://git-scm.com/downloads)
- **Python** (3.9 or higher) - For AI/ML module (optional)

### Optional Tools
- **MongoDB Compass** - GUI for MongoDB
- **Postman** - API testing
- **VS Code** - Recommended code editor

---

## Installation Steps

### 1. Clone or Navigate to Project Directory

```powershell
cd "d:\soilMoisture\soil moisture v3"
```

### 2. Install Root Dependencies

```powershell
npm install
```

### 3. Install Backend Dependencies

```powershell
cd backend
npm install
cd ..
```

### 4. Install Frontend Dependencies

```powershell
cd frontend
npm install
cd ..
```

### 4. Or Install All at Once

```powershell
npm run install-all
```

---

## Configuration

### 1. Backend Environment Variables

Create a `.env` file in the `backend` directory:

```powershell
cd backend
Copy-Item .env.example .env
```

Edit the `.env` file with your configuration:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/soil-moisture-db

# JWT Authentication
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d

# Email Configuration (for alerts)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
FROM_EMAIL=noreply@soilmonitor.com
FROM_NAME=Soil Moisture Alert System

# Mapping Services (optional)
MAPBOX_TOKEN=your_mapbox_access_token
GOOGLE_MAPS_API_KEY=your_google_maps_key

# MQTT Broker (for IoT sensors)
MQTT_BROKER_URL=mqtt://localhost:1883
MQTT_USERNAME=
MQTT_PASSWORD=

# Alert Configuration
DEFAULT_MOISTURE_THRESHOLD=45
ALERT_CHECK_INTERVAL=300000

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100
```

### 2. Frontend Environment Variables

Create a `.env` file in the `frontend` directory:

```powershell
cd ..\frontend
Copy-Item .env.example .env
```

Edit the `.env` file:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_MAPBOX_TOKEN=your_mapbox_access_token_here
```

---

## Running the Application

### Option 1: Run Everything Together (Recommended)

From the root directory:

```powershell
npm run dev
```

This will start both backend (port 5000) and frontend (port 3000) simultaneously.

### Option 2: Run Separately

**Start MongoDB:**
```powershell
mongod
```

**In one terminal - Backend:**
```powershell
cd backend
npm run dev
```

**In another terminal - Frontend:**
```powershell
cd frontend
npm run dev
```

---

## Accessing the Application

Once running, access the application at:

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **API Health Check:** http://localhost:5000/health

### Default Login Credentials

Since this is a fresh installation, you'll need to register a new account:

1. Go to http://localhost:3000
2. Click "Register here"
3. Fill in your details
4. First registered user can be made admin through MongoDB

---

## Database Setup

### Using MongoDB Compass (GUI)

1. Open MongoDB Compass
2. Connect to: `mongodb://localhost:27017`
3. The database `soil-moisture-db` will be created automatically
4. Collections will be created when first data is inserted

### Using MongoDB Shell

```bash
mongosh
use soil-moisture-db
db.users.find()
```

---

## Testing the API

### Using Postman

Import the following example requests:

**1. Register User:**
```
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+1234567890",
  "organization": "CGC Landran"
}
```

**2. Login:**
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**3. Get All Sensors (requires token):**
```
GET http://localhost:5000/api/sensors
Authorization: Bearer YOUR_TOKEN_HERE
```

---

## Email Configuration (Gmail)

To enable email alerts:

1. Go to your Google Account settings
2. Enable 2-Factor Authentication
3. Generate an App Password:
   - Go to Security > 2-Step Verification > App passwords
   - Select "Mail" and "Windows Computer"
   - Copy the generated password
4. Use this password in `SMTP_PASS` in your `.env` file

---

## Common Issues and Solutions

### Issue 1: MongoDB Connection Failed
**Solution:** 
- Make sure MongoDB is running: `mongod`
- Check if port 27017 is not blocked
- Verify MONGODB_URI in .env file

### Issue 2: Port Already in Use
**Solution:**
```powershell
# Find process using port
netstat -ano | findstr :5000

# Kill the process
taskkill /PID <PID_NUMBER> /F
```

### Issue 3: Module Not Found
**Solution:**
```powershell
# Clear node_modules and reinstall
Remove-Item -Recurse -Force node_modules
npm install
```

### Issue 4: CORS Errors
**Solution:** 
- Check that frontend URL matches CORS settings in backend/server.js
- Default is http://localhost:3000

---

## Development Tips

### Hot Reload

Both frontend and backend support hot reload:
- Backend: Changes automatically restart server (nodemon)
- Frontend: Changes update browser instantly (Vite HMR)

### Debugging

**Backend:**
- Check console for logs
- Use `console.log()` or debugger
- Check MongoDB for data issues

**Frontend:**
- Open browser DevTools (F12)
- Check Network tab for API calls
- Use React DevTools extension

### Adding Sample Data

You can add test sensors and readings through:
1. The frontend UI (once logged in)
2. API calls via Postman
3. MongoDB directly

---

## Project Structure

```
soil moisture v3/
├── backend/
│   ├── controllers/      # Request handlers
│   ├── models/           # Database schemas
│   ├── routes/           # API routes
│   ├── middleware/       # Auth, error handling
│   ├── services/         # MQTT, alerts, notifications
│   ├── utils/            # Helper functions
│   └── server.js         # Entry point
├── frontend/
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API services
│   │   ├── store/        # Redux state management
│   │   └── App.jsx       # Root component
│   └── index.html
└── package.json
```

---

## Next Steps

### 1. Configure Email Alerts
- Set up Gmail app password
- Test email notifications

### 2. Set Up MQTT Broker (Optional)
- Install Mosquitto MQTT broker
- Configure IoT sensor connections

### 3. Add Map Integration
- Get Mapbox access token from https://www.mapbox.com
- Add token to frontend .env

### 4. Deploy to Production
- Set up cloud database (MongoDB Atlas)
- Deploy backend (Heroku, AWS, Azure)
- Deploy frontend (Vercel, Netlify)

---

## Support and Documentation

### API Documentation
Once server is running, visit: http://localhost:5000

### Code Documentation
- Backend code includes JSDoc comments
- Frontend components are well-commented

### Getting Help
- Check README.md for features overview
- Review code comments
- Contact team members for questions

---

## Production Deployment

### Environment Setup

1. **MongoDB Atlas:**
   - Create cluster at https://cloud.mongodb.com
   - Get connection string
   - Update MONGODB_URI

2. **Backend Deployment (Heroku):**
   ```bash
   heroku create soil-moisture-api
   heroku config:set NODE_ENV=production
   heroku config:set MONGODB_URI=your_atlas_uri
   git push heroku main
   ```

3. **Frontend Deployment (Vercel):**
   ```bash
   cd frontend
   vercel
   ```

### Security Checklist
- [ ] Change JWT_SECRET to strong random string
- [ ] Use environment-specific .env files
- [ ] Enable HTTPS
- [ ] Set up MongoDB authentication
- [ ] Configure CORS for production domains
- [ ] Enable rate limiting
- [ ] Set up monitoring and logging

---

## License
MIT License

## Acknowledgments
- Guide: Dr. Preeti Bansal
- Institution: Chandigarh Engineering College
- Session: 2022-26
