# WoodenBoard Chuck Investigation Board Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a static GitHub Pages investigation-board website that explains Chuck’s complete evolution through scrambled pinned notes, dated/versioned branches, directional threads, cross-board links, and impact evidence.

**Architecture:** The site is a static HTML/CSS/vanilla-JavaScript application. Shared board data lives in one structured JSON file; a shared renderer places sticky notes and draws SVG thread paths with visible chevrons, while thin page wrappers select the main board or one of eight feature boards. Content and navigation stay data-driven so later Chuck builds can be added without rewriting page markup.

**Tech Stack:** Static HTML5, CSS3, vanilla ES modules, SVG, JSON, Node.js built-in test runner, GitHub Pages / GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-10-04-woodenboard-chuck-investigation-board-design.md`

## Global Constraints

- Keep the production site backend-free and dependency-free: static HTML, CSS, vanilla JavaScript, SVG, and JSON only.
- Use the approved warm wood board image as the full-board background.
- Use the approved blank yellow sticky note with red pushpin as the reusable note asset; note text is HTML/CSS, not baked into the image.
- CHUCK must be pinned at the exact visual center of the main board.
- Never render feature evolution as a rigid horizontal/vertical row; every board must use scrambled, branched note placement.
- Every primary thread must communicate direction with repeated or strategically placed `>` / chevron markers.
- Clicking a major main-board sticky navigates to a new full board page; do not use modal mini-boards.
- Significant builds, bugs, fixes, migrations, and decisions show date metadata and version metadata when known.
- Exact dates must be grounded in CHUCK release/commit history; uncertain history must be labeled `Approx.`, `Discussed`, or `Planned`.
- Planned work must never be presented as shipped.
- Retired approaches remain visible and show what replaced them.
- Desktop is the primary experience; tablet/mobile use pan/scroll-friendly layouts rather than compressing the entire board.
- Color alone cannot communicate relationship type; thread styles/labels/direction must remain understandable without color.
- Respect `prefers-reduced-motion`.
- The site must work on GitHub Pages with browser back/forward navigation.

## File Structure

```text
/
  index.html                         # Main Chuck ecosystem board shell
  boards/
    conversation.html               # Loads conversation board
    qbo.html                        # Loads QBO board
    meetings.html                   # Loads meetings board
    cleaner.html                    # Loads Cleaner board
    data-architecture.html          # Loads data architecture board
    reuse-outreach.html             # Loads reuse/outreach board
    mapping-admin.html              # Loads mapping/admin board
    performance-reliability.html    # Loads performance/reliability board
  assets/
    wood-board.png                  # Approved reusable wood background
    sticky-note.png                 # Approved blank sticky + red pin PNG
  css/
    board.css                       # Board shell, note styling, responsive/a11y states
  js/
    board-app.js                    # Page bootstrapping, board selection, interactions
    board-renderer.js               # Note placement and DOM rendering
    thread-geometry.js              # Pure connection geometry/path calculations
    thread-renderer.js              # SVG threads, chevrons, highlighting
  data/
    boards.json                     # Main board + eight feature boards + notes/connections
  scripts/
    validate-data.mjs               # Schema/content/link/date validation
  tests/
    board-data.test.mjs             # Data integrity and historical-label contracts
    thread-geometry.test.mjs        # Geometry/direction tests
    page-contracts.test.mjs         # HTML/page/accessibility/static routing contracts
  .github/
    workflows/
      pages.yml                     # Validate/test and deploy static site
  package.json                      # Test/validation commands only; no runtime deps
  README.md                         # Purpose, navigation, editing conventions, Pages URL
```

## Review Focus

1. **Dangling or duplicate note/connection IDs:** validation must fail before deployment when a connection references a missing note or a note ID is duplicated.
2. **Long sticky-note copy:** renderer/CSS must preserve readable notes without clipping titles, dates, versions, or summaries; the page-contract/fixture tests pin a long-copy case.
3. **Small-screen/off-canvas navigation:** feature boards must remain reachable by scrolling/panning, and the fixed navigation controls must not obscure note interaction.
4. **Missing/invalid cross-board targets:** every `relatedBoard` target and every main-board board link must resolve to a real board/page.
5. **Planned vs shipped history:** validation must reject a note that has `status: "planned"` while also presenting a release version/date as shipped without an explicit planned label.

---

### Task 1: Establish the static project contract and content schema

**Files:**
- Create: `package.json`
- Create: `data/boards.json`
- Create: `scripts/validate-data.mjs`
- Create: `tests/board-data.test.mjs`

**Interfaces:**
- Consumes: approved design spec.
- Produces: `boards.json` schema used by every later task; `validateBoards(data)` and `loadBoards(path)` exports from `scripts/validate-data.mjs`.

- [ ] **Step 1: Write failing data-contract tests**

Create tests that assert:
- exactly one `main` board and eight feature boards exist;
- all board IDs are unique;
- all note IDs are unique within a board;
- every connection `from` and `to` references an existing note in that board;
- every `relatedBoard` references a defined board;
- every important note includes `title`, `type`, `date`, and `summary`;
- planned notes expose `status: "planned"`;
- the schema accepts long note summaries without truncating the source data.

Run: `node --test tests/board-data.test.mjs`  
Expected: FAIL because validator/data files do not exist.

- [ ] **Step 2: Implement `validateBoards(data: object) -> string[]` and `loadBoards(path: string) -> Promise<object>`**

Use only Node built-ins. Return an array of human-readable validation errors; do not throw for ordinary schema violations.

- [ ] **Step 3: Seed `data/boards.json` with board metadata and empty/anchor note structures**

Define board IDs exactly:
`main`, `conversation`, `qbo`, `meetings`, `cleaner`, `data-architecture`, `reuse-outreach`, `mapping-admin`, `performance-reliability`.

Include each board’s route and title so later tasks do not hardcode URLs.

- [ ] **Step 4: Add package scripts**

Required:
- `npm test` → `node --test tests/*.test.mjs`
- `npm run validate` → `node scripts/validate-data.mjs data/boards.json`

No runtime dependencies.

- [ ] **Step 5: Run validation/tests**

Run:
```bash
npm test
npm run validate
```
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add package.json data/boards.json scripts/validate-data.mjs tests/board-data.test.mjs
git commit -m "chore: establish WoodenBoard data contract"
```

---

### Task 2: Build the reusable physical board shell and assets

**Files:**
- Create: `assets/wood-board.png`
- Create: `assets/sticky-note.png`
- Create: `css/board.css`
- Create: `js/board-renderer.js`
- Create: `index.html`
- Create: `tests/page-contracts.test.mjs`

**Interfaces:**
- Consumes: board/note objects from `boards.json`.
- Produces: `renderBoardNotes(container: HTMLElement, board: Board) -> Map<string, HTMLElement>`.

- [ ] **Step 1: Add approved image assets**

Copy the approved generated wood background and blank sticky/pushpin images into `assets/`. Preserve transparency on `sticky-note.png`.

- [ ] **Step 2: Write failing page-contract tests**

Assert that:
- `index.html` has a board root and accessible page title;
- board root exposes a board ID;
- notes render as semantic links/buttons, not non-interactive `div` elements when clickable;
- a long-copy test note can receive a `note--long`/overflow-safe class;
- fixed navigation has an explicit accessible label.

Run: `node --test tests/page-contracts.test.mjs`  
Expected: FAIL before shell/renderer exists.

- [ ] **Step 3: Implement `renderBoardNotes`**

Renderer responsibilities:
- position notes from data `x`/`y` percentages;
- apply data-driven rotation/size;
- render title, type, date, optional version, summary, and optional impact tag;
- use sticky PNG as the physical note surface;
- add stable `data-note-id` attributes for thread rendering;
- create links for main-board destinations and related-board targets.

- [ ] **Step 4: Implement physical-board CSS**

Required classes/behaviors:
- full-viewport wood background;
- large board canvas with `position: relative`;
- pinned sticky note composition using the PNG;
- readable marker/handwritten-style system-font fallback stack (no bundled font files);
- scrambled note placement comes only from data coordinates, never a CSS grid;
- hover/focus lift;
- overflow-safe title/summary sizing;
- fixed board navigation layer;
- reduced-motion fallback.

- [ ] **Step 5: Build `index.html` shell**

Keep markup thin: board root, fixed navigation/legend containers, module entry script placeholder. No hardcoded note content.

- [ ] **Step 6: Run tests**

Run: `npm test`  
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add assets css/board.css js/board-renderer.js index.html tests/page-contracts.test.mjs
git commit -m "feat: add physical WoodenBoard shell"
```

---

### Task 3: Implement directional SVG threads and branch highlighting

**Files:**
- Create: `js/thread-geometry.js`
- Create: `js/thread-renderer.js`
- Create: `tests/thread-geometry.test.mjs`
- Modify: `css/board.css`

**Interfaces:**
- Consumes: note element bounding boxes and connection records.
- Produces:
  - `anchorPoint(rect: Rect, toward: Point) -> Point`
  - `buildThreadPath(from: Point, to: Point, bend?: number) -> string`
  - `renderThreads(svg: SVGSVGElement, noteElements: Map<string, HTMLElement>, connections: Connection[]) -> Map<string, SVGPathElement>`
  - `highlightBranch(noteId: string) -> void`

- [ ] **Step 1: Write failing geometry tests**

Cover:
- left-to-right, right-to-left, upward, and downward connections;
- curved/bent path generation;
- zero-distance guard;
- deterministic path output for fixed inputs;
- direction metadata remains from→to even when the line runs visually right-to-left.

Run: `node --test tests/thread-geometry.test.mjs`  
Expected: FAIL.

- [ ] **Step 2: Implement pure geometry helpers**

Keep DOM access out of `thread-geometry.js` so it stays independently testable.

- [ ] **Step 3: Implement SVG thread renderer**

Requirements:
- SVG layer sits behind notes;
- thread style derives from connection type: problem/fix, dependency, impact, upgrade, planned, retired;
- long threads include multiple visible directional chevrons;
- short threads include at least one directional chevron;
- planned connections are dashed;
- retired paths are faded and visibly crossed/marked;
- chevrons communicate direction even when color is unavailable.

- [ ] **Step 4: Implement hover/focus branch highlighting**

Hovering/focusing a note:
- emphasizes directly connected inbound/outbound threads;
- emphasizes connected notes;
- dims unrelated threads/notes without hiding them;
- restores default on blur/mouseleave.

- [ ] **Step 5: Run tests**

Run: `npm test`  
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add js/thread-geometry.js js/thread-renderer.js tests/thread-geometry.test.mjs css/board.css
git commit -m "feat: add directional investigation threads"
```

---

### Task 4: Build the main Chuck ecosystem board

**Files:**
- Create: `js/board-app.js`
- Modify: `data/boards.json`
- Modify: `index.html`
- Modify: `tests/board-data.test.mjs`
- Modify: `tests/page-contracts.test.mjs`

**Interfaces:**
- Consumes: `renderBoardNotes`, `renderThreads`, `boards.json`.
- Produces: `bootBoard(boardId: string) -> Promise<void>`, used by every page wrapper.

- [ ] **Step 1: Write failing main-board tests**

Assert:
- main board has exactly one `CHUCK` note with `role: "center"`, `x: 50`, `y: 50`;
- eight major family notes exist and each links to its defined feature route;
- no family uses the same x/y pair;
- at least four cross-family connections exist in addition to Chuck→family connections;
- supporting notes (Documents/Line Cards, Scoreboards/Reporting, Future/Planned) point into existing feature boards rather than creating orphan boards.

- [ ] **Step 2: Populate main-board data**

Use deliberately irregular coordinates and varied rotations. Keep CHUCK exact center. Connect:
- Conversation ↔ QBO
- QBO ↔ Meetings
- Cleaner ↔ Data Architecture
- Data Architecture ↔ Reuse & Outreach
- Mapping ↔ Conversation/QBO
- Performance ↔ all runtime-heavy families through lighter dependency threads.

- [ ] **Step 3: Implement `bootBoard`**

Load board data, render notes, render threads, set board title/legend/back navigation, and bind highlight interactions. Fail visibly with an accessible error message if data cannot load.

- [ ] **Step 4: Wire `index.html` to `bootBoard("main")`**

- [ ] **Step 5: Run tests and validator**

Run:
```bash
npm test
npm run validate
```
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add index.html js/board-app.js data/boards.json tests
git commit -m "feat: build Chuck ecosystem main board"
```

---

### Task 5: Create eight full feature-board pages and branched history data

**Files:**
- Create: all eight `boards/*.html` files listed in File Structure
- Modify: `data/boards.json`
- Modify: `tests/board-data.test.mjs`
- Modify: `tests/page-contracts.test.mjs`

**Interfaces:**
- Consumes: shared `bootBoard(boardId)`.
- Produces: eight independent URLs, each rendering a full board and participating in browser history/back-forward navigation.

- [ ] **Step 1: Write failing feature-board route/content tests**

For every feature board assert:
- corresponding HTML page exists;
- page boots the correct board ID;
- board has at least two branches (a node with >1 outgoing connection or two independent chains);
- board has at least one Problem, one Build, one Bug/Limitation or Upgrade/Fix, and one Impact note;
- important historical notes include date metadata;
- any uncertain date is explicitly labeled `Approx.`/`Discussed`;
- planned Queue+ETA content is labeled Planned and is not marked as released.

- [ ] **Step 2: Populate Conversation Intelligence board**

Include dated/versioned nodes for:
- rigid commands;
- natural-language upgrade;
- entity/date pivots;
- references/pronouns;
- corrections;
- social interruption / `where were we?`;
- thread isolation;
- `show all`, `more detail`, polarity transforms;
- explain/exact evidence;
- trusted-agent/human audit separation.

Use exact release dates from CHUCK repo where available; otherwise use month/year with explicit approximate labels.

- [ ] **Step 3: Populate QBO Intelligence board**

Include:
- Meeting/NDA/RFQ definition;
- Approved meeting rule;
- Booked Date vs Actual Date split;
- Response ID;
- 4-field historical fallback;
- historical reconciliation;
- QFR refresh;
- D1 `qbo_records`;
- show rate;
- ratings;
- weekly/monthly scoreboards;
- impact on manual reporting.

- [ ] **Step 4: Populate Meetings & Scheduling board**

Include:
- date/account queries;
- status normalization;
- Tomorrow Meetings;
- daily confirmation snapshots;
- reminder timings;
- rescheduling logic;
- slot rules (30 minutes, max 3, client collision prevention);
- outcome analytics dependencies.

- [ ] **Step 5: Populate COE Cleaner board**

Include:
- manual-cleaning problem;
- RAW → CALL_DATA/EMAIL_DATA;
- owner review;
- notification-before-D1 checkpoint;
- retry/idempotency behavior;
- session persistence;
- client-scoped Cleaner;
- QBO removal;
- undelivered email removal;
- unusable phone removal;
- combined suppression;
- removal-grid optimization.

- [ ] **Step 6: Populate Data Architecture board**

Include the full retired/replacement lineage:
- Excel-heavy workflow;
- Bridge.xlsx;
- Office Script / SharePoint limitations;
- D1 migration;
- `bridge_contacts`;
- appearances;
- `coe_workbooks`;
- `COE_MASTER`;
- Contact/Email/QBO NA DBs;
- `qbo_records`;
- cleaner removal grid H00–H63;
- email directory/index;
- candidate-only reads;
- Bridge→Master;
- retained Bridge rows;
- cursor vs per-row sync flag;
- 10,000/day and ≤1,000 batch rules.

Include scale impact notes (~301k COE_MASTER checkpoint and the known hard-bounce/QBO reconciliation counts) with dates/period labels.

- [ ] **Step 7: Populate COE Reuse & Outreach board**

Include:
- repeated research problem;
- COE_Reuse;
- DB_Upsert as already-cleaned path;
- Outreach_Update;
- hard bounce;
- Delivered supersedes failure;
- call outcomes;
- newer evidence wins;
- NA DB routing;
- feedback into Master;
- human-time/resource impact.

- [ ] **Step 8: Populate Mapping & Admin board**

Include:
- SDR→ATL→Account→COE/APM model;
- ownership lookup;
- add/update flows;
- Slack identity resolution;
- active/inactive control;
- fresh admin-password gate;
- password non-persistence;
- mapping audit log;
- mapping conflicts/health;
- document/line-card retrieval relationship.

- [ ] **Step 9: Populate Performance & Reliability board**

Include:
- single-worker bottleneck;
- request pipeline;
- two-worker split;
- Automation vs Data Engine responsibilities;
- queues;
- staged PLAN/ANALYZE/PRESENT architecture;
- queue-hop latency;
- 3.9.99.6 identity/latency hardening;
- 3.9.99.7 latency collapse;
- waitUntil post-reply work;
- request IDs;
- Slack dedupe;
- diagnostics;
- pause/resume;
- completion notifications;
- 3.9.99.8 Bridge sync optimization connection;
- queue position + ETA as Planned/Discussed, not released.

- [ ] **Step 10: Add page wrappers**

Each wrapper:
- sets its board ID;
- imports the same `board-app.js`;
- includes a visible/fixed Back to Main Board control;
- has a board-specific document title.

- [ ] **Step 11: Run full data/page validation**

Run:
```bash
npm test
npm run validate
```
Expected: PASS.

- [ ] **Step 12: Commit**

```bash
git add boards data/boards.json tests
git commit -m "feat: add eight Chuck evolution boards"
```

---

### Task 6: Add dense-board navigation, accessibility, and responsive behavior

**Files:**
- Modify: `css/board.css`
- Modify: `js/board-app.js`
- Modify: `js/thread-renderer.js`
- Modify: `tests/page-contracts.test.mjs`

**Interfaces:**
- Consumes: existing board renderer and board metadata.
- Produces: keyboard/hover/focus navigation, branch focus behavior, responsive canvas controls.

- [ ] **Step 1: Write failing interaction/accessibility contract tests**

Assert:
- every feature page has a Back to Main Board link;
- clickable notes are keyboard-focusable;
- notes expose type/date/version in accessible text;
- legend explains both color and line-style semantics;
- reduced-motion CSS exists;
- fixed navigation is present on every page;
- long-copy fixture has overflow-safe CSS classes;
- board canvas uses a minimum desktop working area larger than viewport and permits overflow scrolling rather than shrinking all notes.

- [ ] **Step 2: Implement branch-focus click behavior**

Clicking a non-navigating note toggles a focused branch:
- show its inbound/outbound path strongly;
- dim unrelated content;
- second click / Escape clears focus.

- [ ] **Step 3: Add keyboard controls**

- Tab traverses clickable notes/controls.
- Enter/Space follows or focuses a note.
- Escape clears branch focus.
- Do not hijack browser Back/Forward.

- [ ] **Step 4: Add responsive rules**

Desktop:
- expansive board canvas.

Tablet/mobile:
- preserve note sizes;
- allow horizontal/vertical scrolling;
- keep Back/Main controls reachable;
- prevent fixed controls from covering interactive notes.

- [ ] **Step 5: Add legend and type labels**

Legend communicates thread meaning with text + line sample, not color alone.

- [ ] **Step 6: Run tests**

Run: `npm test`  
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add css js tests
git commit -m "feat: improve WoodenBoard navigation and accessibility"
```

---

### Task 7: Add CI, GitHub Pages deployment, documentation, and final historical audit

**Files:**
- Create: `.github/workflows/pages.yml`
- Create: `README.md`
- Modify: `data/boards.json`
- Modify: `tests/board-data.test.mjs`

**Interfaces:**
- Consumes: complete static site and validation commands.
- Produces: repeatable CI validation and GitHub Pages deployment.

- [ ] **Step 1: Write failing release-readiness tests**

Add assertions that:
- every board has at least one cross-board relationship or explicit main-board route;
- every release-version note has a date;
- exact dates use ISO `YYYY-MM-DD`;
- approximate dates are labeled, not silently presented as exact;
- all eight routes exist;
- no modal/popup board markup exists.

- [ ] **Step 2: Audit Chuck history against the CHUCK repository**

Before finalizing exact dates/versions:
- check release notes and commit timestamps in `KaranBarua01/CHUCK`;
- correct any exact date/version mismatches;
- keep approximate labels where repository evidence is insufficient;
- verify 3.9.99.7 and 3.9.99.8 against their release/commit history;
- keep job queue + ETA explicitly Planned/Discussed unless a later CHUCK commit proves shipment.

- [ ] **Step 3: Add GitHub Pages workflow**

Workflow requirements:
- trigger on pushes to `main` and manual dispatch;
- checkout;
- install no runtime packages;
- run `npm test`;
- run `npm run validate`;
- upload static repo as Pages artifact;
- deploy Pages only after validation passes.

- [ ] **Step 4: Write README**

Document:
- purpose and investigation-board metaphor;
- site navigation;
- thread/type legend;
- board data schema;
- how to add a new Chuck note/connection/version safely;
- local serving command (for example `python -m http.server 8000`);
- testing commands;
- GitHub Pages publication instructions.

- [ ] **Step 5: Run final verification**

Run:
```bash
npm test
npm run validate
python -m http.server 8000
```

In a second shell:
```bash
curl -I http://127.0.0.1:8000/
curl -I http://127.0.0.1:8000/boards/data-architecture.html
curl -I http://127.0.0.1:8000/assets/wood-board.png
curl -I http://127.0.0.1:8000/assets/sticky-note.png
```

Expected:
- all tests PASS;
- validator exits 0;
- all HTTP requests return 200.

- [ ] **Step 6: Commit**

```bash
git add .github README.md data tests
git commit -m "chore: publish WoodenBoard investigation site"
```

---

## Plan Self-Review Result

- **Spec coverage:** Main board, eight feature boards, scrambled placement, dates/versions, branched evolution, directional `>` markers, cross-board links, retired/planned semantics, impact notes, responsiveness, accessibility, source accuracy, and GitHub Pages are all assigned to tasks.
- **Step scan:** Tasks are divided at independently reviewable boundaries: data contract, physical shell, threads, main board, feature content, interaction/accessibility, release/deployment.
- **Type consistency:** Board IDs/routes and renderer interfaces are defined once and reused.
- **Review Focus coverage:** Each of the five risk classes has a named test in Tasks 1, 2, 5, 6, or 7.
- **Proportion:** The plan specifies interfaces, tests, and pinned values without scripting the implementation bodies.
