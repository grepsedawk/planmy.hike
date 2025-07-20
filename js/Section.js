class Section {
  constructor() {
    this.name = ""
    this.caloriesPerDay = 4000
  }

  static find(id) {
    return db.sections.get(id)
  }

  save() {
    return db.sections.put(this)
  }

  delete() {
    return db.sections.delete(this.id)
  }

  get foods() {
    return db.foods.where({ sectionId: this.id })
  }

  get requiredCalories() {
    return this.caloriesPerDay * this.days
  }
}

export default Section
