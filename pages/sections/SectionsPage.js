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

    // Page header
    const header = document.createElement("div")
    header.classList.add("dashboard-header")
    header.innerHTML = `
      <h1><span class="material-icons mr-3">explore</span>Trail Sections</h1>
      <p class="text-tertiary">Plan and manage your hiking trail sections</p>
    `
    this.parent.appendChild(header)

    // Quick actions
    const quickActions = document.createElement("div")
    quickActions.classList.add("card-actions", "mb-6")
    this.parent.appendChild(quickActions)

    AddSection.renderTrigger(quickActions)

    // Sections container
    const sectionsContainer = document.createElement("div")
    sectionsContainer.classList.add("grid", "grid-cols-2")
    sectionsContainer.id = "sections-grid"
    this.parent.appendChild(sectionsContainer)

    // Load sections
    db.sections.toArray().then((sections) => {
      if (sections.length === 0) {
        this.renderEmptyState(sectionsContainer)
      } else {
        sections.forEach((s) => this.renderSection(s, sectionsContainer))
      }
    })
  }

  renderEmptyState(container) {
    const emptyState = document.createElement("div")
    emptyState.classList.add("card", "text-center")
    emptyState.style.gridColumn = "1 / -1"
    emptyState.innerHTML = `
      <div style="padding: var(--spacing-8) var(--spacing-4);">
        <span class="material-icons" style="font-size: 4rem; color: var(--text-tertiary); margin-bottom: var(--spacing-4); display: block;">explore_off</span>
        <h3 style="color: var(--text-secondary); margin-bottom: var(--spacing-2);">No Trail Sections Yet</h3>
        <p style="color: var(--text-tertiary); margin-bottom: var(--spacing-4);">Create your first trail section to start planning your hike and meals.</p>
        <button class="btn btn-primary" onclick="document.querySelector('.btn-primary').click()">
          <span class="material-icons">add</span>
          Create First Section
        </button>
      </div>
    `
    container.appendChild(emptyState)
  }

  renderSection(section, container = this.parent) {
    const sectionCard = document.createElement("div")
    sectionCard.classList.add("card")
    sectionCard.style.cursor = "pointer"

    // Calculate section miles
    const miles =
      section.endMile && section.startMile
        ? (parseFloat(section.endMile) - parseFloat(section.startMile)).toFixed(
            1,
          )
        : "0"

    // Current mile and progress display
    const currentMileInfo = section.currentMile
      ? `<div class="stat-item">
           <div class="stat-number">${section.currentMile}</div>
           <div class="stat-label">Current Mile</div>
         </div>
         <div class="stat-item">
           <div class="stat-number">${(section.progressPercentage || 0).toFixed(1)}%</div>
           <div class="stat-label">Progress</div>
         </div>`
      : ""

    sectionCard.innerHTML = `
      <div class="card-header">
        <h3 class="card-title">
          <span class="material-icons mr-3">hiking</span>
          ${section.name || "Unnamed Section"}
        </h3>
        <span class="badge primary">${miles} miles</span>
      </div>
      <div class="card-content">
        <div class="stats-mini">
          <div class="stat-item">
            <div class="stat-number">${section.startMile || 0}</div>
            <div class="stat-label">Start Mile</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">${section.endMile || 0}</div>
            <div class="stat-label">End Mile</div>
          </div>
          ${currentMileInfo}
          <div class="stat-item">
            <div class="stat-number">${section.days || 0}</div>
            <div class="stat-label">Days</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">${section.caloriesPerDay || 0}</div>
            <div class="stat-label">Cal/Day</div>
          </div>
        </div>
      </div>
      <div class="card-actions">
        <button class="btn btn-primary btn-sm">
          <span class="material-icons">restaurant</span>
          Plan Food
        </button>
      </div>
    `

    sectionCard.addEventListener("click", () => {
      window.location = `#/sections/${section.id}/food`
    })

    container.appendChild(sectionCard)
  }
}

export default SectionPage
