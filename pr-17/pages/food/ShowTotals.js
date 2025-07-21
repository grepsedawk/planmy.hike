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

    const header = document.createElement("div")
    header.classList.add("card-header")

    const title = document.createElement("h3")
    title.classList.add("card-title")
    title.innerHTML = `<span class="material-icons">analytics</span> Nutrition Stats`

    header.appendChild(title)
    this.div.appendChild(header)

    // Stats overview grid
    const statsGrid = document.createElement("div")
    statsGrid.classList.add("stats-overview")

    this.addStatItem(
      statsGrid,
      Math.round(this.totalCalories()),
      "Calories",
      "primary",
    )
    this.addStatItem(
      statsGrid,
      Math.round(this.goalCalories()),
      "Goal",
      "success",
    )
    this.addStatItem(statsGrid, `${this.totalCarbs().toFixed(1)}g`, "Carbs")
    this.addStatItem(statsGrid, `${this.totalProtein().toFixed(1)}g`, "Protein")
    this.addStatItem(statsGrid, `${this.totalFat().toFixed(1)}g`, "Fat")
    this.addStatItem(statsGrid, this.proteinCarbRatio().toFixed(2), "P:C Ratio")
    this.addStatItem(
      statsGrid,
      `${this.caloriesPerOunce().toFixed(0)}`,
      "Cal/oz",
    )
    this.addStatItem(
      statsGrid,
      `${(this.totalNetWeight() / 453.592).toFixed(1)} lbs`,
      "Weight",
    )

    this.div.appendChild(statsGrid)

    // Progress indicators
    const progressSection = document.createElement("div")
    progressSection.style.marginTop = "var(--spacing-4)"

    const calorieProgress = this.createProgressBar(
      "Calorie Progress",
      this.totalCalories(),
      this.goalCalories(),
      "success",
    )
    progressSection.appendChild(calorieProgress)

    this.div.appendChild(progressSection)

    this.parent.innerHTML = ""
    this.parent.appendChild(this.div)
  }

  addStatItem(parent, value, label, variant = "") {
    const item = document.createElement("div")
    item.classList.add("stat-item")
    if (variant) {
      item.classList.add(variant)
    }

    const number = document.createElement("div")
    number.classList.add("stat-number")
    number.textContent = value

    const labelEl = document.createElement("div")
    labelEl.classList.add("stat-label")
    labelEl.textContent = label

    item.appendChild(number)
    item.appendChild(labelEl)
    parent.appendChild(item)
  }

  createProgressBar(label, current, goal, variant = "") {
    const container = document.createElement("div")
    container.style.marginBottom = "var(--spacing-3)"

    const labelEl = document.createElement("div")
    labelEl.style.cssText =
      "display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-1);"

    const labelText = document.createElement("span")
    labelText.style.cssText =
      "font-size: var(--font-size-sm); font-weight: var(--font-weight-medium); color: var(--text-primary);"
    labelText.textContent = label

    const percentage = Math.min((current / goal) * 100, 100)
    const percentageText = document.createElement("span")
    percentageText.style.cssText =
      "font-size: var(--font-size-sm); color: var(--text-tertiary);"
    percentageText.textContent = `${Math.round(current)}/${Math.round(goal)} (${percentage.toFixed(0)}%)`

    labelEl.appendChild(labelText)
    labelEl.appendChild(percentageText)

    const progressBar = document.createElement("div")
    progressBar.classList.add("progress")

    const progressFill = document.createElement("div")
    progressFill.classList.add("progress-bar")
    if (variant) {
      progressFill.classList.add(variant)
    }
    progressFill.style.width = `${percentage}%`

    progressBar.appendChild(progressFill)
    container.appendChild(labelEl)
    container.appendChild(progressBar)

    return container
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
