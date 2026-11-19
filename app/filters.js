// filters.js — which trophies a view shows, and the spoiler rule.
// Kinds come from the data file (story, collectibles, activities, platinum);
// 'missable' and 'online' are derived filters over the same data, so the
// checklist, the header bars and the result count always agree.

export const KIND_LABELS = {
  story: 'Story',
  collectibles: 'Collectibles',
  activities: 'Activities',
  platinum: 'Platinum',
  online: 'Online',
};

export function matchesKind(trophy, kind) {
  if (kind === 'all') return true;
  if (kind === 'missable') return trophy.missable === true;
  if (kind === 'online') return trophy.kind === 'online';
  return trophy.kind === kind;
}

export function filterTrophies(trophies, state) {
  const query = state.search.trim().toLowerCase();
  return trophies.filter((trophy) => {
    if (!matchesKind(trophy, state.kind)) return false;
    if (state.grade !== 'all' && trophy.grade !== state.grade) return false;
    if (state.earnedState === 'earned' && !state.earned.has(trophy.id)) return false;
    if (state.earnedState === 'unearned' && state.earned.has(trophy.id)) return false;
    if (query) {
      const shielded = isShielded(trophy, state);
      const haystack = shielded
        ? 'hidden trophy'
        : `${trophy.name} ${trophy.description}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });
}

// The spoiler rule: with the shield on, every hidden trophy (28 of the 55
// are hidden on PlayStation, the story trophies among them) stays masked —
// name and description — until it is earned. Earning it, or turning the
// shield off, reveals it. The toggle defaults to ON.
export function isShielded(trophy, state) {
  return Boolean(state.spoilerShield && trophy.hidden && !state.earned.has(trophy.id));
}

export function displayName(trophy, state) {
  return isShielded(trophy, state) ? 'Hidden trophy' : trophy.name;
}

export function displayDescription(trophy, state) {
  return isShielded(trophy, state)
    ? 'Hidden until earned — the spoiler shield is on.'
    : trophy.description;
}

export function progressByKind(trophies, earned) {
  const kinds = ['story', 'collectibles', 'activities'];
  return kinds.map((kind) => {
    const inKind = trophies.filter((t) => t.kind === kind);
    const done = inKind.filter((t) => earned.has(t.id)).length;
    return { kind, label: KIND_LABELS[kind], done, total: inKind.length };
  });
}
