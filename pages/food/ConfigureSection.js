import Renderer from "../../js/Renderer.js"

class ConfigureSection extends Renderer {
  static async render(parent, section) {
    new ConfigureSection(parent, section).render()
  }

  constructor(parent, section) {
    super()
    this.parent = parent
    this.section = section
  }

  render() {
    this.div = document.createElement("div")
    this.div.classList.add("card")

    this.renderHeader()

    const details = document.createElement("div")
    details.classList.add("details")

    this.addEditableElement(
      details,
      this.section.name || "Section Name",
      "name",
      "text",
      (value) => {
        this.section.name = value
        this.section.save()
      },
    )

    this.addEditableElement(
      details,
      this.section.currentMile || 0,
      "current mile",
      "number",
      (value) => {
        this.section.currentMile = value
        this.section.save()
      },
      {
        unit: "mi",
        round: 2,
      },
    )

    this.addEditableElement(
      details,
      this.section.caloriesPerDay,
      "per day",
      "number",
      (value) => {
        this.section.caloriesPerDay = value
        this.section.save()
      },
      {
        unit: "kcal",
        round: 0,
      },
    )

    this.addEditableElement(
      details,
      this.section.days,
      "days",
      "number",
      (value) => {
        this.section.days = value
        this.section.save()
      },
    )

    this.div.appendChild(details)
    this.parent.innerHTML = ""
    this.parent.appendChild(this.div)
  }

  renderHeader() {
    const title = document.createElement("h3")
    title.innerText = "Section Configuration"
    this.div.appendChild(title)

    const description = document.createElement("p")
    description.innerText = "Click/tap values to edit"
    this.div.appendChild(description)
  }
}

export default ConfigureSection
