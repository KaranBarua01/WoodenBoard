import { renderBoardNotes } from './board-renderer.js';
import { renderThreads, highlightBranch, clearBranchHighlight } from './thread-renderer.js';

function rootPrefix() {
  return document.documentElement.dataset.root || './';
}

function routeForPage(route) {
  const root = rootPrefix();
  return `${root}${route}`.replace('/./', '/');
}


function ensureLegend() {
  if (document.getElementById('board-legend')) return;
  const legend = document.createElement('aside');
  legend.id = 'board-legend';
  legend.className = 'board-legend';
  legend.setAttribute('aria-label', 'Thread legend');
  legend.innerHTML = `
    <strong>Follow the &gt; markers</strong>
    <span><i class="legend-line legend-red"></i>Problem → Fix</span>
    <span><i class="legend-line legend-blue"></i>Technical dependency</span>
    <span><i class="legend-line legend-green"></i>Impact / benefit</span>
    <span><i class="legend-line legend-orange"></i>Upgrade path</span>
    <span><i class="legend-line legend-dashed"></i>Dashed = Planned</span>`;
  document.body.appendChild(legend);
}

export async function bootBoard(boardId) {
  const canvas = document.getElementById('board-canvas');
  if (!canvas) throw new Error('Missing #board-canvas');
  try {
    const response = await fetch(`${rootPrefix()}data/boards.json`, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Board data returned HTTP ${response.status}`);
    const data = await response.json();
    const board = data.boards.find(item => item.id === boardId);
    if (!board) throw new Error(`Unknown board: ${boardId}`);

    document.title = `${board.title} — WoodenBoard`;
    const title = document.getElementById('board-title');
    if (title) title.textContent = board.title;
    canvas.setAttribute('aria-label', `${board.title} investigation board`);
    canvas.replaceChildren();

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.classList.add('thread-layer');
    svg.setAttribute('aria-hidden', 'true');
    canvas.appendChild(svg);

    ensureLegend();
    const boardsForRenderer = data.boards.map(item => ({ ...item, route: routeForPage(item.route) }));
    const noteElements = renderBoardNotes(canvas, board, boardsForRenderer);
    let threadMap = new Map();
    let focusedId = null;

    const draw = () => {
      threadMap = renderThreads(svg, noteElements, board.connections || []);
      if (focusedId) highlightBranch(focusedId, threadMap, noteElements, board.connections || []);
    };
    requestAnimationFrame(draw);

    const clearFocus = () => {
      focusedId = null;
      for (const element of noteElements.values()) {
        if (element.tagName === 'BUTTON') element.setAttribute('aria-pressed', 'false');
      }
      clearBranchHighlight(threadMap, noteElements);
    };

    for (const [noteId, element] of noteElements) {
      element.addEventListener('mouseenter', () => { if (!focusedId) highlightBranch(noteId, threadMap, noteElements, board.connections || []); });
      element.addEventListener('mouseleave', () => { if (!focusedId) clearBranchHighlight(threadMap, noteElements); });
      element.addEventListener('focus', () => { if (!focusedId) highlightBranch(noteId, threadMap, noteElements, board.connections || []); });
      element.addEventListener('blur', () => { if (!focusedId) clearBranchHighlight(threadMap, noteElements); });
      if (element.tagName === 'BUTTON') {
        element.addEventListener('click', () => {
          if (focusedId === noteId) { clearFocus(); return; }
          focusedId = noteId;
          for (const other of noteElements.values()) {
            if (other.tagName === 'BUTTON') other.setAttribute('aria-pressed', String(other === element));
          }
          highlightBranch(noteId, threadMap, noteElements, board.connections || []);
        });
      }
    }
    window.addEventListener('keydown', event => { if (event.key === 'Escape') clearFocus(); });
    window.addEventListener('resize', draw, { passive: true });
    return { board, noteElements, threadMap };
  } catch (error) {
    canvas.innerHTML = `<div class="board-error" role="alert"><strong>Board could not load.</strong><br>${String(error.message || error)}</div>`;
    throw error;
  }
}

const canvas = document.getElementById('board-canvas');
if (canvas?.dataset.boardId) bootBoard(canvas.dataset.boardId);