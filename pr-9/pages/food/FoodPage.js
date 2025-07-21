import Renderer from "../../js/Renderer.js"
import ShowTotals from "./ShowTotals.js"
import NewFood from "./NewFood.js"
import ShowFood from "./ShowFood.js"
import BarcodeScannerRenderer from "./BarcodeScannerRenderer.js"
import GPSButton from "./GPSButton.js"
import Page from "../../js/Page.js"
import Section from "../../js/Section.js"
import ConfigureSection from "./ConfigureSection.js"

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

    Section.find(this.sectionId)
      .then(async (section) => {
        await ShowTotals.render(document.getElementById("totals"), section)
        ConfigureSection.render(
          document.getElementById("configSection"),
          section,
        )
        ShowFood.render(document.getElementById("food"), section)
        NewFood.renderTrigger(quickActions, section)
        BarcodeScannerRenderer.renderTrigger(quickActions, section)
        GPSButton.renderTrigger(quickActions, section)
      })
      .catch((e) => (window.location = "#/404"))
  }
}

export default FoodPage
