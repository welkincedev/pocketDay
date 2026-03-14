# PocketDay — Design Guidelines

## 1. Visual Identity
- **Primary Color:** `#00FF41` (Terminal Green) - Represents "Safe Spend."
- **Secondary Color:** `#FFFB3D` (Attention Yellow) - Represents "Warning / Low Balance."
- **Accent Color:** `#FF4136` (Urgent Red) - Represents "Broke Mode."
- **Background:** `#0A0A0A` (Rich Black) - To save battery on OLED screens and reduce eye strain.

## 2. Typography
- **Primary Font:** `Inter` (Sans-serif) for general UI.
- **Monospace Font:** `JetBrains Mono` or `Roboto Mono` for the balance and currency numbers to give a "utility/financial instrument" feel.

## 3. UI Components
### A. The Dashboard (The "Big Number")
The primary focus is the **Safe Spend Today** amount. It should be the largest text on the screen, centered or in a prominent top card.

### B. Quick Entry Buttons
- Large, thumb-friendly tap targets.
- Icons + Labels for speed (e.g., ☕ Tea, 🍪 Snack, 🚌 Bus).
- Minimalist modal for "Custom" entry.

### C. The Survival Bar
A visual progress bar showing `% of month remaining` vs `% of budget remaining`.

## 4. Interaction Principles
- **No Keyboard if Possible:** For quick entries, use preset buttons.
- **Haptic Feedback:** Simple vibratory feedback on successful log.
- **Animation:** Micro-transitions when switching between "Normal" and "Broke" modes.

## 5. Mobile-First Optimization
- Sticky footer for the "Add Expense" action.
- Swipe gestures for deleting log entries.
- High contrast for outdoor visibility.
