const path = require('path');
const fs = require('fs');

// Default configuration
const defaultConfig = {
  // Server Configuration
  server: {
    port: 5000,
    host: 'localhost',
    cors: {
      origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
      credentials: true
    }
  },

  // Database Configuration
  database: {
    type: 'sqlite', // 'sqlite', 'postgresql', 'mysql'
    sqlite: {
      path: path.join(__dirname, '../backend/mohr.db')
    },
    postgresql: {
      host: 'localhost',
      port: 5432,
      database: 'mohr_hr',
      username: 'postgres',
      password: ''
    },
    mysql: {
      host: 'localhost',
      port: 3306,
      database: 'mohr_hr',
      username: 'root',
      password: ''
    }
  },

  // Authentication Configuration
  auth: {
    jwtSecret: 'mohr-secret-key-change-in-production',
    jwtExpiresIn: '24h',
    bcryptRounds: 10
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
    level: 'info', // 'error', 'warn', 'info', 'debug'
    file: {
      enabled: false,
      path: path.join(__dirname, '../logs/app.log'),
      maxSize: '10m',
      maxFiles: 5
    }
  },

  // Email Configuration (for future features)
  email: {
    enabled: false,
    provider: 'smtp', // 'smtp', 'sendgrid', 'mailgun'
    smtp: {
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: '',
        pass: ''
      }
    }
  },

  // File Upload Configuration
  upload: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'application/pdf'],
    path: path.join(__dirname, '../uploads')
  },

  // Google Integration Configuration (Future)
  google: {
    enabled: false, // Master switch for Google integration
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    redirectUri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/auth/google/callback',
    scopes: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/drive.file'
    ],
    calendar: {
      enabled: false,
      defaultCalendarId: 'primary'
    },
    drive: {
      enabled: false,
      folderId: process.env.GOOGLE_DRIVE_FOLDER_ID || ''
    }
  }
};

// Environment-specific configurations
const environments = {
  development: {
    server: {
      port: 5000,
      host: 'localhost'
    },
    database: {
      type: 'sqlite'
    },
    logging: {
      level: 'debug'
    }
  },

  production: {
    server: {
      port: process.env.PORT || 5000,
      host: '0.0.0.0', // Allow external connections
      cors: {
        origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:3000'],
        credentials: true
      }
    },
    database: {
      type: process.env.DB_TYPE || 'sqlite'
    },
    auth: {
      jwtSecret: process.env.JWT_SECRET || 'mohr-secret-key-change-in-production'
    },
    logging: {
      level: 'warn',
      file: {
        enabled: true
      }
    }
  },

  testing: {
    server: {
      port: 5001
    },
    database: {
      type: 'sqlite',
      sqlite: {
        path: path.join(__dirname, '../backend/test.db')
      }
    },
    logging: {
      level: 'error'
    }
  },

  // Local network deployment
  local_network: {
    server: {
      port: 5000,
      host: '0.0.0.0', // Allow network access
      cors: {
        origin: ['http://localhost:3000', 'http://192.168.1.100:3000'], // Add your local IP
        credentials: true
      }
    },
    database: {
      type: 'sqlite'
    }
  },

  // Remote deployment
  remote: {
    server: {
      port: process.env.PORT || 5000,
      host: '0.0.0.0',
      cors: {
        origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['https://yourdomain.com'],
        credentials: true
      }
    },
    database: {
      type: process.env.DB_TYPE || 'postgresql'
    },
    auth: {
      jwtSecret: process.env.JWT_SECRET || 'mohr-secret-key-change-in-production'
    },
    security: {
      rateLimit: {
        windowMs: 15 * 60 * 1000,
        max: 50 // Lower limit for remote access
      }
    }
  }
};

// Load custom configuration file if it exists
function loadCustomConfig() {
  const customConfigPath = path.join(__dirname, 'custom.js');
  if (fs.existsSync(customConfigPath)) {
    try {
      return require(customConfigPath);
    } catch (error) {
      console.warn('Failed to load custom config:', error.message);
      return {};
    }
  }
  return {};
}

// Merge configurations
function mergeConfigs(base, override) {
  const result = { ...base };
  
  for (const key in override) {
    if (override[key] && typeof override[key] === 'object' && !Array.isArray(override[key])) {
      result[key] = mergeConfigs(result[key] || {}, override[key]);
    } else {
      result[key] = override[key];
    }
  }
  
  return result;
}

// Get configuration for current environment
function getConfig() {
  const env = process.env.NODE_ENV || 'development';
  const envConfig = environments[env] || environments.development;
  const customConfig = loadCustomConfig();
  
  let config = mergeConfigs(defaultConfig, envConfig);
  config = mergeConfigs(config, customConfig);
  
  // Override with environment variables
  config = overrideWithEnvVars(config);
  
  return config;
}

// Override configuration with environment variables
function overrideWithEnvVars(config) {
  const envVars = {
    'SERVER_PORT': 'server.port',
    'SERVER_HOST': 'server.host',
    'DB_TYPE': 'database.type',
    'DB_HOST': 'database.postgresql.host',
    'DB_PORT': 'database.postgresql.port',
    'DB_NAME': 'database.postgresql.database',
    'DB_USER': 'database.postgresql.username',
    'DB_PASS': 'database.postgresql.password',
    'JWT_SECRET': 'auth.jwtSecret',
    'JWT_EXPIRES_IN': 'auth.jwtExpiresIn',
    'LOG_LEVEL': 'logging.level',
    'CORS_ORIGIN': 'server.cors.origin',
    'GOOGLE_CLIENT_ID': 'google.clientId',
    'GOOGLE_CLIENT_SECRET': 'google.clientSecret',
    'GOOGLE_REDIRECT_URI': 'google.redirectUri',
    'GOOGLE_DRIVE_FOLDER_ID': 'google.drive.folderId'
  };

  for (const [envVar, configPath] of Object.entries(envVars)) {
    if (process.env[envVar]) {
      const keys = configPath.split('.');
      let current = config;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      
      let value = process.env[envVar];
      
      // Convert string values to appropriate types
      if (value === 'true') value = true;
      else if (value === 'false') value = false;
      else if (!isNaN(value) && value !== '') value = Number(value);
      else if (value.startsWith('[') && value.endsWith(']')) {
        try {
          value = JSON.parse(value);
        } catch (e) {
          // Keep as string if JSON parsing fails
        }
      }
      
      current[keys[keys.length - 1]] = value;
    }
  }
  
  return config;
}

// Create configuration file for easy customization
function createCustomConfig() {
  const customConfigPath = path.join(__dirname, 'custom.js');
  const template = `// Custom configuration for MOHR HR System
// This file will be automatically loaded and merged with the default configuration

module.exports = {
  // Override any configuration values here
  // Example:
  // server: {
  //   port: 8080
  // },
  // database: {
  //   type: 'postgresql',
  //   postgresql: {
  //     host: 'localhost',
  //     port: 5432,
  //     database: 'mohr_hr',
  //     username: 'postgres',
  //     password: 'your_password'
  //   }
  // }
};
`;

  if (!fs.existsSync(customConfigPath)) {
    fs.writeFileSync(customConfigPath, template);
    console.log('Created custom configuration template at:', customConfigPath);
  }
}

module.exports = {
  getConfig,
  createCustomConfig,
  environments,
  defaultConfig
}; 