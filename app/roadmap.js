// roadmap.js — the platinum roadmap and the missable list.
// Both are built from the official descriptions in the data file: stages
// group trophies by the order a platinum run should earn them, stage
// counts quote the counts PlayStation publishes, and the missable list
// is exactly the trophies whose data carries missable: true, each with
// the note derived from its own description.

export const STAGES = [
  {
    stage: 1,
    title: 'Story first — chapters, missions and choices',
    blurb:
      'Play the campaign straight through: Gone Fishing, Chapters 1–4, the named story missions (Breakfast Run, The Cartel Heist, Child\'s Play, Headliners, VCIA Takedown, Operation Savage Glory) and the final mission. Wording here stays spoiler-safe; the shield hides these names until earned. Make your choices as they come — Actions Speak Louder tracks them (PlayStation counts to 500). Keep a separate save before the final mission.',
    counts: '13 story trophies · 1 gold (the final mission) · choice count to 500',
  },
  {
    stage: 2,
    title: 'The people of Leonida — strangers and character arcs',
    blurb:
      'Finish every strand you started: the final missions for Andy, Kenton, Billy, Randy and Tyrone, the 8 stranger strands silver, and Bret\'s unique-animal hunt. These are the roadmap\'s missable heartland — a strand is a chain, and the trophies sit on its last link, so close each arc before the endgame.',
    counts: '7 trophies · 1 silver (8 complete stranger strands)',
  },
  {
    stage: 3,
    title: 'See all of Leonida — collectibles and exploration',
    blurb:
      'Sweep the state region by region: explore all 52 areas, meditate at all 18 spots, WAiNK It at 100 locations, complete 3 Collectible Card sets and discover 100 vehicles. Exploration is the engine of this stage — every new area feeds several counts at once.',
    counts: '52 areas · 18 meditation spots · 100 WAiNK locations · 3 card sets · 100 vehicles',
  },
  {
    stage: 4,
    title: 'Leonida at play — activities and challenges',
    blurb:
      'Sample and then master the activity list: try all 9 activity types once, gold all 42 Shooting Range challenges, win Top Fun drone races at all 14 locations, win 20 different races, beat Cal at fishing, finish an arcade game, complete 250 stunts and 50 challenges, and bowl at the Kolt & Associates alley.',
    counts: '42 range golds · 14 drone-race locations · 250 stunts · 50 challenges · 20 races',
  },
  {
    stage: 5,
    title: 'Free-roam fortune — crime, money and one-off feats',
    blurb:
      'The deliberate set-ups: lose a 4-star heat with your partner, rob 3 shops back-to-back without losing it, rob 5 bank vaults, an armored truck, a jewelry store unseen and one illegal operation per gang (9 gangs); launder $250,000 of Marked Bills, spend $100,000, buy all 8 garages and register 10 vehicles. Take the one-place moments — a cocktail on Ocean Beach, the showroom smash, the unscheduled VCIA departure — the first time they line up.',
    counts: '$250,000 laundered · $100,000 spent · 8 garages · 9 gangs · 5 bank vaults',
  },
  {
    stage: 6,
    title: 'The last percent — 100% and the platinum',
    blurb:
      'Close the game out: use the tracker filters to sweep for whatever the completion counter still wants, attain 100% Completion (gold), and Vice Got a Price! — the platinum — unlocks with the other 54 earned.',
    counts: '100% completion · 55 of 55 trophies',
  },
];

export function trophiesForStage(trophies, stageNumber) {
  return trophies.filter((t) => t.stage === stageNumber);
}

export function missableTrophies(trophies) {
  return trophies.filter((t) => t.missable);
}

export function renderRoadmap(container, trophies, earned) {
  container.replaceChildren();
  for (const stage of STAGES) {
    const section = document.createElement('article');
    section.className = 'stage';

    const num = document.createElement('div');
    num.className = 'stage-num';
    num.textContent = String(stage.stage);

    const body = document.createElement('div');
    const heading = document.createElement('h3');
    const inStage = trophiesForStage(trophies, stage.stage);
    const done = inStage.filter((t) => earned.has(t.id)).length;
    heading.textContent = `Stage ${stage.stage} — ${stage.title} (${done}/${inStage.length} earned)`;

    const blurb = document.createElement('p');
    blurb.className = 'stage-blurb';
    blurb.textContent = stage.blurb;

    const counts = document.createElement('p');
    counts.className = 'stage-counts';
    counts.textContent = `Counts from the official list: ${stage.counts}.`;

    const list = document.createElement('ul');
    for (const trophy of inStage) {
      const item = document.createElement('li');
      const grade = document.createElement('span');
      grade.className = 'li-grade';
      grade.textContent = `${trophy.grade} · `;
      item.append(grade, document.createTextNode(trophy.name));
      if (trophy.count !== undefined) {
        item.append(document.createTextNode(` — ${trophy.count}`));
      }
      if (trophy.missable) {
        const miss = document.createElement('span');
        miss.className = 'li-miss';
        miss.textContent = ' · MISSABLE';
        item.append(miss);
      }
      if (earned.has(trophy.id)) item.append(document.createTextNode(' ✓'));
      list.append(item);
    }

    body.append(heading, blurb, counts, list);
    section.append(num, body);
    container.append(section);
  }
}

export function renderMissables(container, trophies) {
  container.replaceChildren();
  for (const trophy of missableTrophies(trophies)) {
    const card = document.createElement('article');
    card.className = 'miss-card';

    const heading = document.createElement('h3');
    heading.textContent = `⚠ ${trophy.name}`;

    const desc = document.createElement('p');
    desc.textContent = `Official description: ${trophy.description}`;

    const note = document.createElement('p');
    note.className = 'miss-note';
    note.textContent = `Point of no return: ${trophy.missableNote}`;

    const earliest = document.createElement('p');
    earliest.textContent = `Earliest: ${trophy.earliest}`;

    card.append(heading, desc, note, earliest);
    container.append(card);
  }
}
