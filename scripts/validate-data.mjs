import { readFile } from 'node:fs/promises';

export async function loadBoards(path) {
  return JSON.parse(await readFile(path, 'utf8'));
}

export function validateBoards(data) {
  const errors = [];
  if (!data || !Array.isArray(data.boards)) return ['boards must be an array'];
  const boardIds = new Set();
  for (const board of data.boards) {
    if (!board?.id) { errors.push('board missing id'); continue; }
    if (boardIds.has(board.id)) errors.push(`duplicate board id: ${board.id}`);
    boardIds.add(board.id);
  }
  for (const board of data.boards) {
    if (!board?.id) continue;
    if (!board.title) errors.push(`${board.id}: missing title`);
    if (!board.route) errors.push(`${board.id}: missing route`);
    const notes = Array.isArray(board.notes) ? board.notes : [];
    const ids = new Set();
    for (const note of notes) {
      if (!note?.id) { errors.push(`${board.id}: note missing id`); continue; }
      if (ids.has(note.id)) errors.push(`${board.id}: duplicate note id: ${note.id}`);
      ids.add(note.id);
      if (note.important !== false) {
        for (const key of ['title','type','date','summary']) {
          if (!note[key]) errors.push(`${board.id}/${note.id}: missing ${key}`);
        }
      }
      for (const axis of ['x', 'y']) {
        if (note[axis] !== undefined && (typeof note[axis] !== 'number' || !Number.isFinite(note[axis]) || note[axis] < 0 || note[axis] > 100)) {
          errors.push(`${board.id}/${note.id}: invalid coordinate ${axis}`);
        }
      }
      if (note.relatedBoard && !boardIds.has(note.relatedBoard)) {
        errors.push(`${board.id}/${note.id}: missing related board ${note.relatedBoard}`);
      }
      if (note.status === 'planned') {
        const text = `${note.type ?? ''} ${note.date ?? ''} ${note.summary ?? ''}`;
        if (!/planned|discussed/i.test(text)) errors.push(`${board.id}/${note.id}: planned note is not visibly labeled planned/discussed`);
      }
    }
    for (const connection of Array.isArray(board.connections) ? board.connections : []) {
      if (!ids.has(connection.from)) errors.push(`${board.id}: connection from missing note ${connection.from}`);
      if (!ids.has(connection.to)) errors.push(`${board.id}: connection to missing note ${connection.to}`);
    }
  }
  return errors;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const file = process.argv[2] || 'data/boards.json';
  const data = await loadBoards(file);
  const errors = validateBoards(data);
  if (errors.length) {
    for (const error of errors) console.error(error);
    process.exit(1);
  }
  console.log(`VALID: ${data.boards.length} boards`);
}