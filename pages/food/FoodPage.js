import Renderer from "../../js/Renderer.js"
import ShowTotals from "../../js/ShowTotals.js"
import NewFood from "../../js/NewFood.js"
import ShowFood from "../../js/ShowFood.js"
import BarcodeScannerRenderer from "../../js/BarcodeScannerRenderer.js"
import Page from "../../js/Page.js"
import Section from "../../js/Section.js"

class FoodPage extends Page {
  constructor(parent, params) {
    super()
    this.parent = parent
    this.template = "./pages/food/index.html"
    this.title = "Food Planner"
    this.description = "plan food fast"
    this.sectionId = parseInt(params["id"])
  }

  async render() {
    await this.renderPage()

    const quickActions = document.getElementById("quickActions")

    Section.find(this.sectionId).then(async (section) => {
      await ShowTotals.render(document.getElementById("totals"), section)
      await ShowFood.render(document.getElementById("food"), section)
      await NewFood.renderTrigger(quickActions, section)
    })
    await BarcodeScannerRenderer.renderTrigger(quickActions)
  }
}

export default FoodPage
