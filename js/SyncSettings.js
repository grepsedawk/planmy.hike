/**
 * SyncSettings - UI component for managing sync settings and status
 */

export default class SyncSettings {
  constructor(syncManager) {
    this.syncManager = syncManager;
  }

  /**
   * Show sync settings modal
   */
  showSyncModal() {
    const modal = this.createSyncModal();
    document.body.appendChild(modal);
    
    // Setup event listeners
    this.setupModalEventListeners(modal);
    
    // Show modal with existing styles
    modal.style.display = 'flex';
    
    // Update status
    this.updateModalStatus(modal);
  }

  /**
   * Create sync settings modal HTML
   */
  createSyncModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';

    modal.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <h2 class="text-xl font-bold">
            <span class="material-icons mr-2">sync</span>
            Sync Settings
          </h2>
          <button class="close-modal btn-icon">
            <span class="material-icons">close</span>
          </button>
        </div>

        <div class="modal-body">
          <div class="space-y-4">
            <!-- Sync Status -->
            <div class="card">
              <div class="card-header">
                <h3 class="card-title">
                  <span class="material-icons text-sm mr-1">info</span>
                  Sync Status
                </h3>
              </div>
              <div class="card-content">
                <div id="syncModalStatus">
                  <!-- Status will be updated here -->
                </div>
              </div>
            </div>

            <!-- Data Statistics -->
            <div class="card">
              <div class="card-header">
                <h3 class="card-title">
                  <span class="material-icons text-sm mr-1">analytics</span>
                  Data Statistics
                </h3>
              </div>
              <div class="card-content">
                <div id="dataStats">
                  <!-- Stats will be updated here -->
                </div>
              </div>
            </div>

            <!-- Sync Actions -->
            <div class="card">
              <div class="card-header">
                <h3 class="card-title">
                  <span class="material-icons text-sm mr-1">sync_alt</span>
                  Sync Actions
                </h3>
              </div>
              <div class="card-content">
                <div class="grid grid-cols-2 gap-3 mb-3">
                  <button class="btn btn-outline export-data-btn">
                    <span class="material-icons text-sm mr-1">download</span>
                    Export Data
                  </button>
                  <button class="btn btn-outline import-data-btn">
                    <span class="material-icons text-sm mr-1">upload</span>
                    Import Data
                  </button>
                </div>

                <div class="grid grid-cols-2 gap-3">
                  <button class="btn btn-outline backup-local-btn">
                    <span class="material-icons text-sm mr-1">save</span>
                    Backup Locally
                  </button>
                  <button class="btn btn-outline restore-local-btn">
                    <span class="material-icons text-sm mr-1">restore</span>
                    Restore Local
                  </button>
                </div>
              </div>
            </div>

            <!-- Sync Information -->
            <div class="card">
              <div class="card-header">
                <h3 class="card-title">
                  <span class="material-icons text-sm mr-1">help</span>
                  How Sync Works
                </h3>
              </div>
              <div class="card-content">
                <ul class="text-sm space-y-1 text-tertiary">
                  <li>• Data is automatically backed up locally when changes are made</li>
                  <li>• Export your data to create a backup file</li>
                  <li>• Import the backup file on other devices to sync data</li>
                  <li>• Local backups are stored in your browser's storage</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-primary close-modal">Done</button>
        </div>
      </div>
    `;

    return modal;
  }

  /**
   * Setup event listeners for the modal
   */
  setupModalEventListeners(modal) {
    // Close modal buttons
    modal.querySelectorAll('.close-modal').forEach(btn => {
      btn.addEventListener('click', () => this.closeSyncModal(modal));
    });

    // Click outside to close
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.closeSyncModal(modal);
      }
    });

    // Export data button
    modal.querySelector('.export-data-btn').addEventListener('click', async () => {
      try {
        await this.syncManager.downloadBackup();
        this.showToast('Data exported successfully!', 'success');
      } catch (error) {
        this.showToast('Error exporting data: ' + error.message, 'error');
      }
    });

    // Import data button
    modal.querySelector('.import-data-btn').addEventListener('click', () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.onchange = async (e) => {
        try {
          const file = e.target.files[0];
          if (!file) return;
          
          if (confirm('This will merge the imported data with your existing data. Continue?')) {
            await this.syncManager.uploadBackup(file);
            this.showToast('Data imported successfully!', 'success');
            this.updateModalStatus(modal);
          }
        } catch (error) {
          this.showToast('Error importing data: ' + error.message, 'error');
        }
      };
      input.click();
    });

    // Backup locally button
    modal.querySelector('.backup-local-btn').addEventListener('click', async () => {
      try {
        await this.syncManager.backupToLocal();
        this.showToast('Data backed up locally!', 'success');
        this.updateModalStatus(modal);
      } catch (error) {
        this.showToast('Error backing up data', 'error');
      }
    });

    // Restore local button
    modal.querySelector('.restore-local-btn').addEventListener('click', async () => {
      try {
        if (confirm('This will restore data from your local backup. Continue?')) {
          await this.syncManager.restoreFromLocal();
          this.showToast('Data restored from local backup!', 'success');
          this.updateModalStatus(modal);
        }
      } catch (error) {
        this.showToast('Error restoring data: ' + error.message, 'error');
      }
    });
  }

  /**
   * Update modal status information
   */
  async updateModalStatus(modal) {
    const status = this.syncManager.getSyncStatus();
    const stats = await this.syncManager.getDataStats();

    // Update sync status
    const statusEl = modal.querySelector('#syncModalStatus');
    statusEl.innerHTML = `
      <div class="flex items-center gap-2 mb-2">
        <span class="material-icons text-sm ${status.isOnline ? 'text-green-500' : 'text-gray-400'}">
          ${status.isOnline ? 'cloud_done' : 'cloud_off'}
        </span>
        <span class="font-medium">${status.isOnline ? 'Online' : 'Offline'}</span>
      </div>
      ${status.lastSyncTime ? 
        `<div class="text-sm text-gray-600">Last backup: ${new Date(status.lastSyncTime).toLocaleString()}</div>` : 
        '<div class="text-sm text-gray-600">No backup yet</div>'
      }
      ${status.hasLocalBackup ? 
        `<div class="text-sm text-green-600">✓ Local backup available (${new Date(status.backupTimestamp).toLocaleString()})</div>` : 
        '<div class="text-sm text-gray-600">No local backup</div>'
      }
    `;

    // Update data stats
    const statsEl = modal.querySelector('#dataStats');
    statsEl.innerHTML = `
      <div class="grid grid-cols-3 gap-4 text-center">
        <div>
          <div class="text-lg font-bold text-blue-600">${stats.sections}</div>
          <div class="text-sm text-gray-600">Sections</div>
        </div>
        <div>
          <div class="text-lg font-bold text-green-600">${stats.foods}</div>
          <div class="text-sm text-gray-600">Foods</div>
        </div>
        <div>
          <div class="text-lg font-bold text-purple-600">${stats.total}</div>
          <div class="text-sm text-gray-600">Total Items</div>
        </div>
      </div>
    `;
  }

  /**
   * Close sync modal
   */
  closeSyncModal(modal) {
    modal.style.display = 'none';
    document.body.removeChild(modal);
  }

  /**
   * Show toast notification
   */
  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 20px;
      background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
      color: white;
      border-radius: 6px;
      z-index: 1001;
      max-width: 300px;
    `;
    toast.textContent = message;

    document.body.appendChild(toast);

    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, 3000);
  }
}