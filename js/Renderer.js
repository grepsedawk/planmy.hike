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

    const numValue = value == null ? 0 : parseFloat(value) || 0
    valueDisplay.innerText = `${numValue.toFixed(round)} ${unit}`.trim()
    labelDisplay.innerText = label

    container.appendChild(valueDisplay)
    container.appendChild(labelDisplay)

    parent.appendChild(container)

    return container
  }

  addEditableElement(
    parent,
    value,
    label,
    type = "number",
    saveCallback = null,
    options = { unit: "", round: 2 },
  ) {
    const round = options["round"] === undefined ? 2 : options["round"]

    const container = document.createElement("div")
    container.classList.add("editable")
    const valueDisplay = document.createElement("div")
    const labelDisplay = document.createElement("div")

    labelDisplay.innerText = label
    valueDisplay.innerText =
      type === "number"
        ? `${parseFloat(value).toFixed(round)} ${options["unit"]}`.trim()
        : value

    container.addEventListener("click", () => {
      const input = document.createElement("input")
      input.type = type
      input.value = value

      const save = () => {
        value =
          type === "number"
            ? input.value
              ? parseFloat(input.value)
              : 0
            : input.value
        valueDisplay.innerText =
          type === "number"
            ? `${value.toFixed(round)} ${options["unit"]}`.trim()
            : value
        valueDisplay.hidden = false
        input.remove()

        if (saveCallback) {
          saveCallback(value)
        }
      }

      input.addEventListener("blur", save)
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          save()
        }
      })

      valueDisplay.hidden = true
      valueDisplay.parentElement.insertBefore(input, valueDisplay)
      input.focus()
      input.select()
    })

    container.appendChild(valueDisplay)
    container.appendChild(labelDisplay)
    parent.appendChild(container)

    return container
  }
}

export default Renderer
