# Karachi Runner - Agent Guidelines

## Deployment & Release Protocol

1. **Local Changes & Validation (Allowed Autonomously)**:
   - You may modify code, build bundles locally (`npm run build`, `npx vite build`), run the local dev server (`npm run dev`), and execute automated test suites (`npm test`, `npm run test:ops`, `node scripts/test_runner.js`) after every iteration without asking for permission.

2. **External Deployment & Publishing Gate (Explicit Confirmation Required)**:
   - **GitHub**: ALWAYS ask for user confirmation before pushing to remote (`git push origin main`) or deploying to GitHub Pages (`node scripts/deploy_pages.mjs` / `gh-pages`).
   - **Google Play Console**: ALWAYS ask for user confirmation before building release bundles and uploading/publishing to Google Play Console (`npm run release:play`, `node scripts/publish_play_console.mjs`, `node scripts/release_next.mjs`).
   - When asking for confirmation, summarize the exact changes made, test results, and specify the target tracks (e.g. `internal` and `alpha`).
