# Chess.com — atmosphere to clarity

One desktop pre-game screen and its first-click supporting state for the Inter Inter Studio design assignment. The original Chess.com logo, navigation icons, account presence, board texture, and piece sprites are retained.

## Interaction

Rapid · 10 min is the default. A time selector and Start Game button sit together at the center of the board as a screen-facing overlay. The selector offers Rapid, Blitz, and Bullet, with keyboard-accessible radio options. Start Game dismisses the overlay, flattens the board, settles the piece images, and reveals player bars and the selected time. Back to Play reverses the same scene. Fog is currently removed. This is an interaction prototype: no live opponent, matchmaking, chess engine, or legal-move handling is connected.

The right-side game panel remains visible in both states with New Game / Games / Players, defaulting to New Game. Analysis and its nested tools are removed. The panel uses transparent surfaces without card borders, filled tab boxes, or boxed rows. Move playback controls are disabled because this prototype has no recorded moves.

The screen fits within 100dvh, including a dark Advertisement placeholder in the right column. There is no below-screen advertising section or active ad creative. The top-right username is removed; the account remains in the original left sidebar. Sidebar links lead to the corresponding Chess.com pages. Added taglines, greetings, status slogans, and membership marketing copy have been removed.

## Fake 3D approach

React controls ready → revealing → playing. CSS perspective and transforms render a single persistent board; no WebGL, 3D engine, generated art, or models are needed.

- Existing board texture on a plane tilted 39° about the X axis.
- Existing transparent piece PNGs counter-rotated 27° around their bases, like cutouts.
- A shallow board base, contact shadows, and subtle lighting provide depth, without fog.
- Camera and pieces settle together over 720 ms; the launch overlay fades out immediately; supporting UI starts appearing after 360 ms.
- Reduced-motion preferences make the transition immediate. Hidden controls are inert; focus moves to Back to Play after reveal and returns to Play on reset.
- Buttons and tabs compress to 95% on press over 90 ms, then recover over 380 ms with a soft easing curve. Reduced-motion preferences disable the scale effect.

The visual settings are grouped in `app/globals.css` under the scene and commit comments. All source assets are local; see `references/README.md` for provenance.

## Run and verification

`npm run dev` for the local preview; `npm run build` for production output.

Verified with production compilation, TypeScript, lint of modified app files, and a successful local HTTP render. Animation and keyboard interactions have not been browser-tested in this pass.
