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

    const configGrid = document.createElement("div")
    configGrid.classList.add("config-grid")

    this.addConfigItem(
      configGrid,
      this.section.name || "Section Name",
      "name",
      "text",
      (value) => {
        this.section.name = value
        this.section.save()
      },
    )

    this.addConfigItem(
      configGrid,
      this.section.startMile || 0,
      "start mile",
      "number",
      (value) => {
        this.section.startMile = value
        this.section.save()
      },
      {
        unit: "mi",
        round: 1,
      },
    )

    this.addConfigItem(
      configGrid,
      this.section.endMile || 0,
      "end mile",
      "number",
      (value) => {
        this.section.endMile = value
        this.section.save()
      },
      {
        unit: "mi",
        round: 1,
      },
    )

    this.addConfigItem(
      configGrid,
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

    this.addConfigItem(
      configGrid,
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

    this.addConfigItem(
      configGrid,
      this.section.days,
      "days",
      "number",
      (value) => {
        this.section.days = value
        this.section.save()
      },
    )

    this.div.appendChild(configGrid)
    this.parent.innerHTML = ""
    this.parent.appendChild(this.div)
  }

  addConfigItem(parent, value, label, type, callback, options = {}) {
    const item = document.createElement("div")
    item.classList.add("config-item")

    const valueDisplay = document.createElement("div")
    valueDisplay.classList.add("config-value")

    let displayValue = value
    if (type === "number" && options.round !== undefined) {
      displayValue = parseFloat(value).toFixed(options.round)
    }
    if (options.unit) {
      displayValue += ` ${options.unit}`
    }
    valueDisplay.textContent = displayValue

    const labelEl = document.createElement("div")
    labelEl.classList.add("config-label")
    labelEl.textContent = label

    item.appendChild(valueDisplay)
    item.appendChild(labelEl)

    // Make item editable on click
    item.addEventListener("click", () => {
      this.makeEditable(item, valueDisplay, value, type, callback, options)
    })

    parent.appendChild(item)
  }

  makeEditable(item, valueDisplay, currentValue, type, callback, options = {}) {
    const input = document.createElement("input")
    input.type = type
    input.value = currentValue
    input.classList.add("form-control")
    input.style.cssText =
      "text-align: center; font-weight: bold; color: var(--primary-600);"

    // Replace the value display with input
    item.replaceChild(input, valueDisplay)
    input.focus()
    input.select()

    const saveAndRevert = () => {
      let newValue = input.value
      if (type === "number") {
        newValue = parseFloat(newValue) || 0
      }

      callback(newValue)

      // Update display
      let displayValue = newValue
      if (type === "number" && options.round !== undefined) {
        displayValue = parseFloat(newValue).toFixed(options.round)
      }
      if (options.unit) {
        displayValue += ` ${options.unit}`
      }
      valueDisplay.textContent = displayValue

      item.replaceChild(valueDisplay, input)
    }

    input.addEventListener("blur", saveAndRevert)
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        saveAndRevert()
      } else if (e.key === "Escape") {
        item.replaceChild(valueDisplay, input)
      }
    })
  }

  renderHeader() {
    const header = document.createElement("div")
    header.classList.add("card-header")

    const title = document.createElement("h3")
    title.classList.add("card-title")
    title.innerHTML = `<span class="material-icons">settings</span> Section Configuration`

    const description = document.createElement("p")
    description.classList.add("card-subtitle")
    description.textContent = "Click any value to edit"

    header.appendChild(title)
    header.appendChild(description)
    this.div.appendChild(header)
  }
}

export default ConfigureSection
