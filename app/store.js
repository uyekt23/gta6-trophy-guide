// store.js — progress persistence for the Leonida Legend tracker.
// Earned trophy ids live in localStorage; export downloads them as a JSON
// file and import reads that file back, so progress survives offline and
// can move between browsers. Nothing here touches the network.

export const STORAGE_KEY = 'leonida-legend-progress-v1';
export const SPOILER_KEY = 'leonida-legend-spoiler-v1';

export function loadEarned() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const ids = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(ids) ? ids.filter((n) => Number.isInteger(n)) : []);
  } catch {
    return new Set();
  }
}

export function saveEarned(earned) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...earned].sort((a, b) => a - b)));
}

export function loadSpoilerShield() {
  const raw = localStorage.getItem(SPOILER_KEY);
  return raw === null ? true : raw === 'on';
}

export function saveSpoilerShield(on) {
  localStorage.setItem(SPOILER_KEY, on ? 'on' : 'off');
}

export function exportProgress(earned, trophies) {
  const payload = {
    app: 'leonida-legend-gta6-tracker',
    version: 1,
    exportedAt: new Date().toISOString(),
    earnedIds: [...earned].sort((a, b) => a - b),
    earnedNames: trophies.filter((t) => earned.has(t.id)).map((t) => t.name),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'leonida-legend-progress.json';
  link.click();
  URL.revokeObjectURL(link.href);
}

export async function importProgress(file) {
  const parsed = JSON.parse(await file.text());
  const ids = Array.isArray(parsed) ? parsed : parsed.earnedIds;
  if (!Array.isArray(ids)) throw new Error('That file does not hold a progress list.');
  return new Set(ids.filter((n) => Number.isInteger(n)));
}

// Demo seeding for screenshots and first-look tours: ?seed=13 marks the
// first 13 roadmap trophies of a fresh profile as earned, in place of any
// saved state, so a screenshot can show the tracker mid-progress.
export const DEMO_EARNED_IDS = [2, 3, 4, 5, 8, 9, 10, 15, 16, 21, 28, 35, 53];
