import Renderer from "../../js/Renderer.js"
import Section from "../../js/Section.js"
import Food from "../../js/Food.js"
import ShowTotals from "../../js/ShowTotals.js"
import NewFood from "../../js/NewFood.js"
import EditSection from "../../js/EditSection.js"
import ShowFood from "../../js/ShowFood.js"
import BarcodeScannerRenderer from "../../js/BarcodeScannerRenderer.js"

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
    `
})

db.foods.mapToClass(Food)
db.sections.mapToClass(Section)

const render = () => {
ShowTotals.render(document.getElementById("totals"))
ShowFood.render()
BarcodeScannerRenderer.renderTrigger(document.getElementById("quickActions"))
NewFood.renderTrigger(document.getElementById("quickActions"))
EditSection.renderTrigger(document.getElementById("quickActions"))
}

export default render