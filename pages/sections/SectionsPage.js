import Page from "../../js/Page.js"
import AddSection from "./AddSection.js"

class SectionPage extends Page {
  constructor(parent) {
    super()
    this.parent = parent
    // this.template = "/pages/food/index.html"
    this.title = "Section Planner"
    this.description = "plan hike fast"
  }

  async render() {
    await this.renderPage()

    const quickActions = document.createElement("div")
    quickActions.classList.add("quickActions")
    this.parent.appendChild(quickActions)

    AddSection.renderTrigger(quickActions)

    db.sections
      .toArray()
      .then((sections) => sections.forEach((s) => this.renderSection(s)))
  }

  renderSection(section) {
    let display = document.createElement("div")
    display.innerText = section.name
    display.addEventListener(
      "click",
      () => (window.location = `#/sections/${section.id}/food`),
    )
    //   display.addEventListener("click", () => AddSection.render(section))

    this.parent.appendChild(display)
  }
}

export default SectionPage
