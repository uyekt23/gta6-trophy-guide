// app.js — Leonida Legend: boot, checklist rendering, detail pane, controls.
// Loads the official trophy data from data/trophies.json (a file of this
// app, fetched from the same static server), renders every trophy with its
// official name, description and grade, and wires the tracker: checkbox
// progress in localStorage, kind / grade / state filters, search, the
// spoiler shield, and export / import. No network beyond this app's files.

import {
  DEMO_EARNED_IDS,
  exportProgress,
  importProgress,
  loadEarned,
  loadSpoilerShield,
  saveEarned,
  saveSpoilerShield,
} from './store.js';
import {
  displayDescription,
  displayName,
  filterTrophies,
  isShielded,
  progressByKind,
} from './filters.js';
import { renderMissables, renderRoadmap } from './roadmap.js';

const SOURCES_LINE =
  'Sources: official PlayStation 5 trophy list (name, description, grade and published counts) as listed by Exophase and PSNProfiles; guide text is our own advice derived from the official description quoted in the guide.';

const params = new URLSearchParams(location.search);

const state = {
  trophies: [],
  earned: loadEarned(),
  search: '',
  kind: 'all',
  grade: 'all',
  earnedState: 'all',
  spoilerShield: loadSpoilerShield(),
  selectedId: null,
  view: 'checklist',
};

if (params.has('seed')) {
  state.earned = new Set(DEMO_EARNED_IDS);
}
if (params.get('spoiler') === 'off') state.spoilerShield = false;
if (params.get('spoiler') === 'on') state.spoilerShield = true;
if (params.get('view')) state.view = params.get('view');
if (params.get('kind')) state.kind = params.get('kind');
if (params.get('open')) state.selectedId = Number(params.get('open'));

const els = {
  grid: document.getElementById('grid'),
  detail: document.getElementById('detail'),
  progressCount: document.getElementById('progress-count'),
  progressFill: document.getElementById('progress-fill'),
  progressPct: document.getElementById('progress-pct'),
  kindBars: document.getElementById('kind-bars'),
  resultCount: document.getElementById('result-count'),
  onlineNote: document.getElementById('online-note'),
  roadmapList: document.getElementById('roadmap-list'),
  missableList: document.getElementById('missable-list'),
  search: document.getElementById('search'),
  grade: document.getElementById('grade-filter'),
  earnedState: document.getElementById('state-filter'),
  spoiler: document.getElementById('spoiler-toggle'),
};

function badge(text, className) {
  const span = document.createElement('span');
  span.className = `badge ${className}`;
  span.textContent = text;
  return span;
}

function renderProgress() {
  const total = state.trophies.length;
  const done = state.earned.size;
  els.progressCount.textContent = `${done} of ${total} earned`;
  const pct = total ? Math.round((done / total) * 100) : 0;
  els.progressFill.style.width = `${pct}%`;
  els.progressPct.textContent =
    done === total && total > 0
      ? 'Platinum earned — you are a Leonida Legend.'
      : `${pct}% of the platinum`;
  els.kindBars.replaceChildren();
  for (const row of progressByKind(state.trophies, state.earned)) {
    const wrap = document.createElement('div');
    wrap.className = 'kind-bar';
    const label = document.createElement('span');
    label.textContent = row.label;
    const bar = document.createElement('div');
    bar.className = 'bar';
    const fill = document.createElement('div');
    fill.className = 'bar-fill';
    fill.style.width = row.total ? `${(row.done / row.total) * 100}%` : '0%';
    bar.append(fill);
    const tally = document.createElement('b');
    tally.textContent = `${row.done}/${row.total}`;
    wrap.append(label, bar, tally);
    els.kindBars.append(wrap);
  }
}

function toggleEarned(id, on) {
  if (on) state.earned.add(id);
  else state.earned.delete(id);
  saveEarned(state.earned);
  render();
}

function renderGrid() {
  const shown = filterTrophies(state.trophies, state);
  els.grid.replaceChildren();
  for (const trophy of shown) {
    const card = document.createElement('article');
    card.className = `card grade-${trophy.grade}`;
    if (state.earned.has(trophy.id)) card.classList.add('is-earned');
    if (state.selectedId === trophy.id) card.classList.add('is-selected');

    const top = document.createElement('div');
    top.className = 'card-top';
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = state.earned.has(trophy.id);
    box.setAttribute('aria-label', `Mark ${trophy.name} as earned`);
    box.addEventListener('click', (event) => event.stopPropagation());
    box.addEventListener('change', () => toggleEarned(trophy.id, box.checked));

    const textWrap = document.createElement('div');
    const name = document.createElement('h3');
    name.className = 'card-name';
    if (isShielded(trophy, state)) name.classList.add('spoiler-name');
    name.textContent = displayName(trophy, state);
    const desc = document.createElement('p');
    desc.className = 'card-desc';
    desc.textContent = displayDescription(trophy, state);
    textWrap.append(name, desc);
    top.append(box, textWrap);

    const tags = document.createElement('div');
    tags.className = 'card-tags';
    tags.append(badge(trophy.grade, `badge-${trophy.grade}`));
    if (trophy.kind !== trophy.grade) tags.append(badge(trophy.kind, 'badge-kind'));
    if (trophy.count !== undefined) tags.append(badge(`Target: ${trophy.count}`, 'badge-count'));
    if (trophy.hidden) tags.append(badge('Hidden', 'badge-hidden'));
    if (trophy.missable) tags.append(badge('⚠ Missable', 'badge-missable'));
    if (state.earned.has(trophy.id)) tags.append(badge('Earned ✓', 'badge-count'));

    card.append(top, tags);
    card.addEventListener('click', () => {
      state.selectedId = trophy.id;
      render();
    });
    els.grid.append(card);
  }
  els.resultCount.textContent =
    `Showing ${shown.length} of ${state.trophies.length} trophies` +
    (state.kind === 'missable' ? ' — every missable trophy, with its point of no return in the guide pane.' : '') +
    (state.spoilerShield ? ' Spoiler shield is ON: hidden trophies stay masked until earned.' : ' Spoiler shield is OFF: hidden trophies are revealed.');
  els.onlineNote.hidden = state.kind !== 'online';
}

function renderDetail() {
  const trophy = state.trophies.find((t) => t.id === state.selectedId) ?? state.trophies[0];
  els.detail.replaceChildren();
  if (!trophy) {
    const empty = document.createElement('p');
    empty.className = 'detail-empty';
    empty.textContent = 'Select a trophy to read its guide.';
    els.detail.append(empty);
    return;
  }
  const shielded = isShielded(trophy, state);

  const tags = document.createElement('div');
  tags.className = 'card-tags';
  tags.append(badge(trophy.grade, `badge-${trophy.grade}`));
  if (trophy.kind !== trophy.grade) tags.append(badge(trophy.kind, 'badge-kind'));
  tags.append(badge(`Roadmap stage ${trophy.stage}`, 'badge-kind'));
  if (trophy.count !== undefined) tags.append(badge(`Target: ${trophy.count}`, 'badge-count'));
  if (trophy.missable) tags.append(badge('⚠ Missable', 'badge-missable'));

  const name = document.createElement('h2');
  name.textContent = shielded ? 'Hidden trophy' : trophy.name;

  const desc = document.createElement('p');
  desc.className = 'official-desc';
  desc.textContent = shielded
    ? 'Official description hidden by the spoiler shield until this trophy is earned.'
    : `Official description: “${trophy.description}”`;

  const guideHeading = document.createElement('h3');
  guideHeading.textContent = 'Guide — in our own words, with its basis';
  const guide = document.createElement('p');
  guide.className = 'guide-text';
  guide.textContent = shielded
    ? 'Earn this trophy (or turn the spoiler shield off) to read its guide without spoilers.'
    : trophy.guide;

  els.detail.append(tags, name, desc, guideHeading, guide);

  if (trophy.missable && !shielded) {
    const box = document.createElement('div');
    box.className = 'missable-box';
    const bold = document.createElement('b');
    bold.textContent = '⚠ Missable — point of no return: ';
    box.append(bold, document.createTextNode(trophy.missableNote));
    els.detail.append(box);
  }

  const earliestHeading = document.createElement('h3');
  earliestHeading.textContent = 'Earliest point';
  const earliest = document.createElement('p');
  earliest.className = 'earliest';
  earliest.textContent = trophy.earliest;

  const sourcesHeading = document.createElement('h3');
  sourcesHeading.textContent = 'Sources';
  const sources = document.createElement('p');
  sources.className = 'sources';
  sources.textContent = SOURCES_LINE;

  const earnedLine = document.createElement('label');
  earnedLine.className = 'earned-line';
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = state.earned.has(trophy.id);
  box.addEventListener('change', () => toggleEarned(trophy.id, box.checked));
  earnedLine.append(box, document.createTextNode('I earned this trophy'));

  els.detail.append(earliestHeading, earliest, sourcesHeading, sources, earnedLine);
}

function renderViews() {
  for (const sectionId of ['checklist', 'roadmap', 'missables']) {
    document.getElementById(`view-${sectionId}`).hidden = state.view !== sectionId;
  }
  for (const tab of document.querySelectorAll('.tab')) {
    tab.classList.toggle('is-active', tab.dataset.view === state.view);
  }
  document.getElementById('controls').style.display = state.view === 'checklist' ? '' : 'none';
}

function render() {
  renderProgress();
  renderGrid();
  renderDetail();
  renderRoadmap(els.roadmapList, state.trophies, state.earned);
  renderMissables(els.missableList, state.trophies);
  renderViews();
}

function wireControls() {
  els.search.addEventListener('input', () => {
    state.search = els.search.value;
    renderGrid();
  });
  els.grade.addEventListener('change', () => {
    state.grade = els.grade.value;
    renderGrid();
  });
  els.earnedState.addEventListener('change', () => {
    state.earnedState = els.earnedState.value;
    renderGrid();
  });
  els.spoiler.checked = state.spoilerShield;
  els.spoiler.addEventListener('change', () => {
    state.spoilerShield = els.spoiler.checked;
    saveSpoilerShield(state.spoilerShield);
    render();
  });
  for (const chip of document.querySelectorAll('.chip')) {
    chip.classList.toggle('is-active', chip.dataset.kind === state.kind);
    chip.addEventListener('click', () => {
      state.kind = chip.dataset.kind;
      for (const other of document.querySelectorAll('.chip')) {
        other.classList.toggle('is-active', other === chip);
      }
      renderGrid();
    });
  }
  for (const tab of document.querySelectorAll('.tab')) {
    tab.addEventListener('click', () => {
      state.view = tab.dataset.view;
      renderViews();
    });
  }
  document.getElementById('export-btn').addEventListener('click', () => {
    exportProgress(state.earned, state.trophies);
  });
  document.getElementById('import-input').addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      state.earned = await importProgress(file);
      saveEarned(state.earned);
      render();
    } catch {
      els.resultCount.textContent = 'That import file could not be read as tracker progress.';
    }
    event.target.value = '';
  });
  document.getElementById('reset-btn').addEventListener('click', () => {
    state.earned = new Set();
    saveEarned(state.earned);
    render();
  });
}

async function boot() {
  const data = await (await fetch('data/trophies.json')).json();
  state.trophies = data.trophies;
  if (!state.selectedId) {
    const shootist = state.trophies.find((t) => t.name === 'The Shootist');
    state.selectedId = shootist ? shootist.id : state.trophies[0].id;
  }
  wireControls();
  render();
}

boot();
