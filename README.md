# Dmitrii Iarochkin — portfolio

Public professional portfolio at https://yafufig.github.io/.

Static HTML, CSS and JavaScript, hosted with GitHub Pages from `main`. The main interaction is a chrome feedback-loop sculpture made with Three.js. Work focuses link to real evaluation, agent and robotics cases. It renders only while settling or responding to input, pauses offscreen, and respects reduced motion. A static SVG remains available if WebGL cannot render.

The site presents all six work experiences from the owner’s LinkedIn profile, verified on 7 October 2026, plus a FIRST Tech Challenge case. The FM Logistic proposal is part of Darkstore u Doma. Tasks are grouped by role. No private employment code, datasets, contact details or CV PDFs are published. Removed MiniCEO source links and discarded cases remain excluded.

## Preview

Run `python3 -m http.server 8765` and open http://127.0.0.1:8765/.

## Rebuild the sculpture

Run `npm ci` and `npm run build` after editing `hero-scene.js`. The committed `assets/hero-scene.bundle.js` is ready to serve without a build step. `script.js` controls the company index, work filters, focus captions and the awards tooltip.

Bricolage Grotesque and DM Sans are served locally. Their SIL Open Font Licenses are in `assets/fonts/`. The Three.js MIT license is in `assets/THREE-LICENSE.txt`.
