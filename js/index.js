import Router from "./Router.js"
import Food from "./Food.js"
import Section from "./Section.js"

console.debug("app booting...")

// Register service worker for PWA functionality
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
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
    days
    `,
})

db.foods.mapToClass(Food)
db.sections.mapToClass(Section)

Router.init()
