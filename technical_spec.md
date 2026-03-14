# PocketDay — Technical Specification

## 1. Tech Stack Overview
| Layer | Technology |
| :--- | :--- |
| **Frontend** | Vanilla HTML5, CSS3, ES6+ JavaScript |
| **Styling** | Tailwind CSS (CDN/Utility-first) |
| **Database** | Firebase Cloud Firestore |
| **Auth** | Firebase Authentication (Email/Password & Google) |
| **Hosting** | Firebase Hosting |
| **PWA** | Service Workers + Web Manifest |

## 2. PWA Architecture
PocketDay is designed as a **Progressive Web App (PWA)** to ensure it lives on the user's home screen and works offline.
- **Service Worker:** Caches core assets (`index.html`, `main.css`, `app.js`) and intercepts network requests to serve them instantly.
- **IndexedDB:** (Optional) If we want deeper offline logging, we can cache Firestore writes locally before syncing.
- **Manifest.json:** Defines the standalone display mode, orientation, and splash colors.

## 3. Database Design (Firestore)
One collection for `users` and a sub-collection (or flat collection with indexing) for `expenses`.

### Users Collection
`users/{user_id}`
```json
{
  "displayName": "Aman",
  "email": "aman@example.com",
  "currency": "INR",
  "currentBalance": 1200.00,
  "endDate": "2026-03-31T23:59:59Z",
  "preferences": {
    "darkMode": true,
    "quickActions": [
      {"label": "Tea", "amount": 10},
      {"label": "Snack", "amount": 20}
    ]
  }
}
```

### Expenses Collection
`expenses/{expense_id}`
```json
{
  "userId": "user_123",
  "amount": 15.00,
  "category": "Food",
  "note": "Afternoon Tea",
  "date": "2026-03-14",
  "timestamp": "ServerTimestamp"
}
```

## 4. Calculation Logic
The app's core utility is derived from these formulas:

### A. Daily Safe Spend
`daily_safe_spend = (current_balance) / (days_remaining)`
*Note: `days_remaining` is the count between TODAY and the USER_END_DATE.*

### B. Survival Days
`survival_days = (current_balance) / (average_daily_spend_last_7_days)`

### C. No-Spend Streak
Incremental counter that resets if `expenses` for a specific `date` exists with `category != 'Essential'`.

## 5. Deployment Guide
1. **Local Setup:**
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase init
   ```
2. **Configuration:**
   - Select `Hosting` and `Firestore`.
   - Set public directory to `public/`.
3. **Deployment:**
   ```bash
   firebase deploy --only hosting
   ```

## 6. Project Structure
```text
/
├── firebase.json
├── firestore.rules
├── public/
│   ├── index.html
│   ├── manifest.json
│   ├── service-worker.js
│   ├── assets/
│   │   ├── icons/
│   │   └── images/
│   ├── css/
│   │   └── styles.css
│   └── js/
│       ├── app.js
│       ├── auth.js
│       ├── db.js
│       └── utils.js
└── TASKS.md
```
