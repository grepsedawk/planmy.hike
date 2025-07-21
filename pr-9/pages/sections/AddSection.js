import Renderer from "../../js/Renderer.js"
import Section from "../../js/Section.js"

class AddSection extends Renderer {
  constructor(section) {
    super()
    this.section = section
  }

  static renderTrigger(parent) {
    const button = document.createElement("button")
    button.classList.add("btn", "btn-primary")
    button.innerHTML = `
      <span class="material-icons">add</span>
      Create New Section
    `
    button.addEventListener("click", () => AddSection.render())

    parent.appendChild(button)
  }

  static render(section = new Section()) {
    return new AddSection(section).render()
  }

  render() {
    // Create modal overlay
    this.overlay = document.createElement("div")
    this.overlay.classList.add("food-form-modal")
    
    this.div = document.createElement("div")
    this.div.classList.add("food-form-container")
    
    // Header
    const header = document.createElement("div")
    header.classList.add("food-form-header")
    
    const title = document.createElement("h3")
    title.innerHTML = `<span class="material-icons mr-3">hiking</span>${this.section.id ? "Edit Trail Section" : "Create New Trail Section"}`
    title.style.margin = "0"
    title.style.display = "flex"
    title.style.alignItems = "center"
    
    this.closeButton = document.createElement("button")
    this.closeButton.classList.add("food-form-close")
    this.closeButton.innerHTML = `<span class="material-icons">close</span>`
    this.closeButton.addEventListener("click", () => this.close())
    
    header.appendChild(title)
    header.appendChild(this.closeButton)
    this.div.appendChild(header)
    
    // Form container
    const formContainer = document.createElement("div")
    formContainer.classList.add("food-form-grid")
    
    // Section name input (full width)
    this.nameInput = this.renderFormGroup(formContainer, "Section Name", "text", this.section.name, "Enter section name...", ["food-form-group"])
    
    // Start and end mile
    this.startMile = this.renderFormGroup(formContainer, "Start Mile", "number", this.section.startMile, "0", ["food-form-group-half"])
    this.endMile = this.renderFormGroup(formContainer, "End Mile", "number", this.section.endMile, "0", ["food-form-group-half"])
    
    // Days and calories per day
    this.days = this.renderFormGroup(formContainer, "Days", "number", this.section.days, "1", ["food-form-group-half"])
    this.caloriesPerDay = this.renderFormGroup(formContainer, "Calories Per Day", "number", this.section.caloriesPerDay, "2500", ["food-form-group-half"])
    
    // GPS tracking checkbox (full width)
    this.gpsTrackingCheckbox = this.renderCheckboxGroup(formContainer, "Enable GPS Tracking (PCT)", this.section.gpsTrackingEnabled || false)
    
    // Save button (full width)
    const buttonContainer = document.createElement("div")
    buttonContainer.classList.add("food-form-group")
    this.saveButton = document.createElement("button")
    this.saveButton.classList.add("btn", "btn-primary", "btn-lg")
    this.saveButton.innerHTML = `<span class="material-icons">save</span> ${this.section.id ? "Update Section" : "Create Section"}`
    this.saveButton.style.width = "100%"
    this.saveButton.addEventListener("click", () => this.save())
    buttonContainer.appendChild(this.saveButton)
    
    formContainer.appendChild(buttonContainer)
    this.div.appendChild(formContainer)
    this.overlay.appendChild(this.div)
    
    // Close on overlay click
    this.overlay.addEventListener("click", (e) => {
      if (e.target === this.overlay) {
        this.close()
      }
    })
    
    document.body.appendChild(this.overlay)
    
    // Focus on name input
    setTimeout(() => this.nameInput.focus(), 100)
  }

  renderFormGroup(parent, label, type, value, placeholder, classNames = ["food-form-group"]) {
    const group = document.createElement("div")
    
    // Handle multiple class names properly
    if (Array.isArray(classNames)) {
      classNames.forEach(cls => {
        if (cls && cls.trim()) {
          group.classList.add(cls.trim())
        }
      })
    } else {
      // Fallback for string input
      const classes = classNames.split(" ")
      classes.forEach(cls => {
        if (cls.trim()) {
          group.classList.add(cls.trim())
        }
      })
    }
    
    const labelEl = document.createElement("label")
    labelEl.classList.add("form-label")
    labelEl.textContent = label
    
    const input = document.createElement("input")
    input.classList.add("form-control")
    input.type = type
    input.value = value || ""
    input.placeholder = placeholder
    
    // Add step for number inputs
    if (type === "number") {
      input.step = "0.1"
      if (label.toLowerCase().includes("mile")) {
        input.min = "0"
      }
      if (label.toLowerCase().includes("days")) {
        input.min = "1"
        input.step = "1"
      }
      if (label.toLowerCase().includes("calories")) {
        input.min = "0"
        input.step = "50"
      }
    }
    
    group.appendChild(labelEl)
    group.appendChild(input)
    parent.appendChild(group)
    
    return input
  }

  renderCheckboxGroup(parent, label, checked) {
    const group = document.createElement("div")
    group.classList.add("food-form-group")
    
    const checkboxContainer = document.createElement("div")
    checkboxContainer.style.display = "flex"
    checkboxContainer.style.alignItems = "center"
    checkboxContainer.style.gap = "8px"
    
    const checkbox = document.createElement("input")
    checkbox.type = "checkbox"
    checkbox.id = "gps-tracking"
    checkbox.checked = checked
    
    const labelEl = document.createElement("label")
    labelEl.htmlFor = "gps-tracking"
    labelEl.textContent = label
    labelEl.style.cursor = "pointer"
    
    checkboxContainer.appendChild(checkbox)
    checkboxContainer.appendChild(labelEl)
    group.appendChild(checkboxContainer)
    parent.appendChild(group)
    
    return checkbox
  }

  save() {
    if (!this.validate()) {
      return false
    }

    this.section.name = this.nameInput.value
    this.section.startMile = parseFloat(this.startMile.value) || 0
    this.section.endMile = parseFloat(this.endMile.value) || 0
    this.section.caloriesPerDay = parseFloat(this.caloriesPerDay.value) || 2500
    this.section.days = parseInt(this.days.value) || 1
    this.section.gpsTrackingEnabled = this.gpsTrackingCheckbox.checked
    this.section.trail = "PCT" // Default to PCT for now

    this.section
      .save()
      .then((id) => {
        this.close()
        // Refresh the sections page to show the new/updated section
        if (window.location.hash.includes('/sections')) {
          window.location.reload()
        } else {
          window.location = `#/sections/${id}/food`
        }
      })
  }

  validate() {
    // Remove any existing error messages
    const existingErrors = this.div.querySelectorAll(".error-message")
    existingErrors.forEach(error => error.remove())
    
    if (!this.nameInput.value.trim()) {
      this.renderError("Section name is required")
      return false
    }

    const startMile = parseFloat(this.startMile.value) || 0
    const endMile = parseFloat(this.endMile.value) || 0
    
    if (endMile <= startMile) {
      this.renderError("End mile must be greater than start mile")
      return false
    }

    const days = parseInt(this.days.value) || 0
    if (days < 1) {
      this.renderError("Days must be at least 1")
      return false
    }

    return true
  }

  renderError(message) {
    const errorDiv = document.createElement("div")
    errorDiv.className = "error-message"
    errorDiv.textContent = message
    
    errorDiv.addEventListener("click", () => {
      errorDiv.remove()
    })

    this.nameInput.addEventListener("input", () => {
      errorDiv.remove()
    })

    // Insert error after the form header
    const header = this.div.querySelector(".food-form-header")
    header.insertAdjacentElement("afterend", errorDiv)
  }

  close() {
    if (this.overlay) {
      this.overlay.remove()
    }
  }
}

export default AddSection
