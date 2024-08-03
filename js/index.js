import Router from "./Router.js"
import Food from "./Food.js"
import Section from "./Section.js"

window.db = new Dexie("planmyhike")

db.version(1).stores({
  foods: `
    ++id,
    name,
    calories,
    carbs,
    protein,
    fat`,
  sections: `
    ++id,
    name,
    startMile,
    endMile,
    currentMile,
    caloriesPerDay,
    milesPerDay
    `,
})

db.foods.mapToClass(Food)
db.sections.mapToClass(Section)
console.log("db done")
Router.init()
