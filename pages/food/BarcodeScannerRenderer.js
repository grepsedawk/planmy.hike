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
    this.scannerDiv = document.createElement("div")
    this.scannerDiv.style =
      "position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: black; z-index: 1000;"

    // Create close button
    let closeButton = document.createElement("button")
    closeButton.innerText = "✕"
    closeButton.style =
      "position: absolute; top: 20px; right: 20px; z-index: 1001; background: rgba(255,255,255,0.9); border: none; border-radius: 50%; width: 40px; height: 40px; font-size: 20px; cursor: pointer; color: #333; display: flex; align-items: center; justify-content: center;"
    closeButton.addEventListener("click", () => {
      this.close()
    })

    let scanner = document.createElement("div")
    scanner.id = "scanner"
    scanner.style = "width: 100%; height: 100%;"

    this.scannerDiv.appendChild(closeButton)
    this.scannerDiv.appendChild(scanner)
    document.body.appendChild(this.scannerDiv)

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
            this.close()
          })
          .catch((err) => {})
      },
    )
  }

  close() {
    if (this.html5QrCode) {
      this.html5QrCode
        .stop()
        .then(() => {
          if (this.scannerDiv) {
            this.scannerDiv.remove()
            this.scannerDiv = null
          }
        })
        .catch(() => {
          if (this.scannerDiv) {
            this.scannerDiv.remove()
            this.scannerDiv = null
          }
        })
    } else {
      if (this.scannerDiv) {
        this.scannerDiv.remove()
        this.scannerDiv = null
      }
    }
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
