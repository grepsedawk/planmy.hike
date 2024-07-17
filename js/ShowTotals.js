class ShowTotals {
  static render(parent) {
    new ShowTotals(parent).render()
  }
  
  constructor(parent) {
    this.foods = db.foods.toArray()
    this.parent = parent
  }
  
  async render() { 
    this.parent.innerHTML = `<p>Total Calories: ${await this.totalCalories()}</p>`
    this.parent.innerHTML += `<p>Total Carbs: ${await this.totalCarbs()}</p>`
    this.parent.innerHTML += `<p>Total Protein: ${await this.totalProtein()}</p>`
    this.parent.innerHTML += `<p>Total Fat: ${await this.totalFat()}</p>`
    this.parent.innerHTML += `<p>Protein / Carb: ${await this.proteinCarbRatio()}</p>`
  }
      
  async totalCalories() {
    return await this.foods.then((foods) => foods.reduce((total, food) => total + food.calories, 0))
  }
  
  async totalCarbs() {
    return await this.foods.then((foods) => foods.reduce((total, food) => total + food.carbs, 0))
  }
  
  async totalProtein() {
    return await this.foods.then((foods) => foods.reduce((total, food) => total + food.protein, 0))
  }
  
  async totalFat() {
    return await this.foods.then((foods) => foods.reduce((total, food) => total + food.fat, 0))
  }
  
  proteinCarbRatio() {
    return this.totalProtein() / this.totalCarbs()
  }
}

export default ShowTotals