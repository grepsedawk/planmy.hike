import Router from "./Router.js"
import Food from "./Food.js"
import Section from "./Section.js"

window.db = new Dexie("planmyhikedev")

db.version(1).stores({
  foods: `
    ++id,
    sectionId,
    name,
    calories,
    carbs,
    protein,
    fat 
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
