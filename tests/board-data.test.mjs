import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const validatorPath = new URL('../scripts/validate-data.mjs', import.meta.url);
const dataPath = new URL('../data/boards.json', import.meta.url);

async function loadSubject() {
  assert.equal(existsSync(validatorPath), true, 'validator module should exist');
  assert.equal(existsSync(dataPath), true, 'board data should exist');
  const mod = await import(pathToFileURL(validatorPath.pathname));
  const data = JSON.parse(readFileSync(dataPath, 'utf8'));
  return { ...mod, data };
}

test('defines one main board plus eight feature boards', async () => {
  const { data } = await loadSubject();
  assert.equal(data.boards.length, 9);
  assert.equal(data.boards.filter(board => board.id === 'main').length, 1);
  assert.deepEqual(
    data.boards.filter(board => board.id !== 'main').map(board => board.id).sort(),
    ['cleaner','conversation','data-architecture','mapping-admin','meetings','performance-reliability','qbo','reuse-outreach'].sort()
  );
});

test('validator rejects duplicate note ids and dangling connections', async () => {
  const { validateBoards } = await loadSubject();
  const fixture = {
    boards: [{
      id: 'main', title: 'Main', route: 'index.html',
      notes: [
        { id: 'same', title: 'A', type: 'Build', date: '2026-10-04', summary: 'A' },
        { id: 'same', title: 'B', type: 'Build', date: '2026-10-04', summary: 'B' }
      ],
      connections: [{ from: 'same', to: 'missing', type: 'dependency' }]
    }]
  };
  const errors = validateBoards(fixture);
  assert.ok(errors.some(error => error.includes('duplicate note id')));
  assert.ok(errors.some(error => error.includes('missing note')));
});

test('all related boards and important note metadata are valid', async () => {
  const { validateBoards, data } = await loadSubject();
  assert.deepEqual(validateBoards(data), []);
  for (const board of data.boards) {
    for (const note of board.notes) {
      if (note.important !== false) {
        for (const key of ['title', 'type', 'date', 'summary']) {
          assert.ok(note[key], `${board.id}/${note.id} should include ${key}`);
        }
      }
      if (note.status === 'planned') {
        assert.match(`${note.type} ${note.date} ${note.summary}`, /planned|discussed/i);
      }
    }
  }
});

test('long summaries are preserved verbatim', async () => {
  const { validateBoards } = await loadSubject();
  const longSummary = 'x'.repeat(600);
  const fixture = {
    boards: [{ id: 'main', title: 'Main', route: 'index.html', notes: [
      { id: 'long', title: 'Long', type: 'Thought', date: 'Approx. Sep 2026', summary: longSummary }
    ], connections: [] }]
  };
  assert.deepEqual(validateBoards(fixture), []);
  assert.equal(fixture.boards[0].notes[0].summary.length, 600);
});

test('main board centers Chuck and exposes eight scrambled feature families', async () => {
  const { data } = await loadSubject();
  const main = data.boards.find(board => board.id === 'main');
  const chuck = main.notes.filter(note => note.role === 'center');
  assert.equal(chuck.length, 1);
  assert.equal(chuck[0].title, 'CHUCK');
  assert.equal(chuck[0].x, 50);
  assert.equal(chuck[0].y, 50);

  const families = main.notes.filter(note => note.role === 'family');
  assert.equal(families.length, 8);
  const coords = new Set(families.map(note => `${note.x},${note.y}`));
  assert.equal(coords.size, 8, 'feature families should not share coordinates');
  for (const family of families) assert.ok(family.relatedBoard, `${family.id} should link to a feature board`);
});

test('main board includes cross-family relationships and support notes', async () => {
  const { data } = await loadSubject();
  const main = data.boards.find(board => board.id === 'main');
  const familyIds = new Set(main.notes.filter(note => note.role === 'family').map(note => note.id));
  const cross = main.connections.filter(connection => familyIds.has(connection.from) && familyIds.has(connection.to));
  assert.ok(cross.length >= 4, `expected at least 4 cross-family connections, got ${cross.length}`);

  const support = main.notes.filter(note => note.role === 'support');
  assert.ok(support.length >= 3);
  for (const note of support) assert.ok(note.relatedBoard, `${note.id} should route into an existing board`);
});

test('each feature board is branched and includes problem, build, upgrade-or-bug, and impact evidence', async () => {
  const { data } = await loadSubject();
  const features = data.boards.filter(board => board.id !== 'main');
  for (const board of features) {
    const types = new Set(board.notes.map(note => note.type));
    assert.ok(types.has('Problem'), `${board.id} should include a Problem note`);
    assert.ok(types.has('Build'), `${board.id} should include a Build note`);
    assert.ok(types.has('Bug / Limitation') || types.has('Upgrade / Fix'), `${board.id} should include a Bug / Limitation or Upgrade / Fix note`);
    assert.ok(types.has('Impact'), `${board.id} should include an Impact note`);

    const outgoing = new Map();
    for (const connection of board.connections) outgoing.set(connection.from, (outgoing.get(connection.from) || 0) + 1);
    assert.ok([...outgoing.values()].some(count => count > 1) || board.connections.length >= 6, `${board.id} should have visible branching`);
  }
});

test('feature-board routes exist and planned queue ETA is visibly planned', async () => {
  const { data } = await loadSubject();
  const features = data.boards.filter(board => board.id !== 'main');
  for (const board of features) {
    assert.equal(existsSync(new URL(`../${board.route}`, import.meta.url)), true, `${board.route} should exist`);
  }
  const performance = data.boards.find(board => board.id === 'performance-reliability');
  const eta = performance.notes.find(note => /ETA|queue position/i.test(`${note.title} ${note.summary}`));
  assert.ok(eta, 'performance board should include queue position / ETA idea');
  assert.equal(eta.status, 'planned');
  assert.match(`${eta.type} ${eta.date} ${eta.summary}`, /planned|discussed/i);
  assert.equal(Boolean(eta.version), false, 'planned queue ETA should not claim a shipped version');
});

test('release-version notes have dates and audited 3.9.99.6/7/8 dates are exact', async () => {
  const { data } = await loadSubject();
  const versioned = data.boards.flatMap(board => board.notes.map(note => ({ board: board.id, ...note }))).filter(note => note.version);
  for (const note of versioned) {
    assert.ok(note.date, `${note.board}/${note.id} version ${note.version} should have a date`);
    assert.ok(/^\d{4}-\d{2}-\d{2}$/.test(note.date) || /^(Approx\.|Discussed|Planned)/.test(note.date), `${note.board}/${note.id} should use ISO exact date or explicit approximate label`);
  }
  const byVersion = new Map(versioned.map(note => [note.version, note]));
  assert.equal(byVersion.get('3.9.99.6')?.date, '2026-09-25');
  assert.equal(byVersion.get('3.9.99.7')?.date, '2026-09-26');
  assert.equal(byVersion.get('3.9.99.8')?.date, '2026-09-28');
});

test('every board has a route and no board page uses modal or popup navigation', async () => {
  const { data } = await loadSubject();
  for (const board of data.boards) assert.ok(board.route, `${board.id} should have a route`);
  const htmlFiles = ['index.html', ...data.boards.filter(board => board.id !== 'main').map(board => board.route)];
  for (const file of htmlFiles) {
    const html = readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
    assert.doesNotMatch(html, /class="[^"]*(modal|popup)|dialog/i);
  }
});

test('release repository includes CI workflow and documentation', () => {
  const workflowUrl = new URL('../.github/workflows/pages.yml', import.meta.url);
  assert.equal(existsSync(workflowUrl), true, 'Pages workflow should exist');
  assert.equal(existsSync(new URL('../README.md', import.meta.url)), true, 'README should exist');
});

test('Pages workflow skips deployment cleanly until GitHub Pages is enabled', () => {
  const workflow = readFileSync(new URL('../.github/workflows/pages.yml', import.meta.url), 'utf8');
  assert.match(workflow, /name:\s*Check Pages availability/, 'workflow should probe whether Pages is enabled');
  assert.match(workflow, /pages_enabled:\s*\$\{\{ steps\.pages\.outputs\.enabled \}\}/, 'build job should expose the Pages availability result');
  assert.match(workflow, /if:\s*steps\.pages\.outputs\.enabled == 'true'/, 'configure/upload steps should be conditional');
  assert.match(workflow, /if:\s*needs\.build\.outputs\.pages_enabled == 'true'/, 'deploy job should skip when Pages is disabled');
});

test('validator rejects non-numeric or out-of-range note coordinates', async () => {
  const { validateBoards } = await loadSubject();
  const fixture = {
    boards: [{ id: 'main', title: 'Main', route: 'index.html', notes: [
      { id: 'bad-x', title: 'Bad X', type: 'Build', date: '2026-10-04', summary: 'Bad', x: '50', y: 40 },
      { id: 'bad-y', title: 'Bad Y', type: 'Build', date: '2026-10-04', summary: 'Bad', x: 50, y: 140 }
    ], connections: [] }]
  };
  const errors = validateBoards(fixture);
  assert.ok(errors.some(error => error.includes('bad-x') && error.includes('coordinate x')));
  assert.ok(errors.some(error => error.includes('bad-y') && error.includes('coordinate y')));
});

test('data architecture records hard-bounce and QBO reconciliation evidence', async () => {
  const { data } = await loadSubject();
  const board = data.boards.find(item => item.id === 'data-architecture');
  const text = board.notes.map(note => `${note.title} ${note.summary} ${note.impact ?? ''}`).join(' ');
  for (const expected of ['17,018', '11,656', '5,362', '570', '564']) {
    assert.match(text, new RegExp(expected.replace(',', '\\,')), `data architecture should include ${expected}`);
  }
});