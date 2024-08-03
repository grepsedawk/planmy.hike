import Renderer from "./Renderer.js"
import Section from "./Section.js"

class EditSection extends Renderer {
  constructor(section) {
    super()
    this.section = section
  }

  static renderTrigger(parent) {
    const button = document.createElement("button")
    button.innerText = "🔧"
    button.addEventListener("click", () => EditSection.render())

    parent.appendChild(button)
  }

  static render(section = new Section()) {
    return new EditSection(section).render()
  }

  render() {
    this.div = document.createElement("div")
    this.div.classList.add("card", "float")
    this.nameInput = this.renderNameInput(this.div)

    this.saveButton = this.renderButton(this.div, "Save", () => this.save())

    document.body.appendChild(this.div)
  }

  renderNameInput(parent) {
    const input = document.createElement("input")
    input.placeholder = "Name"
    input.value = this.section.name

    parent.appendChild(input)

    return input
  }

  save() {
    if (!this.validate()) {
      return false
    }

    this.section.name = this.nameInput.value
    // this.food.calories = parseInt(this.calInput.value)
    this.section.save()

    this.div.remove()
    // ShowFood.renderFood(this.food)
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

export default EditSection
