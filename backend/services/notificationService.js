const nodemailer = require('nodemailer');
const User = require('../models/User');

// Email transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Send alert notifications to relevant users
exports.sendAlertNotifications = async (alert) => {
  try {
    // Get users who should receive notifications
    const users = await User.find({
      isActive: true,
      'preferences.notifications.email': true,
      'preferences.alertLevel': { 
        $in: getSeverityHierarchy(alert.severity) 
      }
    });

    const notificationPromises = [];

    for (const user of users) {
      // Email notification
      if (user.preferences.notifications.email) {
        notificationPromises.push(
          sendEmailAlert(user, alert).catch(err => 
            console.error(`Email failed for ${user.email}:`, err.message)
          )
        );
      }

      // SMS notification (if enabled and critical)
      if (user.preferences.notifications.sms && alert.severity === 'critical') {
        notificationPromises.push(
          sendSMSAlert(user, alert).catch(err => 
            console.error(`SMS failed for ${user.phone}:`, err.message)
          )
        );
      }
    }

    await Promise.allSettled(notificationPromises);

    // Update alert notification status
    alert.notifications.sent = true;
    alert.notifications.channels.push({
      type: 'email',
      status: 'sent',
      sentAt: new Date(),
      recipients: users.map(u => u.email)
    });
    await alert.save();

    console.log(`📧 Notifications sent for alert ${alert.alertId}`);
  } catch (error) {
    console.error('Notification error:', error);
  }
};

// Send email alert
const sendEmailAlert = async (user, alert) => {
  const severityColors = {
    info: '#2196F3',
    low: '#4CAF50',
    medium: '#FF9800',
    high: '#FF5722',
    critical: '#F44336'
  };

  const mailOptions = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: user.email,
    subject: `[${alert.severity.toUpperCase()}] ${alert.message.title}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: ${severityColors[alert.severity]}; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-top: none; }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
          .badge { display: inline-block; padding: 5px 10px; background: ${severityColors[alert.severity]}; color: white; border-radius: 3px; font-weight: bold; }
          .info { margin: 15px 0; padding: 10px; background: white; border-left: 4px solid ${severityColors[alert.severity]}; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>🚨 ${alert.message.title}</h2>
            <p><span class="badge">${alert.severity.toUpperCase()}</span></p>
          </div>
          <div class="content">
            <p><strong>Alert ID:</strong> ${alert.alertId}</p>
            <p><strong>Type:</strong> ${alert.type}</p>
            <p><strong>Time:</strong> ${alert.createdAt.toLocaleString()}</p>
            
            ${alert.sensorId ? `<p><strong>Sensor:</strong> ${alert.sensorId}</p>` : ''}
            
            <div class="info">
              <h3>Description</h3>
              <p>${alert.message.description}</p>
            </div>

            ${alert.message.actionable ? `
              <div class="info">
                <h3>Recommended Actions</h3>
                <p>${alert.message.actionable}</p>
              </div>
            ` : ''}

            ${alert.location ? `
              <p><strong>Location:</strong> ${alert.location.address || 'View on map'}</p>
            ` : ''}
          </div>
          <div class="footer">
            <p>Soil Moisture Monitoring System - Automated Alert</p>
            <p>Do not reply to this email. Login to the dashboard for more details.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  return transporter.sendMail(mailOptions);
};

// Send SMS alert (placeholder - integrate with SMS service like Twilio)
const sendSMSAlert = async (user, alert) => {
  if (!user.phone) return;

  // TODO: Integrate with SMS service (Twilio, AWS SNS, etc.)
  console.log(`SMS to ${user.phone}: ${alert.message.title}`);
  
  // Example with Twilio:
  // const twilio = require('twilio');
  // const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  // await client.messages.create({
  //   body: `[${alert.severity.toUpperCase()}] ${alert.message.title}: ${alert.message.description}`,
  //   from: process.env.TWILIO_PHONE_NUMBER,
  //   to: user.phone
  // });
};

// Get severity hierarchy for notification filtering
const getSeverityHierarchy = (severity) => {
  const hierarchy = {
    info: ['info'],
    low: ['info', 'low'],
    medium: ['info', 'low', 'medium'],
    high: ['info', 'low', 'medium', 'high'],
    critical: ['info', 'low', 'medium', 'high', 'critical']
  };
  return hierarchy[severity] || ['critical'];
};

// Send test email
exports.sendTestEmail = async (to) => {
  const mailOptions = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to,
    subject: 'Test Email - Soil Moisture Monitoring System',
    html: '<h1>Test Email</h1><p>If you received this, email notifications are working correctly!</p>'
  };

  return transporter.sendMail(mailOptions);
};
