class GearCategory {
  constructor() {
    this.name = ""
    this.description = ""
    this.parentId = null // for nested categories
    this.weight = 0 // optional weight for the category itself (e.g., a pack)
    this.price = 0 // optional price for the category
    this.vendor = ""
    this.url = ""
    this.color = "#2196f3" // for visual organization
    this.sortOrder = 0
    this.dateCreated = new Date()
  }

  save() {
    return db.gearCategories.put(this)
  }

  delete() {
    // TODO: Handle cascade deletion or reassignment of child items
    return db.gearCategories.delete(this.id)
  }

  // Get all gear items in this category
  getGearItems() {
    return db.gear.where({ categoryId: this.id }).toArray()
  }

  // Get subcategories
  getSubcategories() {
    return db.gearCategories.where({ parentId: this.id }).toArray()
  }

  // Get parent category
  async getParent() {
    if (!this.parentId) return null
    return await db.gearCategories.get(this.parentId)
  }

  // Get total weight of all items in this category (including subcategories)
  async getTotalWeight() {
    const items = await this.getGearItems()
    const subcategories = await this.getSubcategories()
    
    let totalWeight = this.weight || 0

    // Add weight from all gear items
    totalWeight += items.reduce((sum, item) => sum + item.totalWeight, 0)

    // Add weight from subcategories recursively
    for (const subcat of subcategories) {
      totalWeight += await subcat.getTotalWeight()
    }

    return totalWeight
  }

  // Get total price of all items in this category (including subcategories)
  async getTotalPrice() {
    const items = await this.getGearItems()
    const subcategories = await this.getSubcategories()
    
    let totalPrice = this.price || 0

    // Add price from all gear items
    totalPrice += items.reduce((sum, item) => sum + item.totalPrice, 0)

    // Add price from subcategories recursively
    for (const subcat of subcategories) {
      totalPrice += await subcat.getTotalPrice()
    }

    return totalPrice
  }

  // Get count of all items in this category (including subcategories)
  async getItemCount() {
    const items = await this.getGearItems()
    const subcategories = await this.getSubcategories()
    
    let count = items.length

    // Add count from subcategories recursively
    for (const subcat of subcategories) {
      count += await subcat.getItemCount()
    }

    return count
  }

  // Price formatting
  get priceFormatted() {
    return `$${(this.price / 100).toFixed(2)}`
  }

  // Get full category path (for nested categories)
  async getFullPath() {
    const parent = await this.getParent()
    if (parent) {
      const parentPath = await parent.getFullPath()
      return `${parentPath} > ${this.name}`
    }
    return this.name
  }

  // Check if this category can be deleted (no child items or subcategories)
  async canDelete() {
    const items = await this.getGearItems()
    const subcategories = await this.getSubcategories()
    return items.length === 0 && subcategories.length === 0
  }
}

export default GearCategory