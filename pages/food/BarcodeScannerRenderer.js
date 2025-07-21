import Food from "../../js/Food.js"
import NewFood from "./NewFood.js"

/**
 * Enhanced Barcode Scanner with performance optimizations:
 * - Increased FPS from 10 to 30 for faster scanning
 * - Adaptive qrbox sizing based on viewport
 * - Enhanced camera constraints with continuous autofocus
 * - Improved error handling and user feedback
 * - Fallback configuration for compatibility
 */

class BarcodeScannerRenderer {
  config = { 
    fps: 30, // Increased from 10 for faster scanning
    qrbox: (viewfinderWidth, viewfinderHeight) => {
      // Adaptive qrbox size based on viewport
      const minEdgePercentage = 0.7 // 70% of the smallest edge
      const minEdgeSize = Math.min(viewfinderWidth, viewfinderHeight)
      const qrboxSize = Math.floor(minEdgeSize * minEdgePercentage)
      return {
        width: Math.min(qrboxSize, 400), // Max 400px
        height: Math.min(qrboxSize, 400) // Max 400px
      }
    },
    aspectRatio: 1.0, // Square aspect ratio for better barcode detection
    disableFlip: false, // Allow image flipping for better detection
    videoConstraints: {
      facingMode: "environment",
      focusMode: "continuous", // Continuous autofocus
      advanced: [{ focusMode: "continuous" }] // Additional focus constraints
    }
  }

  constructor(section) {
    this.section = section
    this.isScannerStopped = false
    this.verbose = false // Set to true for debugging
  }

  static renderTrigger(parent, section) {
    const button = document.createElement("button")
    button.classList.add("btn", "btn-outline", "btn-sm")
    button.innerHTML = `<span class="material-icons">qr_code_scanner</span> Scan Barcode`
    button.addEventListener("click", () =>
      new BarcodeScannerRenderer(section).start(),
    )

    parent.appendChild(button)
  }

  start() {
    this.scannerDiv = document.createElement("div")
    this.scannerDiv.classList.add("modal-overlay")
    this.scannerDiv.style.background = "black"
    
    // Create scanner container
    const scannerContainer = document.createElement("div")
    scannerContainer.style.cssText = "position: relative; width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center;"
    
    // Create close button
    let closeButton = document.createElement("button")
    closeButton.classList.add("btn", "btn-danger")
    closeButton.innerHTML = `<span class="material-icons">close</span> Close Scanner`
    closeButton.style.cssText = "position: absolute; top: 20px; right: 20px; z-index: 1001;"
    closeButton.addEventListener("click", () => {
      this.close()
    })
    
    // Create instruction text
    const instructions = document.createElement("div")
    instructions.style.cssText = "color: white; text-align: center; margin-bottom: 20px; padding: 0 20px;"
    instructions.innerHTML = `
      <h3 style="color: white; margin-bottom: 10px;">Barcode Scanner</h3>
      <p style="color: rgba(255,255,255,0.8); margin: 0;">Position the barcode within the frame to scan</p>
      <p id="scanner-status" style="color: rgba(255,255,255,0.6); margin: 5px 0 0 0; font-size: 12px;">Starting camera...</p>
    `
    
    let scanner = document.createElement("div")
    scanner.id = "scanner"
    scanner.style.cssText = "max-width: 400px; width: 90%; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.5);"
    
    scannerContainer.appendChild(closeButton)
    scannerContainer.appendChild(instructions)
    scannerContainer.appendChild(scanner)
    this.scannerDiv.appendChild(scannerContainer)
    document.body.appendChild(this.scannerDiv)

    this.html5QrCode = new Html5Qrcode("scanner")
    
    // Enhanced camera constraints for better focus and performance
    const cameraConfig = {
      facingMode: "environment"
    }
    
    // Try to add advanced focus constraints if supported
    if (navigator.mediaDevices && navigator.mediaDevices.getSupportedConstraints) {
      const supportedConstraints = navigator.mediaDevices.getSupportedConstraints()
      if (supportedConstraints.focusMode) {
        cameraConfig.advanced = [{ focusMode: "continuous" }]
      }
      if (supportedConstraints.focusDistance) {
        if (!cameraConfig.advanced) cameraConfig.advanced = []
        cameraConfig.advanced.push({ focusDistance: 0 }) // Focus at infinity for barcodes
      }
    }

    this.html5QrCode.start(
      cameraConfig,
      this.config,
      (code, result) => {
        // Update status on successful scan
        const statusElement = document.getElementById("scanner-status")
        if (statusElement) {
          statusElement.textContent = "Barcode detected! Processing..."
          statusElement.style.color = "rgba(106, 175, 80, 0.8)"
        }
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
            this.isScannerStopped = true
            this.cleanup()
          })
          .catch((err) => {
            console.error("Error stopping scanner:", err)
            this.cleanup()
          })
      },
      (errorMessage, error) => {
        // Enhanced error handling with less verbose logging for common scanning errors
        if (error && (error.name === 'NotFoundException' || errorMessage.includes('No QR code found'))) {
          // These are normal "no barcode detected" errors, don't log them
          return
        }
        if (this.verbose) {
          console.warn("QR Code scan error:", errorMessage)
        }
      }
    ).then(() => {
      // Camera started successfully
      const statusElement = document.getElementById("scanner-status")
      if (statusElement) {
        statusElement.textContent = "Camera ready - Point at barcode"
        statusElement.style.color = "rgba(255,255,255,0.6)"
      }
    }).catch((err) => {
      console.error("Unable to start scanning:", err)
      // Update status to show error
      const statusElement = document.getElementById("scanner-status")
      if (statusElement) {
        statusElement.textContent = "Camera error - trying fallback..."
        statusElement.style.color = "rgba(203, 36, 49, 0.8)"
      }
      // Try fallback with reduced constraints if the enhanced ones fail
      this.html5QrCode.start(
        { facingMode: "environment" },
        { ...this.config, fps: 20 }, // Fallback with lower fps
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
              this.isScannerStopped = true
              this.cleanup()
            })
            .catch((err) => {
              console.error("Error stopping scanner:", err)
              this.cleanup()
            })
        },
        (errorMessage, error) => {
          if (error && (error.name === 'NotFoundException' || errorMessage.includes('No QR code found'))) {
            return
          }
          if (this.verbose) {
            console.warn("QR Code scan error:", errorMessage)
          }
        }
      ).catch((fallbackErr) => {
        console.error("Failed to start scanner even with fallback:", fallbackErr)
        this.cleanup()
      })
    })
  }

  close() {
    if (this.html5QrCode && !this.isScannerStopped) {
      this.html5QrCode.stop().then(() => {
        this.isScannerStopped = true
        this.cleanup()
      }).catch(() => {
        this.isScannerStopped = true
        this.cleanup()
      })
    } else {
      this.cleanup()
    }
  }

  cleanup() {
    if (this.scannerDiv) {
      this.scannerDiv.remove()
      this.scannerDiv = null
    }
    this.html5QrCode = null
    this.isScannerStopped = true
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
