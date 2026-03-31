# PRD: RoutineLog — Daily Routine Tracker

## Overview

RoutineLog is a mobile-first web app for logging daily routine task completion. The primary use case is end-of-day reflection: open the app before bed, check off what you did today, and track consistency over time.

The app is designed to **motivate through visuals** — every interaction should feel rewarding, and the leaderboard creates friendly social pressure to stay consistent.

**Target users:** A small group of friends (2–6 people) sharing the app, holding each other accountable through a shared leaderboard.

---

## Core User Flows

### Flow 1: Daily Logging
```
Open app → See "Today" view → Tap tasks done/not done → See streak animation → Done
```

### Flow 2: Leaderboard Check
```
Tap "Arena" tab → See all members ranked by consistency → View someone's public tasks → Feel motivated to stay on top
```

---

## Tech Stack

| Layer       | Choice                     |
|-------------|----------------------------|
| Framework   | Next.js (App Router)       |
| Styling     | Tailwind CSS + Framer Motion (animations) |
| Auth        | Supabase Auth (magic link) |
| Database    | Supabase (PostgreSQL)      |
| Hosting     | Vercel                     |

---

## Features (v1 Scope)

### 1. Authentication
- Magic link login via email (Supabase Auth)
- On first login, user sets a display name and optional avatar (initials-based if no upload)
- Persistent session — no daily re-login

### 2. Task Management
- **Create a task** with:
  - Task name (e.g., "Morning walk", "Read 30 mins")
  - Schedule type:
    - **Daily** — appears every day
    - **Specific days** — user picks which days (e.g., Mon/Wed/Fri)
  - Emoji/icon for quick visual identification
  - **Visibility: Private or Public**
    - **Private** — only visible to the user, hidden from leaderboard
    - **Public** — visible on the leaderboard to all app users
- Edit task name, schedule, icon, or visibility anytime
- Archive task (soft delete — keeps history, stops appearing in Today view)
- Reorder tasks (drag or priority number)

### 3. Today View (Home Screen)
- Shows only tasks scheduled for today (based on day-of-week)
- Each task has a toggle: tap to mark complete, tap again to undo
- Current streak count displayed next to each task (🔥 + number)
- Date selector at top for backfilling past days
- Public tasks show a small 🌐 badge; private tasks show 🔒
- **Visual states:** all tasks done = celebration state (see Motivational UI section)

### 4. Streak Tracking
- Streak = consecutive scheduled days completed (backwards from today)
- Calculated on-the-fly from completions table
- Streak rules:
  - Daily tasks: every day counts
  - Day-specific tasks: only scheduled days count (non-scheduled days are skipped, don't break streak)
  - Missing a scheduled day resets streak to 0
- Milestone markers: 7-day, 30-day, 60-day, 100-day streaks trigger special visual rewards

### 5. Stats / Weekly Review
- Weekly grid: 7-column grid, each task × each day, filled/empty dots
- Monthly heatmap: GitHub-style contribution grid for overall daily completion rate
- Per-task stats: current streak, longest streak, completion rate (7/30/90 days)
- Overall daily score: % of scheduled tasks completed, shown as trend line

### 6. Arena (Leaderboard)
The shared space where all app users see each other's public progress.

#### 6.1 Leaderboard Ranking
- All users ranked by a **Consistency Score** (see formula below)
- Each user card shows:
  - Display name + avatar
  - Consistency score (percentage)
  - Total active public tasks
  - Current best streak (highest streak across public tasks)
  - Rank position (🥇🥈🥉 for top 3)
- Rank updates daily (based on previous day's data)
- Tap a user card → see their public task detail view

#### 6.2 User Public Profile (within Arena)
- When you tap a user on the leaderboard, see:
  - Their list of public tasks (name + emoji only — not private ones)
  - Per-task streak count
  - Per-task completion heatmap (last 30 days)
  - Their overall weekly completion grid
- Cannot see private tasks — ever

#### 6.3 Consistency Score Formula
```
Consistency Score = (Total completions on scheduled days / Total scheduled days) × 100
```
- Calculated over a rolling 30-day window
- Only public tasks count toward leaderboard ranking
- Recalculated daily

#### 6.4 How Users Join the Same Leaderboard
- The app works with a **single shared leaderboard** for all registered users
- Share the app link with friends → they sign up → they appear on the Arena
- v1: All users share one leaderboard (works for small groups of 2–6)
- v2 consideration: Group-based leaderboards with invite codes (not in v1)

---

## Motivational UI & Visual Design

The visual design is core to this product — not an afterthought. Every element should make the user *want* to come back.

### Design Language
- **Dark theme by default** — modern, focused, easy on eyes at night (primary use is before bed)
- Color palette: Dark base (#0A0A0F), accent gradient (emerald → cyan for positive), warm amber for streaks
- Typography: Clean sans-serif, large numbers for stats, bold for streaks
- Rounded cards, subtle glassmorphism on stat panels

### Micro-Interactions & Animations
- **Task completion:** Tap a task → satisfying check animation + subtle haptic-style pulse + the row briefly glows green
- **Streak milestone hit:** Reaching 7/30/60/100 days triggers a full-screen confetti/particle burst animation
- **All tasks done today:** The Today view header transitions to a gradient glow state with a message like "Perfect day 💪" or "Crushed it 🔥"
- **Empty state motivation:** If no tasks are logged yet today, show an encouraging nudge — not guilt. E.g., "Your evening check-in awaits" with a calm animation
- **Streak counter:** The 🔥 number should feel alive — slight scale bounce when it increments, color intensifies with longer streaks (warm yellow → deep orange → red for 30+)

### Visual Streak Tiers
| Streak Range | Visual Treatment                           |
|--------------|--------------------------------------------|
| 1–6 days     | Simple 🔥 + warm yellow text               |
| 7–29 days    | 🔥 + orange glow + "1 week!" badge on first hit |
| 30–59 days   | 🔥🔥 + pulsing orange-red + "1 month!" badge    |
| 60–99 days   | 🔥🔥🔥 + animated flame effect + "2 months!" badge |
| 100+ days    | Special animated crown/fire icon + permanent badge |

### Leaderboard Visuals
- Top 3 users get podium-style display at the top (1st elevated, 2nd/3rd flanking)
- Rank changes shown with ↑↓ arrows and green/red coloring
- User's own card highlighted/outlined so they spot themselves instantly
- Consistency score shown as a radial progress ring (satisfying fill animation)

### Heatmap & Stats Visuals
- GitHub-style heatmap uses intensity gradient: empty (#1a1a2e) → light green → emerald → bright cyan for full completion
- Weekly grid uses filled/hollow circles with smooth transitions
- Trend lines use subtle gradient fills under the line

---

## Database Schema

### `profiles` table
| Column        | Type      | Notes                                      |
|---------------|-----------|---------------------------------------------|
| id            | uuid (PK) | references auth.users                      |
| display_name  | text      | shown on leaderboard                       |
| avatar_url    | text      | optional profile image URL                 |
| created_at    | timestamptz | auto                                     |

### `habits` table
| Column        | Type      | Notes                                      |
|---------------|-----------|---------------------------------------------|
| id            | uuid (PK) | auto-generated                             |
| user_id       | uuid (FK) | references auth.users                      |
| name          | text      | task name                                  |
| emoji         | text      | emoji/icon for the task                    |
| schedule_type | text      | 'daily' or 'specific_days'                 |
| schedule_days | int[]     | array of day numbers (0=Sun...6=Sat). Null if daily |
| is_public     | boolean   | true = visible on leaderboard              |
| sort_order    | int       | for custom ordering                        |
| is_active     | boolean   | false = archived                           |
| created_at    | timestamptz | auto                                     |

### `completions` table
| Column         | Type      | Notes                                     |
|----------------|-----------|-------------------------------------------|
| id             | uuid (PK) | auto-generated                            |
| habit_id       | uuid (FK) | references habits                         |
| user_id        | uuid (FK) | references auth.users (denormalized for RLS) |
| completed_date | date      | date only, no time                        |
| created_at     | timestamptz | auto                                    |
| **unique**     |           | (habit_id, completed_date) — one entry per task per day |

### Row Level Security (RLS)
- `profiles`: Anyone can read all profiles (needed for leaderboard). Users can only update their own.
- `habits`: Users can read/write their own. Other users can read rows where `is_public = true` (for leaderboard).
- `completions`: Users can read/write their own. Other users can read completions for public habits (for leaderboard stats).

---

## Pages & Routes

| Route             | Purpose                                    |
|-------------------|--------------------------------------------|
| `/`               | Today view — daily checklist (home screen) |
| `/arena`          | Leaderboard — ranked users + public stats  |
| `/arena/[userId]` | User's public profile — their public tasks + heatmaps |
| `/stats`          | Personal stats — weekly grid, heatmap, trends |
| `/tasks`          | Manage tasks — add, edit, archive, reorder |
| `/login`          | Magic link auth                            |
| `/onboarding`     | First-time: set display name               |

---

## Key UX Principles

1. **< 5 seconds to log.** Open → see today → tap checkboxes → done.
2. **Mobile-first.** Designed for phone before bed. Large tap targets, thumb-friendly.
3. **Reward, never punish.** Missed days are empty, not red. Streaks celebrate, they don't shame.
4. **Backfill allowed.** Forgot yesterday? Go back and fill it. Life happens.
5. **PWA.** Add to Home Screen for native-app feel. No app store.
6. **Visuals drive behavior.** Every animation, color, and transition is intentional — designed to make consistency feel good.

---

## Non-Goals (v1)

- No push notifications (use phone alarm)
- No group-based leaderboards (v1 is a single shared leaderboard)
- No task categories/tags
- No time-of-day tracking (just did/didn't)
- No points or badges beyond streak tiers
- No chat or comments between users

---

## Open Questions

1. Should users be able to "cheer" or react to someone's streak on the leaderboard? (lightweight social without chat)
2. Notes field per completion? (e.g., "Walked 3km") — adds friction but useful for personal review
3. Offline support via service worker for PWA? (log offline, sync on reconnect)
4. Should the leaderboard scoring window be configurable (7 days vs 30 days)?

---

## Success Metrics

- User logs tasks at least 5 out of 7 days per week
- Average time-to-complete daily logging < 30 seconds
- At least 2 users active on leaderboard within first week of sharing
- Average streak length increases month-over-month
