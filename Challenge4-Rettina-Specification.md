# Rettina — Specification Document

**Hackathon:** "Unique" (Yachid Be'Minó) — home technology solutions for rare diseases
**Challenge 4:** Learning & Development Platform
**Disease and profile:** Rett syndrome, girl aged ~7–10, grades 2–4. She understands speech but cannot speak, and her hands are not usable for typing or writing. Gaze is her most reliable input.
**Version:** Draft 2 · 19 Nov 2026 (Live Lesson captions replaced by the Conversation module; student-chosen learning topics added)

> Items marked **[TO FILL]** or **[VERIFY]** need real input from the team (conversations held, prices checked). They are left open on purpose and must not be submitted as-is.

---

## 0. One-paragraph summary

Rettina is an accessibility layer that sits on top of the regular school. It does **not** replace the teacher, the curriculum or the school's materials. Families told us the biggest problem with today's eye-gaze communication tools is that they are **slow**: every word, sometimes every letter, costs a look and a wait, so the conversation has moved on before she has finished. Rettina has three parts, built on one shared engine:

1. **Conversation: take part at the speed of the class.** Classroom speech is transcribed in the background and is used only as context. A language model keeps the board filled with the words she is most likely to need right now. She selects two or three keywords, for example *teacher · ask · medieval*, and Rettina offers complete sentences such as *"Teacher, can I ask a question about medieval times?"* One more look speaks the sentence she chose.
2. **Learning she chooses.** On first start-up, and whenever she opens Learn, Rettina asks *"What would you like to learn?"* It offers topic tiles, plus a large gaze keyboard with ranked autocomplete, so one or two looks can reach any topic. The same engine also turns the teacher's homework into questions she can answer by gaze.
3. **Independent assessment.** A short adaptive quiz finds her level and shows teachers and parents what she actually knows. It separates "doesn't know" from "couldn't select".

The key ideas: **fewer selections per message**, and content that comes from the school's own lessons and her own interests, so no separate curriculum has to be built.

---

## 1. The need

### 1.1 Who it is for
A girl with Rett syndrome in a regular or integrated class. She understands much more than she can show. **She cannot speak, and she cannot type or write with her hands.** Her reliable channel is gaze, with slow and variable response time. Every selection costs her several seconds and effort.

*Assumption to confirm: Rett and grades 2–4. The design is input-agnostic (see 4.5), so T-A and other conditions can be added by changing the input method.*

### 1.2 The problem in the family's words
**[TO FILL: exact quotes from the family member and others you spoke with at the hackathon.]**

What we have so far:
- **Speed is the biggest complaint.** Patients and families told us existing solutions are too slow to keep up with a real conversation.
- Eye-tracking technology exists, but **word completion is done manually** by the user.
- Current devices are **not wearable** and are heavy to move around.
- Tools built for children with a motor disability do not follow what is happening **in the live lesson**.

### 1.3 Gaps this solution targets (from the Challenge 4 brief)

| Gap named in the brief | How Rettina answers it |
|---|---|
| Real learning content built for limited input | Works on the school's own lessons and assignments; every screen is operated by gaze |
| Experience tied to the child's interests | She picks her own learning topics; the board follows the live conversation |
| Slow, effortful communication (what families told us) | Prediction from context plus keyword-to-sentence completion; success is measured in selections per message |
| "Doesn't know" vs "couldn't select" | Every answer is classified by selection quality (see 4.4) |
| Showing teacher and parents what the child knows | Knowledge map and level report |

### 1.4 What we learned and what we changed
- **Learned:** speed matters more than reading support. **Changed:** the Draft 1 live-captions module was replaced by the Conversation module (4.1–4.2).
- **[TO FILL after talking with families, a speech-language therapist and a special-education teacher.]**

---

## 2. The solution

### 2.1 Users and roles

| Role | What they do |
|---|---|
| **Student** | Selects a few words by gaze and picks a full sentence; chooses learning topics; answers questions |
| **Teacher** | Wears a microphone; uploads assignments and approves AI-made questions; sees the student's messages and reports |
| **Aide / parent** | Sets up and calibrates input; adds topics and interests; approves new learning sources; sees reports |

### 2.2 The three modules

- **Module A — Conversation.** A predictive word board and sentence completion, fed by background speech. See 4.1 and 4.2.
- **Module B — Learning.**
  - **Choose what to learn:** student-initiated topics, with a topic menu and a gaze keyboard with autocomplete (4.3.1).
  - **Parent-initiated topics** (4.3.2).
  - **Accessible homework:** teacher assignments turned into multiple-choice questions (4.3.3).
- **Module C — Level Check and Knowledge Map.** A short adaptive quiz. Output is a level estimate, a suitability verdict and a per-topic knowledge map (4.4).

### 2.3 A day in the life
1. **08:30** The aide opens Rettina on the student's laptop and runs a 20-second gaze calibration. The teacher clips on a wireless microphone.
2. **09:00, history lesson on medieval times.** She doesn't need to watch the transcript. Her board quietly fills with *castle, knight, horse, armor, farmer, king*.
3. **09:12** A classmate asks whether knights had horses. She selects **Teacher · Ask · castle**. Three sentences appear, and she picks *"Teacher, can I ask a question about castles?"* It is spoken aloud and the teacher's screen shows a raised hand. That took 4 selections for a 9-word sentence.
4. **09:25** The teacher asks, *"Noa, what job would you choose?"* Her name triggers an immediate board update with *knight, baker, farmer, princess*. She selects **I want · baker**, then picks *"I want to be a baker, like Yael."* It takes 3 selections.
5. **16:00 at home** She opens Learn: *"What would you like to learn?"* None of the tiles is what she wants, so she looks at **Something else**, selects **A**, and the Search key already reads **"Search: Airplanes"**. One more look opens a short, accessible lesson on airplanes, followed by four questions.
6. **16:20** She finishes the homework her teacher uploaded and approved, then a 10-question adaptive quiz runs. The report says: level 4 of 7, appropriate for this assignment.
7. **Evening** Her father sees in the report that she chose *airplanes* today, and adds a book page about airports.

---

## 3. How it differs from what exists

| Existing solution (examples) | What it does | What is missing | What we add |
|---|---|---|---|
| Eye-gaze AAC devices and word boards | Gaze selection of words, symbols or letters | **Slow:** one selection per word or letter. Boards are static and not tied to the conversation. Word completion is manual. | A board predicted from the live conversation, and 2–3 keywords expanded into a full sentence |
| Generic word prediction (keyboard autocomplete) | Predicts the next word from what you typed | Knows nothing about the room; still word-by-word | Uses what was just said in class, including questions addressed to her by name |
| Gaze-based practice software | Basic skills (e.g., choose between two pictures) | Stops at early skills; not tied to the school curriculum or her interests | Learning from the school's content and from topics she picks herself |
| Adaptive learning platforms | Adjust difficulty | Assume working hands; build their own content | Works on the teacher's content; input-agnostic |
| Classroom aides and accommodations | Human support | Depends on a person; varies by place | Reduces dependence on an aide for everyday participation |

---

## 4. Detailed functional design

**Target device and sizes (apply to every screen):**
- Design canvas **1920×1080 (16:9)** on a **13–15.6" screen**. Layout uses relative units so it scales to 1366×768 and 1280×800.
- **Minimum selectable target: 2.5 cm (≈ 3° of visual angle at ~55 cm).** Eye trackers are typically accurate to about 0.5–1° (dedicated) or 2–5° (webcam), and children with Rett add head and eye movement. Targets must therefore be much larger than the tracker error.
- On a 15.6" 1920×1080 screen (~55 px/cm), 2.5 cm ≈ 140 px.
- Text is high-contrast, adjustable and sans-serif, with light and dark themes. Everything is **operated by dwell**: looking at a target fills it, then it selects. There is no clicking, typing or speaking anywhere in the student's flow.

### 4.1 Conversation screen

**Layout (landscape, one screen, no scrolling):**

```
+-----------------------+---------------------------------------------------------------+
| ROOM CONTEXT  ~27 %   | NOA'S BOARD  ~73 %                                            |
| (for aide / teacher;  |  [ teacher ][ ask ][ castle ]          <- keywords she chose  |
|  student can ignore)  |                                                               |
|                       |  [ Teacher, can I ask a  ][ Why did castles have ][ I like  ] |
| Ms. Cohen: Knights    |  [ question about castles?][ big walls?          ][ castles.] |
|   rode big horses...  |                                        <- 3 full sentences    |
| Dan: Did knights have |  [ Yes ][ No ][ Teacher ][ I want ][ Ask ][ I don't know ]    |
|   horses?             |  [castle][knight][horse ][armor ][ king ][ farmer ]   <- 18    |
| Ms. Cohen: Noa, what  |  [ wheat][ sword][ bread][tower ][ walls][ school ]   predicted|
|   job would you...    |  [ baker][ job  ][ weave][ cows ][ metal][ draw   ]   words    |
|                       |  [ Undo ][ Clear ][   Say my words as they are  ]             |
+-----------------------+---------------------------------------------------------------+
```

| Area | Content | Behavior |
|---|---|---|
| **Keyword strip** | The keywords she has chosen, in order | Shows what she has said so far; nothing is sent until she picks a sentence or "Say my words" |
| **Sentence row** | 3 complete sentences, most likely first | Appears after her first keyword and updates after each one. The three differ in intent (question / statement / request). One look speaks it aloud and sends it to the teacher. |
| **Core row** | Fixed: Yes · No · Teacher · I want · Ask · I don't know | Never moves, so motor planning stays stable |
| **Predicted words** | 18 words or short phrases | From the room context and her keywords (4.2). Words that stay relevant keep their position. |
| **Controls** | Undo · Clear · Say my words as they are | "Say my words" speaks the keywords exactly as chosen, with no AI rewording |

**Rules that protect her voice:**
- **Nothing is ever sent automatically.** The AI only suggests; she always makes the final selection.
- **"Say my words as they are" is always available**, so she is never forced into the AI's phrasing.
- The log marks each message as *AI-completed* or *her exact words*, so teachers and parents can see what was hers.
- Suggestions are written in the first person, are age-appropriate, and must carry the meaning of every keyword she chose.

**Teacher notification:** when she picks a sentence, it is spoken aloud by text-to-speech, and the teacher's screen shows a raised hand with the message. The teacher decides when to call on her.

**Speed metric (shown to aide, logged for the pilot):** *selections per message* and *seconds per message*. Example: 3 selections → 11 words, versus 11+ with a word-by-word board.

### 4.2 Prediction engine (technical behavior)
- **Inputs:**
  - The last ~14 utterances of the room transcript (rolling buffer)
  - Her selected keywords
  - The lesson topic, if the teacher uploaded material
  - Her personal vocabulary and recent messages
- **Outputs, in one request:** 18 predicted words and, if she has chosen keywords, 3 sentences. Returned as structured JSON.
- **When it refreshes:**
  - Immediately after every selection she makes.
  - On new speech, debounced and throttled to at most one refresh every ~4 seconds, so the board stays calm.
  - **Immediately when someone says her name**, since that usually means a question for her.
- **Stability rules for gaze users:**
  - Predicted words that are still likely keep their tile; only freed tiles change, with a brief highlight.
  - Context-driven updates are held back while her gaze is resting on the word grid.
- **Latency:**
  - Target **< 1.5 s** from selection to new sentences. **[VERIFY in pilot]**
  - A newer request cancels the older one.
  - The model runs at low effort. A faster, cheaper model tier is an option if quality holds.
- **Offline / failure fallback:** a simple local predictor (frequent topic words plus sentence templates), so the board never goes blank.
- **Language:** the same language as the transcript (Hebrew first; English supported).

### 4.3 Learning

#### 4.3.1 Choose what to learn (student-initiated)
On **first start-up**, and every time she opens **Learn**, Rettina asks **"What would you like to learn?"**

**Screen 1 — Topic menu.** 7 large picture-and-word tiles plus **Something else**:

| Tile source | Example |
|---|---|
| Her interests (set by parents at setup, then learned from her choices) | Horses, Music |
| What her class is studying this week (from the teacher's uploads) | Medieval times |
| Popular, age-appropriate topics | Space, Animals, Dinosaurs |
| **Something else ⌨** | Opens the keyboard below |

The order is learned from what she picks, so her favourite topics come first and cost one look.

**Screen 2 — "Something else": large gaze keyboard with autocomplete.** She cannot type with her hands or speak, so each letter is one gaze selection. The design aims to **finish in as few letters as possible**.

```
+---------------------------------------------------------------------+
|  [ Search: AIRPLANES ✓ ]   [ Animals ]   [ Apples ]   [ Astronauts ]  |  <- top match + next 3
|  typed: A_                                                           |
|  [ A ][ B ][ C ][ D ][ E ][ F ][ G ]                                 |
|  [ H ][ I ][ J ][ K ][ L ][ M ][ N ]      keys ≥ 2.5 cm              |
|  [ O ][ P ][ Q ][ R ][ S ][ T ][ U ]      keys that lead nowhere     |
|  [ V ][ W ][ X ][ Y ][ Z ][ ⌫ ][ Back ]   are dimmed and disabled    |
+---------------------------------------------------------------------+
```

- **A ranked topic index.** Search runs against an index of age-appropriate topics (a few thousand entries) rather than free text. Each entry has a rank score, which combines:
  - How popular the topic is with children her age
  - Her own history (topics she chose or lingered on)
  - What her class is studying now
  - Topics parents or teachers added for her
- **Search resolves to the top match.** "Search" always shows the topic it will open, for example **"Search: Airplanes"**. If *Airplanes* is the highest-ranked entry starting with "A", then selecting **A → Search** opens airplanes: **2 selections** for any topic at the top of its letter. Every extra letter narrows the match (A → AN → *Animals*).
- **The next 3 matches are shown as big tiles** next to Search, so a near-miss costs one look instead of more letters.
- **Impossible keys are dimmed.** Letters that cannot continue any topic in the index are dimmed and cannot be selected. This means fewer targets, fewer mistakes, and faster scanning.
- **Tolerant matching.** Gaze sometimes lands on a neighbouring key. A one-letter slip between neighbouring keys still finds the intended topic if no exact match exists.
- **"Not this" is always one look away** on the lesson screen. It returns to the keyboard with her letters kept.
- **Keyboard layout:** alphabetical by default, because it is easier to learn without typing experience. Final layout to be agreed with a speech-language therapist (see 10). The keyboard is Hebrew for the Hebrew version.
- **Pre-readers:** if she cannot spell yet, Something else opens picture categories (Animals → Farm animals → Horses) instead of letters, using the same ranking.
- **Why an index, and not free text sent to the AI:**
  - It is instant and works offline.
  - Every reachable topic is vetted as age-appropriate.
  - A single letter can resolve to a confident answer.
  - Parents and teachers can add topics to it.

**After a topic is chosen**, the engine builds a short accessible lesson: large text read aloud, and pictures where available. It is drawn **only from vetted sources for that topic** (a curated children's encyclopedia or parent-approved material), followed by 3–5 gaze-answerable questions. The topic and her answers appear in the parent report.

#### 4.3.2 Parent-initiated learning
A parent uploads text or a photo of a page, or types a topic. The same engine turns it into accessible content, with an age-appropriateness filter and a parent approval step. New topics are added to her index, so she can find them herself later.

#### 4.3.3 Accessible homework (teacher assignments)
1. Teacher uploads an assignment (PDF, Word, photo or pasted text).
2. The AI converts it into multiple-choice questions, **grounded only in the uploaded content**. No outside facts are introduced.
3. The teacher sees every question and the correct answer, edits or deletes, and **approves**. Students never see unapproved items.
4. Each question has 2–4 options, each at least 2.5 cm. The number of options adapts to how reliably she is selecting.
5. Because the source is the school's own assignment, the output follows the class's level, topic and wording.

#### Why it works at every level
Content comes from the school's assignments, from her own chosen topics and from her parents, and the quiz adapts to wherever she is. The same app works for below-grade, at-grade or above-grade students, with no content library to maintain beyond the topic index.

### 4.4 Level Check — adaptive assessment ("how much does she know")
After an assignment or a self-chosen lesson, an 8–12 item quiz on that subject.

- **Levels 1–7** per subject, tagged to grade expectations (below grade, at grade, above grade).
- **Bracketing:**
  - Item difficulty follows a staircase: big steps at first, then single levels.
  - The quiz stops when the estimate is stable, at 12 items, or on a fatigue flag.
  - The final level is a guessing-corrected estimate from all valid answers.
- **Selection-quality layer:** for each answer the app records time to first look, number of gaze switches, dwell failures and reversals.

| Class | Meaning | Effect |
|---|---|---|
| **Valid** | Clear, timely selection | Counts toward level |
| **Uncertain** | Hesitation, changed choice, timeout | Re-asked with fewer options before counting |
| **No response** | Fatigue or tracker loss | Excluded, **never counted as wrong** |

- **Output:**
  - **Level estimate** with range and confidence
  - **Suitability verdict** for the assignment: *too easy / appropriate / too hard / not enough data*
  - **Knowledge map** per topic
  - **Short explanation** for teacher and parents
- **Validated in simulation:** synthetic student profiles with known ability were used to check the quiz. Examples include a strong reader with unreliable gaze, and a tired day. Known bias: with 3 options, very low ability is over-estimated by about 1 level. **[Tune with pilot data.]**

This is a **placement and learning-support tool**. It does not give an IQ or an official cognitive result.

### 4.5 Input methods (input-agnostic)

| Input | Role |
|---|---|
| **Dedicated eye tracker presented as a pointer** (existing device or standard consumer tracker) | Primary for Rett; dwell selection |
| **Webcam eye gaze** (on-device face and iris model, 9-point calibration) | No extra hardware; lower accuracy, so snapping to the nearest target is used. For trying Rettina at home, and as a backup. |
| **Webcam head pointer** | Steadier than webcam eye gaze where head control allows |
| **Switch scanning** | Fallback; also the path for T-A and other conditions |
| **Touch or mouse** | For aides and for testing |

- Dwell time is adjustable from 0.5 to 5 s, with a visual fill.
- Gaze is snapped to the nearest target within an adjustable radius, with hysteresis so the target does not flicker.
- A short calibration is run by the aide before each day.

### 4.6 Reports

| Viewer | What they see |
|---|---|
| **Teacher** | Her messages in class (marked *AI-completed* or *her exact words*), participation over time, assignment results, level and suitability verdict, topic map |
| **Parent** | Same, plus the topics she chose to learn and her answers |
| **Aide** | Setup, dwell and calibration, device status, selections-per-message trend |

Export as PDF or CSV. No required integration with school systems in version 1; assignment upload is by file.

---

## 5. Architecture

```
 CLASSROOM                         CLOUD                                  STUDENT DEVICE
 ---------                         -----                                  --------------
 Wireless mic ──audio──► [ Streaming speech-to-text (Hebrew) ]
 (teacher clip-on)               │ text only
                                 ▼
                       [ Rolling context buffer (~5 min, not stored) ]
                                 │
 her keywords ─────────► [ Prediction service (LLM) ] ─ words + sentences ─► [ Conversation board ]
                                                                               │ chosen sentence
                                                                               ▼
                                              teacher screen ◄── message ── [ Text-to-speech ]

                       [ Topic index + ranking ] ◄──────── letters ───────── [ Gaze keyboard ]
                                 │ topic                                       (search runs on device)
                                 ▼
 Assignment / parent ─► [ Lesson + question generator (LLM, grounded) ] ─► approval ─► [ Question bank ]
 upload                                                                                 │
 Student responses ◄─────────────────────────────────────────── [ Adaptive engine + selection-quality layer ]
                                 │
                       [ Analytics + reports ] ─► Teacher / Parent dashboards
                       [ Auth + roles + audit log ]
```

| Component | Where it runs | Notes |
|---|---|---|
| Speech-to-text | Cloud (streaming) | Hebrew; vocabulary biased by the lesson materials. **[VERIFY: accuracy on classroom Hebrew]** |
| Context buffer | Cloud, memory only | Rolling window of recent text used for prediction; **not saved to disk by default** |
| Prediction service | Cloud (LLM) | One request returns words plus sentences; structured output; stale requests cancelled; local fallback |
| Topic index and autocomplete | **On the device** (synced from cloud) | Instant, works offline; ranking updated from her choices |
| Lesson and question generation | Cloud (LLM) | Grounded only in uploaded or vetted content; no web access |
| Text-to-speech | Device or cloud | Speaks her chosen message |
| Gaze, dwell and snapping logic | **On the device** | Smooth even on a slow connection; webcam video never leaves the device |
| Reports | Cloud | Role-based access |

**Privacy and data:**
- Only the **teacher's microphone** is captured by default, to reduce recording of other children. A room microphone, which would also capture classmates' questions, is optional and needs class consent.
- Audio is processed as a stream and **not stored**. The transcript is used only as short-lived context for prediction and is not stored by default. Her own messages are kept for the report, and parents can delete them.
- Webcam gaze runs fully on the device; no video is sent or stored.
- Student data is pseudonymized; access is by role; every access is logged.
- Parental consent is required, and the teacher and class parents are notified.
- LLM and speech providers are used under no-training, no-retention terms. **[VERIFY with each provider]**
- Compliance with Israeli privacy law for minors is required. **[VERIFY with legal advisor]**

---

## 6. Bill of quantities

**Exchange rate and price check date: [TO FILL]**. Every row needs a working link to the product page **and** the price page before submission. The rows below are the structure; prices are **not yet verified**.

| Component | Maker and model | Role | Qty | Unit price (source currency) | Unit price (ILS) | Total (ILS) | Link | Notes |
|---|---|---|---|---|---|---|---|---|
| Laptop 15.6" 1920×1080 with webcam | **[VERIFY]** | Student device | 1 | **[VERIFY]** | | | | Often already owned by the family or school |
| Eye tracker | **[VERIFY]** (consumer-class, for screens up to ~27") | Gaze input | 1 | **[VERIFY]** | | | | Many families already own one. The webcam mode is a no-cost fallback. |
| Wireless clip-on microphone set | **[VERIFY]** | Teacher audio | 1 | **[VERIFY]** | | | | Check lead time > 4 weeks |
| Switch (backup) | **[VERIFY]** | Fallback input | 1 | **[VERIFY]** | | | | |
| Mount for laptop or tablet | **[VERIFY]** | Positioning | 1 | **[VERIFY]** | | | | |
| Speech-to-text (streaming) | **[VERIFY]** | Background transcript | per class-hour | **[VERIFY]** | | | | Per class, shared |
| LLM API | **[VERIFY]** | Word prediction, sentence completion, lessons, questions | usage | **[VERIFY]** | | | | See 7.3 |
| Text-to-speech | **[VERIFY]** | Speaks her messages | usage | **[VERIFY]** | | | | |
| Topic index content | **[VERIFY]** (curated children's encyclopedia or licensed list) | Learn → Something else | licence | **[VERIFY]** | | | | |
| Hosting and database | **[VERIFY]** | Backend | monthly | **[VERIFY]** | | | | |

---

## 7. Cost calculation

### 7.1 Development cost (build and integration phase)
Show hours, not just the total **[TO FILL: team estimate]**. Proposed breakdown to size:

| Work item | Estimate (person-weeks) |
|---|---|
| Background speech-to-text and context buffer | **[TO FILL]** |
| Prediction service, sentence completion, stability rules | **[TO FILL]** |
| Learn: topic menu, gaze keyboard, topic index and ranking | **[TO FILL]** |
| Gaze, webcam and switch input layer, calibration | **[TO FILL]** |
| Lesson and question generator, teacher approval flow | **[TO FILL]** |
| Adaptive engine and selection-quality layer | **[TO FILL]** |
| Dashboards and reports | **[TO FILL]** |
| Privacy, security and a pilot with 5 families | **[TO FILL]** |

### 7.2 One working unit
The device bundle at the student's desk (laptop + tracker + mount + switch), plus the classroom microphone kit. If the family or school already owns a device, the unit cost falls to the microphone and the mount. With webcam gaze it can fall to the microphone alone.

**Formula to show:**
`Unit cost = laptop + tracker + mount + switch + microphone kit + setup time`
`Cost per student per year = unit cost ÷ years of use + cloud subscriptions per year + maintenance`

### 7.3 Illustrative cloud cost (assumptions, **not verified**)
- **Speech-to-text:** ~4 lesson hours a day × ~180 school days ≈ 43,000 minutes a year. At an assumed price of a few cents per minute, this alone could cost hundreds of dollars a year for one class. That is why the transcript is shared **per class** and only the hours she attends are transcribed. **[VERIFY with real prices.]**
- **LLM:** one small request on each selection, and at most one every ~4 s during speech. Cost scales with how much she talks and the model tier chosen. A faster, cheaper tier is the main lever if quality holds. **[VERIFY: measure tokens per lesson in the pilot.]**

### 7.4 Screen resolution decision (my call)
1920×1080, 13–15.6", landscape. The board panel is ~73% of 1920 px ≈ 1400 px, which fits 6 columns of ~230 px (≥ 2.5 cm each). The gaze keyboard's 7 columns fit at full width. This must be confirmed with the family's actual device.

---

## 8. Impact measurement

Two main measures.

| Measure | Today | Pilot method | Success |
|---|---|---|---|
| **1. Communication speed:** selections and seconds per message in class | Measure with her current AAC device in 3 lessons before the pilot **[TO FILL]** | **5 families, 8 weeks**, app logs plus the same measure on her current device | **[TO AGREE with clinicians]**, e.g., at least half the selections per message, with families confirming the messages say what she meant |
| **2. Independent participation:** answers and questions given in lessons without an aide | Observe 3 lessons before the pilot **[TO FILL]** | Observation sheet and app logs | **[TO AGREE]**, e.g., a clear increase over baseline |

Secondary:
- Share of messages sent as *AI-completed* versus *her exact words*, and how often she rejects suggestions (a quality check on predictions)
- Topics she chose herself per week
- Knowledge-map agreement with the teacher's own view
- Share of homework finished independently

---

## 9. Path to the build-and-integration stage

**What a build team needs:**
- This spec, and the clickable prototype (`prototype/`)
- The confirmed device list
- Access to speech-to-text and LLM services
- A licensed or curated topic index
- Five pilot families
- A special-education teacher and a speech therapist as advisors
- A test set of recorded classroom Hebrew

### Three main risks

| Risk | Why it matters | How we handle it |
|---|---|---|
| **1. Putting words in her mouth** (predictions that are wrong or steer her) | Her voice must stay hers; a fluent wrong sentence is worse than a slow right one | She always makes the final pick; nothing is auto-sent; "Say my words as they are" is always one look away; messages are logged as AI-completed or exact; rejection rate is monitored; parents and clinicians review samples |
| **2. Hebrew speech recognition in a real classroom** (noise, academic words, fast speech) | Poor transcripts lead to poor predictions | Teacher clip-on microphone; vocabulary biasing from lesson materials; the board still works from her own keywords and the local fallback if speech recognition fails; test on recorded classes **before** committing |
| **3. Reliable gaze input for a Rett user** (head movement, fatigue, calibration drift) | If she cannot select reliably, nothing else works | Large targets; snapping; adjustable dwell; short daily calibration; switch fallback; stable board layout; fatigue detection and breaks; selection-quality layer in assessment |

---

## 10. Open questions

**For families:**
- What input does she use today, how reliable is it across the day, and how many seconds does one message take now?
- Does she recognise letters or read words? This decides between the keyboard and picture categories in Learn.
- Which topics does she love? These seed her topic menu.

**For clinicians and teachers:**
- Keyboard layout for a child who has never typed: alphabetical, frequency-ordered, or matching her current AAC device?
- Which core words must be fixed on the board, so they don't conflict with her current AAC vocabulary?
- How should AI-completed messages be presented, so she feels they are her own and others trust them?
- How many questions can a student of this profile do before fatigue?

**For providers and legal:**
- Hebrew streaming accuracy and price; no-retention terms for speech and LLM providers.
- Consent requirements for using classroom speech, even as short-lived context.
- Licensing for the topic index and lesson sources.

**For the school:**
- Will teachers wear a microphone and approve AI-made questions? How much time can they spend?
- Which school systems must we export to later?
