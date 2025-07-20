import Renderer from "../../js/Renderer.js"

class ShowTotals extends Renderer {
  static async render(parent, section) {
    new ShowTotals(parent, section)
      .render()
      .catch((e) => console.error("Error in ShowTotals:", e.name, e.message))
  }

  constructor(parent, section) {
    super()
    this.parent = parent
    this.section = section
  }

  async render() {
    this.foods = await this.section.foods.toArray()

    this.div = document.createElement("div")
    this.div.classList.add("card")

    const title = document.createElement("h3")
    title.innerText = "Stats"
    this.div.appendChild(title)

    const details = document.createElement("div")
    details.classList.add("details")

    this.addDetail(details, this.totalCalories(), "Calories")
    this.addDetail(details, this.goalCalories(), "Goal Calories")
    this.addDetail(details, this.totalCarbs(), "Total Carbs", "g")
    this.addDetail(details, this.totalProtein(), "Total Protein", "g")
    this.addDetail(details, this.totalFat(), "Total Fat", "g")
    this.addDetail(details, this.proteinCarbRatio(), "Protein / Carb")
    this.addDetail(details, this.caloriesPerOunce(), "Calories / Ounce")
    this.addDetail(details, this.totalNetWeight(), "Total Net Weight", "g")
    this.addDetail(
      details,
      this.totalNetWeight() / 453.592,
      "Total Net Weight",
      "lbs",
    )

    this.div.appendChild(details)
    this.parent.innerHTML = ""
    this.parent.appendChild(this.div)
  }

  totalCalories() {
    return this.foods.reduce((total, food) => total + food.totalCalories, 0)
  }

  goalCalories() {
    return this.section.caloriesPerDay * this.section.days
  }

  totalCarbs() {
    return this.foods.reduce((total, food) => total + food.totalCarbs, 0)
  }

  totalProtein() {
    return this.foods.reduce((total, food) => total + food.totalProtein, 0)
  }

  totalFat() {
    return this.foods.reduce((total, food) => total + food.totalFat, 0)
  }

  proteinCarbRatio() {
    const totalCarbs = this.totalCarbs()
    return totalCarbs > 0 ? this.totalProtein() / totalCarbs : 0
  }

  totalNetWeight() {
    return this.foods.reduce((total, food) => total + food.netWeight, 0)
  }

  caloriesPerOunce() {
    const totalWeight = this.totalNetWeight()
    return totalWeight > 0 ? this.totalCalories() / (totalWeight / 28.3495) : 0
  }
}

export default ShowTotals
