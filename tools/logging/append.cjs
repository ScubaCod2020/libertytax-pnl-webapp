#!/usr/bin/env node

/**
 * Append-Only Logging Helper
 * 
 * Provides consistent, append-only logging to _meta/logs/
 * Usage: node tools/logging/append.js [TYPE] [MESSAGE]
 * 
 * Types: dev, maint, audit, process, handoff, ops
 */

const fs = require('fs');
const path = require('path');

// Configuration
const LOG_TYPES = {
  dev: 'dev',
  maint: 'maint',
  audit: 'audit',
  process: 'process',
  handoff: 'handoff',
  ops: 'ops'
};

const LOG_DIR = '_meta/logs';
const RETENTION_DAYS = {
  dev: 30,
  maint: 90,
  audit: 365,
  process: 90,
  handoff: 365,
  ops: 30
};

/**
 * Get current timestamp in ISO format
 */
function getTimestamp() {
  return new Date().toISOString();
}

/**
 * Get log file path for today
 */
function getLogFilePath(type) {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  return path.join(LOG_DIR, `${type}-${today}.log`);
}

/**
 * Ensure log directory exists
 */
function ensureLogDirectory() {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}

/**
 * Clean up old log files
 */
function cleanupOldLogs(type) {
  const retentionDays = RETENTION_DAYS[type] || 30;
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
  
  try {
    const files = fs.readdirSync(LOG_DIR);
    const logFiles = files.filter(file => file.startsWith(`${type}-`) && file.endsWith('.log'));
    
    for (const file of logFiles) {
      const filePath = path.join(LOG_DIR, file);
      const stats = fs.statSync(filePath);
      
      if (stats.mtime < cutoffDate) {
        fs.unlinkSync(filePath);
        console.log(`🗑️  Cleaned up old log file: ${file}`);
      }
    }
  } catch (error) {
    console.warn(`⚠️  Warning: Could not clean up old logs: ${error.message}`);
  }
}

/**
 * Append log entry
 */
function appendLog(type, message) {
  // Validate log type
  if (!LOG_TYPES[type]) {
    console.error(`❌ Invalid log type: ${type}`);
    console.error(`Valid types: ${Object.keys(LOG_TYPES).join(', ')}`);
    process.exit(1);
  }
  
  // Ensure log directory exists
  ensureLogDirectory();
  
  // Get log file path
  const logFilePath = getLogFilePath(type);
  
  // Create log entry
  const timestamp = getTimestamp();
  const logEntry = `${timestamp} [${type.toUpperCase()}] ${message}\n`;
  
  try {
    // Append to log file
    fs.appendFileSync(logFilePath, logEntry);
    console.log(`📝 Logged to ${logFilePath}`);
    
    // Clean up old logs
    cleanupOldLogs(type);
    
  } catch (error) {
    console.error(`❌ Error writing to log file: ${error.message}`);
    process.exit(1);
  }
}

/**
 * Main function
 */
function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.error('❌ Usage: node tools/logging/append.js [TYPE] [MESSAGE]');
    console.error(`Valid types: ${Object.keys(LOG_TYPES).join(', ')}`);
    console.error('Example: node tools/logging/append.js dev "Added new component"');
    process.exit(1);
  }
  
  const type = args[0];
  const message = args.slice(1).join(' ');
  
  appendLog(type, message);
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { appendLog, getTimestamp, getLogFilePath };
