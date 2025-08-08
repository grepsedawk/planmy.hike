# Plan My Hike - GitHub Copilot Instructions

**ALWAYS reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.**

Plan My Hike is a vanilla JavaScript Single Page Application (SPA) for hiking planning. It's a Progressive Web App that works offline, using IndexedDB for local data storage and includes features for section planning, food planning with barcode scanning, and gear management.

## Working Effectively

### Bootstrap and Setup

```bash
# Install dependencies (only Prettier for code formatting)
npm install  # Takes ~1 second, installs only prettier@3.3.3

# Format code (ALWAYS run before committing)
npx prettier --write .  # Takes ~1.5 seconds for full codebase
npx prettier --check .  # Check formatting without changing files
```

### Local Development Server

Choose one of these methods to serve the application locally:

```bash
# Method 1: Python HTTP server (recommended - instant startup)
python3 -m http.server 8000
# Access at: http://localhost:8000

# Method 2: Node.js serve (takes ~15 seconds to download and start)
npx serve . -l 3000
# Access at: http://localhost:3000
```

**NEVER CANCEL** the development server - it runs continuously until manually stopped.

### No Build Process Required

- This is a **static file application** - no compilation or build step needed
- Simply serve the files with any HTTP server
- Changes are immediately visible after browser refresh

## Validation Requirements

### Code Formatting Validation

**ALWAYS run before committing:**

```bash
npx prettier --write .  # Format all files
```

### Application Functionality Validation

**ALWAYS test these scenarios after making changes:**

1. **Home Page Loading**: Navigate to `/` and verify dashboard displays
2. **Section Management**:
   - Create a new section via "Create New Section" button
   - Fill in section name, start mile (0), end mile (100), days (5), calories per day (4000)
   - Verify section appears in list
3. **Food Planning**:
   - Click "Plan Food" on any section
   - Verify food planning interface loads with nutrition stats
   - Test "Add Food" and "Scan Barcode" buttons are present
4. **Gear Management**:
   - Navigate to `/gear`
   - Verify gear management interface loads
   - Test "Add Gear" functionality is accessible

### Manual Testing Commands

```bash
# Start development server
python3 -m http.server 8000 &

# Open browser and test key functionality
# - Navigate through all main pages (/, /sections, /gear)
# - Create a test section
# - Verify food planning loads for a section
# - Test gear management interface

# Stop development server when done
kill %1  # or use Ctrl+C in the terminal
```

## Architecture Overview

### Core Architecture

- **Type**: Vanilla JavaScript SPA with hash-based routing
- **Database**: IndexedDB via Dexie.js for offline data storage
- **PWA**: Service worker enabled for offline functionality
- **No Framework**: Pure ES6 modules, no React/Vue/Angular

### Key Files and Directories

```
├── index.html              # Main entry point
├── index.css               # Global styles (26KB)
├── js/                     # Core JavaScript modules
│   ├── index.js            # App initialization and database setup
│   ├── Router.js           # Hash-based SPA router
│   ├── Page.js             # Base page class
│   ├── Food.js             # Food nutrition calculations
│   ├── Section.js          # Hiking section model
│   ├── Gear.js             # Gear item model
│   ├── GPSTracker.js       # GPS tracking functionality
│   ├── MileLogger.js       # Mile logging system
│   ├── dexie.min.js        # IndexedDB wrapper library
│   └── html5-qrcode.min.js # Barcode scanning library
├── pages/                  # Page components (matches routing)
│   ├── home/               # Dashboard and welcome page
│   ├── sections/           # Section management
│   ├── food/               # Food planning interface
│   ├── gear/               # Gear management
│   └── 404/                # Not found page
├── data/                   # Static data files
│   └── Full_PCT_Mile_Marker.gpx  # Trail GPS data (804KB)
├── icons/                  # PWA icons
├── manifest.json           # PWA manifest
└── sw.js                   # Service worker
```

### Database Schema

The app uses IndexedDB with these tables:

- **foods**: Food items with nutrition data and section associations
- **sections**: Hiking sections with mile tracking and GPS settings
- **gear**: Gear items with weight, price, and category data
- **gearCategories**: Gear organization categories

### Routing System

Hash-based routes that map to page components:

- `/` → HomePage (dashboard)
- `/sections` → SectionsPage (section management)
- `/sections/:id` → Section detail view
- `/sections/:id/food` → FoodPage (food planning)
- `/gear` → GearPage (gear management)
- `/404` → NotFoundPage

## Development Patterns

### Adding New Features

1. **Always format code first**: `npx prettier --write .`
2. **Test existing functionality** before making changes
3. **Follow the modular architecture**:
   - Create new JS modules in `/js/` directory
   - Create new pages in `/pages/` directory following existing structure
   - Update router if adding new routes
4. **Test thoroughly** using the validation scenarios above
5. **Format code again**: `npx prettier --write .`

### External Dependencies

- **Dexie.js**: IndexedDB wrapper (included as `js/dexie.min.js`)
- **html5-qrcode**: Barcode scanning (included as `js/html5-qrcode.min.js`)
- **Prettier**: Code formatting (dev dependency only)
- **Material Icons**: Via CDN (may fail in sandboxed environments)

### Common Issues

- **Chart.js errors**: The app expects Chart.js from CDN which may be blocked - this is non-critical
- **Font loading errors**: Google Fonts may be blocked - this is cosmetic only
- **External CDN resources**: May fail in sandboxed environments but app still functions

## CI/CD System

### GitHub Pages Deployment

- **Main branch**: Auto-deploys to `https://grepsedawk.github.io/planmy.hike/`
- **PR previews**: Auto-deploys to `https://grepsedawk.github.io/planmy.hike/pr-{number}/`
- **No build step** in CI - just copies static files

### Workflow Files

- `.github/workflows/deploy-pages.yml`: Main branch deployment
- `.github/workflows/pr-preview.yml`: PR preview deployment
- `.github/workflows/cleanup-pr-preview.yml`: PR cleanup

## Testing Checklist

Before completing any changes:

- [ ] Run `npx prettier --write .` to format code
- [ ] Start local development server: `python3 -m http.server 8000`
- [ ] Navigate to `http://localhost:8000` and verify app loads
- [ ] Test section creation workflow completely
- [ ] Test food planning interface loads correctly
- [ ] Test gear management interface loads correctly
- [ ] Verify navigation between all main pages works
- [ ] Check browser console for critical errors (ignore CDN failures)

## Quick Reference

### Repository Stats

- **Total files**: 37 source files (JS, HTML, CSS, JSON)
- **Size**: ~9.8MB total (mostly trail GPS data)
- **Dependencies**: Only Prettier for development

### Common Commands Timing

- `npm install`: ~1 second
- `npx prettier --write .`: ~1.5 seconds
- `python3 -m http.server 8000`: Instant startup
- `npx serve .`: ~15 seconds (downloads serve package first time)

**Remember**: This app has NO build process, NO test suite, and NO compilation step. It's designed for simplicity and offline use during hiking.
