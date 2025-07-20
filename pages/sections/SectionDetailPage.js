import Page from "../../js/Page.js"
import Renderer from "../../js/Renderer.js"

class SectionDetailPage extends Page {
  constructor(parent, sectionId) {
    super()
    this.parent = parent
    this.sectionId = sectionId
    this.section = null
    this.title = "Section Details"
    this.description = "Manage section GPS tracking"
  }

  async render() {
    console.debug("SectionDetailPage render starting for section:", this.sectionId)
    
    // Set page title and description without clearing content
    document.title = this.title
    document.querySelector('meta[name="description"]')?.setAttribute("content", this.description)
    
    // Clear parent content
    this.parent.innerHTML = ""
    
    try {
      console.debug("Fetching section from database...")
      this.section = await db.sections.get(parseInt(this.sectionId))
      console.debug("Section fetched:", this.section)
      
      if (!this.section) {
        this.renderError("Section not found")
        return
      }

      console.debug("Rendering section info...")
      this.renderSectionInfo()
      
      console.debug("Rendering GPS controls...")
      this.renderGPSControls()
      
      console.debug("Rendering mile log...")
      this.renderMileLog()
      
      // If GPS tracking is enabled for this section, initialize tracking
      if (this.section.gpsTrackingEnabled) {
        console.debug("Initializing GPS tracking...")
        this.initializeGPSTracking()
      }
      
      console.debug("SectionDetailPage render completed successfully")
      
    } catch (error) {
      console.error('Error loading section:', error)
      this.renderError("Failed to load section: " + error.message)
    }
  }

  renderSectionInfo() {
    const infoDiv = document.createElement("div")
    infoDiv.classList.add("section-info")
    
    const title = document.createElement("h2")
    title.textContent = this.section.name
    infoDiv.appendChild(title)
    
    const details = document.createElement("div")
    details.innerHTML = `
      <p><strong>Miles:</strong> ${this.section.startMile || 0} - ${this.section.endMile || 0}</p>
      <p><strong>Current Mile:</strong> ${this.section.currentMile || 'Not set'}</p>
      <p><strong>Progress:</strong> ${this.section.progressPercentage.toFixed(1)}%</p>
      <p><strong>Remaining:</strong> ${this.section.remainingMiles} miles</p>
      <p><strong>Trail:</strong> ${this.section.trail || 'PCT'}</p>
    `
    infoDiv.appendChild(details)
    
    this.parent.appendChild(infoDiv)
  }

  renderGPSControls() {
    const controlsDiv = document.createElement("div")
    controlsDiv.classList.add("gps-controls")
    
    const title = document.createElement("h3")
    title.textContent = "GPS Tracking"
    controlsDiv.appendChild(title)
    
    // GPS status display
    this.statusDiv = document.createElement("div")
    this.statusDiv.classList.add("gps-status")
    controlsDiv.appendChild(this.statusDiv)
    
    // Control buttons
    const buttonsDiv = document.createElement("div")
    buttonsDiv.classList.add("gps-buttons")
    
    this.startButton = this.createButton("Start GPS Tracking", () => this.startGPSTracking())
    this.stopButton = this.createButton("Stop GPS Tracking", () => this.stopGPSTracking())
    this.loadDataButton = this.createButton("Load PCT Data", () => this.loadPCTData())
    
    buttonsDiv.appendChild(this.startButton)
    buttonsDiv.appendChild(this.stopButton)
    buttonsDiv.appendChild(this.loadDataButton)
    controlsDiv.appendChild(buttonsDiv)
    
    // Manual mile update
    const manualDiv = document.createElement("div")
    manualDiv.classList.add("manual-mile")
    
    const manualTitle = document.createElement("h4")
    manualTitle.textContent = "Manual Mile Update"
    manualDiv.appendChild(manualTitle)
    
    this.mileInput = document.createElement("input")
    this.mileInput.type = "number"
    this.mileInput.step = "0.1"
    this.mileInput.placeholder = "Enter current mile"
    this.mileInput.value = this.section.currentMile || ""
    
    const updateButton = this.createButton("Update Mile", () => this.updateMileManually())
    
    manualDiv.appendChild(this.mileInput)
    manualDiv.appendChild(updateButton)
    controlsDiv.appendChild(manualDiv)
    
    this.parent.appendChild(controlsDiv)
    
    // Update GPS status after buttons are created
    this.updateGPSStatus()
  }

  renderMileLog() {
    const logDiv = document.createElement("div")
    logDiv.classList.add("mile-log")
    
    const title = document.createElement("h3")
    title.textContent = "Mile Update Log"
    logDiv.appendChild(title)
    
    this.logContainer = document.createElement("div")
    this.logContainer.classList.add("log-entries")
    logDiv.appendChild(this.logContainer)
    
    this.refreshMileLog()
    
    this.parent.appendChild(logDiv)
  }

  async refreshMileLog() {
    const logs = window.mileLogger.getLogsForSection(this.section.id)
    this.logContainer.innerHTML = ""
    
    if (logs.length === 0) {
      this.logContainer.innerHTML = "<p>No mile updates recorded yet.</p>"
      return
    }
    
    logs.slice(0, 10).forEach(log => {
      const logEntry = document.createElement("div")
      logEntry.classList.add("log-entry")
      
      const time = new Date(log.timestamp).toLocaleString()
      const accuracy = log.accuracy ? `±${Math.round(log.accuracy)}m` : 'Unknown accuracy'
      
      logEntry.innerHTML = `
        <div class="log-time">${time}</div>
        <div class="log-details">Mile ${log.mile} ${accuracy}</div>
      `
      
      this.logContainer.appendChild(logEntry)
    })
  }

  createButton(text, onClick) {
    const button = document.createElement("button")
    button.textContent = text
    button.addEventListener("click", onClick)
    return button
  }

  async loadPCTData() {
    try {
      this.updateStatus("Loading PCT mile marker data...")
      await window.gpsTracker.loadMileMarkers("PCT")
      this.updateStatus("PCT data loaded successfully!")
    } catch (error) {
      this.updateStatus("Failed to load PCT data: " + error.message)
    }
  }

  async startGPSTracking() {
    try {
      this.updateStatus("Starting GPS tracking...")
      
      // Load mile markers first
      await this.loadPCTData()
      
      // Start GPS tracking with mile update callback
      await window.gpsTracker.startTracking((mileData) => {
        this.handleMileUpdate(mileData)
      })
      
      this.updateStatus("GPS tracking active")
      this.updateGPSStatus()
      
    } catch (error) {
      console.error('GPS tracking error:', error)
      this.updateStatus("GPS tracking failed: " + error.message)
    }
  }

  stopGPSTracking() {
    window.gpsTracker.stopTracking()
    this.updateStatus("GPS tracking stopped")
    this.updateGPSStatus()
  }

  handleMileUpdate(mileData) {
    if (mileData.mile !== null) {
      // Update section's current mile
      this.section.updateCurrentMile(mileData.mile, 'gps')
      
      // Refresh displays
      this.refreshSectionInfo()
      this.refreshMileLog()
      
      this.updateStatus(`Mile updated to ${mileData.mile}`)
    }
  }

  updateMileManually() {
    const mile = parseFloat(this.mileInput.value)
    if (isNaN(mile)) {
      this.updateStatus("Please enter a valid mile number")
      return
    }
    
    this.section.updateCurrentMile(mile, 'manual')
    this.refreshSectionInfo()
    this.updateStatus(`Mile manually updated to ${mile}`)
  }

  refreshSectionInfo() {
    // Find and update the section info display
    const infoDiv = this.parent.querySelector('.section-info')
    if (infoDiv) {
      const details = infoDiv.querySelector('div:last-child')
      details.innerHTML = `
        <p><strong>Miles:</strong> ${this.section.startMile || 0} - ${this.section.endMile || 0}</p>
        <p><strong>Current Mile:</strong> ${this.section.currentMile || 'Not set'}</p>
        <p><strong>Progress:</strong> ${this.section.progressPercentage.toFixed(1)}%</p>
        <p><strong>Remaining:</strong> ${this.section.remainingMiles} miles</p>
        <p><strong>Trail:</strong> ${this.section.trail || 'PCT'}</p>
      `
    }
  }

  updateGPSStatus() {
    const isTracking = window.gpsTracker.isTracking()
    const trackingEnabled = this.section?.gpsTrackingEnabled
    
    if (this.startButton && this.stopButton) {
      this.startButton.disabled = isTracking
      this.stopButton.disabled = !isTracking
    }
    
    let statusText = ""
    if (trackingEnabled && isTracking) {
      statusText = "🟢 GPS tracking active"
    } else if (trackingEnabled && !isTracking) {
      statusText = "🟡 GPS tracking enabled but not active"
    } else {
      statusText = "🔴 GPS tracking disabled"
    }
    
    if (this.statusDiv) {
      this.statusDiv.textContent = statusText
    }
  }

  updateStatus(message) {
    console.debug(message)
    // Could add a status message area to the UI here
  }

  renderError(message) {
    const errorDiv = document.createElement("div")
    errorDiv.classList.add("error")
    errorDiv.textContent = message
    this.parent.appendChild(errorDiv)
  }

  async initializeGPSTracking() {
    // Auto-start GPS tracking if enabled and not already tracking
    if (!window.gpsTracker.isTracking()) {
      try {
        await this.startGPSTracking()
      } catch (error) {
        console.error('Auto GPS start failed:', error)
      }
    }
  }
}

export default SectionDetailPage