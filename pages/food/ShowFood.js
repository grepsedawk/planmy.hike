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

  render() {
    this.div = document.createElement("div")
    this.div.classList.add("card")

    const title = document.createElement("h3")
    title.innerText = this.food.name

    this.div.appendChild(title)

    const details = document.createElement("div")
    details.classList.add("details")

    this.addDetail(details, this.food.netWeight, "net weight", "g")
    this.addDetail(details, this.food.totalCalories, "total cal")
    this.addDetail(details, this.food.totalCarbs, "total carbs", "g")
    this.addDetail(details, this.food.totalProtein, "total protein", "g")
    this.addDetail(details, this.food.totalFat, "total fat", "g")
    this.addDetail(details, this.food.proteinToCarbsRatio, "P:C ratio")
    this.addDetail(details, this.food.caloriePerOunce, "cal/oz")

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
