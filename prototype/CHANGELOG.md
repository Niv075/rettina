# Rettina prototype: change log

Newest first. Each entry lists what changed, the files touched, and how to undo it.

**Restore points (git):**

| Commit / branch | State |
|---|---|
| `d0cd5de` (main) | Initial prototype: Conversation, Learn, Homework, Level Check |
| `b82d1c7` (main) | Everything below up to and including the lavender redesign. **Last state before the lesson frame.** |
| tag `before-frame` = `b82d1c7` | Same restore point, kept as a tag after the frame was merged into `main` |
| `f879013` | Lesson screen in the frame |
| `main` (latest) | The frame on all of Noa's screens (merged from `lesson-frame`, pushed to GitHub) |

To see the state before the frame: `git switch --detach before-frame`.
To undo the frame on `main` for good, keeping history: `git revert --no-edit before-frame..main` (creates undo commits), then push.
To compare without git: in Noa's mode press **Layout: Frame / Classic** in the top bar, or open the link with `#classic`. The switch now applies to all of Noa's screens.

---

## 2026-11-19 · The gaze frame on all of Noa's screens

**What changed**: the welcome/calibration, ready, Today, Start learning and Learn something else screens use the same frame as the lesson:
- **Top-start corner:** *Today*, the long-look exit (2× look time). Not shown where Noa already is at home (welcome, ready, Today).
- **Top-end:** one secondary action (Today screen: *Something else*).
- **Bottom-end forward corner:** the main "continue" action, always in the same place: *Start* (welcome), *Let's go* (ready), *Start learning* (Today), *Up next* (Start learning).
- **Quiet centre** on welcome, ready and Today: titles, the plan and the adult hand-off note, where looking selects nothing.
- **Choice screens** (Start learning, Learn topic menu and keyboard): the choices fill the centre with wide gaps (20–44 px) and less small text; the exit and forward corners stay in place.
- Empty corners stay reserved (invisible), so positions never shift between screens.
- The *Layout: Frame / Classic* switch now covers all of these screens; Classic is unchanged.

**Files**
- `app.js`: `shell()` and `frTile()` helpers; frame branches in `sWelcome`, `sReady`, `sToday`, `sSubjects`, `sLearnElse`; the top-bar *Today* tile is hidden in the frame (the frame has its own corner).
- `index.html`: `.fr-screen`, `.fr-hero`, `.fr-empty`, `.fr-choose`, `.fr-learn` styles.
- The tour needed no changes: the frame keeps the same element IDs (`calGo`, `goToday`, `sStart`, `sElse`, `.st-plan`, `.st-grid`).

**Undo just this:** `git revert <this commit>`, or press *Layout: Classic*.

---

## 2026-11-19 · Lesson screen in the gaze frame (branch `lesson-frame`)

**Why:** the old lesson screen was a mouse UI with dwell added. It had about 20 live targets, the word bank sat right under the text she reads, and there was nowhere to rest her eyes.

**What changed**
- **New lesson layout ("frame"), now the default.** A quiet centre where looking selects nothing (reading, Ollie, her messages). Actions sit in fixed places on the edges:
  - start side: **Today** (top, needs a 2× longer look) and **Talk** (bottom)
  - end side: **Again** (top) and the **forward slot** (bottom): *Next*, the green *✓ Yes, this one*, or the next lesson
  - answers: a row along the bottom, one in each corner and one in the middle, far apart
  - mirrors automatically in Hebrew
- **The ✓ confirm appears in the same forward corner every time**, instead of under the chosen answer.
- **The word bank moved into a Talk drawer.** Look at *Talk* and it opens over the lesson; the same tile becomes *Close*. Sending a sentence or phrase closes it, and the reply appears in the quiet centre.
- **Live targets while reading: 4** (was ~20). While answering: 6–7.
- **Dwell feedback fills the whole tile from the inside** with a growing inner ring, where her eyes already are (was a thin bar on the bottom edge). Frame tiles also play a soft click when they select (sound on).
- **The classic layout is unchanged** and one click away (*Layout* button in Noa's top bar, or `#classic`).

**Engine changes (affect both layouts, all backward-compatible)**
- `data-dwell="2"` on any tile multiplies its look time (index.html dwell loop).
- `.quiet` regions: webcam gaze never snaps to a tile while the gaze point is inside one (gaze.js `snap`).
- Hidden tiles (`visibility:hidden`) can't be targeted by gaze or dwell (index.html loop, gaze.js `snap`).

**Files**
- `lesson.js`: frame skeleton, `drawer()`, layout helpers (`setFwd`, `clearAct`, `hint`, `ansBox`), frame branches in `ask`, `choose`, `commit`, `finish`; `OWL` constant; `uiTick` click sound.
- `index.html`: frame CSS (`.fr*`, `.fz`), dwell multiplier, visibility check, click sound hook, *Layout* button in Noa's top bar.
- `gaze.js`: quiet zones and hidden-tile check in `snap`.
- `app.js`: `settings.frame` (default on, off with `#classic`), *Layout* toggle, the frame hides the duplicate *Today* tile in the top bar, `App.reset` turns the frame back on.
- `tour.js`: narrates the quiet centre and edges, opens Talk before using the word bank, uses the frame's corners; `look()` respects `data-dwell`.

**Undo just this:** `git switch main`, or press *Layout: Classic*.

---

## 2026-11-19 · Lavender redesign + Lucide icons (in `b82d1c7`)
- Palette: white + soft lavender (accent `#7457d9`), lavender–periwinkle gradients; white by default, dark only via the Theme button.
- Font: Rubik (Google Fonts, Latin + Hebrew).
- All UI emoji replaced with Lucide icons (ISC licence, loaded from jsDelivr); line-art owl for Ollie; Noa's avatar is her initial. Learn topic pictures stay as emoji.
- Files: `index.html`, `i18n.js` (`ic()`, `lbl()`, icon observer), `app.js`, `lesson.js`, `learn.js`, `tour.js`, `quiz.js`, `gaze.js`.

## 2026-11-19 · Israel-blue palette (in `b82d1c7`, replaced by the lavender redesign)

## 2026-11-19 · Autoplay tour (in `b82d1c7`)
- `tour.js`: a 15-chapter self-playing demo with captions, a cursor and gaze ring, pause and stop. Starts automatically; `#manual` disables it.
- `app.js`: `App.reset`, `App.go`, *Play demo* buttons. `index.html`: `Dwell.force` / `Dwell.locked`, tour styles.

## 2026-11-19 · Hebrew version + EN/עב switch (in `b82d1c7`)
- `i18n.js` (new): strings, `t()` / `tr()`, RTL switching, the Hebrew class script.
- Hebrew lessons, word banks, topic index, gaze keyboard, homework sample and fallback predictor.
- RTL-safe CSS, phone-width layout, `#he-8`-style links.
- Files: all scripts, `index.html`.

## 2026-11-19 · 8-screen demo flow (in `b82d1c7`)
- `app.js` (new): sign-in, parent dashboard, schedule review, handover, Noa's welcome and calibration, Today, Start learning.
- `lesson.js` (new): Ollie lesson, look-twice answers, word bank, break.
- `index.html`: new screens, styles, dwell re-render guard. `learn.js`: no longer auto-opens.
