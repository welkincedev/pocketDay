# PocketDay — Product Requirements Document (PRD)

## 1. Product Overview
**PocketDay** is a "brutally minimal" expense tracking web application built specifically for students, hostel residents, and individuals living on a strict daily budget. Unlike complex accounting tools, PocketDay is designed for high-speed logging and instant survival awareness.

## 2. Problem Statement
Most personal finance apps (Mint, YNAB, Spendee) fail the "Hostel Test":
- **Too Slow:** Logging a ₹10 tea shouldn't take 5 taps and a keyboard interaction.
- **Too Macro:** Monthly budgets are hard to stick to when you only have ₹200 left for the week.
- **Too Polite:** Traditional apps don't emphasize the urgency of "Broke Mode."

PocketDay solves this by reducing the 24-hour financial cycle into a single number: **"Safe to Spend Today."**

## 3. Target Users
### Primary Users
- **Students:** Living on fixed monthly/weekly allowances.
- **Hostel Residents:** Managing daily food and travel costs.
- **Daily Wage/Small Budgeters:** Anyone whose primary concern is "Will I make it to the end of the month?"

### Secondary Users
- **Minimalists:** People who hate feature bloat.
- **Impulse Control Seekers:** Users wanting psychological friction before small purchases.

## 4. Product Philosophy (The "North Star")
1. **Speed First:** Logging an expense must take < 2 seconds.
2. **Survival Focus:** Priority is given to "Days remaining" over "Savings rate."
3. **Radical Honesty:** Use "Brutal Insights" to highlight bad habits.
4. **Mobile Native Feel:** Even as a web app, it must behave like a high-performance utility.

## 5. Core User Stories
- *As a student,* I want to see exactly how much I can spend today so I don't run out of money before my next allowance.
- *As a hostel resident,* I want to log my daily chai and snacks with one tap.
- *As a budgeter,* I want a warning when I'm entering "Broke Mode" so I can adjust my spending immediately.

## 6. MVP Features
- **Dashboard:** Balance, Safe-to-Spend, Today's Spend, and Survival Days.
- **Quick Entry:** One-tap buttons for common items (Tea, Snacks, Travel).
- **Daily Log:** Simplistic list of today's transactions.
- **Survival Calculator:** Automatic adjustment of daily safe spend based on current balance and goal date.

## 7. Advanced & Viral Features
- **Broke Mode:** UI shifts to a high-contrast "Warning" mode when daily spend is near zero.
- **Brutal Spending Insights:** Notifications like "You've spent more on coffee than on dinner this week."
- **No Spend Streak:** Gamified counter for days with zero non-essential spending.
- **Monthly Share Report:** A sleek, minimal graphic summarizing the month's "survival."

## 8. Non-Functional Requirements
- **Performance:** App shell load < 1s; logging interaction < 0.5s.
- **Offline Reliability:** Service workers ensure 100% uptime for logging, even in poor connectivity.
- **Data Privacy:** Secure Firestore rules to ensure data is private to the authenticated user.

## 9. Success Metrics
- **Retention:** % of users logging at least 3 expenses per day.
- **Efficiency:** Average time spent in app per session (Target: < 10 seconds).
- **Survival Rate:** % of users who reach their "End Date" without hitting zero balance.
