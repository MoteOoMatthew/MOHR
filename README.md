# MOHR - Modular HR Management System

A web-based, multi-user, multi-privilege level HR system that is modular, simple for non-technical users, and easy to extend. **Perfect for small to medium businesses with mobile-first design and multiple deployment options.**

## 🚀 Features

- **Multi-User Authentication**: Secure login with JWT tokens
- **Role-Based Access Control**: Admin, Manager, and Employee roles
- **Employee Management**: Complete CRUD operations for employee records
- **User Management**: Admin can manage user accounts
- **Modular Architecture**: Easy to add new features and modules
- **📱 Mobile-First Design**: Responsive interface optimized for phones and tablets
- **🔄 Progressive Web App (PWA)**: Install as mobile app, works offline
- **🖥️ Desktop Application**: Electron wrapper for standalone operation
- **🌐 Network Access**: Accessible from multiple devices on local network
- **⚙️ Environment Configuration**: Flexible setup for different deployment scenarios
- **🤖 Automated Deployment**: One-command setup and deployment scripts
- **🔒 Security Features**: Helmet, rate limiting, CORS protection
- **📊 SQLite Database**: Simple, file-based database (can be upgraded to PostgreSQL/MySQL)
- **🔌 RESTful API**: Clean, well-documented API endpoints
- **🎨 Modern UI**: React-based frontend with Tailwind CSS

## 🏗️ Architecture

```
MOHR/
├── frontend/          # React application (PWA)
│   ├── public/        # Static files & PWA manifest
│   ├── src/           # React components
│   └── package.json   # Frontend dependencies
├── backend/           # Node.js/Express server
│   ├── modules/       # Modular feature organization
│   │   ├── auth/      # Authentication & authorization
│   │   ├── users/     # User management
│   │   └── employees/ # Employee management
│   ├── server.js      # Main server file
│   └── database.js    # Database setup & helpers
├── electron/          # Desktop application wrapper
│   ├── main.js        # Electron main process
│   ├── preload.js     # Preload script
│   └── package.json   # Electron configuration
├── config/            # Environment configuration
│   └── environment.js # Configuration management
├── scripts/           # Deployment scripts
│   └── deploy.js      # Automated deployment
├── start-mohr.bat     # Windows startup script
├── DEPLOYMENT.md      # Comprehensive deployment guide
└── README.md
```

## 🛠️ Quick Start

### 🪟 Windows Users (Easiest)
1. **Double-click `start-mohr.bat`** - Installs dependencies and starts everything automatically
2. **Open your browser** to `http://localhost:5000`
3. **Login** with `admin` / `admin123`

### 💻 Command Line Users
```bash
# Development (local only)
node scripts/deploy.js development

# Local Network (accessible from phones/other devices)
node scripts/deploy.js local_network

# Production
node scripts/deploy.js production

# Desktop Application
node scripts/deploy.js electron
```

### 📱 Mobile Access
After starting with `local_network` or `production`:
1. Find your computer's IP address: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
2. On your phone, open browser and go to: `http://YOUR_IP:5000`
3. **Add to Home Screen** for app-like experience

## 🌍 Deployment Scenarios

### Development
- **Purpose**: Local development and testing
- **Access**: Localhost only
- **Features**: Hot reload, detailed logging
- **Command**: `node scripts/deploy.js development`

### Local Network
- **Purpose**: Testing on multiple devices (phones, tablets)
- **Access**: All devices on your WiFi network
- **Features**: Network accessibility, mobile optimization
- **Command**: `node scripts/deploy.js local_network`

### Production
- **Purpose**: Live deployment for business use
- **Access**: Configured for your domain/IP
- **Features**: Security hardening, performance optimization
- **Command**: `node scripts/deploy.js production`

### Remote
- **Purpose**: Cloud or remote server deployment
- **Access**: Public internet access
- **Features**: SSL support, advanced security
- **Command**: `node scripts/deploy.js remote`

### Desktop App
- **Purpose**: Standalone desktop application
- **Access**: No browser needed
- **Features**: System tray, native notifications
- **Command**: `node scripts/deploy.js electron`

## 🔐 Default Login

The system creates a default admin user on first run:

- **Username:** `admin`
- **Password:** `admin123`
- **Role:** `admin`

⚠️ **Important:** Change the default password after first login!

## 📱 Mobile Features

### Progressive Web App (PWA)
- **Install on Home Screen**: Works like a native app
- **Offline Support**: Basic functionality without internet
- **Push Notifications**: Real-time updates (coming soon)
- **Touch Optimized**: Large buttons, swipe gestures

### Mobile-First Design
- **Responsive Layout**: Adapts to any screen size
- **Touch Targets**: Minimum 44px for easy tapping
- **Bottom Navigation**: Thumb-friendly navigation
- **Fast Loading**: Optimized for mobile networks

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Create new user (admin only)
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/logout` - User logout

### Users
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Deactivate user (admin only)
- `POST /api/users/:id/reactivate` - Reactivate user (admin only)

### Employees
- `GET /api/employees` - Get all employees
- `GET /api/employees/:id` - Get employee by ID
- `POST /api/employees` - Create new employee (admin/manager only)
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Deactivate employee (admin only)
- `POST /api/employees/:id/reactivate` - Reactivate employee (admin only)
- `GET /api/employees/departments/list` - Get all departments
- `GET /api/employees/managers/list` - Get all managers

## 🔒 Security Features

- **Password Hashing**: All passwords are hashed using bcrypt
- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control**: Different permissions for different roles
- **Input Validation**: Server-side validation for all inputs
- **SQL Injection Protection**: Parameterized queries
- **CORS Configuration**: Cross-origin resource sharing setup
- **Helmet Security**: HTTP headers protection
- **Rate Limiting**: API request throttling
- **Environment Variables**: Secure configuration management

## 🎯 User Roles & Permissions

### Admin
- Full system access
- Can create, read, update, delete users and employees
- Can manage user roles and permissions
- Can view all system data
- Can access system configuration

### Manager
- Can manage employees in their department
- Can view employee information
- Can approve/reject leave requests
- Cannot manage user accounts
- Can access team reports

### Employee
- Can view their own information
- Can update their own profile
- Can submit leave requests
- Cannot access other employee data
- Can view their own reports

## 🚀 Adding New Modules

The system is designed to be modular. To add a new feature:

1. **Create a new module directory:**
   ```bash
   mkdir backend/modules/your-module
   ```

2. **Create the module files:**
   - `routes.js` - API endpoints
   - `controller.js` - Business logic (optional)
   - `model.js` - Data models (optional)

3. **Add the module to server.js:**
   ```javascript
   const yourModuleRoutes = require('./modules/your-module/routes');
   app.use('/api/your-module', yourModuleRoutes);
   ```

4. **Add database tables** in `database.js` if needed

5. **Add frontend components** in `frontend/src/components/`

## 🐛 Troubleshooting

### Common Issues

1. **Port already in use:**
   ```bash
   # Windows
   netstat -ano | findstr :5000
   taskkill /PID <PID> /F
   
   # Mac/Linux
   lsof -i :5000
   kill -9 <PID>
   ```

2. **Database errors:**
   - Delete `mohr.db` file and restart the server to recreate the database

3. **Module not found errors:**
   ```bash
   # Install all dependencies
   node scripts/deploy.js development
   ```

4. **Mobile not connecting:**
   - Ensure you're using `local_network` or `production` deployment
   - Check firewall settings
   - Verify both devices are on same WiFi network

5. **CORS errors:**
   - Ensure the frontend is running on the correct port
   - Check CORS configuration in `config/environment.js`

### Network Troubleshooting

**Find your IP address:**
```bash
# Windows
ipconfig

# Mac/Linux
ifconfig
```

**Test network connectivity:**
```bash
# From another device
ping YOUR_IP_ADDRESS
```

## 📝 Development Notes

- **Database**: SQLite for simplicity. For production, consider PostgreSQL or MySQL
- **Security**: JWT secret should be changed in production using environment variables
- **Environment**: Use `config/environment.js` for different deployment scenarios
- **Mobile**: Test on actual devices, not just browser dev tools
- **Performance**: Frontend is optimized for mobile networks
- **Updates**: Use `scripts/deploy.js` for consistent deployments

## 📚 Additional Documentation

- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Comprehensive deployment guide
- **[Environment Configuration](config/environment.js)** - Configuration options
- **[API Documentation](backend/modules/)** - Detailed API documentation
- **[Google Integration](docs/GOOGLE_INTEGRATION.md)** - Google Apps integration planning

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly (including mobile)
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

---

**MOHR HR System** - Making HR management simple, mobile-friendly, and modular! 🎉📱
