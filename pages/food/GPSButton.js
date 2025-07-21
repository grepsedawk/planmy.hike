import Section from "../../js/Section.js"

class GPSButton {
  constructor(section) {
    this.section = section
  }

  static renderTrigger(parent, section) {
    const button = document.createElement("button")
    button.classList.add("btn", "btn-outline", "btn-sm")
    button.innerHTML = `<span class="material-icons">my_location</span> Log Mile (GPS)`
    button.addEventListener("click", () => {
      new GPSButton(section).logCurrentMile()
    })

    parent.appendChild(button)
  }

  async logCurrentMile() {
    try {
      // Show loading state
      const button = event.target.closest("button")
      const originalHTML = button.innerHTML
      button.innerHTML = `<span class="material-icons">hourglass_empty</span> Getting GPS...`
      button.disabled = true

      // Load PCT mile markers if not already loaded
      if (!window.gpsTracker.getMileMarkers().length) {
        await window.gpsTracker.loadMileMarkers("PCT")
      }

      // Get current GPS position
      const position = await this.getCurrentPosition()

      // Update GPS tracker with current position
      window.gpsTracker.currentPosition = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        timestamp: new Date(position.timestamp),
        accuracy: position.coords.accuracy,
      }

      // Get current mile based on GPS position
      const currentMile = window.gpsTracker.getCurrentMile()

      if (currentMile !== null) {
        // Update section's current mile (this will automatically log it)
        await this.section.updateCurrentMile(currentMile, "gps")

        // Show success message
        this.showMessage(
          `✅ Mile updated to ${currentMile} (±${Math.round(position.coords.accuracy)}m accuracy)`,
          "success",
        )

        // Refresh any displays that might show current mile
        this.refreshDisplays()
      } else {
        this.showMessage(
          `❌ No trail mile marker found near your location. You may be too far from the PCT trail.`,
          "error",
        )
      }
    } catch (error) {
      console.error("GPS mile logging error:", error)
      let errorMessage = "❌ Failed to get GPS location: "

      if (error.code === 1) {
        errorMessage +=
          "Location access denied. Please enable location permissions."
      } else if (error.code === 2) {
        errorMessage += "Location unavailable. Please try again."
      } else if (error.code === 3) {
        errorMessage += "Location request timed out. Please try again."
      } else {
        errorMessage += error.message
      }

      this.showMessage(errorMessage, "error")
    } finally {
      // Restore button state
      const button = document.querySelector("button[disabled]")
      if (button) {
        button.innerHTML = `<span class="material-icons">my_location</span> Log Mile (GPS)`
        button.disabled = false
      }
    }
  }

  getCurrentPosition() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("GPS not supported on this device"))
        return
      }

      const options = {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 30000,
      }

      navigator.geolocation.getCurrentPosition(resolve, reject, options)
    })
  }

  showMessage(message, type = "info") {
    // Create message element
    const messageDiv = document.createElement("div")
    messageDiv.className = `alert alert-${type} mt-2`
    messageDiv.style.cssText =
      "position: fixed; top: 20px; right: 20px; z-index: 1000; max-width: 400px; padding: 12px; border-radius: 6px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);"

    // Style based on type
    if (type === "success") {
      messageDiv.style.backgroundColor = "#d4edda"
      messageDiv.style.borderColor = "#c3e6cb"
      messageDiv.style.color = "#155724"
    } else if (type === "error") {
      messageDiv.style.backgroundColor = "#f8d7da"
      messageDiv.style.borderColor = "#f5c6cb"
      messageDiv.style.color = "#721c24"
    } else {
      messageDiv.style.backgroundColor = "#d1ecf1"
      messageDiv.style.borderColor = "#bee5eb"
      messageDiv.style.color = "#0c5460"
    }

    messageDiv.textContent = message

    // Add to page
    document.body.appendChild(messageDiv)

    // Remove after 5 seconds
    setTimeout(() => {
      if (messageDiv.parentNode) {
        messageDiv.parentNode.removeChild(messageDiv)
      }
    }, 5000)
  }

  async refreshDisplays() {
    // Refresh any UI components that might display current mile

    // Try to refresh totals section if it exists
    const totalsElement = document.getElementById("totals")
    if (totalsElement) {
      try {
        const ShowTotals = (await import("./ShowTotals.js")).default
        await ShowTotals.render(totalsElement, this.section)
      } catch (error) {
        console.debug("Could not refresh totals:", error)
      }
    }

    // Try to refresh config section if it shows current mile
    const configElement = document.getElementById("configSection")
    if (configElement) {
      try {
        const ConfigureSection = (await import("./ConfigureSection.js")).default
        ConfigureSection.render(configElement, this.section)
      } catch (error) {
        console.debug("Could not refresh config section:", error)
      }
    }
  }
}

export default GPSButton
