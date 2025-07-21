import Page from "../../js/Page.js"

class SectionDetailPage extends Page {
  constructor(parent, sectionId) {
    super()
    this.parent = parent
    this.sectionId = sectionId
    this.section = null
    this.title = "Section Details"
    this.description = "View section details"
  }

  async render() {
    // Set page title and description
    document.title = this.title
    document.querySelector('meta[name="description"]')?.setAttribute("content", this.description)
    
    // Clear parent content
    this.parent.innerHTML = ""

    this.section = await db.sections.get(parseInt(this.sectionId))
    
    if (!this.section) {
      const errorDiv = document.createElement("div")
      errorDiv.classList.add("error")
      errorDiv.textContent = "Section not found"
      this.parent.appendChild(errorDiv)
      return
    }

    this.renderSectionInfo()
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
      <p><strong>GPS Tracking:</strong> ${this.section.gpsTrackingEnabled ? 'Enabled' : 'Disabled'}</p>
    `
    infoDiv.appendChild(details)
    
    // Add navigation to food page
    const foodButton = document.createElement("button")
    foodButton.textContent = "Plan Food"
    foodButton.classList.add("btn", "btn-primary")
    foodButton.addEventListener("click", () => {
      window.location.hash = `#/sections/${this.section.id}/food`
    })
    
    infoDiv.appendChild(foodButton)
    
    this.parent.appendChild(infoDiv)
  }
}

export default SectionDetailPage