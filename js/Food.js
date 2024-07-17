class Food {
  constructor() {
    this.name = ""
  }
  
  save() {
    return db.foods.put(this) 
  }
  
  delete() {
    return db.foods.delete(this.id)
  }
}

export default Food