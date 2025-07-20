import Router from "./Router.js"
import Food from "./Food.js"
import Section from "./Section.js"
import GPSTracker from "./GPSTracker.js"
import MileLogger from "./MileLogger.js"

console.debug("app booting...")

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
})

db.foods.mapToClass(Food)
db.sections.mapToClass(Section)

// Initialize GPS tracker and mile logger
window.gpsTracker = new GPSTracker()
window.mileLogger = new MileLogger()

// Load mile logging data
window.mileLogger.loadLogs()

Router.init()
