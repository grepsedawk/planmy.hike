/**
 * SyncManager - Handles data synchronization for Plan My Hike
 * Provides export/import functionality and prepares for future cloud sync
 */

export default class SyncManager {
  constructor(db) {
    this.db = db;
    this.isOnline = navigator.onLine;
    this.lastSyncTime = localStorage.getItem('lastSyncTime') || null;
    
    // Listen for online/offline changes
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.notifyStatusChange();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.notifyStatusChange();
    });

    // Auto-backup to localStorage periodically
    this.setupAutoBackup();
  }

  /**
   * Export all data from the database
   */
  async exportData() {
    try {
      const [sections, foods] = await Promise.all([
        this.db.sections.toArray(),
        this.db.foods.toArray()
      ]);

      const exportData = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        data: {
          sections,
          foods
        }
      };

      return exportData;
    } catch (error) {
      console.error('Failed to export data:', error);
      throw new Error('Failed to export data');
    }
  }

  /**
   * Import data into the database
   */
  async importData(importData, options = { merge: true }) {
    try {
      if (!importData.data) {
        throw new Error('Invalid import data format');
      }

      const { sections, foods } = importData.data;

      if (!options.merge) {
        // Clear existing data if not merging
        await this.db.transaction('rw', [this.db.sections, this.db.foods], async () => {
          await this.db.sections.clear();
          await this.db.foods.clear();
        });
      }

      // Import data in a transaction
      await this.db.transaction('rw', [this.db.sections, this.db.foods], async () => {
        if (sections && sections.length > 0) {
          if (options.merge) {
            // For merge, update existing or add new
            for (const section of sections) {
              await this.db.sections.put(section);
            }
          } else {
            await this.db.sections.bulkAdd(sections);
          }
        }

        if (foods && foods.length > 0) {
          if (options.merge) {
            // For merge, update existing or add new
            for (const food of foods) {
              await this.db.foods.put(food);
            }
          } else {
            await this.db.foods.bulkAdd(foods);
          }
        }
      });

      this.updateLastSyncTime();
      this.notifyStatusChange();
      
      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      throw new Error('Failed to import data: ' + error.message);
    }
  }

  /**
   * Download data as a file
   */
  async downloadBackup() {
    try {
      const data = await this.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `planmyhike-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      console.error('Failed to download backup:', error);
      throw error;
    }
  }

  /**
   * Upload data from a file
   */
  async uploadBackup(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const data = JSON.parse(e.target.result);
          await this.importData(data);
          resolve(true);
        } catch (error) {
          reject(new Error('Invalid backup file format'));
        }
      };

      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  /**
   * Backup data to localStorage
   */
  async backupToLocal() {
    try {
      const data = await this.exportData();
      localStorage.setItem('planmyhike_backup', JSON.stringify(data));
      localStorage.setItem('backup_timestamp', new Date().toISOString());
      return true;
    } catch (error) {
      console.error('Failed to backup to localStorage:', error);
      return false;
    }
  }

  /**
   * Restore data from localStorage
   */
  async restoreFromLocal() {
    try {
      const backupData = localStorage.getItem('planmyhike_backup');
      if (!backupData) {
        throw new Error('No local backup found');
      }

      const data = JSON.parse(backupData);
      await this.importData(data);
      return true;
    } catch (error) {
      console.error('Failed to restore from localStorage:', error);
      throw error;
    }
  }

  /**
   * Get sync status
   */
  getSyncStatus() {
    return {
      isOnline: this.isOnline,
      lastSyncTime: this.lastSyncTime,
      hasLocalBackup: !!localStorage.getItem('planmyhike_backup'),
      backupTimestamp: localStorage.getItem('backup_timestamp')
    };
  }

  /**
   * Setup automatic backup to localStorage
   */
  setupAutoBackup() {
    // Backup whenever data changes
    this.db.sections.hook('creating', () => this.scheduleBackup());
    this.db.sections.hook('updating', () => this.scheduleBackup());
    this.db.sections.hook('deleting', () => this.scheduleBackup());
    
    this.db.foods.hook('creating', () => this.scheduleBackup());
    this.db.foods.hook('updating', () => this.scheduleBackup());
    this.db.foods.hook('deleting', () => this.scheduleBackup());
  }

  /**
   * Schedule a backup (debounced)
   */
  scheduleBackup() {
    clearTimeout(this.backupTimeout);
    this.backupTimeout = setTimeout(() => {
      this.backupToLocal();
    }, 5000); // Backup 5 seconds after last change
  }

  /**
   * Update last sync time
   */
  updateLastSyncTime() {
    this.lastSyncTime = new Date().toISOString();
    localStorage.setItem('lastSyncTime', this.lastSyncTime);
  }

  /**
   * Notify UI about status changes
   */
  notifyStatusChange() {
    // Dispatch custom event for UI to listen to
    window.dispatchEvent(new CustomEvent('syncStatusChange', {
      detail: this.getSyncStatus()
    }));
  }

  /**
   * Get data statistics
   */
  async getDataStats() {
    const [sectionsCount, foodsCount] = await Promise.all([
      this.db.sections.count(),
      this.db.foods.count()
    ]);

    return {
      sections: sectionsCount,
      foods: foodsCount,
      total: sectionsCount + foodsCount
    };
  }
}