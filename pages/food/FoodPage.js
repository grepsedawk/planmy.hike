import Renderer from "../../js/Renderer.js"
import Section from "../../js/Section.js"
import Food from "../../js/Food.js"
import ShowTotals from "../../js/ShowTotals.js"
import NewFood from "../../js/NewFood.js"
import EditSection from "../../js/EditSection.js"
import ShowFood from "../../js/ShowFood.js"
import BarcodeScannerRenderer from "../../js/BarcodeScannerRenderer.js"
import Page from "../../js/Page.js"

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

class FoodPage extends Page {
  constructor(parent) {
    super()
    this.parent = parent
    this.template = "/pages/food/index.html"
    this.title = "Food Planner"
    this.description = "plan food fast"
  }

  async render() {
    console.log("render()")
    await this.renderPage()
    console.log("rendered page")

    const quickActions = document.getElementById("quickActions")

    ShowTotals.render(document.getElementById("totals"))
    ShowFood.render()
    BarcodeScannerRenderer.renderTrigger(quickActions)
    NewFood.renderTrigger(quickActions)
    EditSection.renderTrigger(quickActions)
  }
}

export default FoodPage
