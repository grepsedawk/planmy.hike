class ShowTotals {
  static async render(parent, section) {
    new ShowTotals(parent, section)
      .render().catch((e) => console.error("Error in ShowTotals:", e.name, e.message))
  }

  constructor(parent, section) {
    this.parent = parent
    this.section = section
  }

  async render() {
    this.foods = await this.section.foods.toArray()

    this.parent.innerHTML = `<p>Total Calories: ${this.totalCalories()}/${this.section.requiredCalories }</p>
<p>Total Carbs: ${this.totalCarbs()}</p>
<p>Total Protein: ${this.totalProtein()}</p>
<p>Total Fat: ${this.totalFat()}</p>
<p>Protein / Carb: ${this.proteinCarbRatio()}</p>
    `
  }

  totalCalories() {
    return this.foods.reduce((total, food) => total + food.totalCalories, 0)
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
    return this.totalProtein() / this.totalCarbs()
  }
}

export default ShowTotals
