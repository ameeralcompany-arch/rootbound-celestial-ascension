# The Reaper's story movie (retired)

"What the Dark Keeps" was a 216-second story movie for the Reaper (60 shots, voiced). After seeing it, the user chose short 20-second evolution cinematics for every class instead (`src/js/late/99-zzzzzzzzzz-z7-evocine.js` and the `z8-evc-*` files).
The film is kept here, out of the game and out of the shipped `audio/` folder, in case it is wanted again (for example as an optional story from the Classes screen):
- `src/`: the movie (`z6-movie-reaper.js`) and its lip-sync data (`z5a-movievoice.js`). It needs MOVIE1 and FILM1, which are still in the game.
- `audio/reaper/`: its 32 voice lines and score.
- The tools that made it: `record.js` (voices), `cues.js`, `score.js` with `score-reaper.txt` (music; it also needs `../../score-engine.txt`), and `mix.js`. The script and storyboard are in `docs/class-movies/`.
