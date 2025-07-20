import Renderer from "../../js/Renderer.js"
import Food from "../../js/Food.js"
import ShowFood from "./ShowFood.js"
import ShowTotals from "./ShowTotals.js"

class NewFood extends Renderer {
  constructor(section, food = new Food()) {
    super()
    this.section = section
    this.food = food
  }

  static renderTrigger(parent, section) {
    const button = document.createElement("button")
    button.innerText = "🆕"
    button.addEventListener("click", () => new NewFood(section).render())

    parent.appendChild(button)
  }

  static render(section, food = new Food()) {
    return new NewFood(section, food).render()
  }

  render() {
    this.div = document.createElement("div")
    this.div.classList.add("card", "float")
    
    // Add close button
    this.closeButton = this.renderButton(this.div, "✕", () => this.close())
    this.closeButton.style.cssText = "position: absolute; top: 10px; right: 10px; width: 30px; height: 30px; padding: 0; border-radius: 50%; background: #ff4136; font-size: 16px;"
    
    this.nameInput = this.renderNameInput(this.div)
    this.quantity = this.renderNumberInput(
      this.div,
      this.food.quantity,
      "Quantity",
    )
    this.netWeight = this.renderNumberInput(
      this.div,
      this.food.netWeight,
      "Net Weight (g)",
    )
    this.servingSize = this.renderNumberInput(
      this.div,
      this.food.servingSize,
      "Serving Size (g)",
    )
    this.calInput = this.renderNumberInput(
      this.div,
      this.food.calories,
      "Calories [per serving]",
    )
    this.fatInput = this.renderNumberInput(
      this.div,
      this.food.fat,
      "Fat (g) [per serving]",
    )
    this.carbsInput = this.renderNumberInput(
      this.div,
      this.food.carbs,
      "Carbs (g) [per serving]",
    )
    this.proteinInput = this.renderNumberInput(
      this.div,
      this.food.protein,
      "Protein (g) [per serving]",
    )

    this.saveButton = this.renderButton(this.div, "Save", () => this.save())

    document.body.appendChild(this.div)
  }

  renderNameInput(parent) {
    const input = document.createElement("input")
    input.placeholder = "Name"
    input.value = this.food.name

    parent.appendChild(input)

    return input
  }

  save() {
    if (!this.validate()) {
      return false
    }

    this.food.name = this.nameInput.value
    this.food.quantity = parseFloat(this.quantity.value)
    this.food.calories = parseFloat(this.calInput.value)
    this.food.carbs = parseFloat(this.carbsInput.value)
    this.food.protein = parseFloat(this.proteinInput.value)
    this.food.fat = parseFloat(this.fatInput.value)
    this.food.netWeight = parseFloat(this.netWeight.value)
    this.food.servingSize = parseFloat(this.servingSize.value)
    this.food.sectionId = parseInt(this.section.id)

    this.food.save()

    this.div.remove()
    ShowFood.renderFood(
      document.getElementById("food"),
      this.food,
      this.section,
    )

    ShowTotals.render(document.getElementById("totals"), this.section)
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

  close() {
    this.div.remove()
  }
}

export default NewFood
