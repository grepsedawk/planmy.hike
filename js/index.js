import Router from "./Router.js"
import Food from "./Food.js"
import Section from "./Section.js"
import Gear from "./Gear.js"
import GearCategory from "./GearCategory.js"
import GPSTracker from "./GPSTracker.js"
import MileLogger from "./MileLogger.js"

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

window.db = new Dexie("planmyhikedev2")

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

// Load mile logging data
window.mileLogger.loadLogs()

Router.init()
