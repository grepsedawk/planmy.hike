class Section {
  constructor() {
    this.name = ""
  }

  save() {
    return db.sections.put(this)
  }

  delete() {
    return db.sections.delete(this.id)
  }
}

export default Section
