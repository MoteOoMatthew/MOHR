const express = require('express');
const cors = require('cors');
const path = require('path');
const { getConfig } = require('../config/environment');

// Import modules
const authRoutes = require('./modules/auth/routes');
const userRoutes = require('./modules/users/routes');
const employeeRoutes = require('./modules/employees/routes');

const app = express();
const config = getConfig();
const PORT = config.server.port;
const HOST = config.server.host;

// Middleware
app.use(cors(config.server.cors));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Security middleware
if (config.security.helmet.enabled) {
  const helmet = require('helmet');
  app.use(helmet());
}

// Rate limiting
if (config.security.rateLimit) {
  const rateLimit = require('express-rate-limit');
  const limiter = rateLimit(config.security.rateLimit);
  app.use('/api/', limiter);
}

// Serve static files from React app
app.use(express.static(path.join(__dirname, '../frontend/build')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/employees', employeeRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'MOHR HR System is running!' });
});

// Catch all handler: send back React's index.html file for any non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, HOST, () => {
  console.log(`🚀 MOHR HR System server running on ${HOST}:${PORT}`);
  console.log(`📊 Health check: http://${HOST}:${PORT}/api/health`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  
  if (HOST === '0.0.0.0') {
    console.log(`🌍 Server accessible from network`);
    console.log(`💡 Local access: http://localhost:${PORT}`);
  }
}); 