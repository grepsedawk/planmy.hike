import Page from "../../js/Page.js"
import AddSection from "./AddSection.js"

class SectionPage extends Page {
  constructor(parent) {
    super()
    this.parent = parent
    // this.template = "/pages/food/index.html"
    this.title = "Section Planner"
    this.description = "plan hike fast"
  }

  async render() {
    await this.renderPage()

    const quickActions = document.createElement("div")
    quickActions.classList.add("quickActions")
    this.parent.appendChild(quickActions)

    AddSection.renderTrigger(quickActions)

    db.sections
      .toArray()
      .then((sections) => sections.forEach((s) => this.renderSection(s)))
  }

  renderSection(section) {
    let display = document.createElement("div")
    display.classList.add("section-item")
    
    // Section name and basic info
    const nameDiv = document.createElement("div")
    nameDiv.classList.add("section-name")
    nameDiv.innerText = section.name
    display.appendChild(nameDiv)
    
    // Mile information
    const mileInfo = document.createElement("div")
    mileInfo.classList.add("section-miles")
    
    let mileText = `Miles: ${section.startMile || 0} - ${section.endMile || 0}`
    if (section.currentMile) {
      mileText += ` (Current: ${section.currentMile})`
      const progress = section.progressPercentage
      if (progress > 0) {
        mileText += ` [${progress.toFixed(1)}%]`
      }
    }
    
    mileInfo.innerText = mileText
    display.appendChild(mileInfo)
    
    // GPS tracking status
    if (section.gpsTrackingEnabled) {
      const gpsStatus = document.createElement("div")
      gpsStatus.classList.add("gps-status")
      gpsStatus.innerText = "📍 GPS Tracking Enabled"
      gpsStatus.style.color = "#28a745"
      gpsStatus.style.fontSize = "0.9em"
      display.appendChild(gpsStatus)
    }
    
    display.addEventListener(
      "click",
      () => (window.location = `#/sections/${section.id}`),
    )

    this.parent.appendChild(display)
  }
}

export default SectionPage
