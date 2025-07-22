export default class SyncManager {
  constructor(db) {
    this.db = db
    this.statusElement = null
    this.textElement = null
    this.iconElement = null
    this.isOnline = navigator.onLine
    this.init()
  }

  init() {
    // Get sync status elements
    this.statusElement = document.getElementById("sync-status")
    if (this.statusElement) {
      this.textElement = this.statusElement.querySelector(".sync-text")
      this.iconElement = this.statusElement.querySelector(".sync-icon")
      
      // Add click handler to sync status for manual sync
      this.statusElement.addEventListener("click", () => {
        this.triggerSync()
      })
    }

    // Listen to online/offline events
    window.addEventListener("online", () => {
      this.isOnline = true
      this.updateSyncStatus("connecting", "Connecting...", "cloud_sync")
      setTimeout(() => this.updateSyncStatus(), 1000)
    })

    window.addEventListener("offline", () => {
      this.isOnline = false
      this.updateSyncStatus("offline", "Offline", "cloud_off")
    })

    // Set up database event listeners for sync foundation
    this.setupSyncEventListeners()

    // Check initial sync status
    this.updateSyncStatus()
  }

  setupSyncEventListeners() {
    // Listen for basic sync events that we emit manually
    if (this.db.syncEvents) {
      this.db.syncEvents.on("syncStarted", () => {
        this.updateSyncStatus("syncing", "Syncing...", "cloud_sync")
      })

      this.db.syncEvents.on("syncComplete", () => {
        this.updateSyncStatus("synced", "Synced", "cloud_done")
      })

      this.db.syncEvents.on("syncError", (error) => {
        console.error("Sync error:", error)
        this.updateSyncStatus("error", "Sync Error", "cloud_off")
      })
    }

    // TODO: Replace with real Dexie Cloud event listeners when implemented
    // Example for when Dexie Cloud addon is added:
    /*
    if (this.db.cloud && this.db.cloud.events) {
      this.db.cloud.events.subscribe("syncComplete", () => {
        this.updateSyncStatus("synced", "Synced", "cloud_done")
      })
      // ... other cloud events
    }
    */
  }

  updateSyncStatus(status = null, text = null, icon = null) {
    if (!this.statusElement) return

    // Determine status based on current state if not provided
    if (!status) {
      if (!this.isOnline) {
        status = "offline"
        text = "Offline"
        icon = "cloud_off"
      } else if (this.db.syncConfig && this.db.syncConfig.enabled) {
        status = "synced"
        text = "Sync Ready"
        icon = "cloud_done"
      } else {
        status = "offline"
        text = "Sync Disabled"
        icon = "cloud_off"
      }
    }

    // Remove all status classes
    this.statusElement.classList.remove("synced", "syncing", "error", "offline")
    
    // Add current status class
    if (status !== "connecting") {
      this.statusElement.classList.add(status)
    }

    // Update text and icon
    if (this.textElement && text) {
      this.textElement.textContent = text
    }
    if (this.iconElement && icon) {
      this.iconElement.textContent = icon
    }

    // Update tooltip
    this.statusElement.title = `Sync Status: ${text || status}`

    console.debug(`Sync status updated: ${status} - ${text || status}`)
  }

  // Manual sync trigger (ready for real implementation)
  async triggerSync() {
    if (!this.isOnline) {
      this.updateSyncStatus("offline", "Device Offline", "cloud_off")
      return
    }

    if (!this.db.syncConfig || !this.db.syncConfig.enabled) {
      this.updateSyncStatus("offline", "Sync Not Configured", "cloud_off")
      console.warn("Sync not configured. Please set up Dexie Cloud to enable sync.")
      return
    }

    try {
      this.db.syncEvents.emit("syncStarted")
      
      // TODO: Replace with actual sync implementation
      // This is a placeholder that simulates sync
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Update last sync time
      this.db.syncConfig.lastSync = new Date().toISOString()
      localStorage.setItem('lastSync', this.db.syncConfig.lastSync)
      
      this.db.syncEvents.emit("syncComplete")
      
    } catch (error) {
      console.error("Manual sync failed:", error)
      this.db.syncEvents.emit("syncError", error)
    }
  }

  // Get current sync status
  async getSyncStatus() {
    return {
      enabled: this.db.syncConfig?.enabled || false,
      online: this.isOnline,
      lastSync: this.db.syncConfig?.lastSync || localStorage.getItem('lastSync'),
      configured: !!(this.db.syncConfig?.url)
    }
  }

  // Enable sync (when cloud service is configured)
  enableSync(config = {}) {
    if (this.db.syncConfig) {
      this.db.syncConfig.enabled = true
      this.db.syncConfig.url = config.url || this.db.syncConfig.url
      this.db.syncConfig.autoSync = config.autoSync !== false
      this.updateSyncStatus()
    }
  }

  // Disable sync
  disableSync() {
    if (this.db.syncConfig) {
      this.db.syncConfig.enabled = false
      this.updateSyncStatus()
    }
  }
}