# Plan My Hike! 🥾

An all-in-one hike planning toolkit to help you prepare for your adventures. Whether you're planning a day hike or a multi-week backpacking trip, this app provides essential tools for food planning, calorie calculation, and resupply management.

**Key Features:**

- 📊 **Food Planner**: Calculate total calories needed based on miles, elevation, and hiking duration
- 📱 **Barcode Scanner**: Scan food items using OpenFoodFacts API for easy nutritional data
- ⚖️ **Macro Analysis**: Optimize protein-to-carb ratios and weight-per-calorie efficiency
- 🎯 **Resupply Planning**: Plan your food resupply strategy for long-distance hikes

_Fun fact: A lot of the development work was done on the PCT trail via phone! 📱⛰️_

## Contributing 🤝

**We welcome contributions from hikers, developers, and outdoor enthusiasts of all skill levels!**

Whether you're a seasoned developer or just getting started, there are many ways to help improve Plan My Hike:

### How to Contribute

- 🐛 **Report bugs** or suggest improvements via [GitHub Issues](https://github.com/grepsedawk/planmy.hike/issues)
- 💡 **Request features** that would make your hike planning easier
- 🔧 **Submit pull requests** with bug fixes or new features
- 📖 **Improve documentation** to help other contributors
- 🧪 **Test the app** and provide feedback on usability

### Feature Requests & Bug Reports

Have an idea for a new feature or found something that isn't working right? We'd love to hear from you!

👉 **[Open an issue on GitHub](https://github.com/grepsedawk/planmy.hike/issues/new)** to:

- Request new features
- Report bugs or unexpected behavior
- Suggest improvements to existing functionality
- Ask questions about the project

### Getting Started

New to contributing to open source? No problem! Check out the development section below to get your local environment set up, and don't hesitate to ask questions in the issues.

## Development

### PR Previews

This repository is configured with automatic PR preview deployments. When you open a pull request:

1. **Automatic Deployment**: The app is automatically deployed to a preview URL
2. **Preview Link**: A comment will be added to your PR with the preview link
3. **Live Updates**: The preview updates automatically when you push new commits
4. **Automatic Cleanup**: Preview deployments are cleaned up when PRs are closed

**Deployment Structure:**

- **Main app**: The `main` branch is deployed to the root URL: `https://grepsedawk.github.io/planmy.hike/`
- **PR previews**: Each PR gets its own preview URL: `https://grepsedawk.github.io/planmy.hike/pr-{number}/`

### Local Development

To run the app locally:

```bash
# Serve the app on http://localhost:8000
python3 -m http.server 8000
```

or

```bash
# Alternative with Node.js
npx serve .
```
