import Renderer from "../../js/Renderer.js"
import ShowTotals from "./ShowTotals.js"

class ShowFood extends Renderer {
  constructor(food, section) {
    super()
    this.food = food
    this.section = section
  }

  static render(parent, section) {
    section.foods
      .toArray()
      .then((foods) => foods.forEach((food) => this.renderFood(food, section)))
  }

  static renderFood(food, section) {
    let foodRenderer = new ShowFood(food, section)
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

    this.addDetail(details, this.food.netWeight, "net weight", "g")
    this.addDetail(details, this.food.totalCalories, "cal")
    this.addDetail(details, this.food.totalCarbs, "carbs", "g")
    this.addDetail(details, this.food.totalProtein, "protein", "g")
    this.addDetail(details, this.food.totalFat, "fat", "g")

    this.div.appendChild(details)

    this.deleteButton = this.renderButton(this.div, "Delete", () =>
      this.delete(),
    )
    this.deleteButton.classList.add("red")

    document.getElementById("content").appendChild(this.div)
  }

  delete() {
    this.food.delete()
    this.div.remove()
    ShowTotals.render(document.getElementById("totals"), this.section)
  }
}

export default ShowFood
