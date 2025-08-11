import Page from "../../js/Page.js"

class HomePage extends Page {
  constructor(parent, params) {
    super()
    this.parent = parent
    this.template = "./pages/home/index.html"
    this.title = "Plan My Hike"
    this.description = "Your comprehensive hiking planning companion"
  }

  async render() {
    await this.renderPage()
    await this.loadDashboardData()
    this.setupChart()
    this.setupEventListeners()
  }

  async loadDashboardData() {
    try {
      const sections = await db.sections.toArray()
      const foods = await db.foods.toArray()

      // Calculate statistics
      const totalSections = sections.length
      const totalMiles = sections.reduce(
        (sum, s) => sum + (s.endMile - s.startMile),
        0,
      )
      const totalDays = sections.reduce((sum, s) => sum + s.days, 0)
      const totalCalories = foods.reduce((sum, f) => sum + (f.calories || 0), 0)

      // Update DOM elements
      document.getElementById("totalSections").textContent = totalSections
      document.getElementById("totalMiles").textContent = totalMiles.toFixed(1)
      document.getElementById("totalDays").textContent = totalDays
      document.getElementById("totalCalories").textContent =
        totalCalories.toLocaleString()

      // Update recent activity
      this.updateRecentActivity(sections)
    } catch (error) {
      console.error("Error loading dashboard data:", error)
    }
  }

  updateRecentActivity(sections) {
    const recentActivityElement = document.getElementById("recentActivity")

    if (sections.length === 0) {
      recentActivityElement.innerHTML =
        '<p class="text-center text-tertiary">No sections created yet. <a href="#/sections">Create your first section</a>!</p>'
      return
    }

    const recentSections = sections.slice(-3).reverse()
    const activityHTML = recentSections
      .map(
        (section) => `
      <div class="flex items-center justify-between py-2 border-b border-gray-200">
        <div>
          <div class="font-medium">${section.name}</div>
          <div class="text-sm text-tertiary">${section.endMile - section.startMile} miles • ${section.days} days</div>
        </div>
        <a href="#/sections/${section.id}/food" class="btn btn-sm btn-outline">
          <span class="material-icons">arrow_forward</span>
        </a>
      </div>
    `,
      )
      .join("")

    recentActivityElement.innerHTML = activityHTML
  }

  setupChart() {
    const ctx = document.getElementById("progressChart")
    if (!ctx) return

    // Create a simple progress chart
    new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["Planned", "In Progress", "Completed"],
        datasets: [
          {
            data: [60, 30, 10],
            backgroundColor: ["#2196f3", "#ff9800", "#4caf50"],
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
          },
        },
      },
    })
  }

  setupEventListeners() {
    // Add global functions for import/export
    window.importData = () => {
      alert("Import functionality coming soon!")
    }

    window.exportData = async () => {
      try {
        const sections = await db.sections.toArray()
        const foods = await db.foods.toArray()
        const data = { sections, foods }

        const blob = new Blob([JSON.stringify(data, null, 2)], {
          type: "application/json",
        })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = "planmyhike-data.json"
        a.click()
        URL.revokeObjectURL(url)
      } catch (error) {
        console.error("Error exporting data:", error)
        alert("Error exporting data")
      }
    }
  }
}

export default HomePage
