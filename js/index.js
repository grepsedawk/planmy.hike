import Router from "./Router.js"
import Food from "./Food.js"
import Section from "./Section.js"
import Gear from "./Gear.js"
import GearCategory from "./GearCategory.js"
import GPSTracker from "./GPSTracker.js"
import MileLogger from "./MileLogger.js"
import SyncManager from "./SyncManager.js"

console.debug("app booting...")

// Register service worker for PWA functionality
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./sw.js")
      .then((registration) => {
        console.log("SW registered: ", registration)
      })
      .catch((registrationError) => {
        console.log("SW registration failed: ", registrationError)
      })
  })
}

// Configure Dexie database
window.db = new Dexie("planmyhikedev2")

// Add sync configuration foundation (to be extended with actual cloud service)
db.syncConfig = {
  enabled: false, // Set to true when cloud service is configured
  url: null, // Will be set to actual cloud URL when configured
  lastSync: null,
  autoSync: true
}

// Basic sync event emitter for extensibility
db.syncEvents = {
  listeners: {},
  emit: function(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data))
    }
  },
  on: function(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = []
    }
    this.listeners[event].push(callback)
  }
}

db.version(1).stores({
  foods: `
    ++id,
    sectionId,
    name,
    quantity,
    calories,
    carbs,
    protein,
    fat,
    netWeight,
    servingSize
    `,
  sections: `
    ++id,
    name,
    startMile,
    endMile,
    currentMile,
    caloriesPerDay,
    days,
    gpsTrackingEnabled,
    trail
    `,
  gear: `
    ++id,
    name,
    weight,
    price,
    description,
    vendor,
    url,
    categoryId,
    quantity,
    notes,
    dateAdded,
    lastUsed,
    timesUsed
    `,
  gearCategories: `
    ++id,
    name,
    description,
    color,
    dateCreated
    `,
})

db.foods.mapToClass(Food)
db.sections.mapToClass(Section)
db.gear.mapToClass(Gear)
db.gearCategories.mapToClass(GearCategory)

// Initialize GPS tracker and mile logger
window.gpsTracker = new GPSTracker()
window.mileLogger = new MileLogger()

// Initialize sync manager after ensuring database is ready
try {
  window.syncManager = new SyncManager(db)
  console.debug("SyncManager initialized successfully")
} catch (error) {
  console.error("Failed to initialize SyncManager:", error)
}

// Load mile logging data
window.mileLogger.loadLogs()

Router.init()
