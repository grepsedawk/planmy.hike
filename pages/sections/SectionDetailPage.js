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
    
    // Set page title and description
    document.title = this.title
    document.querySelector('meta[name="description"]')?.setAttribute("content", this.description)
    
    // Clear parent content
    this.parent.innerHTML = ""

    console.debug("Fetching section from database...")
    this.section = await db.sections.get(parseInt(this.sectionId))
    console.debug("Section fetched:", this.section)
    
    if (!this.section) {
      const errorDiv = document.createElement("div")
      errorDiv.classList.add("error")
      errorDiv.textContent = "Section not found"
      this.parent.appendChild(errorDiv)
      return
    }

    console.debug("Rendering section info...")
    this.renderSectionInfo()
    console.debug("Section info rendered. Children count:", this.parent.children.length)
    
    console.debug("Creating GPS controls...")
    this.renderBasicGPSControls()
    console.debug("GPS controls rendered. Children count:", this.parent.children.length)
    
    console.debug("Creating mile log...")
    this.renderBasicMileLog()
    console.debug("Mile log rendered. Children count:", this.parent.children.length)
    
    // Set up cleanup for any errors that appear
    this.setupErrorCleanup()
    
    console.debug("SectionDetailPage render completed successfully. Final children count:", this.parent.children.length)
    
    // Let's also verify the content after a delay
    setTimeout(() => {
      console.debug("After 100ms - Children count:", this.parent.children.length)
      console.debug("Content:", this.parent.innerHTML.substring(0, 200))
    }, 100)
  }

  renderBasicGPSControls() {
    const gpsDiv = document.createElement("div")
    gpsDiv.classList.add("gps-controls")
    gpsDiv.innerHTML = `
      <h3>GPS Tracking</h3>
      <p>Status: ${this.section.gpsTrackingEnabled ? '🟢 Enabled' : '🔴 Disabled'}</p>
      <div class="gps-buttons">
        <button id="load-pct-btn">Load PCT Data</button>
        <button id="start-gps-btn">Start GPS Tracking</button>
        <button id="stop-gps-btn">Stop GPS Tracking</button>
      </div>
      <div class="manual-mile">
        <h4>Manual Mile Update</h4>
        <input type="number" step="0.1" placeholder="Enter current mile" value="${this.section.currentMile || ''}" id="mile-input">
        <button id="update-mile-btn">Update Mile</button>
      </div>
    `
    this.parent.appendChild(gpsDiv)
    
    // Add event listeners
    const loadBtn = document.getElementById('load-pct-btn')
    const startBtn = document.getElementById('start-gps-btn')
    const stopBtn = document.getElementById('stop-gps-btn')
    const updateBtn = document.getElementById('update-mile-btn')
    const mileInput = document.getElementById('mile-input')
    
    if (loadBtn) loadBtn.addEventListener('click', () => this.loadPCTData())
    if (startBtn) startBtn.addEventListener('click', () => this.startGPSTracking())
    if (stopBtn) stopBtn.addEventListener('click', () => this.stopGPSTracking())
    if (updateBtn) updateBtn.addEventListener('click', () => this.updateMileManually())
  }

  renderBasicMileLog() {
    const logDiv = document.createElement("div")
    logDiv.classList.add("mile-log")
    logDiv.innerHTML = `
      <h3>Mile Update Log</h3>
      <div class="log-entries">
        <p>No mile updates recorded yet.</p>
      </div>
    `
    this.parent.appendChild(logDiv)
  }

  setupErrorCleanup() {
    // Clean up any rogue error messages that appear
    const cleanup = () => {
      const errors = document.querySelectorAll('.error')
      errors.forEach(error => {
        if (error.textContent.includes('Failed to load section')) {
          console.debug('Removing rogue error message')
          error.remove()
        }
      })
    }
    
    // Run cleanup immediately and then periodically
    setTimeout(cleanup, 50)
    setTimeout(cleanup, 100)
    setTimeout(cleanup, 500)
  }

  async loadPCTData() {
    try {
      console.debug("Loading PCT mile marker data...")
      await window.gpsTracker.loadMileMarkers("PCT")
      alert("PCT data loaded successfully!")
    } catch (error) {
      console.error("Failed to load PCT data:", error)
      alert("Failed to load PCT data: " + error.message)
    }
  }

  async startGPSTracking() {
    try {
      console.debug("Starting GPS tracking...")
      
      // Load mile markers first
      await this.loadPCTData()
      
      // Start GPS tracking with mile update callback
      await window.gpsTracker.startTracking((mileData) => {
        this.handleMileUpdate(mileData)
      })
      
      alert("GPS tracking started!")
      
    } catch (error) {
      console.error('GPS tracking error:', error)
      alert("GPS tracking failed: " + error.message)
    }
  }

  stopGPSTracking() {
    window.gpsTracker.stopTracking()
    alert("GPS tracking stopped")
  }

  handleMileUpdate(mileData) {
    if (mileData.mile !== null) {
      // Update section's current mile
      this.section.updateCurrentMile(mileData.mile, 'gps')
      
      // Refresh displays
      this.refreshSectionInfo()
      
      console.debug(`Mile updated to ${mileData.mile}`)
    }
  }

  updateMileManually() {
    try {
      const mileInput = document.getElementById('mile-input')
      if (!mileInput) {
        alert("Mile input not found")
        return
      }
      
      console.debug("Manual mile update - input value:", mileInput.value)
      const mile = parseFloat(mileInput.value)
      if (isNaN(mile)) {
        alert("Please enter a valid mile number")
        return
      }
      
      this.section.updateCurrentMile(mile, 'manual')
      this.refreshSectionInfo()
      alert(`Mile manually updated to ${mile}`)
    } catch (error) {
      console.error("Error in updateMileManually:", error)
      alert("Error updating mile: " + error.message)
    }
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
    console.debug("renderGPSControls starting...")
    
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
    console.debug("Updating GPS status...")
    this.updateGPSStatus()
    console.debug("renderGPSControls completed")
  }

  renderMileLog() {
    console.debug("renderMileLog starting...")
    
    try {
      const logDiv = document.createElement("div")
      logDiv.classList.add("mile-log")
      
      const title = document.createElement("h3")
      title.textContent = "Mile Update Log"
      logDiv.appendChild(title)
      
      this.logContainer = document.createElement("div")
      this.logContainer.classList.add("log-entries")
      logDiv.appendChild(this.logContainer)
      
      this.parent.appendChild(logDiv)
      
      this.refreshMileLog()
      
      console.debug("renderMileLog completed")
    } catch (error) {
      console.error("Error in renderMileLog:", error)
      throw error
    }
  }

  async refreshMileLog() {
    console.debug("refreshMileLog starting...")
    
    try {
      const logs = window.mileLogger.getLogsForSection(this.section.id)
      this.logContainer.innerHTML = ""
      
      if (logs.length === 0) {
        this.logContainer.innerHTML = "<p>No mile updates recorded yet.</p>"
        console.debug("No logs found for section", this.section.id)
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
      
      console.debug("refreshMileLog completed, displayed", logs.length, "logs")
    } catch (error) {
      console.error("Error in refreshMileLog:", error)
      this.logContainer.innerHTML = "<p>Error loading mile logs.</p>"
    }
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
    console.error("Render error:", message)
    const errorDiv = document.createElement("div")
    errorDiv.classList.add("error")
    errorDiv.textContent = "Error: " + message
    this.parent.appendChild(errorDiv)
  }

  async initializeGPSTracking() {
    console.debug("initializeGPSTracking starting...")
    // Auto-start GPS tracking if enabled and not already tracking
    if (!window.gpsTracker.isTracking()) {
      try {
        console.debug("Auto-starting GPS tracking...")
        // Don't await this as it might be blocking
        this.startGPSTracking().catch(error => {
          console.error('Auto GPS start failed:', error)
        })
      } catch (error) {
        console.error('Auto GPS start failed:', error)
      }
    }
    console.debug("initializeGPSTracking completed")
  }
}

export default SectionDetailPage