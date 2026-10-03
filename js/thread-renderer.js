import { anchorPoint, buildThreadPath } from './thread-geometry.js';

const NS = 'http://www.w3.org/2000/svg';

function center(rect, origin) {
  return { x: rect.left - origin.left + rect.width / 2, y: rect.top - origin.top + rect.height / 2 };
}

function localRect(rect, origin) {
  return { left: rect.left - origin.left, top: rect.top - origin.top, width: rect.width, height: rect.height };
}

export function renderThreads(svg, noteElements, connections = []) {
  svg.replaceChildren();
  const containerRect = svg.parentElement.getBoundingClientRect();
  svg.setAttribute('viewBox', `0 0 ${svg.parentElement.scrollWidth} ${svg.parentElement.scrollHeight}`);
  svg.setAttribute('width', svg.parentElement.scrollWidth);
  svg.setAttribute('height', svg.parentElement.scrollHeight);
  const map = new Map();

  connections.forEach((connection, index) => {
    const fromEl = noteElements.get(connection.from);
    const toEl = noteElements.get(connection.to);
    if (!fromEl || !toEl) return;
    const fromRect = localRect(fromEl.getBoundingClientRect(), containerRect);
    const toRect = localRect(toEl.getBoundingClientRect(), containerRect);
    const fromCenter = center(fromEl.getBoundingClientRect(), containerRect);
    const toCenter = center(toEl.getBoundingClientRect(), containerRect);
    const from = anchorPoint(fromRect, toCenter);
    const to = anchorPoint(toRect, fromCenter);
    const id = `thread-${connection.from}-${connection.to}-${index}`.replace(/[^a-zA-Z0-9_-]/g, '-');

    const group = document.createElementNS(NS, 'g');
    group.classList.add('thread-group', `thread--${connection.type || 'dependency'}`);
    group.dataset.from = connection.from;
    group.dataset.to = connection.to;
    if (connection.dashed || connection.type === 'planned') group.classList.add('thread--dashed');
    if (connection.type === 'retired') group.classList.add('thread--retired');

    const path = document.createElementNS(NS, 'path');
    path.id = id;
    path.classList.add('thread-path');
    path.setAttribute('d', buildThreadPath(from, to, connection.bend ?? 0));
    path.setAttribute('fill', 'none');
    group.appendChild(path);

    const arrows = document.createElementNS(NS, 'text');
    arrows.classList.add('thread-arrows');
    const textPath = document.createElementNS(NS, 'textPath');
    textPath.setAttribute('href', `#${id}`);
    textPath.setAttribute('startOffset', '20%');
    textPath.setAttribute('textLength', '60%');
    textPath.setAttribute('lengthAdjust', 'spacing');
    textPath.textContent = '>     >     >     >';
    arrows.appendChild(textPath);
    group.appendChild(arrows);

    if (connection.type === 'retired') {
      const retired = document.createElementNS(NS, 'text');
      retired.classList.add('retired-marker');
      const retiredPath = document.createElementNS(NS, 'textPath');
      retiredPath.setAttribute('href', `#${id}`);
      retiredPath.setAttribute('startOffset', '50%');
      retiredPath.textContent = '×';
      retired.appendChild(retiredPath);
      group.appendChild(retired);
    }

    if (connection.label) {
      const label = document.createElementNS(NS, 'text');
      label.classList.add('thread-label');
      const labelPath = document.createElementNS(NS, 'textPath');
      labelPath.setAttribute('href', `#${id}`);
      labelPath.setAttribute('startOffset', '50%');
      labelPath.textContent = connection.label;
      label.appendChild(labelPath);
      group.appendChild(label);
    }
    svg.appendChild(group);
    map.set(id, group);
  });
  return map;
}

export function highlightBranch(noteId, threadMap, noteElements, connections) {
  const related = new Set([noteId]);
  for (const connection of connections) {
    if (connection.from === noteId) related.add(connection.to);
    if (connection.to === noteId) related.add(connection.from);
  }
  for (const element of noteElements.values()) {
    element.classList.toggle('note--dimmed', !related.has(element.dataset.noteId));
  }
  for (const group of threadMap.values()) {
    const active = group.dataset.from === noteId || group.dataset.to === noteId;
    group.classList.toggle('thread--highlight', active);
    group.classList.toggle('thread--dimmed', !active);
  }
}

export function clearBranchHighlight(threadMap, noteElements) {
  for (const element of noteElements.values()) element.classList.remove('note--dimmed');
  for (const group of threadMap.values()) group.classList.remove('thread--highlight', 'thread--dimmed');
}