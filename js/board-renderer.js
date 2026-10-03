function makeNoteElement(note, board, routeById) {
  const destination = note.href || (note.relatedBoard ? routeById.get(note.relatedBoard) : null);
  const el = document.createElement(destination ? 'a' : 'button');
  el.className = 'evidence-note';
  if ((note.summary || '').length > 180) el.classList.add('note--long');
  if (note.role === 'center') el.classList.add('note--center');
  if (note.status === 'planned') el.classList.add('note--planned');
  if (/retired/i.test(note.type || '')) el.classList.add('note--retired');
  el.dataset.noteId = note.id;
  el.dataset.noteType = note.type || '';
  el.style.setProperty('--x', `${note.x ?? 50}%`);
  el.style.setProperty('--y', `${note.y ?? 50}%`);
  el.style.setProperty('--rotation', `${note.rotation ?? 0}deg`);
  el.style.setProperty('--note-scale', `${note.scale ?? 1}`);
  if (destination) el.href = destination.startsWith('/') ? destination : destination;
  else {
    el.type = 'button';
    el.setAttribute('aria-pressed', 'false');
  }

  const version = note.version ? `<span class="note-version">${escapeHtml(note.version)}</span>` : '';
  const impact = note.impact ? `<span class="note-impact">${escapeHtml(note.impact)}</span>` : '';
  el.setAttribute('aria-label', [note.title, note.type, note.date, note.version, note.summary].filter(Boolean).join('. '));
  el.innerHTML = `
    <span class="note-paper" aria-hidden="true"></span>
    <span class="note-content">
      <span class="note-meta"><span class="note-type">${escapeHtml(note.type || '')}</span><span class="note-date">${escapeHtml(note.date || '')}</span></span>
      <strong class="note-title">${escapeHtml(note.title || '')}</strong>
      ${version}
      <span class="note-summary">${escapeHtml(note.summary || '')}</span>
      ${impact}
    </span>`;
  return el;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export function renderBoardNotes(container, board, boards = []) {
  const routeById = new Map(boards.map(item => [item.id, item.route]));
  const result = new Map();
  for (const note of board.notes || []) {
    const element = makeNoteElement(note, board, routeById);
    container.appendChild(element);
    result.set(note.id, element);
  }
  return result;
}