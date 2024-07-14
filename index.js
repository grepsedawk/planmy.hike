var db = new Dexie("foods")

db.version(1).stores({
  foods: `
    ++id,
    name,
    calories,
    carbs,
    protein,
    fat`
})

class Food {
  constructor() {
    this.name = ""
  }
  
  save() {
    return db.foods.put(this) 
  }
  
  delete() {
    return db.foods.delete(this.id)
  }
}

db.foods.mapToClass(Food)

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

class FoodRenderer extends Renderer {
  constructor(food) {
    super()
    this.food = food
  }
  
  static render(parent) {
    db.foods
      .toArray()
      .then((foods) =>
        foods.forEach((food) => this.renderFood(food))
      )
  }
  
  static renderFood(food) {
    let foodRenderer = new FoodRenderer(food)
    foodRenderer.render()
    
    return foodRenderer
  }

  render() {
    this.div = document.createElement("div")
    
    this.div.innerText = this.food.name
    this.deleteButton = this.renderButton(this.div, "Delete", () => this.delete())

    document.body.appendChild(this.div)
  }
  
  delete() {
    this.food.delete()
    this.div.remove()
  } 
}

class NewFood extends Renderer {
  constructor(food = new Food()) {
    super()
    this.food = food
  }
  
  static renderTrigger() {
    const button = document.createElement("button")
    // TODO: css grid out these action buttons
    button.innerText = "🆕"
    button.style = "position: fixed; bottom: 4rem; right: 1rem; height: 3rem; width: 3rem"
    button.addEventListener("click", () => new NewFood().render())
    
    document.body.appendChild(button) 
  }
  
  static render(food = new Food()) {
    return new NewFood(food).render()
  }
  
  render() {
    this.div = document.createElement("div")
    this.div.style = "position: fixed; bottom: 0; height: 100px"
    this.nameInput = this.renderNameInput(this.div)
    
    this.calInput = this.renderNumberInput(this.div, this.food.calories)
    this.carbsInput = this.renderNumberInput(this.div, this.food.carbs)
    this.proteinInput = this.renderNumberInput(this.div, this.food.protein)
    this.fatInput = this.renderNumberInput(this.div, this.food.fat)
    
    this.saveButton = this.renderButton(this.div, "Save", () => this.save())

    document.body.appendChild(this.div)
  }
  
  renderNameInput(parent) {
    const input = document.createElement("input")
    input.placeholder = "Name"
    input.value = this.food.name
    
    parent.appendChild(input)
 
    return input
  }
  
  save() {
    this.food.name = this.nameInput.value
    this.food.calories = parseInt(this.calInput.value)
    this.food.carbs = parseInt(this.carbsInput.value)
    this.food.protein = parseInt(this.proteinInput.value)
    this.food.fat = parseInt(this.fatInput.value)
    
    this.food.save()
    
    this.div.remove()
    FoodRenderer.render(this.food) 
    
    TotalsRenderer.render(document.getElementById("totals"))
  }
}

class TotalsRenderer {
  static render(parent) {
    new TotalsRenderer(parent).render()
  }
  
  constructor(parent) {
    this.foods = db.foods.toArray()
    this.parent = parent
  }
  
  async render() { 
    this.parent.innerHTML = `<p>Total Calories: ${await this.totalCalories()}</p>`
    this.parent.innerHTML += `<p>Total Carbs: ${await this.totalCarbs()}</p>`
    this.parent.innerHTML += `<p>Total Protein: ${await this.totalProtein()}</p>`
    this.parent.innerHTML += `<p>Total Fat: ${await this.totalFat()}</p>`
    this.parent.innerHTML += `<p>Protein / Carb: ${await this.proteinCarbRatio()}</p>`
  }
      
  async totalCalories() {
    return await this.foods.then((foods) => foods.reduce((total, food) => total + food.calories, 0))
  }
  
  async totalCarbs() {
    return await this.foods.then((foods) => foods.reduce((total, food) => total + food.carbs, 0))
  }
  
  async totalProtein() {
    return await this.foods.then((foods) => foods.reduce((total, food) => total + food.protein, 0))
  }
  
  async totalFat() {
    return await this.foods.then((foods) => foods.reduce((total, food) => total + food.fat, 0))
  }
  
  proteinCarbRatio() {
    return this.totalProtein() / this.totalCarbs()
  }
}

class BarcodeScannerRenderer {
  config = { fps: 10, qrbox: { width: 250, height: 250 } }
  
  static renderTrigger() {
    const button = document.createElement("button")
    button.style = "position: fixed; bottom: 1rem; right: 1rem; height: 3rem; width: 3rem"
    button.innerText = "📷"
    button.addEventListener("click", () => new BarcodeScannerRenderer().start())
    
    document.body.appendChild(button)
  } 
  
  start() {
    let div = document.createElement("div")
    div.style = "position: fixed; top: 0; left: 0; width: 100vw;"
    let scanner = document.createElement("div")
    scanner.id = "scanner"
    scanner.style = "width: 100%"
    div.appendChild(scanner)
    document.body.appendChild(div)
  
    this.html5QrCode = new Html5Qrcode("scanner")
    this.html5QrCode.start(
      { facingMode: "environment" },
      this.config,
      (code, result) => {
        this.cachedBarcodeLookup(code)
          .then((r) => r.json())
          .then((data) => {
          let food = new Food()

          food.name = `${data["product"]["brands"]} ${data["product"]["product_name"]}`,
          food.calories = data["product"]["nutriments"]["energy-kcal_serving"],
          food.carbs = data["product"]["nutriments"]["carbohydrates_serving"],
          food.proteins = data["product"]["nutriments"]["proteins_serving"],
          food.fat = data["product"]["nutriments"]["fat_serving"]
          
          food.save()
          FoodRenderer.renderFood(food)
    })
    this.html5QrCode.stop().then(() => {
      div.remove()
    }).catch((err) => {})
    }
    )
  }
  
  cachedBarcodeLookup(code) {
    const url = `https://world.openfoodfacts.org/api/v3/product/${code}.json`
    return caches.open("barcodes_v1").then((cache) => cache.match(url).then((r) => r || cache.add(url).then((r) => cache.match(url))))
  } 
}

TotalsRenderer.render(document.getElementById("totals"))
FoodRenderer.render()
BarcodeScannerRenderer.renderTrigger()
NewFood.renderTrigger()