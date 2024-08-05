import Renderer from "../../js/Renderer.js"
import ShowTotals from "../../js/ShowTotals.js"
import NewFood from "../../js/NewFood.js"
import ShowFood from "../../js/ShowFood.js"
import BarcodeScannerRenderer from "../../js/BarcodeScannerRenderer.js"
import Page from "../../js/Page.js"

class FoodPage extends Page {
  constructor(parent, params) {
    super()
    this.parent = parent
    this.template = "./pages/food/index.html"
    this.title = "Food Planner"
    this.description = "plan food fast"

    if (params["id"]) {
      console.log(params["id"])
    }
  }

  async render() {
    await this.renderPage()

    const quickActions = document.getElementById("quickActions")

    ShowTotals.render(document.getElementById("totals"))
    ShowFood.render()
    BarcodeScannerRenderer.renderTrigger(quickActions)
    NewFood.renderTrigger(quickActions)
  }
}

export default FoodPage
