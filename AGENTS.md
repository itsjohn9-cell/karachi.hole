# Karachi Runner - Agent Guidelines

## Deployment & Release Protocol

1. **Local Changes & Validation (Allowed Autonomously)**:
   - You may modify code, build bundles locally (`npm run build`, `npx vite build`), run the local dev server (`npm run dev`), and execute automated test suites (`npm test`, `npm run test:ops`, `node scripts/test_runner.js`) after every iteration without asking for permission.

2. **External Deployment & Publishing Gate (Explicit Confirmation Required)**:
   - When going live upon user confirmation, always execute all three release channels together via `npm run release:next`:
     1. **Git Push Live**: Push latest commits to `origin/main` and deploy to GitHub Pages (`node scripts/deploy_pages.mjs`).
     2. **Play Console Push**: Build release bundle (`.aab`) and publish to Google Play Console `internal` and `alpha` tracks (`node scripts/publish_play_console.mjs`).
     3. **GitHub APK Release (Manual Download)**: Build signed `.apk` and publish to GitHub Releases with permanent direct download link:
        `https://github.com/itsjohn9-cell/karachi.hole/releases/latest/download/karachi-runner-latest.apk`
   - When asking for confirmation, summarize the exact changes made, test results, and specify all three release destinations.
