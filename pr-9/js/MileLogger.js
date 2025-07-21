// Service for logging mile updates and tracking progress over time
class MileLogger {
  constructor() {
    this.logs = []
  }

  // Log a mile update
  logMileUpdate(mileData) {
    const logEntry = {
      id: Date.now(),
      sectionId: mileData.sectionId,
      mile: mileData.mile,
      previousMile: mileData.previousMile,
      position: mileData.position,
      timestamp: mileData.timestamp || new Date(),
      accuracy: mileData.position?.accuracy
    }

    this.logs.unshift(logEntry) // Add to beginning for chronological order
    this.saveLogs()
    
    console.debug('Mile update logged:', logEntry)
    return logEntry
  }

  // Save logs to local storage
  async saveLogs() {
    try {
      // Store in IndexedDB using Dexie if available
      if (window.db) {
        // Create mile_logs table if it doesn't exist
        if (!db.mile_logs) {
          // For now, store in localStorage since we can't modify DB schema easily
          localStorage.setItem('mile_logs', JSON.stringify(this.logs))
        }
      } else {
        localStorage.setItem('mile_logs', JSON.stringify(this.logs))
      }
    } catch (error) {
      console.error('Failed to save mile logs:', error)
    }
  }

  // Load logs from storage
  async loadLogs() {
    try {
      const stored = localStorage.getItem('mile_logs')
      if (stored) {
        this.logs = JSON.parse(stored)
      }
      return this.logs
    } catch (error) {
      console.error('Failed to load mile logs:', error)
      return []
    }
  }

  // Get logs for a specific section
  getLogsForSection(sectionId) {
    return this.logs.filter(log => log.sectionId === sectionId)
  }

  // Get logs within a time range
  getLogsByTimeRange(startDate, endDate) {
    return this.logs.filter(log => {
      const logDate = new Date(log.timestamp)
      return logDate >= startDate && logDate <= endDate
    })
  }

  // Get recent logs (last N entries)
  getRecentLogs(count = 10) {
    return this.logs.slice(0, count)
  }

  // Calculate progress statistics
  getProgressStats(sectionId = null) {
    const relevantLogs = sectionId 
      ? this.getLogsForSection(sectionId)
      : this.logs

    if (relevantLogs.length === 0) {
      return {
        totalUpdates: 0,
        milesTracked: 0,
        firstUpdate: null,
        lastUpdate: null,
        averageAccuracy: 0
      }
    }

    const sortedLogs = relevantLogs.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
    const firstLog = sortedLogs[0]
    const lastLog = sortedLogs[sortedLogs.length - 1]
    
    const milesWithAccuracy = relevantLogs.filter(log => log.accuracy)
    const averageAccuracy = milesWithAccuracy.length > 0
      ? milesWithAccuracy.reduce((sum, log) => sum + log.accuracy, 0) / milesWithAccuracy.length
      : 0

    const uniqueMiles = new Set(relevantLogs.map(log => log.mile))

    return {
      totalUpdates: relevantLogs.length,
      milesTracked: uniqueMiles.size,
      firstUpdate: firstLog.timestamp,
      lastUpdate: lastLog.timestamp,
      averageAccuracy: Math.round(averageAccuracy),
      mileCoverage: {
        first: firstLog.mile,
        last: lastLog.mile,
        range: Math.abs(lastLog.mile - firstLog.mile)
      }
    }
  }

  // Clear all logs
  clearLogs() {
    this.logs = []
    localStorage.removeItem('mile_logs')
  }

  // Clear logs for a specific section
  clearSectionLogs(sectionId) {
    this.logs = this.logs.filter(log => log.sectionId !== sectionId)
    this.saveLogs()
  }

  // Export logs as JSON
  exportLogs() {
    return JSON.stringify(this.logs, null, 2)
  }

  // Import logs from JSON
  importLogs(jsonData) {
    try {
      const imported = JSON.parse(jsonData)
      if (Array.isArray(imported)) {
        this.logs = imported
        this.saveLogs()
        return true
      }
      return false
    } catch (error) {
      console.error('Failed to import logs:', error)
      return false
    }
  }
}

export default MileLogger