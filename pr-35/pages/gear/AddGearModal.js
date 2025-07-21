import Page from "../../js/Page.js"

class AddGearModal {
  constructor(gearItem = null) {
    this.modal = null
    this.form = null
    this.gearItem = gearItem // For editing existing gear
    this.isEditing = !!gearItem
  }

  show() {
    this.createModal()
    this.setupEventListeners()
    document.body.appendChild(this.modal)
    this.modal.classList.add('show')
    
    // Focus first input
    const firstInput = this.modal.querySelector('input[name="name"]')
    if (firstInput) {
      setTimeout(() => firstInput.focus(), 100)
    }
  }

  hide() {
    if (this.modal) {
      this.modal.classList.remove('show')
      setTimeout(() => {
        if (this.modal && this.modal.parentNode) {
          this.modal.parentNode.removeChild(this.modal)
        }
      }, 300)
    }
  }

  createModal() {
    this.modal = document.createElement('div')
    this.modal.className = 'modal-overlay'
    this.modal.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <h3>${this.isEditing ? 'Edit Gear Item' : 'Add Gear Item'}</h3>
          <button type="button" class="modal-close" aria-label="Close">
            <span class="material-icons">close</span>
          </button>
        </div>
        <div class="modal-body">
          <form id="addGearForm" class="gear-form">
            <div class="form-row">
              <div class="form-group">
                <label for="gearName">Name *</label>
                <input type="text" id="gearName" name="name" required class="form-control" placeholder="e.g., Osprey Atmos 65" value="${this.isEditing ? this.gearItem.name : ''}">
              </div>
              <div class="form-group">
                <label for="gearCategory">Category</label>
                <select id="gearCategory" name="categoryId" class="form-control">
                  <option value="">Uncategorized</option>
                </select>
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label for="gearWeight">Weight (grams)</label>
                <input type="number" id="gearWeight" name="weight" min="0" step="0.1" class="form-control" placeholder="e.g., 2040" value="${this.isEditing ? this.gearItem.weight : ''}">
              </div>
              <div class="form-group">
                <label for="gearQuantity">Quantity</label>
                <input type="number" id="gearQuantity" name="quantity" min="1" value="${this.isEditing ? this.gearItem.quantity : '1'}" class="form-control">
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label for="gearPrice">Price ($)</label>
                <input type="number" id="gearPrice" name="price" min="0" step="0.01" class="form-control" placeholder="e.g., 249.95" value="${this.isEditing && this.gearItem.price ? (this.gearItem.price / 100).toFixed(2) : ''}">
              </div>
              <div class="form-group">
                <label for="gearVendor">Brand/Vendor</label>
                <input type="text" id="gearVendor" name="vendor" class="form-control" placeholder="e.g., Osprey" value="${this.isEditing ? this.gearItem.vendor || '' : ''}">
              </div>
            </div>
            
            <div class="form-group">
              <label for="gearDescription">Description</label>
              <textarea id="gearDescription" name="description" class="form-control" rows="2" placeholder="Optional description...">${this.isEditing ? this.gearItem.description || '' : ''}</textarea>
            </div>
            
            <div class="form-group">
              <label for="gearUrl">URL/Reference</label>
              <input type="url" id="gearUrl" name="url" class="form-control" placeholder="https://..." value="${this.isEditing ? this.gearItem.url || '' : ''}">
            </div>
            
            <div class="form-group">
              <label for="gearNotes">Notes</label>
              <textarea id="gearNotes" name="notes" class="form-control" rows="2" placeholder="Personal notes, usage tips, etc.">${this.isEditing ? this.gearItem.notes || '' : ''}</textarea>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-outline modal-cancel">Cancel</button>
          <button type="submit" form="addGearForm" class="btn btn-primary">
            <span class="material-icons">${this.isEditing ? 'save' : 'add'}</span>
            ${this.isEditing ? 'Update Gear' : 'Add Gear'}
          </button>
        </div>
      </div>
    `
  }

  async setupEventListeners() {
    // Load categories for the dropdown
    await this.loadCategories()
    
    // Set selected category if editing
    if (this.isEditing && this.gearItem.categoryId) {
      const select = this.modal.querySelector('#gearCategory')
      select.value = this.gearItem.categoryId
    }
    
    // Close button
    const closeBtn = this.modal.querySelector('.modal-close')
    closeBtn.addEventListener('click', () => this.hide())
    
    // Cancel button
    const cancelBtn = this.modal.querySelector('.modal-cancel')
    cancelBtn.addEventListener('click', () => this.hide())
    
    // Overlay click (close modal)
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.hide()
      }
    })
    
    // Form submission
    const form = this.modal.querySelector('#addGearForm')
    form.addEventListener('submit', (e) => this.handleSubmit(e))
    
    // ESC key to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal) {
        this.hide()
      }
    })
  }

  async loadCategories() {
    try {
      const categories = await db.gearCategories.orderBy('name').toArray()
      const select = this.modal.querySelector('#gearCategory')
      
      // Clear existing options except first
      while (select.children.length > 1) {
        select.removeChild(select.lastChild)
      }
      
      // Add category options
      categories.forEach(category => {
        const option = document.createElement('option')
        option.value = category.id
        option.textContent = category.name
        select.appendChild(option)
      })
    } catch (error) {
      console.error('Error loading categories:', error)
    }
  }

  async handleSubmit(e) {
    e.preventDefault()
    
    const formData = new FormData(e.target)
    
    // Create gear object directly and then add to database
    const gearData = {
      name: formData.get('name').trim(),
      weight: parseFloat(formData.get('weight')) || 0,
      price: Math.round((parseFloat(formData.get('price')) || 0) * 100), // Convert to cents
      quantity: parseInt(formData.get('quantity')) || 1,
      description: formData.get('description').trim(),
      vendor: formData.get('vendor').trim(),
      url: formData.get('url').trim(),
      notes: formData.get('notes').trim(),
      categoryId: formData.get('categoryId') || null,
    }
    
    if (this.isEditing) {
      // Update existing gear
      gearData.id = this.gearItem.id
      gearData.dateAdded = this.gearItem.dateAdded
      gearData.lastUsed = this.gearItem.lastUsed
      gearData.timesUsed = this.gearItem.timesUsed
    } else {
      // New gear
      gearData.dateAdded = new Date()
      gearData.lastUsed = null
      gearData.timesUsed = 0
    }
    
    if (!gearData.name) {
      alert('Name is required')
      return
    }
    
    try {
      if (this.isEditing) {
        await db.gear.put(gearData)
      } else {
        await db.gear.add(gearData)
      }
      
      this.hide()
      
      // Trigger refresh of gear list if GearPage is available
      if (window.currentGearPage && typeof window.currentGearPage.loadGear === 'function') {
        window.currentGearPage.loadGear()
      }
      
      // Show success message
      this.showSuccessMessage(gearData.name, this.isEditing)
    } catch (error) {
      console.error('Error saving gear:', error)
      alert('Error saving gear item. Please try again.')
    }
  }

  showSuccessMessage(gearName, isEditing = false) {
    // Simple success message - could be enhanced with a proper toast system
    const message = document.createElement('div')
    message.className = 'success-message'
    message.innerHTML = `
      <div class="success-content">
        <span class="material-icons">check_circle</span>
        "${gearName}" ${isEditing ? 'updated' : 'added'} successfully!
      </div>
    `
    document.body.appendChild(message)
    
    setTimeout(() => {
      message.classList.add('show')
    }, 100)
    
    setTimeout(() => {
      message.classList.remove('show')
      setTimeout(() => {
        if (message.parentNode) {
          message.parentNode.removeChild(message)
        }
      }, 300)
    }, 3000)
  }
}

export default AddGearModal