class Section {
  constructor() {
    this.name = ""
    this.caloriesPerDay = 4000
    this.gpsTrackingEnabled = false
    this.trail = "PCT" // Default trail
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

  // Update current mile (can be called manually or by GPS tracker)
  updateCurrentMile(mile, source = 'manual') {
    const previousMile = this.currentMile
    this.currentMile = mile
    
    // Log the mile update if mile logger is available
    if (window.mileLogger && source === 'gps') {
      window.mileLogger.logMileUpdate({
        sectionId: this.id,
        mile: mile,
        previousMile: previousMile,
        position: window.gpsTracker?.getPosition(),
        timestamp: new Date()
      })
    }
    
    // Save the updated section
    this.save()
    
    console.debug(`Section ${this.id} mile updated: ${previousMile} -> ${mile} (${source})`)
    return mile
  }

  // Get progress as percentage
  get progressPercentage() {
    if (!this.startMile || !this.endMile || !this.currentMile) {
      return 0
    }
    
    const totalMiles = this.endMile - this.startMile
    const completedMiles = this.currentMile - this.startMile
    
    return Math.max(0, Math.min(100, (completedMiles / totalMiles) * 100))
  }

  // Get remaining miles
  get remainingMiles() {
    if (!this.endMile || !this.currentMile) {
      return this.endMile - (this.startMile || 0)
    }
    
    return Math.max(0, this.endMile - this.currentMile)
  }
}

export default Section
