# MVM Group audit fixes and completion plan

> Implement the user-approved verification report in this session with disjoint agent ownership and a final integrated review.

**Goal:** Fix every verified defect, finish the useful exploration/planning improvements described in the approved report, and deliver one working local build.

**Architecture:** Preserve the vanilla JavaScript/static-page project and shared UI kit. Keep new discovery/planning interactions in focused modules, share markup where needed with the static builder, and retain native links, keyboard controls and progressive disclosure.

**Tech Stack:** Existing ESM JavaScript, CSS, Python local server, esbuild, Node test runner and Playwright.

**Spec:** `docs/claude-work-verification-2026-10-22.md` and its accepted copy direction, authorized by the user's “แก้ตามที่คุณว่ามาทั้งหมดเลยครับ”.

## Constraints

- Keep the forest-green/cream/gold identity, attractive photographs, compact package grids and icon-only slideshow controls.
- Support Thai, Lao, English and Simplified Chinese; preserve destinations, prices, sample status and contact/message semantics.
- Never invent company contacts, people, credentials, customer reviews, schedules or seasonal suitability.
- Retain readable no-JavaScript/failure fallback, reduced motion, visible close controls, native scrolling and keyboard operation.
- Back up the editable source. This checkout has no Git repository; do not create an unrelated repository or worktree.
- Company contacts are requested asynchronously; all independent implementation continues meanwhile.

## Review focus

- Slow locale loading and repeated choices: only the latest choice wins, even when selecting the current language.
- Pointer/touch/focus map selection: no floating element may block a province link; preview and regional zoom stay within the map.
- Module failure: one readable fallback with working links, no duplicated heading or dead controls.
- Paused/offscreen/reduced-motion animations: every associated animation must pause/cancel and clean up.
- New saved-list, form and viewer gestures: preserve entered data, reading scroll, native links, sample disclosures and focus recovery.

## Tasks

### 1. Foundation and map

**Files:** `dist/app.js`, `dist/i18n.js`, `dist/trip-tools.js`, `dist/ui-kit.js`, `scripts/build-static.mjs`, focused new map/search files, regression test file.

- [x] Add focused failing browser regressions for language race, cross-language search before opening the menu, module startup failure and real map pointer selection.
- [x] Replace blocking map tooltip behavior with an adjacent photograph preview. Keep province links as direct navigation on click/tap and focus preview usable from keyboard. Add regional framing and reuse the component on Home after integration.
- [x] Guard asynchronous language changes with a latest-request token. Provide a small multilingual search index independent of full descriptive translations.
- [x] Correct shell/fallback markup, inline filter translations and duplicate gallery accessible names.
- [x] Verify targeted regressions and return ownership of app/UI-kit to the integrator.

### 2. Motion, accessibility and mobile viewer

**Files:** `dist/hero-experience.js`, `dist/motion.css`, appropriate existing CSS, new `dist/viewer-gestures.js`, focused browser tests. App integration by root after task 1.

- [x] Demonstrate Pause drift and CSS lift failures with behavior assertions.
- [x] Synchronize hero timer/progress/drift. Correct card transition cascade and keep reduced-motion behavior.
- [x] Correct credits target spacing, failed-image contrast and mobile composition. Use image slot sizes matching the displayed width.
- [x] Provide an optional sheet-handle gesture controller with threshold/cancel cleanup and no interception of normal content scrolling. Preserve explicit close and horizontal place navigation.
- [x] Verify on desktop/touch emulation, keyboard and reduced motion.

### 3. Natural copy and truthful company slots

**Files:** `dist/content.js`, `dist/home-discovery.js`, `dist/locales/*.js`, copy replacement manifest for source files owned by task 1, documentation.

- [x] Apply the evidence-backed natural wording in the copy audit while preserving factual values and proper names.
- [x] Keep current and revised English catalog keys compatible until source integration completes; verify templates and full four-language coverage.
- [x] Prepare a documented empty welcome slot with complete language fields, rendered conditionally on Home and About.
- [x] Reduce unnecessary homepage repetition using existing licensed images and correct premature comments.

### 4. Discovery and planning completion

**Files:** Focused new discovery/planning data/UI modules, a scoped stylesheet, app integration and focused tests.

- [x] Reuse the fixed map on Home with clear region selection and place preview.
- [x] Add explicit month metadata derived only from existing stated month ranges. Unknown months mean no specific recommendation data, never “cannot travel”.
- [x] Add a compact Luang Prabang day story from existing place/time content with manual controls, optional play/pause and reduced-motion/offscreen cleanup.
- [x] Add compact daily photographs and route overview to package details, with a desktop sticky price panel.
- [x] Add persistent saved-place reordering using accessible up/down buttons and optional drag, a linked route overview and unchanged inquiry context.
- [x] Improve inquiry summary with destination imagery and progressive steps without adding required information; preserve all draft fields across locale switches and navigation. Ensure the final action still creates a message for review rather than silently sending it.

### 5. Delivery, integration and verification

**Files:** `เปิดเว็บ.command`, `scripts/` launcher support, `dist/index.html`, `package.json`, README and update report.

- [x] Make the launcher install required dependencies when missing, build first, and serve `build/`; detect a conflicting server clearly.
- [x] Install locked dependencies and produce minified assets. Use image-identity checks for shared transitions; keep Back reliable without requiring decorative reverse motion.
- [x] Integrate app changes sequentially and validate syntax, complete unit and browser suites.
- [x] Run one batched desktop/mobile visual and accessibility pass across the new surfaces; fix material findings in one batch and confirm once.
- [x] Build the actual deliverable and open the local preview. Record finished work, tests and any real company data still awaiting the owner.

## Verification commands

`npm run check`, `npm test`, `npm run test:browser`, focused new browser tests, axe-core route/state checks and screenshots at 320/390/768/1440px. New behavioral regressions must fail before their corresponding production fixes. Pure copy/spacing changes use existing coverage and rendered checks rather than tests that duplicate the implementation.

## Delivery result

Completed 22 October 2026. Syntax checks, 54 unit tests and 63 browser tests pass. All 128 responsive/language states have no detected overflow, missing images or runtime errors; 32 selected axe states have no violations after the one correction batch. The actual build is served on 127.0.0.1:4173 and the Thai preview is open. Detailed changes and owner-data limits: `docs/audit-fixes-2026-10-22.md`. Real contact channels remain blank pending owner input; all conditional display and inquiry-copy/download behavior is complete.
