class Renderer {
  renderNumberInput(parent, initialValue = 0, label = null) {
    let field = document.createElement("input")
    field.type = "number"
    field.value = initialValue

    if (label) {
      let labelElement = document.createElement("label")
      labelElement.innerText = label
      labelElement.appendChild(field)
      parent.appendChild(labelElement)

      return field
    }

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
