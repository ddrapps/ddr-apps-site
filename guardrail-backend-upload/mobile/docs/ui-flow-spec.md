# Guardrail UI Flow + MVP Spec

## Product summary
Guardrail is a local-first savings guardrail app that helps users avoid impulse spending before it happens. The MVP centers on a 4-step onboarding flow, geofenced danger zones, goal-driven intervention copy, and a simple dashboard that tracks avoided spend.

## Positioning
- Headline: Protect your money before you spend it.
- Subhead: Local-first spending guardrails tied to your real savings goal.
- Trust line: No bank login. No spreadsheets. Your data stays on your phone.

## Primary user journey
1. Open app.
2. Continue with Apple or Google.
3. Pick a core goal.
4. Pick a danger-zone category.
5. Accept location permission after value explainer.
6. Land on dashboard.
7. Receive a contextual notification when entering a flagged place.
8. Confirm "Skipped it" or "I spent".
9. Update Win Wallet and streaks.

## Screen map

### 1. Welcome
Purpose: Remove friction and establish trust.
- Primary CTA: Continue with Apple
- Secondary CTA: Continue with Google
- Support copy: Your data never leaves this phone. No bank logins required.

### 2. Goal picker
Purpose: Give the app a motivational anchor.
Options:
- Travel / Vacation
- Clearing Debt
- Large Purchase / House

### 3. Danger zone picker
Purpose: Define high-risk spending contexts.
Options:
- Coffee Shops
- Target / Big Box Stores
- Fast Food & Dining
- Custom category (phase 2)

### 4. Permission explainer
Purpose: Improve opt-in before native location prompt.
Hero copy:
- To send you automated spending guardrails when you walk into your danger zones, we need location access.
- Set this to Always Allow so we can protect your wallet in the background.
CTA:
- Enable Guardrails

### 5. Dashboard
Purpose: Show current protection status and reward behavior.
Modules:
- Weekly budget left
- Active savings goal progress
- Win Wallet total
- Current streak
- Recent interventions
- Active danger zones

### 6. Intervention sheet
Purpose: Turn temptation into a goal-framed trade-off.
Example copy:
- You are entering Target.
- Skipping a $40 impulse buy gets you 4 days closer to your vacation fund.
Actions:
- I skipped it
- I spent
- Snooze guardrail

### 7. History
Purpose: Build retention and self-awareness.
- Timeline of alerts
- Outcome labels
- Money saved estimate
- Spend pattern summary

### 8. Settings
Purpose: Control trust and tuning.
- Quiet hours
- Notification sensitivity
- Danger zone management
- Goal editing
- Subscription
- Privacy summary

## MVP data model

### Goal
- id
- type
- label
- targetAmount
- currentAmount

### DangerZone
- id
- category
- label
- latitude
- longitude
- radiusMeters
- enabled

### GuardrailEvent
- id
- dangerZoneId
- timestamp
- predictedSpend
- message
- outcome

### Wallet
- savedTotal
- streakDays
- weeklyAvoidedSpend

### Settings
- quietHoursStart
- quietHoursEnd
- sensitivity
- notificationsEnabled
- hasBackgroundLocation
- subscriptionTier

## MVP rules engine
- Trigger only when entering an enabled danger zone.
- Suppress duplicates within a cooldown window.
- Do not notify during quiet hours.
- Personalize copy using active goal and predicted spend.
- Reward only explicit "I skipped it" confirmations in v1.

## Phase 2
- Merchant-specific zones
- Manual spend calibration
- Custom goal creation
- Better savings estimation
- Subscription paywall experiments
