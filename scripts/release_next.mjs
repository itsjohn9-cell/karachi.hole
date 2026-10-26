#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { google } from 'googleapis';

const PACKAGE_NAME = 'pk.karachi.runner';
const POSSIBLE_KEY_PATHS = [
  process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_KEY,
  path.resolve(process.env.HOME || '', '.karachi-runner-keys/play-service-account.json'),
  path.resolve(process.env.HOME || '', '.karachi-runner-keys/service-account.json'),
  path.resolve('play-service-account.json')
].filter(Boolean);

let keyPath = POSSIBLE_KEY_PATHS.find(p => fs.existsSync(p));
if (!keyPath) {
  console.error('❌ Service Account Key not found for Play Console auto-increment.');
  process.exit(1);
}

const key = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
const auth = new google.auth.JWT({
  email: key.client_email,
  key: key.private_key,
  scopes: ['https://www.googleapis.com/auth/androidpublisher']
});
const play = google.androidpublisher({ version: 'v3', auth });

async function autoRelease() {
  console.log('====================================================');
  console.log('   KARACHI RUNNER - AUTO-INCREMENT RELEASE PIPELINE ');
  console.log('====================================================');

  console.log('🔍 [1/5] Checking latest Version Codes on Google Play...');
  const edit = await play.edits.insert({ packageName: PACKAGE_NAME });
  const bundlesRes = await play.edits.bundles.list({
    packageName: PACKAGE_NAME,
    editId: edit.data.id
  });
  const existingCodes = (bundlesRes.data.bundles || [])
    .map(b => Number(b.versionCode))
    .filter(n => !isNaN(n));

  const maxCode = existingCodes.length > 0 ? Math.max(...existingCodes) : 24;
  const nextCode = maxCode + 1;
  console.log(`✔ Highest existing Version Code on Play Console: ${maxCode}`);
  console.log(`✔ Next Version Code targeted: ${nextCode}`);

  // Bump version in package.json
  const pkgPath = path.resolve('package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  const currentVer = pkg.version || '2.2.2';
  const parts = currentVer.split('.').map(Number);
  parts[parts.length - 1] = (parts[parts.length - 1] || 0) + 1;
  const nextVer = parts.join('.');

  console.log(`🚀 [2/5] Bumping version to ${nextVer} (Code: ${nextCode})...`);
  pkg.version = nextVer;
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');

  // Update src/main.js
  const mainJsPath = path.resolve('src/main.js');
  let mainJs = fs.readFileSync(mainJsPath, 'utf8');
  mainJs = mainJs.replace(/appVersion:\s*['"][^'"]+['"]/, `appVersion: '${nextVer}'`);
  fs.writeFileSync(mainJsPath, mainJs);

  // Update android/app/build.gradle fallback
  const gradlePath = path.resolve('android/app/build.gradle');
  let gradle = fs.readFileSync(gradlePath, 'utf8');
  gradle = gradle.replace(/releaseVersionCodeValue\s*=\s*project\.findProperty\('releaseVersionCode'\)\s*\?:.*?System\.getenv\('KARACHI_RUNNER_VERSION_CODE'\)\s*\?:\s*'\d+'/, `releaseVersionCodeValue = project.findProperty('releaseVersionCode') ?: System.getenv('KARACHI_RUNNER_VERSION_CODE') ?: '${nextCode}'`);
  gradle = gradle.replace(/def pkgVersion = ".*?"/, `def pkgVersion = "${nextVer}"`);
  fs.writeFileSync(gradlePath, gradle);

  console.log('🚀 [3/5] Building Android App Bundle (.aab)...');
  execSync(`export JAVA_HOME="/opt/homebrew/opt/openjdk@21" && export PATH="/opt/homebrew/opt/openjdk@21/bin:$PATH" && export KARACHI_RUNNER_VERSION_CODE=${nextCode} && export KARACHI_RUNNER_VERSION_NAME=${nextVer} && npm run build:android:aab`, {
    stdio: 'inherit'
  });

  console.log('\n🚀 [4/5] Publishing to Google Play Console (Internal & Closed Testing)...');
  execSync('node scripts/publish_play_console.mjs --tracks=internal,alpha', {
    stdio: 'inherit'
  });

  console.log('\n🚀 [5/5] Deploying Web to GitHub Pages...');
  execSync('node scripts/deploy_pages.mjs', {
    stdio: 'inherit'
  });

  console.log('====================================================');
  console.log(`🎉 RELEASE ${nextVer} (Code ${nextCode}) IS FULLY LIVE!`);
  console.log('====================================================\n');
}

autoRelease().catch(err => {
  console.error('\n❌ Auto-Release Failed:', err);
  process.exit(1);
});
