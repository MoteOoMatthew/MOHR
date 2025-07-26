// Production environment configuration for MOHR HR System
module.exports = {
  // Server Configuration
  server: {
    port: process.env.PORT || 5000,
    host: process.env.HOST || '0.0.0.0',
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
      credentials: true
    }
  },

  // Database Configuration
  database: {
    type: process.env.DB_TYPE || 'sqlite',
    sqlite: {
      path: process.env.DATABASE_PATH || './mohr.db'
    }
  },

  // Authentication Configuration
  auth: {
    jwtSecret: process.env.JWT_SECRET || 'mohr-production-secret-change-this',
    jwtExpiresIn: '24h',
    bcryptRounds: 12
  },

  // Security Configuration
  security: {
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100 // limit each IP to 100 requests per windowMs
    },
    helmet: {
      enabled: true
    }
  },

  // Logging Configuration
  logging: {
    level: 'info',
    file: {
      enabled: false
    }
  },

  // Email Configuration
  email: {
    enabled: false
  },

  // File Upload Configuration
  upload: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'application/pdf'],
    path: './uploads'
  },

  // Google Integration Configuration
  google: {
    enabled: false
  }
}; 