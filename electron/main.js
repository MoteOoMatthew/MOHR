const { app, BrowserWindow, Menu, Tray, nativeImage, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const isDev = require('electron-is-dev');

let mainWindow;
let tray;
let serverProcess;
let isQuitting = false;

// Environment configuration
const config = {
  development: {
    serverPort: 5000,
    frontendPort: 3000,
    serverPath: path.join(__dirname, '../backend/server.js'),
    frontendUrl: 'http://localhost:3000'
  },
  production: {
    serverPort: 5000,
    frontendPort: 5000,
    serverPath: path.join(__dirname, 'resources/backend/server.js'),
    frontendUrl: 'http://localhost:5000'
  }
};

const env = process.env.NODE_ENV || 'development';
const currentConfig = config[env];

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'assets/icon.png'),
    show: false,
    titleBarStyle: 'default'
  });

  // Load the frontend
  if (isDev) {
    // Development: Load from React dev server
    mainWindow.loadURL(currentConfig.frontendUrl);
    mainWindow.webContents.openDevTools();
  } else {
    // Production: Load from local server (more reliable)
    mainWindow.loadURL('http://localhost:5000');
  }

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Prevent window from being closed when clicking X (minimize to tray instead)
  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
  });
}

function createTray() {
  // Create tray icon
  const iconPath = path.join(__dirname, 'assets/icon.png');
  const icon = nativeImage.createFromPath(iconPath);
  
  tray = new Tray(icon);
  tray.setToolTip('MOHR HR System');

  // Create tray menu
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show MOHR HR System',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        }
      }
    },
    {
      label: 'Open in Browser',
      click: () => {
        require('electron').shell.openExternal(currentConfig.frontendUrl);
      }
    },
    { type: 'separator' },
    {
      label: 'Server Status',
      submenu: [
        {
          label: 'Restart Server',
          click: () => restartServer()
        },
        {
          label: 'Stop Server',
          click: () => stopServer()
        }
      ]
    },
    { type: 'separator' },
    {
      label: 'Settings',
      click: () => {
        // TODO: Open settings window
        console.log('Settings clicked');
      }
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        isQuitting = true;
        app.quit();
      }
    }
  ]);

  tray.setContextMenu(contextMenu);

  // Double click tray icon to show window
  tray.on('double-click', () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    }
  });
}

function startServer() {
  return new Promise((resolve, reject) => {
    console.log('Starting MOHR HR Server...');
    
    // Set environment variables
    const env = {
      ...process.env,
      NODE_ENV: isDev ? 'development' : 'production',
      PORT: currentConfig.serverPort
    };

    // Start the backend server
    serverProcess = spawn('node', [currentConfig.serverPath], {
      env,
      stdio: ['pipe', 'pipe', 'pipe']
    });

    serverProcess.stdout.on('data', (data) => {
      console.log(`Server: ${data}`);
      if (data.toString().includes('MOHR HR System server running')) {
        resolve();
      }
    });

    serverProcess.stderr.on('data', (data) => {
      console.error(`Server Error: ${data}`);
    });

    serverProcess.on('error', (error) => {
      console.error('Failed to start server:', error);
      reject(error);
    });

    serverProcess.on('close', (code) => {
      console.log(`Server process exited with code ${code}`);
    });
  });
}

function stopServer() {
  if (serverProcess) {
    serverProcess.kill();
    serverProcess = null;
    console.log('Server stopped');
  }
}

function restartServer() {
  stopServer();
  setTimeout(() => {
    startServer().catch(console.error);
  }, 1000);
}

// App event handlers
app.whenReady().then(async () => {
  try {
    await startServer();
    createTray();
    createWindow();
  } catch (error) {
    console.error('Failed to start application:', error);
    app.quit();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('before-quit', () => {
  isQuitting = true;
  stopServer();
});

// IPC handlers for communication between main and renderer processes
ipcMain.handle('get-server-status', () => {
  return {
    isRunning: serverProcess && !serverProcess.killed,
    port: currentConfig.serverPort,
    url: currentConfig.frontendUrl
  };
});

ipcMain.handle('restart-server', async () => {
  restartServer();
  return { success: true };
});

ipcMain.handle('get-config', () => {
  return currentConfig;
}); 