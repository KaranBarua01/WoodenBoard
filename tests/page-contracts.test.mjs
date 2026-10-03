import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

function read(path) {
  assert.equal(existsSync(path), true, `${path} should exist`);
  return readFileSync(path, 'utf8');
}

test('main page exposes an accessible board root and fixed navigation', () => {
  const html = read('index.html');
  assert.match(html, /<title>[^<]+<\/title>/i);
  assert.match(html, /id="board-canvas"/);
  assert.match(html, /data-board-id="main"/);
  assert.match(html, /aria-label="Board navigation"/);
});

test('note renderer uses semantic interactive elements and stable note ids', () => {
  const js = read('js/board-renderer.js');
  assert.match(js, /createElement\(destination \? ['"]a['"] : ['"]button['"]\)/);
  assert.match(js, /data-note-id|dataset\.noteId/);
  assert.match(js, /note--long/);
});

test('board css supports physical background, fixed navigation and reduced motion', () => {
  const css = read('css/board.css');
  assert.match(css, /wood-board\.webp/);
  assert.match(css, /\.board-nav[\s\S]*position:\s*fixed/);
  assert.match(css, /prefers-reduced-motion/);
});

test('feature pages expose back navigation and preserve board-specific ids', () => {
  const files = ['conversation','qbo','meetings','cleaner','data-architecture','reuse-outreach','mapping-admin','performance-reliability'];
  for (const id of files) {
    const html = read(`boards/${id}.html`);
    assert.match(html, /Back to Main Board/);
    assert.match(html, new RegExp(`data-board-id="${id}"`));
    assert.match(html, /aria-label="Board navigation"/);
  }
});

test('board app supports persistent branch focus, escape clearing, and a non-color-only legend', () => {
  const js = read('js/board-app.js');
  assert.match(js, /aria-pressed/);
  assert.match(js, /Escape/);
  assert.match(js, /board-legend/);
  assert.match(js, /Problem → Fix|Problem.*Fix/s);
  assert.match(js, /Dashed.*Planned/s);
});

test('dense boards stay scrollable and keep readable note sizes on small screens', () => {
  const css = read('css/board.css');
  assert.match(css, /body[\s\S]*overflow:\s*auto/);
  assert.match(css, /\.board-canvas[\s\S]*min-width:\s*1[34-9]00px/);
  assert.match(css, /\.board-legend[\s\S]*position:\s*fixed/);
});

test('center Chuck note stays visually simple and hides secondary metadata', () => {
  const css = read('css/board.css');
  assert.match(css, /\.note--center[\s\S]*\.note-meta[\s\S]*display:\s*none/);
  assert.match(css, /\.note--center[\s\S]*\.note-summary[\s\S]*display:\s*none/);
});

test('retired threads include a visible retirement marker beyond color or dashing', () => {
  const js = read('js/thread-renderer.js');
  const css = read('css/board.css');
  assert.match(js, /retired-marker/);
  assert.match(css, /\.retired-marker/);
});

test('production board uses optimized WebP assets derived from the approved images', () => {
  const css = read('css/board.css');
  assert.match(css, /wood-board\.webp/);
  assert.match(css, /sticky-note\.webp/);
  assert.equal(existsSync('assets/wood-board.webp'), true);
  assert.equal(existsSync('assets/sticky-note.webp'), true);
});