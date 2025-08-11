class Food {
  constructor() {
    this.name = ""
    this.quantity = 1
  }

  save() {
    return db.foods.put(this)
  }

  delete() {
    return db.foods.delete(this.id)
  }

  get servings() {
    return (this.netWeight * this.quantity) / this.servingSize
  }

  get totalCalories() {
    return Math.round(this.calories * this.servings)
  }

  get totalFat() {
    return Math.round(this.fat * this.servings * 100) / 100
  }

  get totalCarbs() {
    return Math.round(this.carbs * this.servings * 100) / 100
  }

  get totalProtein() {
    return Math.round(this.protein * this.servings * 100) / 100
  }

  get caloriePerOunce() {
    const weightInOunces = (this.netWeight * this.quantity) / 28.3495
    const ratio = weightInOunces > 0 ? this.totalCalories / weightInOunces : 0
    return Math.round(ratio)
  }

  get proteinToCarbsRatio() {
    const ratio = this.totalCarbs > 0 ? this.totalProtein / this.totalCarbs : 0
    return Math.round(ratio * 100) / 100
  }
}

export default Food
