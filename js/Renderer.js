class Renderer {
  renderNumberInput(parent, initialValue = 0) {
    let field = document.createElement("input")
    field.type = "number"
    field.value = initialValue
    
    parent.appendChild(field)
    
    return field
  }
  
  renderButton(parent, text, onClick) {
    let button = document.createElement("button")
    button.innerText = text
    button.addEventListener("click", onClick)
    
    parent.appendChild(button)
    
    return button
  }
}

export default Renderer