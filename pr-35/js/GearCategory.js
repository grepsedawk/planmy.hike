class GearCategory {
  constructor() {
    this.name = ""
    this.description = ""
    this.color = "#2196f3" // for visual organization
    this.dateCreated = new Date()
  }

  save() {
    return db.gearCategories.put(this)
  }

  delete() {
    return db.gearCategories.delete(this.id)
  }

  // Get all gear items in this category
  getGearItems() {
    return db.gear.where({ categoryId: this.id }).toArray()
  }

  // Get total weight of all items in this category
  async getTotalWeight() {
    const items = await this.getGearItems()
    return items.reduce((sum, item) => sum + item.totalWeight, 0)
  }

  // Get total price of all items in this category
  async getTotalPrice() {
    const items = await this.getGearItems()
    return items.reduce((sum, item) => sum + item.totalPrice, 0)
  }

  // Get count of all items in this category
  async getItemCount() {
    const items = await this.getGearItems()
    return items.length
  }
}

export default GearCategory