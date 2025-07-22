# Dexie.js Sync Setup Guide

This guide explains how to set up real-time synchronization for Plan My Hike using Dexie.js Cloud.

## Current Implementation

The app includes a sync framework foundation with:
- ✅ Sync status indicator in the navigation bar
- ✅ Offline/online detection
- ✅ Manual sync triggering (click the sync status)
- ✅ Event system for sync state management
- ✅ Extensible architecture for cloud integration

## Setting Up Real Sync

To enable real synchronization across devices, follow these steps:

### 1. Set Up Dexie Cloud Service

Option A: Use Dexie Cloud (Official Service)
1. Visit [Dexie Cloud](https://dexie.org/cloud/)
2. Create an account and set up your database
3. Get your database URL

Option B: Self-Host Dexie Cloud
1. Follow the [self-hosting guide](https://dexie.org/cloud/docs/self-hosting)
2. Deploy your own Dexie Cloud instance
3. Note your server URL

### 2. Add Dexie Cloud Addon

Uncomment the cloud addon script in `index.html`:

```html
<!-- Change this: -->
<!-- <script src="https://unpkg.com/dexie-cloud-addon@latest/dist/dexie-cloud-addon.js"></script> -->

<!-- To this: -->
<script src="https://unpkg.com/dexie-cloud-addon@latest/dist/dexie-cloud-addon.js"></script>
```

### 3. Configure Database for Sync

Update `js/index.js` to enable cloud sync:

```javascript
// Replace the current database configuration with:
window.db = new Dexie("planmyhikedev2", {
  addons: [DexieCloudAddon]
})

// Configure cloud sync
db.cloud.configure({
  databaseUrl: "YOUR_DEXIE_CLOUD_URL_HERE", // Replace with your actual URL
  tryUseServiceWorker: true,
  requireAuth: false // Set to true if you want to require authentication
})
```

### 4. Update SyncManager

In `js/SyncManager.js`, uncomment and use the real cloud event listeners:

```javascript
// Replace the TODO section in setupSyncEventListeners() with:
if (this.db.cloud && this.db.cloud.events) {
  this.db.cloud.events.subscribe("syncComplete", () => {
    this.updateSyncStatus("synced", "Synced", "cloud_done")
  })

  this.db.cloud.events.subscribe("syncStarted", () => {
    this.updateSyncStatus("syncing", "Syncing...", "cloud_sync")
  })

  this.db.cloud.events.subscribe("syncError", (error) => {
    console.error("Sync error:", error)
    this.updateSyncStatus("error", "Sync Error", "cloud_off")
  })

  this.db.cloud.events.subscribe("ready", () => {
    this.updateSyncStatus("synced", "Ready", "cloud_done")
  })

  this.db.cloud.events.subscribe("disconnected", () => {
    this.updateSyncStatus("offline", "Offline", "cloud_off")
  })
}
```

### 5. Enable Sync in the App

Call the enableSync method with your configuration:

```javascript
// After database initialization
window.syncManager.enableSync({
  url: "YOUR_DEXIE_CLOUD_URL_HERE",
  autoSync: true
})
```

## Features Available After Setup

Once configured, users will have:

- **Real-time sync** across all devices
- **Offline support** with automatic sync when back online
- **Conflict resolution** handled by Dexie Cloud
- **User authentication** (optional)
- **Visual sync status** with live updates
- **Manual sync trigger** by clicking the sync status

## Sync Status Indicators

The sync status indicator shows:
- 🔄 **Syncing** - Data is being synchronized
- ✅ **Synced** - All data is up to date
- ❌ **Error** - Sync failed (check console for details)
- ⚫ **Offline** - Device is offline or sync is disabled

## Development Notes

- The current implementation provides a foundation for sync without requiring cloud setup
- All database operations remain functional without sync
- The sync framework is designed to be easily extensible
- Error handling and offline support are built-in

## Testing Sync

To test sync functionality:
1. Set up sync following the steps above
2. Open the app on multiple devices/browsers
3. Create sections, add food items, or gear
4. Verify changes appear on other devices
5. Test offline behavior by disconnecting internet

## Troubleshooting

Common issues and solutions:

**Sync status shows "Sync Disabled"**
- Ensure Dexie Cloud addon is loaded
- Check that `enableSync()` has been called
- Verify your database URL is correct

**"Cannot use import statement" error**
- This indicates a module loading issue with the cloud addon
- Try using a different CDN or version of the addon

**Data not syncing between devices**
- Check browser console for sync errors
- Verify internet connectivity
- Ensure both devices are using the same database URL

For more detailed information, see the [Dexie Cloud documentation](https://dexie.org/cloud/docs/).