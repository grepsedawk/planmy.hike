class Renderer {
  renderNumberInput(parent, initialValue = 0, label = null) {
    const field = document.createElement("input")
    field.type = "number"
    field.value = initialValue

    if (label) {
      const labelElement = document.createElement("label")
      labelElement.innerText = label
      labelElement.appendChild(field)
      parent.appendChild(labelElement)

      return field
    }

    parent.appendChild(field)

    return field
  }

  renderButton(parent, text, onClick) {
    const button = document.createElement("button")
    button.innerText = text
    button.addEventListener("click", onClick)

    parent.appendChild(button)

    return button
  }

  addDetail(parent, value, label, unit = "", round = 2) {
    const container = document.createElement("div")
    const valueDisplay = document.createElement("div")
    const labelDisplay = document.createElement("div")

    valueDisplay.innerText = `${value.toFixed(round)} ${unit}`.trim()
    labelDisplay.innerText = label

    container.appendChild(valueDisplay)
    container.appendChild(labelDisplay)

    parent.appendChild(container)

    return container
  }

}

export default Renderer
