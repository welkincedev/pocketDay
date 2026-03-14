# PocketDay — Development Roadmap (TASKS.md)

## Phase 1: Project Setup
- [ ] **1.1 Initialize Environment**
  - Create `public/` directory structure.
  - Create `index.html`, `styles.css`, `app.js`.
- [ ] **1.2 PWA Basic Config**
  - Create `manifest.json`.
  - Implement a basic service worker for offline shell caching.
- [ ] **1.3 Firebase Integration**
  - Link Firebase project.
  - Setup Firestore security rules.

## Phase 2: UI Foundations
- [ ] **2.1 Shell Layout**
  - Implement a mobile-first responsive container.
  - Add dark mode base styles.
- [ ] **2.2 Dashboard View**
  - Build the "Main Number" display (Safe Spend).
  - Implement the "Survival Bar."
- [ ] **2.3 Activity Feed**
  - Create a simple list view for daily transactions.

## Phase 3: Business Logic
- [ ] **3.1 Calculation Module**
  - Write functions for `calcSafeSpend()`, `calcSurvivalDays()`.
  - Handle date logic (days remaining in cycle).
- [ ] **3.2 Transaction Logic**
  - Implement the "Quick Add" logic.
  - Add "Delete" and "Edit" functionality.

## Phase 4: Advanced Features
- [ ] **4.1 Broke Mode Engine**
  - logic to detect balance thresholds.
  - Trigger global CSS changes for "Broke Mode" theme.
- [ ] **4.2 History View**
  - Simple calendar or expandable list of previous days.
- [ ] **4.3 Brutal Insights**
  - Logic to count frequent categories/spend patterns.

## Phase 5: Polish & Deployment
- [ ] **5.1 Performance Audit**
  - Optimize asset sizes.
  - Ensure Lighthouse score > 90.
- [ ] **5.2 Final Deployment**
  - `firebase deploy --only hosting`.
