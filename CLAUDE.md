# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

This is a vanilla JavaScript project with minimal dependencies:

```bash
# Format code
npx prettier --write .

# Start local development server (if needed)
python3 -m http.server 8000
# or
npx serve .
```

## Architecture Overview

This is a client-side JavaScript hiking planner application with the following key architectural components:

### Core Architecture

- **Single Page Application (SPA)** using vanilla JavaScript with hash-based routing
- **Local Database**: Uses Dexie.js wrapper around IndexedDB for offline data persistence
- **Modular Design**: ES6 modules with clear separation of concerns

### Key Components

**Router** (`js/Router.js`): Hash-based SPA router that matches URLs to page components

- Routes: `/`, `/sections`, `/sections/:id`, `/sections/:id/food`, `/404`
- Each route maps to a Page class instance

**Database Models** (`js/index.js:9-38`):

- `foods` table: Stores food items with nutrition data and section associations
- `sections` table: Stores hiking sections with mile tracking and GPS settings
- Uses Dexie ORM with mapped classes for Food and Section

**GPS Tracking System**:

- **GPSTracker** (`js/GPSTracker.js`): Real-time GPS tracking with mile marker correlation
- **MileLogger** (`js/MileLogger.js`): Logs mile updates and position history
- Integrates with trail mile markers (currently sample PCT data)

**Food Planning System**:

- **Food Model** (`js/Food.js`): Nutrition calculations, calorie density, macro ratios
- **Barcode Scanner**: Uses html5-qrcode library for product scanning
- **OpenFoodFacts Integration**: API integration for nutrition data lookup

### Data Flow

1. **Section Management**: Create hiking sections with start/end miles, daily calorie needs
2. **GPS Integration**: Optional real-time mile tracking updates section progress
3. **Food Planning**: Scan/add foods to sections, calculate nutrition totals vs requirements
4. **Progress Tracking**: Visual progress indicators and mile logging

### Key Files

- `js/index.js`: App initialization, database setup, global instances
- `js/Page.js`: Base page class with template rendering
- `pages/`: Directory structure matches routing pattern
- `data/Full_PCT_Mile_Marker.gpx`: Trail mile marker data

### External Dependencies

- **Dexie.js**: IndexedDB wrapper for local database
- **html5-qrcode**: Barcode scanning functionality
- **Prettier**: Code formatting (dev dependency)

The app is designed for offline-first usage during hiking, with local data persistence and optional GPS integration for automatic mile tracking.
