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
    button.classList.add("btn", "btn-primary", "btn-sm")
    button.innerHTML = `<span class="material-icons">add</span> Add Food`
    button.addEventListener("click", () => new NewFood(section).render())

    parent.appendChild(button)
  }

  static render(section, food = new Food()) {
    return new NewFood(section, food).render()
  }

  render() {
    // Create modal overlay
    this.overlay = document.createElement("div")
    this.overlay.classList.add("food-form-modal")
    
    this.div = document.createElement("div")
    this.div.classList.add("food-form-container")
    
    // Header
    const header = document.createElement("div")
    header.classList.add("food-form-header")
    
    const title = document.createElement("h3")
    title.textContent = this.food.id ? "Edit Food Item" : "Add New Food Item"
    title.style.margin = "0"
    
    this.closeButton = document.createElement("button")
    this.closeButton.classList.add("food-form-close")
    this.closeButton.innerHTML = `<span class="material-icons">close</span>`
    this.closeButton.addEventListener("click", () => this.close())
    
    header.appendChild(title)
    header.appendChild(this.closeButton)
    this.div.appendChild(header)
    
    // Form container
    const formContainer = document.createElement("div")
    formContainer.classList.add("food-form-grid")
    
    // Name input (full width)
    this.nameInput = this.renderFormGroup(formContainer, "Food Name", "text", this.food.name, "Enter food name...", ["food-form-group"])
    
    // Quantity and net weight
    this.quantity = this.renderFormGroup(formContainer, "Quantity", "number", this.food.quantity, "1", ["food-form-group-half"])
    this.netWeight = this.renderFormGroup(formContainer, "Net Weight (g)", "number", this.food.netWeight, "0", ["food-form-group-half"])
    
    // Serving size and calories
    this.servingSize = this.renderFormGroup(formContainer, "Serving Size (g)", "number", this.food.servingSize, "0", ["food-form-group-half"])
    this.calInput = this.renderFormGroup(formContainer, "Calories (per serving)", "number", this.food.calories, "0", ["food-form-group-half"])
    
    // Macros
    this.fatInput = this.renderFormGroup(formContainer, "Fat (g)", "number", this.food.fat, "0", ["food-form-group-half"])
    this.carbsInput = this.renderFormGroup(formContainer, "Carbs (g)", "number", this.food.carbs, "0", ["food-form-group-half"])
    this.proteinInput = this.renderFormGroup(formContainer, "Protein (g)", "number", this.food.protein, "0", ["food-form-group-half"])
    
    // Save button (full width)
    const buttonContainer = document.createElement("div")
    buttonContainer.classList.add("food-form-group")
    this.saveButton = document.createElement("button")
    this.saveButton.classList.add("btn", "btn-primary", "btn-lg")
    this.saveButton.innerHTML = `<span class="material-icons">save</span> Save Food Item`
    this.saveButton.style.width = "100%"
    this.saveButton.addEventListener("click", () => this.save())
    buttonContainer.appendChild(this.saveButton)
    
    formContainer.appendChild(buttonContainer)
    this.div.appendChild(formContainer)
    this.overlay.appendChild(this.div)
    
    // Close on overlay click
    this.overlay.addEventListener("click", (e) => {
      if (e.target === this.overlay) {
        this.close()
      }
    })
    
    document.body.appendChild(this.overlay)
    
    // Focus on name input
    setTimeout(() => this.nameInput.focus(), 100)
  }

  renderFormGroup(parent, label, type, value, placeholder, classNames = ["food-form-group"]) {
    const group = document.createElement("div")
    
    // Handle multiple class names properly
    if (Array.isArray(classNames)) {
      classNames.forEach(cls => {
        if (cls && cls.trim()) {
          group.classList.add(cls.trim())
        }
      })
    } else {
      // Fallback for string input
      const classes = classNames.split(" ")
      classes.forEach(cls => {
        if (cls.trim()) {
          group.classList.add(cls.trim())
        }
      })
    }
    
    const labelEl = document.createElement("label")
    labelEl.classList.add("form-label")
    labelEl.textContent = label
    
    const input = document.createElement("input")
    input.classList.add("form-control")
    input.type = type
    input.value = value || ""
    input.placeholder = placeholder
    
    group.appendChild(labelEl)
    group.appendChild(input)
    parent.appendChild(group)
    
    return input
  }

  save() {
    if (!this.validate()) {
      return false
    }

    this.food.name = this.nameInput.value
    this.food.quantity = parseFloat(this.quantity.value) || 1
    this.food.calories = parseFloat(this.calInput.value) || 0
    this.food.carbs = parseFloat(this.carbsInput.value) || 0
    this.food.protein = parseFloat(this.proteinInput.value) || 0
    this.food.fat = parseFloat(this.fatInput.value) || 0
    this.food.netWeight = parseFloat(this.netWeight.value) || 0
    this.food.servingSize = parseFloat(this.servingSize.value) || 0
    this.food.sectionId = parseInt(this.section.id)

    this.food.save()

    this.close()
    ShowFood.renderFood(
      document.getElementById("food"),
      this.food,
      this.section,
    )

    ShowTotals.render(document.getElementById("totals"), this.section)
  }

  validate() {
    // Remove any existing error messages
    const existingErrors = this.div.querySelectorAll(".error-message")
    existingErrors.forEach(error => error.remove())
    
    if (!this.nameInput.value.trim()) {
      this.renderError("Food name is required")
      return false
    }

    return true
  }

  renderError(message) {
    const errorDiv = document.createElement("div")
    errorDiv.className = "error-message"
    errorDiv.textContent = message
    
    errorDiv.addEventListener("click", () => {
      errorDiv.remove()
    })

    this.nameInput.addEventListener("input", () => {
      errorDiv.remove()
    })

    // Insert error after the form header
    const header = this.div.querySelector(".food-form-header")
    header.insertAdjacentElement("afterend", errorDiv)
  }

  close() {
    if (this.overlay) {
      this.overlay.remove()
    }
  }
}

export default NewFood
