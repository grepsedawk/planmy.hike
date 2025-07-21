import Page from "../../js/Page.js"

class CategoryManager {
  constructor() {
    this.modal = null
    this.categories = []
  }

  async show() {
    await this.loadCategories()
    this.createModal()
    this.setupEventListeners()
    document.body.appendChild(this.modal)
    this.modal.classList.add('show')
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

  async loadCategories() {
    try {
      this.categories = await db.gearCategories.orderBy('name').toArray()
    } catch (error) {
      console.error('Error loading categories:', error)
      this.categories = []
    }
  }

  createModal() {
    this.modal = document.createElement('div')
    this.modal.className = 'modal-overlay'
    this.modal.innerHTML = `
      <div class="modal large">
        <div class="modal-header">
          <h3>Manage Categories</h3>
          <button type="button" class="modal-close" aria-label="Close">
            <span class="material-icons">close</span>
          </button>
        </div>
        <div class="modal-body">
          <div class="category-actions mb-4">
            <button id="addCategoryBtn" class="btn btn-primary">
              <span class="material-icons">add</span>
              Add Category
            </button>
          </div>
          
          <div id="categoryList" class="category-list">
            ${this.renderCategoryList()}
          </div>
          
          <div id="addCategoryForm" class="add-category-form" style="display: none;">
            <div class="form-group">
              <label for="categoryName">Category Name *</label>
              <input type="text" id="categoryName" class="form-control" placeholder="e.g., Shelter, Cooking, Clothing">
            </div>
            <div class="form-group">
              <label for="categoryDescription">Description</label>
              <textarea id="categoryDescription" class="form-control" rows="2" placeholder="Optional description..."></textarea>
            </div>
            <div class="form-group">
              <label for="categoryColor">Color</label>
              <input type="color" id="categoryColor" class="form-control" value="#2196f3">
            </div>
            <div class="form-actions">
              <button type="button" id="saveCategoryBtn" class="btn btn-primary">Save Category</button>
              <button type="button" id="cancelCategoryBtn" class="btn btn-outline">Cancel</button>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-outline modal-cancel">Close</button>
        </div>
      </div>
    `
  }

  renderCategoryList() {
    if (this.categories.length === 0) {
      return `
        <div class="empty-state text-center py-4">
          <span class="material-icons text-6xl text-tertiary mb-2">category</span>
          <h4>No Categories Yet</h4>
          <p class="text-tertiary">Create categories to organize your gear</p>
        </div>
      `
    }

    return this.categories.map(category => `
      <div class="category-item" data-category-id="${category.id}">
        <div class="category-info">
          <div class="category-color" style="background-color: ${category.color}"></div>
          <div class="category-details">
            <div class="category-name">${category.name}</div>
            ${category.description ? `<div class="category-description">${category.description}</div>` : ''}
          </div>
        </div>
        <div class="category-actions">
          <button class="btn btn-sm btn-outline edit-category" data-id="${category.id}" title="Edit">
            <span class="material-icons">edit</span>
          </button>
          <button class="btn btn-sm btn-outline delete-category" data-id="${category.id}" title="Delete">
            <span class="material-icons">delete</span>
          </button>
        </div>
      </div>
    `).join('')
  }

  setupEventListeners() {
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
    
    // Add category button
    const addBtn = this.modal.querySelector('#addCategoryBtn')
    addBtn.addEventListener('click', () => this.showAddForm())
    
    // Save category button
    const saveBtn = this.modal.querySelector('#saveCategoryBtn')
    saveBtn.addEventListener('click', () => this.saveCategory())
    
    // Cancel add category
    const cancelAddBtn = this.modal.querySelector('#cancelCategoryBtn')
    cancelAddBtn.addEventListener('click', () => this.hideAddForm())
    
    // Edit and delete buttons
    this.modal.addEventListener('click', (e) => {
      if (e.target.closest('.edit-category')) {
        const id = parseInt(e.target.closest('.edit-category').dataset.id)
        this.editCategory(id)
      } else if (e.target.closest('.delete-category')) {
        const id = parseInt(e.target.closest('.delete-category').dataset.id)
        this.deleteCategory(id)
      }
    })
    
    // ESC key to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal) {
        this.hide()
      }
    })
  }

  showAddForm(category = null) {
    const form = this.modal.querySelector('#addCategoryForm')
    const addBtn = this.modal.querySelector('#addCategoryBtn')
    const saveBtn = this.modal.querySelector('#saveCategoryBtn')
    
    form.style.display = 'block'
    addBtn.style.display = 'none'
    
    // Reset button for add mode
    if (!category) {
      saveBtn.textContent = 'Save Category'
      saveBtn.onclick = () => this.saveCategory()
    }
    
    // Focus name input
    const nameInput = form.querySelector('#categoryName')
    setTimeout(() => nameInput.focus(), 100)
  }

  hideAddForm() {
    const form = this.modal.querySelector('#addCategoryForm')
    const addBtn = this.modal.querySelector('#addCategoryBtn')
    const saveBtn = this.modal.querySelector('#saveCategoryBtn')
    
    form.style.display = 'none'
    addBtn.style.display = 'block'
    
    // Clear form
    form.querySelector('#categoryName').value = ''
    form.querySelector('#categoryDescription').value = ''
    form.querySelector('#categoryColor').value = '#2196f3'
    
    // Reset button
    saveBtn.textContent = 'Save Category'
    saveBtn.onclick = () => this.saveCategory()
  }

  async saveCategory() {
    const nameInput = this.modal.querySelector('#categoryName')
    const descInput = this.modal.querySelector('#categoryDescription')
    const colorInput = this.modal.querySelector('#categoryColor')
    
    const name = nameInput.value.trim()
    if (!name) {
      alert('Category name is required')
      nameInput.focus()
      return
    }
    
    try {
      const categoryData = {
        name: name,
        description: descInput.value.trim(),
        color: colorInput.value,
        dateCreated: new Date()
      }
      
      await db.gearCategories.add(categoryData)
      
      // Refresh the category list
      await this.loadCategories()
      this.refreshCategoryList()
      this.hideAddForm()
      
      // Refresh gear page if available
      if (window.currentGearPage && typeof window.currentGearPage.loadGear === 'function') {
        window.currentGearPage.loadGear()
      }
      
      this.showSuccessMessage(`Category "${name}" created successfully!`)
    } catch (error) {
      console.error('Error saving category:', error)
      alert('Error saving category. Please try again.')
    }
  }

  async editCategory(id) {
    const category = this.categories.find(c => c.id === id)
    if (!category) return
    
    // Show the form with current values
    this.showAddForm(category)
    
    // Update form title and button
    const form = this.modal.querySelector('#addCategoryForm')
    const saveBtn = this.modal.querySelector('#saveCategoryBtn')
    
    // Fill form with current values
    form.querySelector('#categoryName').value = category.name
    form.querySelector('#categoryDescription').value = category.description || ''
    form.querySelector('#categoryColor').value = category.color || '#2196f3'
    
    // Change save button to update
    saveBtn.textContent = 'Update Category'
    saveBtn.onclick = () => this.updateCategory(id)
  }

  async updateCategory(id) {
    const nameInput = this.modal.querySelector('#categoryName')
    const descInput = this.modal.querySelector('#categoryDescription')
    const colorInput = this.modal.querySelector('#categoryColor')
    
    const name = nameInput.value.trim()
    if (!name) {
      alert('Category name is required')
      nameInput.focus()
      return
    }
    
    try {
      const categoryData = {
        id: id,
        name: name,
        description: descInput.value.trim(),
        color: colorInput.value,
        dateCreated: new Date()
      }
      
      await db.gearCategories.put(categoryData)
      
      // Refresh the category list
      await this.loadCategories()
      this.refreshCategoryList()
      this.hideAddForm()
      
      // Refresh gear page if available
      if (window.currentGearPage && typeof window.currentGearPage.loadGear === 'function') {
        window.currentGearPage.loadGear()
      }
      
      this.showSuccessMessage(`Category "${name}" updated successfully!`)
    } catch (error) {
      console.error('Error updating category:', error)
      alert('Error updating category. Please try again.')
    }
  }

  async deleteCategory(id) {
    const category = this.categories.find(c => c.id === id)
    if (!category) return
    
    // Check if category has items
    const itemCount = await db.gear.where('categoryId').equals(id).count()
    
    if (itemCount > 0) {
      const confirmed = confirm(`Category "${category.name}" contains ${itemCount} item(s). Deleting it will move those items to "Uncategorized". Continue?`)
      if (!confirmed) return
      
      // Move items to uncategorized
      await db.gear.where('categoryId').equals(id).modify({ categoryId: null })
    } else {
      const confirmed = confirm(`Are you sure you want to delete category "${category.name}"?`)
      if (!confirmed) return
    }
    
    try {
      await db.gearCategories.delete(id)
      
      // Refresh the category list
      await this.loadCategories()
      this.refreshCategoryList()
      
      // Refresh gear page if available
      if (window.currentGearPage && typeof window.currentGearPage.loadGear === 'function') {
        window.currentGearPage.loadGear()
      }
      
      this.showSuccessMessage(`Category "${category.name}" deleted successfully!`)
    } catch (error) {
      console.error('Error deleting category:', error)
      alert('Error deleting category. Please try again.')
    }
  }

  refreshCategoryList() {
    const listContainer = this.modal.querySelector('#categoryList')
    listContainer.innerHTML = this.renderCategoryList()
  }

  showSuccessMessage(message) {
    const msgElement = document.createElement('div')
    msgElement.className = 'success-message'
    msgElement.innerHTML = `
      <div class="success-content">
        <span class="material-icons">check_circle</span>
        ${message}
      </div>
    `
    document.body.appendChild(msgElement)
    
    setTimeout(() => {
      msgElement.classList.add('show')
    }, 100)
    
    setTimeout(() => {
      msgElement.classList.remove('show')
      setTimeout(() => {
        if (msgElement.parentNode) {
          msgElement.parentNode.removeChild(msgElement)
        }
      }, 300)
    }, 3000)
  }
}

export default CategoryManager