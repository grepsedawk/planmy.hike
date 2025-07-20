// GPS tracking service for automatic mile calculation
class GPSTracker {
  constructor() {
    this.currentPosition = null
    this.tracking = false
    this.watchId = null
    this.onMileUpdate = null
    this.mileMarkers = []
  }

  // Load mile markers from GPX data
  async loadMileMarkers(trail = 'PCT') {
    try {
      // For now, we'll use sample data until we can integrate real GPX files
      // This represents mile markers with lat/lng coordinates
      this.mileMarkers = await this.loadSamplePCTData()
      console.debug(`Loaded ${this.mileMarkers.length} mile markers for ${trail}`)
      return this.mileMarkers
    } catch (error) {
      console.error('Failed to load mile markers:', error)
      throw error
    }
  }

  // Sample PCT mile marker data (Southern California section)
  async loadSamplePCTData() {
    // These are approximate coordinates for PCT mile markers 0-10
    // In real implementation, this would be loaded from GPX files
    return [
      { mile: 0, lat: 32.5951, lng: -116.4656, name: "Mexican Border" },
      { mile: 1, lat: 32.6023, lng: -116.4703, name: "Mile 1" },
      { mile: 2, lat: 32.6095, lng: -116.4750, name: "Mile 2" },
      { mile: 3, lat: 32.6167, lng: -116.4797, name: "Mile 3" },
      { mile: 4, lat: 32.6239, lng: -116.4844, name: "Mile 4" },
      { mile: 5, lat: 32.6311, lng: -116.4891, name: "Mile 5" },
      { mile: 6, lat: 32.6383, lng: -116.4938, name: "Mile 6" },
      { mile: 7, lat: 32.6455, lng: -116.4985, name: "Mile 7" },
      { mile: 8, lat: 32.6527, lng: -116.5032, name: "Mile 8" },
      { mile: 9, lat: 32.6599, lng: -116.5079, name: "Mile 9" },
      { mile: 10, lat: 32.6671, lng: -116.5126, name: "Mile 10" }
    ]
  }

  // Start GPS tracking
  async startTracking(onMileUpdate = null) {
    if (!navigator.geolocation) {
      throw new Error('GPS not supported on this device')
    }

    this.onMileUpdate = onMileUpdate
    this.tracking = true

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 30000
    }

    return new Promise((resolve, reject) => {
      this.watchId = navigator.geolocation.watchPosition(
        (position) => {
          this.handlePositionUpdate(position)
          if (!this.currentPosition) resolve() // First position acquired
        },
        (error) => {
          console.error('GPS error:', error)
          reject(error)
        },
        options
      )
    })
  }

  // Stop GPS tracking
  stopTracking() {
    if (this.watchId) {
      navigator.geolocation.clearWatch(this.watchId)
      this.watchId = null
    }
    this.tracking = false
  }

  // Handle position updates
  handlePositionUpdate(position) {
    const newPosition = {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
      timestamp: new Date(position.timestamp),
      accuracy: position.coords.accuracy
    }

    const previousMile = this.currentPosition ? this.getCurrentMile() : null
    this.currentPosition = newPosition

    const currentMile = this.getCurrentMile()
    
    // If mile changed and we have a callback, notify
    if (currentMile !== previousMile && this.onMileUpdate) {
      this.onMileUpdate({
        mile: currentMile,
        position: newPosition,
        previousMile: previousMile,
        timestamp: newPosition.timestamp
      })
    }

    console.debug('Position updated:', {
      lat: newPosition.lat.toFixed(6),
      lng: newPosition.lng.toFixed(6),
      mile: currentMile,
      accuracy: newPosition.accuracy
    })
  }

  // Calculate distance between two points using Haversine formula
  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371000 // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180
    const φ2 = lat2 * Math.PI / 180
    const Δφ = (lat2 - lat1) * Math.PI / 180
    const Δλ = (lng2 - lng1) * Math.PI / 180

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))

    return R * c // Distance in meters
  }

  // Find the closest mile marker to current position
  getCurrentMile() {
    if (!this.currentPosition || !this.mileMarkers.length) {
      return null
    }

    let closestMile = null
    let minDistance = Infinity

    for (const marker of this.mileMarkers) {
      const distance = this.calculateDistance(
        this.currentPosition.lat,
        this.currentPosition.lng,
        marker.lat,
        marker.lng
      )

      if (distance < minDistance) {
        minDistance = distance
        closestMile = marker.mile
      }
    }

    return closestMile
  }

  // Get current position
  getPosition() {
    return this.currentPosition
  }

  // Check if tracking is enabled
  isTracking() {
    return this.tracking
  }

  // Get loaded mile markers
  getMileMarkers() {
    return this.mileMarkers
  }
}

export default GPSTracker