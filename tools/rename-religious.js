// Removes religious names and wording from everything a player sees, keeping every internal id (saint, hollow, night, demon, haloseraph...) so saves,
// items and the server stay valid. Display text only. Run once: node tools/rename-religious.js   (prints how many places each change touched)
// Approved with the story proposal (docs/story-proposal.md), 2026-11-07.
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const FILES = [
  ...fs.readdirSync(path.join(ROOT, 'src/js/late')).filter(f => f.endsWith('.js')).map(f => 'src/js/late/' + f),
  'src/legacy.html',
  ...fs.readdirSync(path.join(ROOT, 'tools')).filter(f => f.endsWith('.json')).map(f => 'tools/' + f),
  'tools/voice/boss-lines.json',
];
// [old, new], longest and most specific first. Only whole phrases a player reads.
const MAP = [
  // the Nameless Saint → the Nameless Gardener; Hollow Sanctuary → Hollow Grove
  ['What Was Prayed To, Afterward', 'What the Grove Forgot'],
  ["The sanctuary\\'s keeper", "The grove\\'s keeper"],
  ["Saint\\'s Halo Fragment", "Gardener\\'s Bloom Ring Fragment"], ["Saint's Halo Fragment", "Gardener's Bloom Ring Fragment"], ["Saint\\'s Mantle", "Gardener\\'s Mantle"],
  ['NAMELESS SAINT', 'NAMELESS GARDENER'], ['Nameless Saint', 'Nameless Gardener'],
  ['Mark of the Saint', 'Mark of the Gardener'], ['Saintbreaker', 'Thornbreaker'],
  ['HOLLOW SANCTUARY', 'HOLLOW GROVE'], ['Hollow Sanctuary', 'Hollow Grove'],
  ['A dark root from the fallen sanctuary', 'A dark root from the fallen grove'],
  ['Even the sacred can fall.', 'Even the gentlest things can fall.'],
  ['Root and thorn, take back the sanctuary.', 'Root and thorn, take back the grove.'],
  ['The Last Blessing', 'The Last Bloom'], ['Halo of Thorns', 'Ring of Thorns'], ['Her halo cracks', 'Her bloom ring cracks'], ['Fallen Halo', 'Fallen Bloom'],
  // Temple of Eternal Night → Halls of the Eternal Night, and the other temples
  ['TEMPLE OF ETERNAL NIGHT', 'HALLS OF THE ETERNAL NIGHT'], ['Temple of Eternal Night', 'Halls of the Eternal Night'],
  ['A black temple under one cold moon', 'Black halls under one cold moon'], ['so the temple would never see morning', 'so the halls would never see morning'],
  ['The temple falls', 'The halls fall'], ['Last Keeper of the Sealed Temple', 'Last Keeper of the Sealed Gate'],
  ['A temple trapped in eternal winter', 'A palace trapped in eternal winter'], ['An abandoned temple swallowed by moss', 'Abandoned ruins swallowed by moss'],
  // heaven
  ['Heaven rends at my command!', 'The sky tears open at my command!'], ['Heaven falls with me!', 'The sky falls with me!'],
  ['Collapse of Heaven', 'Collapse of the Sky'], ['Heaven Rends', 'Sky Rend'],
  // the Demon class → Bloodbound (its id stays 'demon')
  ["demon:{n:'Demon',", "demon:{n:'Bloodbound',"], ['Demon blades, of course.', 'Bloodbound blades, of course.'],
  ['They call me a demon. I prefer fortune teller with a temper.', 'They call me spooky. I prefer fortune teller with a temper.'],
  ['Small demonic bat wings', 'Small bat wings'], ["n:'Hellhound'", "n:'Ashhound'"], ["'Hellfang'", "'Ashfang'"],
  // judgement, holy, divine, sacred
  ['Judgement: holy rays strike', 'Verdict: rays of light strike'], ["'Judgement'", "'Verdict'"], ["Ruin\\'s Judgment", "Ruin\\'s Verdict"],
  ['columns of holy light', 'columns of light'], ['column of holy light', 'column of light'],
  ['Divine Light: a pillar of light smites monsters', 'Radiant Light: a pillar of light strikes monsters'], ["'White Lily','Divine'", "'White Lily','Radiant'"],
  ['Sacred Flame', 'Pure Flame'], ['Ice Priestess', 'Ice Warden'],
  // angels, seraphs, halos
  ['pearl-white angel wings', 'pearl-white feathered wings'], ['Angel Wings', 'Pearl Wings'],
  ['Celestial Seraph Robe', 'Celestial Starlight Robe'], ['Golden Seraph Ring', 'Golden Sun Ring'], ['Seraph of Eternity', 'Wings of Eternity'], ['Noon Seraph', 'Noon Plume'], ['Halo Seraph', 'Radiant Plume'],
  ['Celestial Halo Crown', 'Celestial Star Crown'], ['Celestial Halo', 'Celestial Star Ring'], ['Rune Halo Charm', 'Rune Ring Charm'],
  ['around a glowing halo ring', 'around a glowing ring of light'], ['and a radiant halo', 'and a radiant ring of light'], ["'Halo'", "'Lumen'"],
  // shrines and cathedrals
  ['Prism Shrine', 'Prism Spire'], ['Sky Shrine', 'Sky Spire'], ['shrine lantern', 'stone lantern'],
  ['The Walking Cathedral of Crystal', 'The Walking Citadel of Crystal'], ['A walking cathedral of living crystal.', 'A walking citadel of living crystal.'],
  ['A cathedral of starlight', 'A citadel of starlight'], ['The cathedral shatters into blades', 'The citadel shatters into blades'],
  // the owner's test switch
  ["'God mode on'", "'Invincible mode on'"], ["bd.textContent='God mode'", "bd.textContent='Invincible mode'"],
];
const hits = new Map(MAP.map(m => [m[0], 0])); let changed = 0;
for (const f of FILES) { const p = path.join(ROOT, f); if (!fs.existsSync(p)) continue; let s = fs.readFileSync(p, 'utf8'); const s0 = s;
  for (const [a, b] of MAP) { const n = s.split(a).length - 1; if (n) { hits.set(a, hits.get(a) + n); s = s.split(a).join(b); } }
  if (s !== s0) { fs.writeFileSync(p, s); changed++; } }
for (const [a, n] of hits) console.log(String(n).padStart(3), a);
console.log(changed, 'files changed');
