import Renderer from "./Renderer.js"
import Food from "./Food.js"
import NewFood from "./NewFood.js"
import ShowFood from "./ShowFood.js"
import ShowTotals from "./ShowTotals.js"
import BarcodeScannerRenderer from "./BarcodeScannerRenderer.js"

window.db = new Dexie("foods")

db.version(1).stores({
  foods: `
    ++id,
    name,
    calories,
    carbs,
    protein,
    fat`
})

db.foods.mapToClass(Food)

ShowTotals.render(document.getElementById("totals"))
ShowFood.render()
BarcodeScannerRenderer.renderTrigger(document.getElementById("quickActions"))
NewFood.renderTrigger(document.getElementById("quickActions"))