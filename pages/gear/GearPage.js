import Page from "../../js/Page.js"
import AddGearModal from "./AddGearModal.js"
import CategoryManager from "./CategoryManager.js"

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
    
    // Make this page available globally for modal callbacks
    window.currentGearPage = this
  }

  async loadGear() {
    try {
      const [gear, categories] = await Promise.all([
        db.gear.toArray(),
        db.gearCategories.toArray()
      ])

      // Apply current filters and sorting
      const filteredAndSortedGear = this.applyFiltersAndSort(gear)
      
      this.renderGearList(filteredAndSortedGear, categories)
      this.updateStats(gear, categories) // Use original gear for stats
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
      const modal = new AddGearModal()
      modal.show()
    }

    window.editGear = async (id) => {
      try {
        const gearItem = await db.gear.get(id)
        if (gearItem) {
          const modal = new AddGearModal(gearItem)
          modal.show()
        } else {
          alert('Gear item not found')
        }
      } catch (error) {
        console.error('Error loading gear for edit:', error)
        alert('Error loading gear item')
      }
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
      this.showImportModal()
    }

    window.manageCategoriesModal = () => {
      const categoryManager = new CategoryManager()
      categoryManager.show()
    }
  }

  setupFilters() {
    const sortSelect = document.getElementById('sortSelect')
    const filterInput = document.getElementById('filterInput')
    
    if (sortSelect) {
      sortSelect.addEventListener('change', () => {
        this.loadGear() // Reload with new sorting
      })
    }
    
    if (filterInput) {
      filterInput.addEventListener('input', () => {
        this.loadGear() // Reload with new filtering
      })
    }
  }

  applyFiltersAndSort(gear) {
    let filteredGear = [...gear]
    
    // Apply text filter
    const filterInput = document.getElementById('filterInput')
    if (filterInput && filterInput.value.trim()) {
      const filterText = filterInput.value.toLowerCase().trim()
      filteredGear = filteredGear.filter(item => 
        item.name.toLowerCase().includes(filterText) ||
        (item.description && item.description.toLowerCase().includes(filterText)) ||
        (item.vendor && item.vendor.toLowerCase().includes(filterText)) ||
        (item.notes && item.notes.toLowerCase().includes(filterText))
      )
    }
    
    // Apply sorting
    const sortSelect = document.getElementById('sortSelect')
    if (sortSelect && sortSelect.value) {
      const sortBy = sortSelect.value
      
      filteredGear.sort((a, b) => {
        switch (sortBy) {
          case 'name':
            return a.name.localeCompare(b.name)
          case 'name-desc':
            return b.name.localeCompare(a.name)
          case 'weight':
            return a.totalWeight - b.totalWeight
          case 'weight-desc':
            return b.totalWeight - a.totalWeight
          case 'price':
            return a.totalPrice - b.totalPrice
          case 'price-desc':
            return b.totalPrice - a.totalPrice
          case 'date':
            return new Date(a.dateAdded) - new Date(b.dateAdded)
          case 'date-desc':
            return new Date(b.dateAdded) - new Date(a.dateAdded)
          default:
            return 0
        }
      })
    }
    
    return filteredGear
  }

  showImportModal() {
    const modal = document.createElement('div')
    modal.className = 'modal-overlay'
    modal.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <h3>Import Gear</h3>
          <button type="button" class="modal-close" aria-label="Close">
            <span class="material-icons">close</span>
          </button>
        </div>
        <div class="modal-body">
          <p class="text-tertiary mb-4">
            Import gear from CSV files. Supports LighterPack exports and our format.
          </p>
          
          <div class="form-group">
            <label for="importFile">Select CSV File</label>
            <input type="file" id="importFile" accept=".csv" class="form-control">
          </div>
          
          <div class="form-group">
            <label>
              <input type="checkbox" id="clearExisting"> 
              Clear existing gear before import
            </label>
          </div>
          
          <div class="import-preview" id="importPreview" style="display: none;">
            <h4>Preview</h4>
            <div id="previewContent"></div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-outline import-cancel">Cancel</button>
          <button type="button" class="btn btn-primary import-confirm" disabled>Import Gear</button>
        </div>
      </div>
    `

    // Setup event listeners
    const closeBtn = modal.querySelector('.modal-close')
    const cancelBtn = modal.querySelector('.import-cancel')
    const confirmBtn = modal.querySelector('.import-confirm')
    const fileInput = modal.querySelector('#importFile')
    
    const closeModal = () => {
      modal.classList.remove('show')
      setTimeout(() => {
        if (modal.parentNode) modal.parentNode.removeChild(modal)
      }, 300)
    }
    
    closeBtn.addEventListener('click', closeModal)
    cancelBtn.addEventListener('click', closeModal)
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal()
    })
    
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0]
      if (file) {
        this.previewImport(file, modal)
      }
    })
    
    confirmBtn.addEventListener('click', () => {
      this.executeImport(modal)
    })
    
    document.body.appendChild(modal)
    setTimeout(() => modal.classList.add('show'), 100)
  }

  async previewImport(file, modal) {
    try {
      const text = await file.text()
      const rows = text.split('\n').map(row => {
        // Simple CSV parsing - could be enhanced for complex cases
        return row.split(',').map(cell => cell.replace(/^"|"$/g, '').trim())
      }).filter(row => row.length > 1 && row[0])
      
      if (rows.length === 0) {
        alert('No data found in CSV file')
        return
      }
      
      const headers = rows[0]
      const data = rows.slice(1)
      
      // Detect format (LighterPack vs our format)
      const isLighterPack = headers.some(h => 
        h.toLowerCase().includes('item') || 
        h.toLowerCase().includes('category') ||
        h.toLowerCase().includes('weight')
      )
      
      const preview = modal.querySelector('#importPreview')
      const content = modal.querySelector('#previewContent')
      
      content.innerHTML = `
        <p><strong>Format:</strong> ${isLighterPack ? 'LighterPack' : 'Plan My Hike'}</p>
        <p><strong>Items found:</strong> ${data.length}</p>
        <div class="preview-table">
          <table class="table">
            <thead>
              <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
            </thead>
            <tbody>
              ${data.slice(0, 5).map(row => 
                `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`
              ).join('')}
              ${data.length > 5 ? `<tr><td colspan="${headers.length}">... and ${data.length - 5} more items</td></tr>` : ''}
            </tbody>
          </table>
        </div>
      `
      
      preview.style.display = 'block'
      modal.querySelector('.import-confirm').disabled = false
      
      // Store data for import
      modal.importData = { headers, data, isLighterPack }
      
    } catch (error) {
      console.error('Error parsing CSV:', error)
      alert('Error reading CSV file. Please check the format.')
    }
  }

  async executeImport(modal) {
    const clearExisting = modal.querySelector('#clearExisting').checked
    const { headers, data, isLighterPack } = modal.importData
    
    try {
      if (clearExisting) {
        await db.gear.clear()
      }
      
      const imported = []
      
      for (const row of data) {
        if (row.length < 2) continue // Skip empty rows
        
        let gearData
        
        if (isLighterPack) {
          // Map LighterPack format
          gearData = this.mapLighterPackRow(headers, row)
        } else {
          // Map our format
          gearData = this.mapPlanMyHikeRow(headers, row)
        }
        
        if (gearData && gearData.name) {
          imported.push(gearData)
        }
      }
      
      if (imported.length > 0) {
        await db.gear.bulkAdd(imported)
        
        // Close modal
        modal.classList.remove('show')
        setTimeout(() => {
          if (modal.parentNode) modal.parentNode.removeChild(modal)
        }, 300)
        
        // Refresh gear list
        this.loadGear()
        
        alert(`Successfully imported ${imported.length} gear items!`)
      } else {
        alert('No valid gear items found to import.')
      }
      
    } catch (error) {
      console.error('Error importing gear:', error)
      alert('Error importing gear. Please try again.')
    }
  }

  mapLighterPackRow(headers, row) {
    const getValue = (fieldNames) => {
      for (const name of fieldNames) {
        const index = headers.findIndex(h => h.toLowerCase().includes(name.toLowerCase()))
        if (index >= 0 && row[index]) {
          return row[index].trim()
        }
      }
      return ''
    }
    
    const name = getValue(['item', 'name', 'description'])
    if (!name) return null
    
    const weightStr = getValue(['weight', 'oz', 'grams'])
    let weight = 0
    if (weightStr) {
      const weightMatch = weightStr.match(/[\d.]+/)
      if (weightMatch) {
        weight = parseFloat(weightMatch[0])
        // Convert oz to grams if needed
        if (weightStr.toLowerCase().includes('oz')) {
          weight = weight * 28.3495
        }
      }
    }
    
    const priceStr = getValue(['price', 'cost', '$'])
    let price = 0
    if (priceStr) {
      const priceMatch = priceStr.match(/[\d.]+/)
      if (priceMatch) {
        price = Math.round(parseFloat(priceMatch[0]) * 100) // Convert to cents
      }
    }
    
    return {
      name: name,
      weight: weight,
      price: price,
      quantity: 1,
      description: getValue(['desc', 'description', 'notes']) || '',
      vendor: getValue(['brand', 'vendor', 'manufacturer']) || '',
      url: getValue(['url', 'link']) || '',
      notes: '',
      categoryId: null,
      dateAdded: new Date(),
      lastUsed: null,
      timesUsed: 0
    }
  }

  mapPlanMyHikeRow(headers, row) {
    const getValue = (index) => index < row.length ? row[index].trim() : ''
    
    if (!getValue(0)) return null // Name is required
    
    return {
      name: getValue(0),
      weight: parseFloat(getValue(2)) || 0,
      price: Math.round((parseFloat(getValue(4).replace('$', '')) || 0) * 100),
      quantity: parseInt(getValue(5)) || 1,
      description: getValue(6) || '',
      vendor: getValue(7) || '',
      url: getValue(8) || '',
      notes: '',
      categoryId: null,
      dateAdded: new Date(),
      lastUsed: null,
      timesUsed: 0
    }
  }
}

export default GearPage