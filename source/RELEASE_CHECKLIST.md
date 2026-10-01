# General Portfolio Release

## Build and Static Review

Run `node scripts/build_edition.mjs general`. The general edition preserves the reviewed resume PDF by default. Do not use `--reprint-resume` without separately reviewing the regenerated document.

Run `npm run qa:release`. A static-only pass reports `STATIC_PASS_RUNTIME_PENDING`; it is not a release approval. The gate checks facts, internal links, evidence, wording, featured layouts, motion fallbacks, and reviewed PDF hashes.

## Browser Review

Use the connected browser on the new export. Inspect actual rendered screens, not only extracted text. Record the export fingerprint from `node scripts/qa_release.mjs --fingerprint` with the browser results.

- Home widths: 360, 390, 768, 1024, and 1440 pixels. Record the actual client width, not only the requested size.
- Home, resume, and all nine case pages at both 390 and 1440 pixels. Check horizontal overflow, failed images, headings, and site console errors.
- Capture intermediate and completed count-up values for the hero and a case. Their measured widths must stay fixed. Final numbers alone do not demonstrate animation.
- Test the mobile menu, case index, detail navigation, original evidence, email copy and notification, both PDFs, and the automation demo.
- Inspect at least eight fresh screenshots. Record unresolved issues honestly. Preserve image formats returned by the browser instead of assuming PNG.
- Preserve metric definitions, comparison periods, personal contribution, and source/production credits.
- The reduced-motion and hidden-tab tests execute the actual component with controlled dependencies. They do not replace a real-device accessibility assessment.

The browser record follows the contract in `scripts/release_contract.mjs`. Review the JSON before approving it; the gate cannot determine whether an observation was truthful.

Run `npm run qa:release -- --approve --runtime=PATH_TO_RUNTIME_JSON --report=PATH_TO_RELEASE_JSON`. Missing, stale, incomplete, or failing evidence must block approval.

## Publish

Check for concurrent source edits and remote commits. Publish only the reviewed export to the general portfolio repository. Keep other editions and the reviewed PDF files intact. After GitHub Pages succeeds, verify the live HTML and referenced CSS/JS hashes, inspect desktop/mobile again, and verify PDF downloads. A successful build alone is not a successful deployment.

The gate protects the documented release criteria. It does not promise a hiring outcome, subjective perfection, or compatibility with every future browser version.
