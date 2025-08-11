class Gear {
  constructor() {
    this.name = ""
    this.weight = 0 // weight in grams
    this.price = 0 // price in cents to avoid floating point issues
    this.description = ""
    this.vendor = ""
    this.url = ""
    this.categoryId = null
    this.quantity = 1
    this.notes = ""
    this.dateAdded = new Date()
    this.lastUsed = null
    this.timesUsed = 0
  }

  save() {
    return db.gear.put(this)
  }

  delete() {
    return db.gear.delete(this.id)
  }

  // Weight calculations
  get totalWeight() {
    return this.weight * this.quantity
  }

  get weightInOunces() {
    return this.totalWeight / 28.3495
  }

  get weightInPounds() {
    return this.totalWeight / 453.592
  }

  // Price calculations  
  get priceFormatted() {
    return `$${(this.price / 100).toFixed(2)}`
  }

  get totalPrice() {
    return this.price * this.quantity
  }

  get totalPriceFormatted() {
    return `$${(this.totalPrice / 100).toFixed(2)}`
  }

  // Usage tracking
  markAsUsed() {
    this.lastUsed = new Date()
    this.timesUsed += 1
    return this.save()
  }

  // Get the category this gear belongs to
  async getCategory() {
    if (!this.categoryId) return null
    return await db.gearCategories.get(this.categoryId)
  }

  // Convert weight to display format
  getWeightDisplay(unit = 'auto') {
    if (unit === 'auto') {
      if (this.totalWeight < 28.35) {
        unit = 'g'
      } else if (this.totalWeight < 453.59) {
        unit = 'oz'
      } else {
        unit = 'lbs'
      }
    }

    switch (unit) {
      case 'g':
        return `${this.totalWeight.toFixed(1)}g`
      case 'oz':
        return `${this.weightInOunces.toFixed(2)}oz`
      case 'lbs':
        return `${this.weightInPounds.toFixed(2)}lbs`
      default:
        return `${this.totalWeight.toFixed(1)}g`
    }
  }
}

export default Gear