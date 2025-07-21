import Renderer from "../../js/Renderer.js"
import ShowTotals from "./ShowTotals.js"
import NewFood from "./NewFood.js"

class ShowFood extends Renderer {
  constructor(parent, food, section) {
    super()
    this.parent = parent
    this.food = food
    this.section = section
  }

  static render(parent, section) {
    parent.innerHTML = "" // Clear previous food items
    section.foods
      .toArray()
      .then((foods) =>
        foods.forEach((food) => this.renderFood(parent, food, section)),
      )
  }

  static renderFood(parent, food, section) {
    let foodRenderer = new ShowFood(parent, food, section)
    foodRenderer.render()

    return foodRenderer
  }

  render() {
    this.div = document.createElement("div")
    this.div.classList.add("food-item-card")

    // Header with title and actions
    const header = document.createElement("div")
    header.classList.add("food-item-header")

    const title = document.createElement("h4")
    title.classList.add("food-item-title")
    title.innerText = this.food.name

    const actions = document.createElement("div")
    actions.style.display = "flex"
    actions.style.gap = "var(--spacing-2)"

    this.editButton = document.createElement("button")
    this.editButton.classList.add("btn", "btn-secondary", "btn-sm")
    this.editButton.innerHTML = `<span class="material-icons">edit</span>`
    this.editButton.title = "Edit food item"
    this.editButton.addEventListener("click", () => this.edit())

    this.deleteButton = document.createElement("button")
    this.deleteButton.classList.add("btn", "btn-danger", "btn-sm")
    this.deleteButton.innerHTML = `<span class="material-icons">delete</span>`
    this.deleteButton.title = "Delete food item"
    this.deleteButton.addEventListener("click", () => this.delete())

    actions.appendChild(this.editButton)
    actions.appendChild(this.deleteButton)
    header.appendChild(title)
    header.appendChild(actions)
    this.div.appendChild(header)

    // Details grid
    const details = document.createElement("div")
    details.classList.add("food-item-details")

    this.addDetailItem(details, "Net Weight", this.food.netWeight, "g")
    this.addDetailItem(details, "Total Calories", this.food.totalCalories)
    this.addDetailItem(details, "Total Carbs", this.food.totalCarbs, "g")
    this.addDetailItem(details, "Total Protein", this.food.totalProtein, "g")
    this.addDetailItem(details, "Total Fat", this.food.totalFat, "g")
    this.addDetailItem(details, "P:C Ratio", this.food.proteinToCarbsRatio?.toFixed(2) || "0.00")
    this.addDetailItem(details, "Cal/oz", this.food.caloriePerOunce?.toFixed(0) || "0")

    this.div.appendChild(details)
    this.parent.appendChild(this.div)
  }

  addDetailItem(parent, label, value, unit = "") {
    const item = document.createElement("div")
    item.classList.add("food-detail-item")

    const labelEl = document.createElement("span")
    labelEl.classList.add("food-detail-label")
    labelEl.textContent = label

    const valueEl = document.createElement("span")
    valueEl.classList.add("food-detail-value")
    valueEl.textContent = `${value || "0"}${unit ? ` ${unit}` : ""}`

    item.appendChild(labelEl)
    item.appendChild(valueEl)
    parent.appendChild(item)
  }

  edit() {
    const editForm = new NewFood(this.section, this.food)
    editForm.render()
  }

  delete() {
    this.food.delete()
    this.div.remove()
    ShowTotals.render(document.getElementById("totals"), this.section)
  }
}

export default ShowFood
