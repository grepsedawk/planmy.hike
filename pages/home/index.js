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
      const totalMiles = sections.reduce((sum, s) => sum + (s.endMile - s.startMile), 0)
      const totalDays = sections.reduce((sum, s) => sum + s.days, 0)
      const totalCalories = foods.reduce((sum, f) => sum + (f.calories || 0), 0)

      // Update DOM elements
      document.getElementById('totalSections').textContent = totalSections
      document.getElementById('totalMiles').textContent = totalMiles.toFixed(1)
      document.getElementById('totalDays').textContent = totalDays
      document.getElementById('totalCalories').textContent = totalCalories.toLocaleString()

      // Update recent activity
      this.updateRecentActivity(sections)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    }
  }

  updateRecentActivity(sections) {
    const recentActivityElement = document.getElementById('recentActivity')
    
    if (sections.length === 0) {
      recentActivityElement.innerHTML = '<p class="text-center text-tertiary">No sections created yet. <a href="#/sections">Create your first section</a>!</p>'
      return
    }

    const recentSections = sections.slice(-3).reverse()
    const activityHTML = recentSections.map(section => `
      <div class="flex items-center justify-between py-2 border-b border-gray-200">
        <div>
          <div class="font-medium">${section.name}</div>
          <div class="text-sm text-tertiary">${section.endMile - section.startMile} miles • ${section.days} days</div>
        </div>
        <a href="#/sections/${section.id}/food" class="btn btn-sm btn-outline">
          <span class="material-icons">arrow_forward</span>
        </a>
      </div>
    `).join('')

    recentActivityElement.innerHTML = activityHTML
  }

  setupChart() {
    const ctx = document.getElementById('progressChart')
    if (!ctx) return

    // Check if Chart.js is available
    if (typeof Chart === 'undefined') {
      console.warn('Chart.js not loaded, skipping chart setup')
      ctx.innerHTML = '<div class="text-center text-tertiary p-4">Chart functionality requires Chart.js library</div>'
      return
    }

    // Create a simple progress chart
    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Planned', 'In Progress', 'Completed'],
        datasets: [{
          data: [60, 30, 10],
          backgroundColor: [
            '#2196f3',
            '#ff9800',
            '#4caf50'
          ],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    })
  }

  setupEventListeners() {
    // Sync functionality using SyncManager
    window.importData = () => {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = '.json'
      input.onchange = async (e) => {
        try {
          const file = e.target.files[0]
          if (!file) return
          
          if (confirm('This will import data and merge it with your existing data. Continue?')) {
            await window.syncManager.uploadBackup(file)
            alert('Data imported successfully!')
            // Refresh the page data
            await this.loadDashboardData()
          }
        } catch (error) {
          console.error('Error importing data:', error)
          alert('Error importing data: ' + error.message)
        }
      }
      input.click()
    }

    window.exportData = async () => {
      try {
        await window.syncManager.downloadBackup()
        alert('Data exported successfully!')
      } catch (error) {
        console.error('Error exporting data:', error)
        alert('Error exporting data: ' + error.message)
      }
    }

    // Listen for sync status changes
    window.addEventListener('syncStatusChange', (event) => {
      this.updateSyncStatus(event.detail)
    })

    // Initial sync status update
    this.updateSyncStatus(window.syncManager.getSyncStatus())
  }

  updateSyncStatus(status) {
    // Update sync indicators if they exist in the UI
    const syncIndicator = document.getElementById('syncStatus')
    if (syncIndicator) {
      syncIndicator.innerHTML = `
        <div class="flex items-center gap-2 text-sm">
          <span class="material-icons text-sm ${status.isOnline ? 'text-green-500' : 'text-gray-400'}">
            ${status.isOnline ? 'cloud_done' : 'cloud_off'}
          </span>
          <span class="text-tertiary">
            ${status.isOnline ? 'Online' : 'Offline'}
            ${status.lastSyncTime ? ` • Last backup: ${new Date(status.lastSyncTime).toLocaleDateString()}` : ''}
          </span>
        </div>
      `
    }
  }
}

export default HomePage
