An overall hike planner. Lighterpack, MyFitnessPal, resupply planner, etc!

A lot of the dev work was done on the PCT trail via my phone.

## Food Planner

The goal of food planner is to be able to input section details (miles, elevation, cal/day, days) in order to generate the total calories required. From there, users can go to the store, scan barcodes (uses OpenFoodFacts for API data), or manually enter data, to view core stats (protein to carb macro ratio, weight per cal), and they can scan until calories and macros reach perfection.

## Development

### PR Previews

This repository is configured with automatic PR preview deployments. When you open a pull request:

1. **Automatic Deployment**: The app is automatically deployed to a preview URL
2. **Preview Link**: A comment will be added to your PR with the preview link
3. **Live Updates**: The preview updates automatically when you push new commits
4. **Automatic Cleanup**: Preview deployments are cleaned up when PRs are closed

Preview URLs follow the pattern: `https://grepsedawk.github.io/planmy.hike/pr-{number}/`

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
