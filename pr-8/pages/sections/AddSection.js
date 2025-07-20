import Renderer from "../../js/Renderer.js"
import Section from "../../js/Section.js"

class AddSection extends Renderer {
  constructor(section) {
    super()
    this.section = section
  }

  static renderTrigger(parent) {
    const button = document.createElement("button")
    button.innerText = "➕"
    button.addEventListener("click", () => AddSection.render())

    parent.appendChild(button)
  }

  static render(section = new Section()) {
    return new AddSection(section).render()
  }

  render() {
    this.div = document.createElement("div")
    this.div.classList.add("card", "float")
    this.nameInput = this.renderNameInput(this.div)
    this.startMile = this.renderNumberInput(
      this.div,
      this.section.startMile,
      "Start Mile",
    )
    this.endMile = this.renderNumberInput(
      this.div,
      this.section.endMile,
      "End Mile",
    )
    this.caloriesPerDay = this.renderNumberInput(
      this.div,
      this.section.caloriesPerDay,
      "Cal/day",
    )
    this.days = this.renderNumberInput(this.div, this.section.days, "Days")

    this.saveButton = this.renderButton(this.div, "Save", () => this.save())

    document.body.appendChild(this.div)
  }

  renderNameInput(parent) {
    const div = document.createElement("div")
    const input = document.createElement("input")
    input.placeholder = "Name"
    input.value = this.section.name

    div.appendChild(input)
    parent.appendChild(div)

    return input
  }

  save() {
    if (!this.validate()) {
      return false
    }

    this.section.name = this.nameInput.value
    this.section.startMile = this.startMile.value
    this.section.endMile = this.endMile.value
    this.section.caloriesPerDay = this.caloriesPerDay.value
    this.section.days = this.days.value

    this.section.save().then((id) => window.location = `#/sections/${id}/food`)

    this.div.remove()
  }

  validate() {
    if (!this.nameInput.value.trim()) {
      this.renderError("Name is required")
      return false
    }

    return true
  }

  renderError(message) {
    const errorDiv = document.createElement("div")
    errorDiv.className = "error"
    errorDiv.textContent = message

    errorDiv.addEventListener("click", () => {
      errorDiv.remove()
    })

    this.nameInput.addEventListener("input", () => {
      errorDiv.remove()
    })

    this.div.appendChild(errorDiv)
  }
}

export default AddSection
