const database = require('../database/database');
const fs = require('fs').promises;
const path = require('path');
const { Parser } = require('json2csv');

class BackupManager {
  constructor() {
    this.backupDir = path.join(__dirname, '../../backups');
  }

  async createBackup() {
    try {
      const backupData = {};
      
      // Get all tables
      const tables = await database.all(`
        SELECT name FROM sqlite_master 
        WHERE type='table' 
        AND name NOT LIKE 'sqlite_%'
      `);
      
      for (const table of tables) {
        const data = await database.all(`SELECT * FROM ${table.name}`);
        backupData[table.name] = data;
      }
      
      // Create backup directory if it doesn't exist
      await fs.mkdir(this.backupDir, { recursive: true });
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFileName = `auto-backup-${timestamp}`;
      
      // Save as JSON
      const jsonPath = path.join(this.backupDir, `${backupFileName}.json`);
      await fs.writeFile(jsonPath, JSON.stringify(backupData, null, 2));
      
      // Save as CSV
      const csvPath = path.join(this.backupDir, `${backupFileName}.csv`);
      let csvData = '';
      
      for (const [tableName, tableData] of Object.entries(backupData)) {
        if (tableData.length > 0) {
          try {
            const parser = new Parser();
            const csv = parser.parse(tableData);
            csvData += `=== ${tableName} ===\n${csv}\n\n`;
          } catch (error) {
            console.error(`Error converting table ${tableName} to CSV:`, error);
          }
        }
      }
      
      await fs.writeFile(csvPath, csvData);
      
      // Clean up old backups (keep only last 10)
      await this.cleanupOldBackups();
      
      return {
        success: true,
        files: { json: jsonPath, csv: csvPath },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Backup failed:', error);
      throw error;
    }
  }

  async cleanupOldBackups() {
    try {
      const files = await fs.readdir(this.backupDir);
      const backupFiles = files
        .filter(file => file.startsWith('auto-backup-'))
        .map(file => ({
          name: file,
          path: path.join(this.backupDir, file),
          time: fs.statSync(path.join(this.backupDir, file)).mtime.getTime()
        }))
        .sort((a, b) => b.time - a.time);

      // Keep only the 10 most recent backups
      const filesToDelete = backupFiles.slice(10);
      
      for (const file of filesToDelete) {
        await fs.unlink(file.path);
      }
    } catch (error) {
      console.error('Error cleaning up old backups:', error);
    }
  }
}

module.exports = new BackupManager();