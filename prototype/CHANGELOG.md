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

## 2026-11-20 · Side-edge gaze accuracy, camera mirror gate, closed-loop 6-target validation & auto-refinement

**Why:** calibration previously had no real-camera/face failsafe (allowing calibration with no camera), verification did not confirm gaze on the sides, and predictions fell short toward the left and right edges of the screen where the Gaze Frame tiles live.

**What changed**
1. **Welcome screen live camera mirror & permission gate (`app.js`, `index.html`, `gaze.js`, `i18n.js`):**
   - Entering Noa's *Hi Noa!* screen in webcam gaze/head mode automatically tries to turn on the camera (`enableCamera()`) so Chrome prompts for camera permission immediately, and shows a live `220×165` mirrored preview with face oval + green iris dots (`#welcomeCam`).
   - *Start* (`#calGo`) stays dimmed and locked until the camera is active and a face is detected (`onWelcomeCamFrame`).
   - Removed silent fallback from real camera errors to fake mouse calibration (`realCalibrate` in `app.js`): camera errors now show an explicit modal with **Try again / Switch to mouse demo / Cancel**.
   - Standalone calibration (`Gaze.calibrate()`) also enforces a mandatory **Camera & face check** gate (`setupFaceStreak >= 10`) and frame-locked dot collection (`showAt` fills an SVG progress ring only while live non-blink frames arrive, pausing if the face drops out).
2. **Side-edge gaze accuracy (`gaze.js`, `CAL_VERSION = 4`):**
   - Added separate per-eye horizontal iris features (`rx`, `lx`) and signed quadratic edge-expansion features (`ex2`, `ey2`) in `features()` and `GAZE_KEYS` to handle single-eye abduction compression near side edges.
   - Separated eye vs. head regularization (`GAZE_FLOOR`, `GAZE_PEN_X/Y`, `GAZE_HEAD_PEN_X/Y`) so real vertical/horizontal eye ranges are not over-shrunk toward screen center.
   - Added center-anchored piecewise edge gain calibration (`stretchAxis` / `applyStretch`, clamped to `[0.85, 1.55]`) in `fitMode` and `predictNorm` so left and right edge predictions reach all the way to `u = 0..1`.
   - Widened the 9-dot grid closer to the frame rails (`mx <= 64`, `my <= 64`), moved the 4 check dots onto the side rails (`[0.08, 0.32]`, `[0.92, 0.32]`, `[0.92, 0.68]`, `[0.08, 0.68]`), and increased the horizontal quiet-zone capture band `bx` in `snap()` up to `105 px` (keeping vertical `by <= 42 px`).
3. **Closed-loop 6-target side & corner validation + auto-refinement (`gaze.js`, `index.html`, `app.js`, `i18n.js`):**
   - Extracted `runValidationLoop()` used both at the end of calibration and standalone via `window.Gaze.validate()`.
   - Displays 6 side/corner targets (`8%` and `92%` horizontally × `16%`, `50%`, `84%` vertically) with pulsing active-target guidance, live SVG dwell rings, and per-ring error badges (`.cal-err`).
   - **Auto-refinement:** if the user fixates steadily on the pulsing side target (`>= 16` clean frames over `>= 550 ms` with low variance) and the gaze dot still falls short on that side, it automatically anchors that target (`w: 2` weighted point), refits `G.cal` + `stretchAxis`, and updates the live dot in real time. Clicking any spot while looking at it also adds a `2×` anchor.
   - **Continue ✓** stays locked until all 6 targets confirm `✓` (with explicit **Recalibrate** and secondary **Skip**).
4. **UI refinements (`index.html`, `app.js`, `i18n.js`):**
   - Consolidated calibration instructions, `1 / 13` counter, mini camera mirror, status pills, and action buttons into a single centered glass card (`#calibCard`) so the 6 side targets stay completely clear.
   - Added **Test & refine** buttons (`#calTestBtn` in Parent sidebar, `#sTestGaze` in Noa's top bar) next to **Calibrate** (`#sRecal`) to launch the 6-target validation & refinement loop anytime without re-running all 13 dots.
   - Raised `#toast` (`z-index: 95`) and `#gazeDot` (`z-index: 65`) with a solid center pinpoint.

**Files modified (all currently uncommitted against `HEAD` `a2995c6`):**
- `prototype/gaze.js` (`CAL_VERSION = 4`, `features`, `GAZE_KEYS/FLOOR/PEN`, weighted `fitAxisLOOCV`, `stretchAxis`, `applyStretch`, `snap`, `drawCalibStatus`, `runValidationLoop`, `calibrate`, `validateCalibration`, `window.Gaze.validate/isCameraOn/enableCamera`)
- `prototype/index.html` (`#calibCard`, `#calibCamStat`, `.cal-ring.current/.cal-err`, `#camMirror`, `.cam-gate`, `#sTestGaze`, `#sRecal`, `#calTestBtn`, `Dwell` blink grace/debounce)
- `prototype/app.js` (`sWelcome` mirror + `checkWelcomeCamera`, `realCalibrate` camera-error modal, `#sTestGaze`, `#sRecal`)
- `prototype/i18n.js` (EN & HE calibration, mirror gate, and validation strings)
- `prototype/CHANGELOG.md` (this log)

**How to revert:**
- Revert everything in the working tree back to last commit (`HEAD` = `a2995c6`):
  `git checkout -- prototype/gaze.js prototype/index.html prototype/app.js prototype/i18n.js prototype/CHANGELOG.md`
- Revert only a single file (for example `gaze.js`):
  `git checkout -- prototype/gaze.js`
- Clear saved v4 browser calibration in DevTools console if needed:
  `localStorage.removeItem('rettina.calib')`

---

## 2026-11-19 · Overhaul: webcam eye-gaze & head-pointer accuracy, calibration, filtering and dwell

**Symptom:** eye tracking became wildly inaccurate after moving to the gaze frame and drifted off target with even tiny head movements, blinks, or window resizes.

**Root causes and fixes**
1. **Standardizing tiny calibration head motion blew up post-calibration tracking.** Calibration asked users to keep their head still, making `std(yaw)`/`std(pitch)` tiny (~0.004); z-score division amplified accidental micro-turns into huge regression weights, so any 2–4° head shift after calibration threw gaze hundreds of pixels off-target. Uncentered `ex²`/`ey²` also overfit the 9 points (fitted on ~270 correlated frames with `lambda=2`) and warped near the edges. *Fix:* switched to normalized `[0,1]` viewport prediction with fixed physical minimum feature scales (`MIN_SCALE`), parallax-adjusted physics priors on 3D head pose/translation, cross-axis penalties, and per-axis Leave-One-Point-Out Cross-Validation (LOOCV) (`gaze.js`).
2. **Weak vertical eye signal, aspect-ratio distortion, and 640×480 video.** `eyeFeat` mixed normalized `x` and `y` without correcting for webcam aspect ratio and relied only on iris-to-corner offset (only 2–4 px vertical sweep). *Fix:* request 1280×720 ideal video, enable MediaPipe `outputFaceBlendshapes` and `outputFacialTransformationMatrixes`, correct all geometry by video aspect ratio, and combine iris-to-corners, bone-anchored inner-corner iris offset, upper-eyelid drop (lid-eye synkinesis), ARKit `eyeLook*` blendshapes, and true 3D skull `yaw`/`pitch`/`roll` (`gaze.js`).
3. **No blink detection, outlier trimming, or 13-point refit.** Blinks and slow saccades poisoned least-squares fitting, and the 4 validation dots were discarded. *Fix:* adaptive blink detection (`eyeBlink*` + eye openness), per-dot MAD outlier trimming + equal-weight point aggregation, honest 9→4 out-of-sample error measurement followed by a 13-point full refit, and calibration schema `v: 2` to invalidate stale pixel-space calibrations (`gaze.js`).
4. **Framerate-dependent EMA and glitch amplification.** `steer()` smoothed on every 60/120 Hz display frame (4× per 30 fps webcam frame) and `a = 0.08 + jump/900` amplified 1-frame glitches. *Fix:* update filtering only on new video frames, freeze gaze across brief blinks (< 380 ms), apply a 3-frame median pre-filter + framerate-independent 1-Euro filter, and render `#gazeDot` with `translate3d` (`gaze.js`, `index.html`).
5. **Calibration UI bugs.** Re-calibrating flashed the old `#gazeDot` over `#calib` during every settle window, dot #1 slid in from `(0, 0)`, and there was no face-in-view feedback or in-mode recalibrate button. *Fix:* dedicated `G.calibrating` guard, immediate centered dot #1 with bullseye target, live mini camera preview + face status badge inside `#calib`, mode-aware prompts (eye gaze vs head pointer), and an adult-only 1-click **Calibrate** button in Noa's top bar (`gaze.js`, `index.html`, `app.js`, `i18n.js`).
6. **Quiet-zone & dwell interaction.** Shrinking `.quiet` by 140 px on all sides ate into Ollie's bottom question bubble (triggering the middle answer while reading), old hysteresis stuck on neighboring tiles in dense grids, and a 1-frame drop wiped dwell progress to 0. *Fix:* asymmetric quiet-zone edge bands (≤ 75 px horizontal, ≤ 42 px vertical), Schmitt-trigger hysteresis, and a 260 ms blink/jitter grace window + 110 ms tile-switch debounce in gaze dwell (`gaze.js`, `index.html`).

**Files:** `gaze.js`, `index.html`, `app.js`, `i18n.js`.

---

## 2026-11-19 · Fix: webcam eye tracking in the frame layout

**Symptom:** with real webcam eye gaze, tiles in the frame were hard or impossible to select, although tracking used to work.

**Causes and fixes**
1. **The quiet zone swallowed gaze aimed at the edges.** Webcam gaze estimates drift toward the middle of the screen, and the frame's large quiet centre turned off snapping, so a look at an edge tile often selected nothing. *Fix:* only the core of a quiet zone is quiet. A band as wide as the snap radius (at least 80 px) along its edge still snaps to the nearest edge tile (`gaze.js` `snap`). Checked: gaze 40–110 px inside the centre reaches Next and Today; the deep centre stays quiet.
2. **A tile that replaced the one just chosen could stay blocked.** With gaze, snapping keeps the eyes "on" that spot, so a new Next in the same corner was ignored until the eyes went to another tile. *Fix:* for gaze, such a tile is released 1.2 s after it appears (`index.html` `setTarget`). A tile that was itself chosen still needs a look away, as before.
3. **Found while testing: resting the eyes on the forward corner during a question could answer it with no second look.** Snapping picked the nearest answer, then the ✓ appeared under the eyes and confirmed. *Fix:* a fresh ✓ (`data-fresh`) can't be selected until the gaze point has left a 60 px area around it, based on the actual gaze position, so a one-frame snap wobble can't bypass it. Applies to both layouts. Checked: 5 s of staring marks an answer but doesn't confirm; looking away and back confirms.

**Also added:** `Dwell.point` (current gaze or mouse position) and a test hook `Gaze.snapAt(x, y)`, used to check all of the above without a camera.

**Files:** `gaze.js` (quiet band, `Dwell.point`, `snapAt`), `index.html` (dwell guard timing, fresh-✓ check, pointer position), `lesson.js` (✓ marked `data-fresh`).

**Undo just this:** `git revert <this commit>`.

---

## 2026-11-19 · Sources: Ministry of Education library + parent file uploads

**Why:** the team wants lessons grounded in official curriculum material; parents also need a way to add the school's own worksheets and custom files as context.

**What changed**
- **New parent page: Sources** (sidebar, under Today's schedule), with three trust levels:
  1. **Official: Ministry of Education.** A connected curriculum library for Grade 3 History, Language, Math and Science. These are **clearly labelled sample entries**: a real integration needs the Ministry's permission and terms of use, so the demo never presents them as real documents.
  2. **School and teacher files.** What the class is learning this week, approved by the teacher.
  3. **Your files.** Extra context; nothing reaches Noa until the parent approves.
- **Real file reading in the browser:** PDF (PDF.js 3.11.174) and Word .docx (Mammoth 1.6.0), both from cdnjs and loaded only when a file is added, plus .txt/.md. Drag and drop or a file picker; several files at once.
- **Each uploaded file shows** its type, word and page count, who added it, a guessed subject, a text preview, and a **privacy check** that lists possible names of other people (English and common Hebrew names) to remove before approving.
- **Actions per file:** *Approve for Noa*, *Make questions from it* (sends the text to the Accessible Homework generator), *Remove*.
- **Every lesson shows its source:** a badge in the lesson header, e.g. "Ministry of Education + 📎 Class worksheet - Castles", listing approved files for that subject only.
- **Rules shown to parents:** Rettina answers only from listed sources; official sources win on facts, school files win on "this week"; file text is treated as reference, never as instructions.
- **Tour:** a new chapter after the schedule (16 chapters total). It opens Sources, adds a sample class worksheet through the real reader, shows the name check (Dan, Yael) and approves it. The lesson chapter then highlights the source badge. The handover now uses the sidebar button.

**Files**
- `sources.js` (new): library data, file readers, name check, subject guess, page rendering, `badge()`, `addSample()`, `reset()`.
- `index.html`: Sources nav item and page, script tag, `.src-*` styles.
- `i18n.js`: nav and title strings (English and Hebrew).
- `lesson.js`: source badge in the lesson header (both layouts).
- `app.js`: `App.reset` clears uploads.
- `tour.js`: Sources chapter, badge highlight, handover via `#toStudent`.

**Limits:** uploads live in the browser tab only (lost on reload). The hosted demo can't call the AI, so approved files currently drive the source badge and the question generator, not new lesson text. Scanned PDFs without real text show "couldn't read".

**Undo just this:** `git revert <this commit>`.

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
