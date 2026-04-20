# FocusPath

FocusPath is a free, offline-first study companion built as a Progressive Web App (PWA). It runs entirely in the browser with no accounts, no servers, and no subscriptions — all data is stored locally using `localStorage`.

## Getting Started

### Which file to open

- **`index.html`** — This is the entry point. Open this file in your browser and it will automatically redirect you to `home.html`.
- **`home.html`** — The main dashboard with your calendar, event manager, study buddy, and sidebar navigation to all features.

You can open `index.html` directly from the file system (`file://` protocol) or serve it with any static web server.

### Installing as an app

FocusPath is a PWA. After visiting it in Chrome, Edge, or any Chromium-based browser:

1. Click the install icon in the address bar (or "Add to Home Screen" on mobile)
2. It installs as a standalone app and works fully offline

The service worker (`sw.js`) caches all pages and assets on first visit.

## Features

| Feature | Page | Description |
|---|---|---|
| **Flash Cards** | `flashcards.html` | Create card sets by subject, study with timed sessions, Leitner box system, starred cards, smart review |
| **Tests** | `test.html` | Build multiple-choice / true-false / written tests, take them, review answers, track scores |
| **Pomodoro Timer** | `pomodoro.html` | 25-minute focus intervals with short/long breaks. Floating mini-timer on every page |
| **Goal Tracker** | `goals.html` | Set goals with milestones, deadlines, and categories |
| **Recall Journal** | `journal.html` | Daily reflections using structured prompts. Builds active recall habit |
| **Study Planner** | `planner.html` | Visual weekly timetable with color-coded study blocks |
| **Habit Tracker** | `habits.html` | Daily/weekday/weekend habits with streak tracking and heatmaps |
| **Cornell Notes** | `notes.html` | Structured note-taking: cues, notes column, and summary |
| **Pre/Post Compare** | `compare.html` | Compare two test attempts side-by-side to see improvement |
| **Statistics** | `stats.html` | Charts, counters, streaks, and 60+ unlockable achievement badges |
| **Help & Guide** | `help.html` | Full walkthrough of every feature, import/export instructions, FAQ |
| **Games** | `games.html` | Study games including Snake and Concept Typer |

## Import & Export

Tests and flashcard sets can be exported as JSON files and imported on another device or shared with others.

- **Export**: Choose to export a single item or everything. Optional AES-256 password encryption.
- **Import**: Select a `.json` file. Encrypted files prompt for the password. Cross-format validation prevents importing test files as flashcards (and vice versa).
- **Password-protected tests** are locked on import to prevent editing — useful for teachers distributing exams.

## Project Structure

```
index.html            Redirect → home.html
home.html             Main dashboard / calendar / sidebar nav
flashcards.html       Flashcard shell (loads card-builder / card-runner)
card-builder.html     Inline flashcard set editor
card-builder.js       Flashcard builder logic
card-runner.html      Inline flashcard study session UI
card-runner.js        Flashcard runner logic
test.html             Test shell (loads test-builder / test-runner)
test-builder.html     Inline test editor
test-builder.js       Test builder logic
test-runner.html      Inline test runner UI
test-runner.js        Test runner logic
stats.html            Statistics dashboard + Trophy Room
pomodoro.html         Pomodoro timer page
goals.html            Goal tracker
journal.html          Recall journal
planner.html          Study planner
habits.html           Habit tracker
notes.html            Cornell notes
compare.html          Pre/Post test comparison
help.html             Help & guide page
games.html            Game launcher
snake.html / snake.js Snake game
concept-typer.html/js Concept typing game
themes.js             Theme manager (16+ themes, dark mode)
achievements.js       Achievement checking + toast notifications
icons.js / icons.json SVG icon sprite definitions
tools-drawer.js       Injects tools dropdown + floating Pomodoro timer on every page
quotes.js             Motivational/mean quote engine
sw.js                 Service worker for offline caching
manifest.json         PWA manifest
```

## Tech Stack

- **HTML / CSS / JavaScript** — No build tools, no frameworks, no bundler
- **Tailwind CSS** (via CDN script in `vendor/tailwind.js`)
- **Chart.js** (via `vendor/chart.umd.min.js`) for statistics charts
- **Web Crypto API** for AES-GCM encrypted exports
- **Service Worker** for full offline support
- **localStorage** for all data persistence

## Data Storage

All data is stored in `localStorage` under these keys:

| Key | Contents |
|---|---|
| `tests` | Array of test objects |
| `testAttempts` | Array of test attempt records |
| `flashcardSets` | Array of flashcard set objects |
| `flashcardSessions` | Array of flashcard study sessions |
| `fpPomodoro` | Pomodoro session data by day |
| `fpGoals` | Array of goal objects |
| `fpJournal` | Array of journal entries |
| `fpHabits` | Array of habit objects |
| `fpPlanner` | Planner block data |
| `fpCornell` | Cornell notes data |
| `fpPersistedBadges` | Earned achievement badge IDs |
| `fpSubjectColors` | Stable color mapping for subjects |

## License

FocusPath is free to use.
