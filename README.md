# WoodenBoard — CHUCK Investigation Board

WoodenBoard is an interactive visual history of **CHUCK**. It is deliberately designed like a detective/investigation board rather than a normal documentation site: a wooden surface, pinned sticky notes, scrambled branches, and directional thread markers that show how problems led to ideas, builds, bugs, fixes, upgrades and measurable impact.

## How to navigate

Open `index.html` (or the GitHub Pages site). CHUCK sits in the center of the main board. Eight major ecosystem stickies surround it:

- Conversation Intelligence
- QBO Intelligence
- Meetings & Scheduling
- COE Cleaner
- Data Architecture
- COE Reuse & Outreach
- Mapping & Admin
- Performance & Reliability

Clicking a major sticky opens a **full feature board page**. There are no modal mini-boards. On a feature board, follow the `>` markers on the strings to see which sticky comes next. Hovering/focusing a note highlights the directly related branch; clicking a non-link note locks that branch until you click it again or press `Escape`.

## Thread legend

- **Red solid:** problem → fix / bug → correction
- **Blue solid:** technical or data dependency
- **Green solid:** impact / benefit
- **Orange solid:** upgrade / evolution path
- **Dashed:** planned or discussed future work
- **Faded/dotted:** retired/replaced architecture

The `>` markers show direction, so color is never the only navigation signal.

## Content model

All curated board content lives in `data/boards.json`. Each note supports fields such as:

```json
{
  "id": "collapse",
  "title": "Latency Collapse",
  "type": "Upgrade / Fix",
  "date": "2026-09-26",
  "version": "3.9.99.7",
  "summary": "Normal business requests run PLAN + ANALYZE + PRESENT inside the existing queue consumer.",
  "x": 15,
  "y": 55,
  "rotation": -2,
  "impact": "Optional impact text",
  "relatedBoard": "data-architecture"
}
```

Connections are directional:

```json
{
  "from": "queue-latency",
  "to": "collapse",
  "type": "fix",
  "bend": -12,
  "label": "optional relationship label"
}
```

### Adding a new CHUCK build safely

1. Add a sticky note to the correct board in `data/boards.json`.
2. Give it a unique `id`, title, type, date, summary, and scrambled `x`/`y` coordinates.
3. Add one or more directional connections.
4. Use an exact ISO date (`YYYY-MM-DD`) only when the release/commit history proves it. Otherwise write `Approx. ...`, `Discussed ...`, or `Planned ...`.
5. Never give planned work a shipped version.
6. Run the test and validation commands below before committing.

## Local use

No application dependencies are required.

```bash
npm test
npm run validate
python -m http.server 8000
```

Then open `http://127.0.0.1:8000/`.

## Project structure

```text
index.html
boards/                 # eight full evolution boards
assets/                 # reusable wood + blank pinned sticky imagery
css/board.css           # physical board, notes, threads, responsive behavior
js/board-app.js          # board bootstrap + interactions
js/board-renderer.js     # sticky-note rendering
js/thread-geometry.js    # pure thread path geometry
js/thread-renderer.js    # SVG strings, > markers and highlighting
data/boards.json         # all board history/content
scripts/validate-data.mjs
tests/
```

## Source accuracy

WoodenBoard is curated documentation. Exact release dates/versions are grounded in the CHUCK repository when available; uncertain history is explicitly labeled approximate/discussed/planned. Retired approaches remain visible because the point of the board is to show **how the system evolved**, not only the final architecture.

Audited exact milestones in the first release include:

- `3.9.99.6` — 2026-09-25 — Phase 1 latency + identity hardening
- `3.9.99.7` — 2026-09-26 — Latency Collapse
- `3.9.99.8` — 2026-09-28 — Bridge → COE_MASTER daily sync

The queue-position/ETA experience remains labeled **Planned / Discussed** unless a later CHUCK release proves it shipped.

## GitHub Pages

`.github/workflows/pages.yml` runs tests and board-data validation before deploying the static repository to GitHub Pages on pushes to `main` or manual workflow dispatch.