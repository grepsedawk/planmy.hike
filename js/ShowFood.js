import Renderer from "./Renderer.js"

class ShowFood extends Renderer {
  constructor(food) {
    super()
    this.food = food
  }
  
  static render(parent) {
    db.foods
      .toArray()
      .then((foods) =>
        foods.forEach((food) => this.renderFood(food))
      )
  }
  
  static renderFood(food) {
    let foodRenderer = new ShowFood(food)
    foodRenderer.render()
    
    return foodRenderer
  }
  
  addDetail(parent, value, label, unit = "") {
    const container = document.createElement("div")
    const valueDisplay = document.createElement("div")
    const labelDisplay = document.createElement("div")
    
    valueDisplay.innerText = value + unit
    labelDisplay.innerText = label
    
    container.appendChild(valueDisplay)
    container.appendChild(labelDisplay)
    
    parent.appendChild(container)
    
    return container
  }

  render() {
    this.div = document.createElement("div")
    this.div.classList.add("card")
    
    const title = document.createElement("h3")
    title.innerText = this.food.name

    this.div.appendChild(title)
    
    const details = document.createElement("div")
    details.classList.add("details")
    
    this.addDetail(details, this.food.calories, "cal")
    this.addDetail(details, this.food.carbs, "carbs", "g")
    this.addDetail(details, this.food.protein, "protein", "g")
    this.addDetail(details, this.food.fat, "fat", "g")
    
    this.div.appendChild(details)


    this.deleteButton = this.renderButton(this.div, "Delete", () => this.delete())
    this.deleteButton.classList.add("red")

    document.body.appendChild(this.div)
  }
  
  delete() {
    this.food.delete()
    this.div.remove()
  } 
}

export default ShowFood