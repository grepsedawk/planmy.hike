class Section {
  constructor() {
    this.name = ""
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
}

export default Section
