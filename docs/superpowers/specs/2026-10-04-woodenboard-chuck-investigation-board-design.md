# WoodenBoard — Chuck Investigation Board Design

**Date:** 2026-10-04  
**Repository:** KaranBarua01/WoodenBoard  
**Status:** Design approved in conversation; implementation pending spec review

## 1. Purpose

WoodenBoard is an interactive visual history of Chuck. It should not look like a traditional architecture diagram or documentation site. It should look and behave like a real investigation/evidence board: warm wood background, pinned sticky notes, thread connections, deliberately scrambled placement, and clear directional markers showing how one problem, decision, bug, fix, or upgrade led to the next.

The board must explain not only **what Chuck contains**, but **why each part exists, what problem created it, what changed over time, what bugs/limitations were discovered, how those were fixed, and what time/resource/accuracy impact each change produced**.

## 2. Core Visual Language

### Board surface
- Full-page wood texture background based on the approved wooden board reference.
- The page should feel like a physical investigation board, not a flat dashboard.

### Sticky notes
- Reusable blank yellow sticky note with red pushpin asset.
- Text is rendered in HTML/CSS over the sticky asset so the same image can be reused.
- Notes may vary slightly in rotation and size.
- Notes must never be placed in rigid rows or a perfect radial layout.

### Note types
Each note has a type, and the type controls metadata and optional visual treatment:
- Problem
- Thought
- Build
- Bug / Limitation
- Upgrade / Fix
- Impact
- Retired
- Planned

Every important note contains:
- Title
- Type
- Date
- Optional Chuck version
- 1–3 line summary
- Optional impact metric
- Optional related-board link

### Thread semantics
Threads connect notes and must show direction.

- Red: problem → decision → solution, or bug → fix
- Blue: technical/data dependency
- Green: impact/benefit relationship
- Orange: upgrade/evolution path
- Dashed: planned/future
- Faded/crossed: retired/replaced approach

Directional markers are mandatory. Threads must include repeated or strategically placed `>` / arrow markers so a viewer can immediately tell which note comes next.

## 3. Navigation Model

### Level 1 — Main Chuck Board
The home page is the ecosystem overview.

- CHUCK sticky note pinned in the exact center.
- Major feature-family notes are placed around it in a deliberately irregular/scrambled layout.
- Threads connect each family to Chuck and to related families.
- Hovering a note should emphasize its directly connected thread paths and dim unrelated threads.
- Clicking a major family opens a **new full board page**.

No modal mini-board is used.

### Level 2 — Feature Boards
Each family opens a standalone investigation board page.

Each board:
- uses the same wood background and sticky/thread language;
- is large enough to support a branched, non-linear visual history;
- shows dates and versions where known;
- preserves bugs, retired ideas, and upgrade chains rather than showing only the final state;
- contains cross-links to related boards;
- has a clear “Back to Main Board” control.

The viewer should be able to understand a feature’s evolution by following directional threads through multiple branches.

## 4. Main Board Categories

The first release uses eight primary entry boards:

1. Conversation Intelligence
2. QBO Intelligence
3. Meetings & Scheduling
4. COE Cleaner
5. Data Architecture
6. COE Reuse & Outreach
7. Mapping & Admin
8. Performance & Reliability

Possible smaller supporting notes on the main board:
- Documents / Line Cards
- Scoreboards / Reporting
- Future / Planned

These support notes can link into the relevant major board instead of becoming separate boards in v1.

## 5. Feature Board Content Architecture

### 5.1 Conversation Intelligence
Core branches:
- Rigid commands problem
- Natural language
- Follow-up handling
- Entity pivots
- Date pivots
- Pronoun/reference handling
- Correction handling
- Thread isolation
- “Where were we?”
- `show all`, `more detail`, “only problems”, “only positives”
- Explain / exact-record audit
- Trusted-agent behavior

Representative evolution:
Rigid commands → repeated context → conversational follow-ups → context memory → entity/date pivots → references/corrections → bounded state/thread isolation → explainability and exact evidence.

### 5.2 QBO Intelligence
Core branches:
- QBO definition = Meeting + NDA + RFQ
- Approved meeting logic
- Booked Date vs Actual Date
- Response ID identity
- Four-field historical fallback
- QFR Refresh
- Historical QBO sync
- qbo_records in D1
- QBO analytics
- Show rate
- Ratings
- Scoreboards

Representative evolution:
Manual QBO counting → canonical QBO rules → date-basis separation → Response ID identity → QFR sync → D1 operational truth → fast analytics.

### 5.3 Meetings & Scheduling
Core branches:
- Meeting lookup
- Account/date/timezone filtering
- Status normalization
- Tomorrow Meetings
- Daily confirmation snapshots
- Meeting reminders
- Calendar slot engine
- Reschedule handling
- Show / No Show / Cancelled semantics

Representative evolution:
Manual meeting checks → query engine → canonical statuses → automatic confirmation flows → tomorrow reminders → slot planning.

### 5.4 COE Cleaner
Core branches:
- Manual cleanup problem
- RAW normalization
- CALL_DATA / EMAIL_DATA
- Owner review
- Send Notification checkpoint
- Cleaner session persistence
- Client-scoped Cleaner
- Removal Gate
- QBO suppression
- Undelivered email suppression
- Unusable phone suppression
- Combined unusable + undelivered
- cleaner_removal_grid

Representative evolution:
Manual cleanup → Cleaner → structured output → human approval → safe notification/commit boundary → removal policies → hash-grid optimization.

### 5.5 Data Architecture
This is expected to be the densest board.

Core branches:
- Excel-heavy early architecture
- Bridge.xlsx
- Why Excel/Office Scripts/SharePoint became a bottleneck
- D1 migration
- bridge_contacts
- appearances
- coe_workbooks
- COE_MASTER
- Contact_NA_DB
- Email_NA_DB
- QBO_NA_DB
- qbo_records
- cleaner_removal_grid
- email hash/index directory
- candidate-only reads
- Bridge → COE_MASTER
- cursor-based sync
- batching and limits
- retained Bridge research history

Representative evolution:
Excel as database → Bridge.xlsx → D1 Bridge → dedupe/appearances → COE_MASTER + NA DBs → index/grid lookups → candidate-only reads → optimized Bridge→Master sync.

### 5.6 COE Reuse & Outreach
Core branches:
- Repeated research problem
- COE_Reuse
- Outreach_Update
- Email Delivery updates
- Call Outcome updates
- Hard Bounce logic
- Delivered superseding previous failure
- Newer evidence wins
- NA DB routing
- Feedback loop into COE_MASTER

Representative evolution:
Re-researching contacts → reuse existing intelligence → collect outreach feedback → update canonical evidence → preserve unmatched evidence in NA DBs.

### 5.7 Mapping & Admin
Core branches:
- Organization hierarchy
- SDR → ATL → Account → COE/APM
- Ownership lookup
- Mapping admin
- Slack-user resolution
- Active/inactive controls
- Fresh password authentication
- Audit logs
- Mapping health/conflict checking
- Document / line-card retrieval references

Representative evolution:
Manual ownership knowledge → persistent mapping → self-service lookup → protected admin writes → auditable mapping changes.

### 5.8 Performance & Reliability
Core branches:
- Single-worker bottleneck
- Two-worker split
- chuck-automation
- chuck-data-engine
- request queues
- CPU isolation
- queue-hop latency problem
- latency collapse
- waitUntil/background bookkeeping
- Durable Object state bounding
- request IDs
- Slack event dedupe
- diagnostics
- pause/resume
- completion notifications
- planned job queue + ETA UX

Representative evolution:
One worker → contention → two workers → queues → queue latency → latency collapse → post-reply work → diagnostics/idempotency → planned queue/ETA UX.

## 6. Scrambled Layout Rules

The visual placement must feel organic, but not confusing.

Each board uses:
- 1–3 anchor notes;
- several branch clusters around each anchor;
- varied x/y positions;
- slight note rotation;
- enough whitespace for readable thread routing;
- no uniform grid and no single horizontal timeline.

Threads may cross, but avoid unreadable tangles. Cross-board dependencies should be visually lighter than the primary evolution chain.

## 7. Interaction Rules

### Note hover
- Raise note slightly.
- Highlight directly related threads.
- Dim unrelated threads.
- Emphasize directional arrows on highlighted paths.

### Note click
- On the main board: navigate to the corresponding full feature board.
- On a feature board:
  - if the note has a related-board target, open that board;
  - otherwise focus/highlight the branch around the selected note.

### Thread behavior
- Threads render behind notes.
- Direction markers (`>` or arrow beads) are repeated along long paths.
- Primary chain direction must remain obvious even when paths bend.

### Board navigation
- Main board button/logo always available.
- Feature-board title visible.
- Related-board links may be represented by small labels attached to notes.
- Browser back/forward must work normally; no modal state trapping.

## 8. Dates and Versions

Dates are first-class content.

Every significant build, bug, fix, migration, or major decision should show:
- exact date when confidently known from release/commit history;
- otherwise month/year or approximate period;
- Chuck version when applicable.

Examples of exact dated milestones to surface:
- 3.9.99.7 Latency Collapse — Sep 2026
- 3.9.99.8 Bridge → COE_MASTER daily sync — Sep 2026

The implementation should derive exact dates from the CHUCK repo commit/release history wherever possible rather than inventing dates.

Planned ideas (for example, queue position + ETA UX if not yet shipped) must be visibly labeled **Planned** and must not be presented as released.

## 9. Impact Notes

Impact notes are not generic praise. They should quantify or clearly describe benefit when known.

Examples:
- Pyramid research: approximately 30 min → 15 min for a comparable 15-company research batch.
- COE_MASTER scale: ~301k rows at a late-Sep checkpoint, motivating indexed candidate reads.
- Hash directory/removal grid: direct candidate/bucket lookup instead of repeated large-table scans.
- Bridge→Master: 10,000 rows/day, ≤1,000-row batches, cursor-based progress.
- Reuse: replaces repeated manual contact research with retrieval of previously researched contacts.

Impact notes should state whether they primarily save:
- Human time
- Database reads
- Database writes
- Worker CPU
- SharePoint/Excel operations
- Error risk
- Rework

## 10. Technical Architecture of WoodenBoard

### Stack
Keep the site intentionally simple and portable:
- Static HTML
- CSS
- Vanilla JavaScript
- SVG for thread rendering

No backend is required for v1.

### Proposed repository structure

```text
/
  index.html
  boards/
    conversation.html
    qbo.html
    meetings.html
    cleaner.html
    data-architecture.html
    reuse-outreach.html
    mapping-admin.html
    performance-reliability.html
  assets/
    wood-board.jpg
    sticky-note.png
  css/
    board.css
  js/
    board-renderer.js
    board-data.js
  data/
    boards.json
  docs/
    superpowers/
      specs/
```

### Data-driven rendering
Board content should live in structured data instead of being hardcoded into every page.

Each note record should support:
- id
- board
- title
- type
- date
- version
- summary
- x
- y
- rotation
- size
- relatedBoard
- impact

Each connection should support:
- from
- to
- color/type
- direction
- dashed
- label

This lets us move notes and add later Chuck builds without rewriting page markup.

### SVG thread layer
Each board uses an SVG layer behind sticky notes:
- paths connect note anchor points;
- arrow/chevron markers render on the path;
- hover state updates SVG classes;
- note positions and SVG paths scale together.

## 11. Responsiveness

The experience is primarily desktop-first because dense investigation boards are easier to understand on a large screen.

- Desktop: full experience.
- Tablet: scroll/zoom board.
- Mobile: board remains usable with pan/scroll and enlarged touch targets, but no attempt should be made to compress the entire board into one phone screen.

## 12. Accessibility

Even though the visual metaphor is intentionally dense:
- sticky notes are real buttons/links where interactive;
- keyboard focus is visible;
- every connection has a textual relationship in the structured data;
- color alone is never the only relationship signal;
- reduced-motion preference disables unnecessary transitions;
- readable contrast must be preserved over the wooden background.

## 13. Source Accuracy

The content should be grounded in:
- current CHUCK GitHub release notes and commit history;
- known project decisions from prior Chuck discussions;
- validated database/feature checkpoints.

Where the historical date or status is uncertain, the board should say “Approx.”, “Discussed”, or “Planned” rather than guessing.

## 14. v1 Success Criteria

The first complete WoodenBoard release is successful when:

1. CHUCK is visibly pinned in the center of the main wood board.
2. All eight major boards are reachable by clicking scrambled sticky notes.
3. No feature evolution is displayed as a single rigid linear row.
4. Every board uses branch-style threads with visible direction markers.
5. Important builds/bugs/fixes show dates and versions where known.
6. Retired approaches remain visible and show what replaced them.
7. Problem → thought → build → bug → fix → impact relationships can be followed visually.
8. Related Chuck systems cross-link between boards.
9. Thread hover/highlight makes dense boards easier to follow.
10. The site works as a static GitHub Pages project with no backend dependency.

## 15. Out of Scope for v1

- Real-time database integration
- Editing the board from the browser
- User accounts/authentication
- Dynamic GitHub API calls at runtime
- 3D/WebGL effects
- Multiplayer collaboration
- Automatic AI-generated notes

The board content is curated, static, version-controlled documentation.
