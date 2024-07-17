import Renderer from "./Renderer.js"
import Food from "./Food.js"
import ShowFood from "./ShowFood.js"
import ShowTotals from "./ShowTotals.js"

class NewFood extends Renderer {
  constructor(food = new Food()) {
    super()
    this.food = food
  }
  
  static renderTrigger() {
    const button = document.createElement("button")
    // TODO: css flex out these action buttons
    button.innerText = "🆕"
    button.style = "position: fixed; bottom: 4rem; right: 1rem; height: 3rem; width: 3rem"
    button.addEventListener("click", () => new NewFood().render())

    document.body.appendChild(button) 
  }
  
  static render(food = new Food()) {
    return new NewFood(food).render()
  }
  
  render() {
    this.div = document.createElement("div")
    this.div.classList.add("card", "float")
    this.nameInput = this.renderNameInput(this.div) 
    
    this.calInput = this.renderNumberInput(this.div, this.food.calories, "Calories")
    this.carbsInput = this.renderNumberInput(this.div, this.food.carbs, "Carbs") 
    this.proteinInput = this.renderNumberInput(this.div, this.food.protein, "Protein")
    this.fatInput = this.renderNumberInput(this.div, this.food.fat, "Fat")
    
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
    this.food.calories = parseInt(this.calInput.value)
    this.food.carbs = parseInt(this.carbsInput.value)
    this.food.protein = parseInt(this.proteinInput.value)
    this.food.fat = parseInt(this.fatInput.value)
    
    this.food.save()
    
    this.div.remove()
    ShowFood.renderFood(this.food) 
    
    ShowTotals .render(document.getElementById("totals"))
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

export default NewFood