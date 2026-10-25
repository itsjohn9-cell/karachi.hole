import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 [DEPLOY] Building production web bundle...');
execSync('npm run build', { stdio: 'inherit' });

const distDir = path.resolve('dist');
if (!fs.existsSync(distDir)) {
  console.error('❌ dist directory does not exist.');
  process.exit(1);
}

// Ensure .nojekyll exists
fs.writeFileSync(path.join(distDir, '.nojekyll'), '');

console.log('📦 [DEPLOY] Fetching and syncing dist to origin/gh-pages...');
execSync('git fetch origin gh-pages', { stdio: 'inherit' });

const tempDir = path.resolve('.gh-pages-temp');
try {
  if (fs.existsSync(tempDir)) {
    execSync(`git worktree remove --force "${tempDir}"`, { stdio: 'ignore' });
  }
} catch {}

try {
  execSync(`git worktree add --detach "${tempDir}" origin/gh-pages`, { stdio: 'inherit' });

  // Clean old files in worktree except .git
  const entries = fs.readdirSync(tempDir);
  for (const entry of entries) {
    if (entry === '.git') continue;
    fs.rmSync(path.join(tempDir, entry), { recursive: true, force: true });
  }

  // Copy dist to worktree
  fs.cpSync(distDir, tempDir, { recursive: true });

  execSync(`git -C "${tempDir}" add --all`, { stdio: 'inherit' });

  const status = execSync(`git -C "${tempDir}" status --porcelain`).toString().trim();
  if (!status) {
    console.log('✔ [DEPLOY] Website bundle is identical to current gh-pages. No commit needed.');
  } else {
    const headCommit = execSync('git rev-parse --short HEAD').toString().trim();
    execSync(`git -C "${tempDir}" commit -m "Deploy website from ${headCommit} (web admin & security gate)"`, { stdio: 'inherit' });
    execSync(`git push origin HEAD:gh-pages`, { cwd: tempDir, stdio: 'inherit' });
    console.log('🎉 [DEPLOY] Successfully deployed to GitHub Pages (gh-pages)!');
  }
} finally {
  try {
    execSync(`git worktree remove --force "${tempDir}"`, { stdio: 'ignore' });
  } catch {}
}
