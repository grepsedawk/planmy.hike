import Page from "../../js/Page.js"

class GearPage extends Page {
  constructor(parent, params) {
    super()
    this.parent = parent
    this.template = "./pages/gear/index.html"
    this.title = "Gear Manager"
    this.description = "Manage your hiking gear and equipment"
    this.params = params
  }

  async render() {
    await this.renderPage()
    await this.loadGear()
    this.setupEventListeners()
    this.setupFilters()
  }

  async loadGear() {
    try {
      const [gear, categories] = await Promise.all([
        db.gear.toArray(),
        db.gearCategories.toArray()
      ])

      this.renderGearList(gear, categories)
      this.updateStats(gear, categories)
    } catch (error) {
      console.error('Error loading gear:', error)
    }
  }

  async renderGearList(gear, categories) {
    const gearListElement = document.getElementById('gearList')
    
    if (gear.length === 0) {
      gearListElement.innerHTML = `
        <div class="text-center py-8">
          <span class="material-icons text-6xl text-tertiary mb-4">backpack</span>
          <h3>No Gear Yet</h3>
          <p class="text-tertiary mb-4">Start building your gear list by adding your first item.</p>
          <button onclick="showAddGearModal()" class="btn btn-primary">
            <span class="material-icons">add</span>
            Add First Gear Item
          </button>
        </div>
      `
      return
    }

    // Group gear by category
    const categoryMap = categories.reduce((map, cat) => {
      map[cat.id] = cat
      return map
    }, {})

    const gearByCategory = gear.reduce((groups, item) => {
      const categoryId = item.categoryId || 'uncategorized'
      if (!groups[categoryId]) {
        groups[categoryId] = []
      }
      groups[categoryId].push(item)
      return groups
    }, {})

    let html = ''
    
    // Render each category
    for (const [categoryId, items] of Object.entries(gearByCategory)) {
      const category = categoryMap[categoryId]
      const categoryName = category ? category.name : 'Uncategorized'
      const totalWeight = items.reduce((sum, item) => sum + item.totalWeight, 0)
      const totalPrice = items.reduce((sum, item) => sum + item.totalPrice, 0)

      html += `
        <div class="category-section mb-6">
          <div class="category-header flex items-center justify-between p-4 bg-gray-50 rounded-t-lg border-b">
            <div class="flex items-center gap-3">
              <h3 class="font-medium">${categoryName}</h3>
              <span class="badge">${items.length} items</span>
            </div>
            <div class="flex items-center gap-4 text-sm text-tertiary">
              <span>${(totalWeight / 28.3495).toFixed(1)}oz</span>
              <span>$${(totalPrice / 100).toFixed(2)}</span>
            </div>
          </div>
          <div class="gear-items">
            ${items.map(item => this.renderGearItem(item)).join('')}
          </div>
        </div>
      `
    }

    gearListElement.innerHTML = html
  }

  renderGearItem(item) {
    return `
      <div class="gear-item flex items-center justify-between p-4 border-b hover:bg-gray-50" data-gear-id="${item.id}">
        <div class="flex-1">
          <div class="flex items-center gap-3">
            <div class="font-medium">${item.name}</div>
            ${item.quantity > 1 ? `<span class="badge badge-outline">×${item.quantity}</span>` : ''}
          </div>
          ${item.description ? `<div class="text-sm text-tertiary mt-1">${item.description}</div>` : ''}
          ${item.vendor ? `<div class="text-sm text-tertiary">Brand: ${item.vendor}</div>` : ''}
        </div>
        <div class="flex items-center gap-4">
          <div class="text-right">
            <div class="font-medium">${item.getWeightDisplay()}</div>
            <div class="text-sm text-tertiary">${item.priceFormatted}</div>
          </div>
          <div class="flex gap-2">
            <button onclick="editGear(${item.id})" class="btn btn-sm btn-outline" title="Edit">
              <span class="material-icons">edit</span>
            </button>
            <button onclick="deleteGear(${item.id})" class="btn btn-sm btn-outline" title="Delete">
              <span class="material-icons">delete</span>
            </button>
          </div>
        </div>
      </div>
    `
  }

  updateStats(gear, categories) {
    const totalItems = gear.length
    const totalWeight = gear.reduce((sum, item) => sum + item.totalWeight, 0)
    const totalPrice = gear.reduce((sum, item) => sum + item.totalPrice, 0)

    document.getElementById('totalItems').textContent = totalItems
    document.getElementById('totalWeight').textContent = `${(totalWeight / 28.3495).toFixed(1)}oz`
    document.getElementById('totalPrice').textContent = `$${(totalPrice / 100).toFixed(2)}`
    document.getElementById('totalCategories').textContent = categories.length
  }

  setupEventListeners() {
    // Global functions for gear management
    window.showAddGearModal = () => {
      // TODO: Implement add gear modal
      alert('Add gear functionality coming soon!')
    }

    window.editGear = (id) => {
      // TODO: Implement edit gear
      alert(`Edit gear ${id} functionality coming soon!`)
    }

    window.deleteGear = async (id) => {
      if (confirm('Are you sure you want to delete this gear item?')) {
        try {
          await db.gear.delete(id)
          this.loadGear() // Refresh the list
        } catch (error) {
          console.error('Error deleting gear:', error)
          alert('Error deleting gear item')
        }
      }
    }

    window.exportGear = async () => {
      try {
        const gear = await db.gear.toArray()
        const categories = await db.gearCategories.toArray()
        
        // Create CSV content
        const csvHeaders = ['Name', 'Category', 'Weight (g)', 'Weight (oz)', 'Price', 'Quantity', 'Description', 'Vendor', 'URL']
        const csvRows = []
        
        for (const item of gear) {
          const category = categories.find(c => c.id === item.categoryId)
          csvRows.push([
            item.name,
            category ? category.name : 'Uncategorized',
            item.totalWeight.toFixed(1),
            item.weightInOunces.toFixed(2),
            item.priceFormatted,
            item.quantity,
            item.description || '',
            item.vendor || '',
            item.url || ''
          ])
        }
        
        const csvContent = [csvHeaders, ...csvRows].map(row => 
          row.map(field => `"${field}"`).join(',')
        ).join('\n')
        
        const blob = new Blob([csvContent], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'gear-list.csv'
        a.click()
        URL.revokeObjectURL(url)
      } catch (error) {
        console.error('Error exporting gear:', error)
        alert('Error exporting gear list')
      }
    }

    window.importGear = () => {
      // TODO: Implement import functionality
      alert('Import gear functionality coming soon!')
    }
  }

  setupFilters() {
    // TODO: Implement filtering and sorting
    const sortSelect = document.getElementById('sortSelect')
    const filterInput = document.getElementById('filterInput')
    
    if (sortSelect) {
      sortSelect.addEventListener('change', () => {
        // TODO: Implement sorting
      })
    }
    
    if (filterInput) {
      filterInput.addEventListener('input', () => {
        // TODO: Implement filtering
      })
    }
  }
}

export default GearPage