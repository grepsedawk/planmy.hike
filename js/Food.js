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
    return this.netWeight * this.quantity / this.servingSize
  }
  
  get totalCalories() {
    return this.calories * this.servings
  }
  
  get totalFat() {
    return this.fat * this.servings
  }
  
  get totalCarbs() {
    return this.carbs * this.servings
  }
  
  get totalProtein() {                                                                                                                                                      
    return this.protein * this.servings
  } 
}

export default Food
