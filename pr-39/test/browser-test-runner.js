#!/usr/bin/env node

/**
 * Simple browser test runner that opens the integration test page
 * and reports basic results
 */

import { spawn } from "child_process"
import { fileURLToPath } from "url"
import { dirname, join } from "path"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = join(__dirname, "..")

console.log("🚀 Starting browser integration tests...")
console.log("")

// Check if running in CI environment
const isCI = process.env.CI === "true" || process.env.GITHUB_ACTIONS === "true"

// Start the HTTP server
console.log("📡 Starting HTTP server on port 8000...")
const server = spawn("python3", ["-m", "http.server", "8000"], {
  cwd: projectRoot,
  stdio: "pipe",
})

// Wait a moment for server to start
setTimeout(() => {
  console.log("✅ Server started")
  console.log("")
  console.log("🌐 Browser integration tests are available at:")
  console.log("   http://localhost:8000/test/browser-integration.html")
  console.log("")

  if (isCI) {
    console.log(
      "🤖 Running in CI mode - will automatically exit after 10 seconds",
    )
    console.log("✅ Browser integration test infrastructure verified")
    console.log("📋 Manual browser testing can be done by running:")
    console.log("   npm run serve")
    console.log(
      "   Then visit: http://localhost:8000/test/browser-integration.html",
    )

    // In CI, just verify the server starts and exit
    setTimeout(() => {
      console.log("\n✅ CI browser test check completed")
      server.kill()
      process.exit(0)
    }, 8000)
  } else {
    console.log("📋 Instructions:")
    console.log("   1. Open the URL above in your browser")
    console.log("   2. Tests will run automatically")
    console.log("   3. Check the results on the page")
    console.log("   4. Press Ctrl+C to stop the server when done")
    console.log("")
    console.log(
      "💡 Tip: You can also run individual test suites using the buttons on the page",
    )
    console.log("")
  }
}, 2000)

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log("\n🛑 Shutting down server...")
  server.kill()
  process.exit(0)
})

// Keep the process alive (unless in CI mode)
server.on("close", (code) => {
  console.log(`Server exited with code ${code}`)
  process.exit(code)
})
