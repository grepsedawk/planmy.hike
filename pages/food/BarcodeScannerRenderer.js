import Food from "../../js/Food.js"
import NewFood from "./NewFood.js"

class BarcodeScannerRenderer {
  config = { fps: 10, qrbox: { width: 250, height: 250 } }

  constructor(section) {
    this.section = section
  }

  static renderTrigger(parent, section) {
    const button = document.createElement("button")
    button.innerText = "📷"
    button.addEventListener("click", () =>
      new BarcodeScannerRenderer(section).start(),
    )

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
            console.debug(data)
            let food = new Food()

            food.name = `${data["product"]["brands"]} ${data["product"]["product_name"]}`
            food.calories = data["product"]["nutriments"]["energy-kcal_serving"]
            food.carbs = data["product"]["nutriments"]["carbohydrates_serving"]
            food.protein = data["product"]["nutriments"]["proteins_serving"]
            food.fat = data["product"]["nutriments"]["fat_serving"]
            food.servingSize = data["product"]["serving_quantity"]
            food.netWeight = data["product"]["product_quantity"]

            return new NewFood(this.section, food).render()
          })
          .catch((e) =>
            console.error("Error fetching/parsing barcode:", e.message),
          )
        this.html5QrCode
          .stop()
          .then(() => {
            div.remove()
          })
          .catch((err) => {})
      },
    )
  }

  cachedBarcodeLookup(code) {
    const url = `https://world.openfoodfacts.org/api/v3/product/${code}.json`
    return caches
      .open("barcodes_v1")
      .then((cache) =>
        cache
          .match(url)
          .then((r) => r || cache.add(url).then((r) => cache.match(url))),
      )
  }
}

export default BarcodeScannerRenderer
