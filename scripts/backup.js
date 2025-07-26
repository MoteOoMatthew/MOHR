#!/usr/bin/env node

/**
 * MOHR HR System - Backup Script
 * 
 * This script creates automated backups of:
 * - Database files
 * - Configuration files
 * - Important project files
 * - User uploads
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, description) {
  log(`\n${colors.bright}${colors.blue}${step}${colors.reset} - ${description}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'cyan');
}

// Backup configuration
const backupConfig = {
  backupDir: 'backup',
  maxBackups: 10, // Keep last 10 backups
  includeFiles: [
    'backend/mohr.db',
    'config/environment.js',
    'config/custom.js',
    '.env',
    'package.json',
    'backend/package.json',
    'frontend/package.json',
    'electron/package.json'
  ],
  includeDirs: [
    'uploads',
    'logs'
  ],
  excludePatterns: [
    'node_modules',
    '*.log',
    '*.tmp',
    '*.temp'
  ]
};

// Helper function to create timestamp
function getTimestamp() {
  const now = new Date();
  return now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
}

// Helper function to ensure backup directory exists
function ensureBackupDir() {
  const backupPath = path.join(process.cwd(), backupConfig.backupDir);
  if (!fs.existsSync(backupPath)) {
    fs.mkdirSync(backupPath, { recursive: true });
    logSuccess(`Created backup directory: ${backupPath}`);
  }
  return backupPath;
}

// Helper function to copy file
function copyFile(source, destination) {
  try {
    if (fs.existsSync(source)) {
      const destDir = path.dirname(destination);
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }
      fs.copyFileSync(source, destination);
      return true;
    }
    return false;
  } catch (error) {
    logError(`Failed to copy ${source}: ${error.message}`);
    return false;
  }
}

// Helper function to copy directory
function copyDirectory(source, destination) {
  try {
    if (fs.existsSync(source)) {
      if (!fs.existsSync(destination)) {
        fs.mkdirSync(destination, { recursive: true });
      }
      
      const items = fs.readdirSync(source);
      for (const item of items) {
        const sourcePath = path.join(source, item);
        const destPath = path.join(destination, item);
        
        if (fs.statSync(sourcePath).isDirectory()) {
          copyDirectory(sourcePath, destPath);
        } else {
          fs.copyFileSync(sourcePath, destPath);
        }
      }
      return true;
    }
    return false;
  } catch (error) {
    logError(`Failed to copy directory ${source}: ${error.message}`);
    return false;
  }
}

// Create database backup
function backupDatabase() {
  logStep('1', 'Backing up Database');
  
  const dbPath = path.join(process.cwd(), 'backend', 'mohr.db');
  if (!fs.existsSync(dbPath)) {
    logWarning('Database file not found, skipping database backup');
    return false;
  }
  
  const backupPath = ensureBackupDir();
  const timestamp = getTimestamp();
  const dbBackupPath = path.join(backupPath, `mohr-db-${timestamp}.db`);
  
  if (copyFile(dbPath, dbBackupPath)) {
    logSuccess(`Database backed up to: ${dbBackupPath}`);
    return true;
  }
  
  return false;
}

// Create configuration backup
function backupConfiguration() {
  logStep('2', 'Backing up Configuration');
  
  const backupPath = ensureBackupDir();
  const timestamp = getTimestamp();
  const configBackupDir = path.join(backupPath, `config-${timestamp}`);
  
  let successCount = 0;
  let totalCount = 0;
  
  for (const file of backupConfig.includeFiles) {
    totalCount++;
    const sourcePath = path.join(process.cwd(), file);
    const destPath = path.join(configBackupDir, file);
    
    if (copyFile(sourcePath, destPath)) {
      successCount++;
      logInfo(`Backed up: ${file}`);
    } else {
      logWarning(`File not found: ${file}`);
    }
  }
  
  logSuccess(`Configuration backup completed: ${successCount}/${totalCount} files`);
  return successCount > 0;
}

// Create directory backup
function backupDirectories() {
  logStep('3', 'Backing up Directories');
  
  const backupPath = ensureBackupDir();
  const timestamp = getTimestamp();
  
  let successCount = 0;
  let totalCount = 0;
  
  for (const dir of backupConfig.includeDirs) {
    totalCount++;
    const sourcePath = path.join(process.cwd(), dir);
    const destPath = path.join(backupPath, `${dir}-${timestamp}`);
    
    if (copyDirectory(sourcePath, destPath)) {
      successCount++;
      logInfo(`Backed up directory: ${dir}`);
    } else {
      logWarning(`Directory not found: ${dir}`);
    }
  }
  
  logSuccess(`Directory backup completed: ${successCount}/${totalCount} directories`);
  return successCount > 0;
}

// Create full system backup
function createFullBackup() {
  logStep('4', 'Creating Full System Backup');
  
  const backupPath = ensureBackupDir();
  const timestamp = getTimestamp();
  const fullBackupDir = path.join(backupPath, `full-backup-${timestamp}`);
  
  try {
    // Create backup directory
    fs.mkdirSync(fullBackupDir, { recursive: true });
    
    // Copy important project files
    const importantFiles = [
      'package.json',
      'README.md',
      'DEPLOYMENT.md',
      'LICENSE',
      'start-mohr.bat'
    ];
    
    for (const file of importantFiles) {
      const sourcePath = path.join(process.cwd(), file);
      const destPath = path.join(fullBackupDir, file);
      copyFile(sourcePath, destPath);
    }
    
    // Copy scripts directory
    const scriptsSource = path.join(process.cwd(), 'scripts');
    const scriptsDest = path.join(fullBackupDir, 'scripts');
    copyDirectory(scriptsSource, scriptsDest);
    
    // Copy config directory
    const configSource = path.join(process.cwd(), 'config');
    const configDest = path.join(fullBackupDir, 'config');
    copyDirectory(configSource, configDest);
    
    // Copy docs directory
    const docsSource = path.join(process.cwd(), 'docs');
    const docsDest = path.join(fullBackupDir, 'docs');
    copyDirectory(docsSource, docsDest);
    
    logSuccess(`Full backup created: ${fullBackupDir}`);
    return true;
  } catch (error) {
    logError(`Failed to create full backup: ${error.message}`);
    return false;
  }
}

// Clean old backups
function cleanOldBackups() {
  logStep('5', 'Cleaning Old Backups');
  
  const backupPath = ensureBackupDir();
  
  try {
    const items = fs.readdirSync(backupPath);
    const backupDirs = items
      .map(item => {
        const itemPath = path.join(backupPath, item);
        const stats = fs.statSync(itemPath);
        return {
          name: item,
          path: itemPath,
          mtime: stats.mtime
        };
      })
      .filter(item => item.name.startsWith('mohr-db-') || 
                      item.name.startsWith('config-') || 
                      item.name.startsWith('full-backup-'))
      .sort((a, b) => b.mtime - a.mtime);
    
    if (backupDirs.length > backupConfig.maxBackups) {
      const toDelete = backupDirs.slice(backupConfig.maxBackups);
      for (const backup of toDelete) {
        if (fs.statSync(backup.path).isDirectory()) {
          fs.rmSync(backup.path, { recursive: true, force: true });
        } else {
          fs.unlinkSync(backup.path);
        }
        logInfo(`Deleted old backup: ${backup.name}`);
      }
      logSuccess(`Cleaned ${toDelete.length} old backups`);
    } else {
      logInfo('No old backups to clean');
    }
  } catch (error) {
    logError(`Failed to clean old backups: ${error.message}`);
  }
}

// Create backup report
function createBackupReport() {
  logStep('6', 'Creating Backup Report');
  
  const backupPath = ensureBackupDir();
  const timestamp = getTimestamp();
  const reportPath = path.join(backupPath, `backup-report-${timestamp}.txt`);
  
  try {
    const report = [
      'MOHR HR System - Backup Report',
      '==============================',
      `Backup Date: ${new Date().toISOString()}`,
      `Backup Location: ${backupPath}`,
      '',
      'Backed up items:',
      '- Database files',
      '- Configuration files',
      '- Important project files',
      '- User uploads (if any)',
      '- Logs (if any)',
      '',
      'Backup completed successfully!',
      '',
      'To restore:',
      '1. Stop the MOHR system',
      '2. Copy backup files to appropriate locations',
      '3. Restart the system',
      '',
      'For more information, see DEPLOYMENT.md'
    ].join('\n');
    
    fs.writeFileSync(reportPath, report);
    logSuccess(`Backup report created: ${reportPath}`);
  } catch (error) {
    logError(`Failed to create backup report: ${error.message}`);
  }
}

// Main backup function
async function main() {
  log(`${colors.bright}${colors.magenta}💾 MOHR HR System - Backup${colors.reset}`);
  log(`${colors.cyan}Creating automated backup of system files${colors.reset}\n`);
  
  // Parse command line arguments
  const args = process.argv.slice(2);
  const backupType = args[0] || 'all';
  
  let success = true;
  
  switch (backupType) {
    case 'db':
      success = backupDatabase();
      break;
    case 'config':
      success = backupConfiguration();
      break;
    case 'dirs':
      success = backupDirectories();
      break;
    case 'full':
      success = createFullBackup();
      break;
    case 'all':
    default:
      backupDatabase();
      backupConfiguration();
      backupDirectories();
      createFullBackup();
      break;
  }
  
  // Clean old backups
  cleanOldBackups();
  
  // Create backup report
  createBackupReport();
  
  if (success) {
    log(`\n${colors.bright}${colors.green}🎉 Backup completed successfully!${colors.reset}`);
    log(`${colors.cyan}Check the backup directory for your backup files.${colors.reset}`);
  } else {
    log(`\n${colors.bright}${colors.red}❌ Backup completed with some issues!${colors.reset}`);
    log(`${colors.yellow}Please check the output above for details.${colors.reset}`);
  }
}

// Show help
function showHelp() {
  log(`${colors.bright}${colors.cyan}Usage:${colors.reset}`);
  log(`  node scripts/backup.js [type]`);
  log(``);
  log(`${colors.bright}${colors.cyan}Backup Types:${colors.reset}`);
  log(`  db      - Database backup only`);
  log(`  config  - Configuration backup only`);
  log(`  dirs    - Directory backup only`);
  log(`  full    - Full system backup`);
  log(`  all     - All backups (default)`);
  log(``);
  log(`${colors.bright}${colors.cyan}Examples:${colors.reset}`);
  log(`  node scripts/backup.js          # All backups`);
  log(`  node scripts/backup.js db       # Database only`);
  log(`  node scripts/backup.js config   # Configuration only`);
}

// Handle command line arguments
if (process.argv.includes('--help')) {
  showHelp();
  process.exit(0);
}

// Run main function
main().catch((error) => {
  logError(`Backup failed: ${error.message}`);
  process.exit(1);
});

module.exports = {
  backupDatabase,
  backupConfiguration,
  backupDirectories,
  createFullBackup,
  cleanOldBackups
}; 