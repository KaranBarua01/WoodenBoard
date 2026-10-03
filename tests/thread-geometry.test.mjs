import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const subjectPath = new URL('../js/thread-geometry.js', import.meta.url);

async function subject() {
  assert.equal(existsSync(subjectPath), true, 'thread geometry module should exist');
  return import(pathToFileURL(subjectPath.pathname));
}

test('anchorPoint exits a rectangle toward the destination direction', async () => {
  const { anchorPoint } = await subject();
  const rect = { left: 0, top: 0, width: 100, height: 80 };
  assert.deepEqual(anchorPoint(rect, { x: 200, y: 40 }), { x: 100, y: 40 });
  assert.deepEqual(anchorPoint(rect, { x: -100, y: 40 }), { x: 0, y: 40 });
  assert.deepEqual(anchorPoint(rect, { x: 50, y: -100 }), { x: 50, y: 0 });
  assert.deepEqual(anchorPoint(rect, { x: 50, y: 200 }), { x: 50, y: 80 });
});

test('buildThreadPath is deterministic and preserves endpoint direction', async () => {
  const { buildThreadPath } = await subject();
  assert.equal(buildThreadPath({ x: 10, y: 20 }, { x: 200, y: 80 }, 0), 'M 10 20 Q 105 50 200 80');
  assert.equal(buildThreadPath({ x: 200, y: 80 }, { x: 10, y: 20 }, 0), 'M 200 80 Q 105 50 10 20');
});

test('buildThreadPath bends perpendicular to the direct line', async () => {
  const { buildThreadPath } = await subject();
  const path = buildThreadPath({ x: 0, y: 0 }, { x: 100, y: 0 }, 40);
  assert.equal(path, 'M 0 0 Q 50 40 100 0');
});

test('buildThreadPath safely handles zero-distance endpoints', async () => {
  const { buildThreadPath } = await subject();
  assert.equal(buildThreadPath({ x: 50, y: 50 }, { x: 50, y: 50 }, 30), 'M 50 50 L 50 50');
});