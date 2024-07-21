class BarcodeScannerRenderer {
  config = { fps: 10, qrbox: { width: 250, height: 250 } }
  
  static renderTrigger(parent) {
    const button = document.createElement("button")
    button.innerText = "📷"
    button.addEventListener("click", () => new BarcodeScannerRenderer().start())
    
    parent.appendChild(button)
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
          
          return new NewFood(food).render()
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

export default BarcodeScannerRenderer