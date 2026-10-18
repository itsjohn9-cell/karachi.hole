#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { ApkSigner, SigningKey } from 'apk_sign_ts';

const rootDir = process.cwd();
const templateApk = path.join(rootDir, 'android', 'base-template.apk');
const keyPath = path.join(rootDir, 'android', 'keystores', 'debug.key.pem');
const certPath = path.join(rootDir, 'android', 'keystores', 'debug.cert.pem');
const outputApk = path.join(rootDir, 'karachi-hole.apk');
const workApk = path.join('/tmp', `work-${Date.now()}.apk`);

console.log('====================================================');
console.log('  KARACHI HOLE.IO - STANDALONE APK BUILD & SIGNER   ');
console.log('====================================================');

if (!fs.existsSync(templateApk)) {
  console.error(`[ERROR] Base template APK not found at: ${templateApk}`);
  process.exit(1);
}

if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
  console.log('[KEYGEN] Generating fresh debug key & certificate...');
  fs.mkdirSync(path.dirname(keyPath), { recursive: true });
  execSync(`openssl req -x509 -newkey rsa:2048 -nodes -keyout "${keyPath}" -out "${certPath}" -days 10000 -subj "/CN=Android Debug/O=Android/C=US"`);
}

// 1. Ensure Vite production build exists
const distIndex = path.join(rootDir, 'dist', 'index.html');
if (!fs.existsSync(distIndex)) {
  console.log('[BUILD] Running vite production build...');
  execSync('npm run build', { stdio: 'inherit' });
}

// 2. Sync web assets with Capacitor
console.log('[CAPACITOR] Syncing web assets to Android...');
execSync('npx cap copy android', { stdio: 'inherit' });

// 3. Prepare working APK from clean base template
console.log('[PREPARE] Copying clean base template...');
fs.copyFileSync(templateApk, workApk);

// 4. Inject current production web assets into APK assets/public/
console.log('[PACK] Injecting web assets and config into APK...');
const androidMain = path.join(rootDir, 'android', 'app', 'src', 'main');
execSync(`cd "${androidMain}" && zip -r "${workApk}" assets/public assets/capacitor.config.json`, { stdio: 'pipe' });

// 5. Read APK data for signing
console.log('[SIGN] Signing APK with JAR v1, APK Scheme v2 and v3 signatures...');
const apkBytes = new Uint8Array(fs.readFileSync(workApk));
const privateKey = fs.readFileSync(keyPath, 'utf8');
const certificate = fs.readFileSync(certPath, 'utf8');

const signer = new ApkSigner({
  signingKey: SigningKey.fromPEM(privateKey, certificate)
});

const { signedApk } = await signer.sign(apkBytes);

// 6. Write signed APK to target destinations
fs.writeFileSync(outputApk, signedApk);

const debugOutputDir = path.join(rootDir, 'android', 'app', 'build', 'outputs', 'apk', 'debug');
fs.mkdirSync(debugOutputDir, { recursive: true });
fs.writeFileSync(path.join(debugOutputDir, 'app-debug.apk'), signedApk);

// Clean up temp file
try { fs.unlinkSync(workApk); } catch (e) {}

const stats = fs.statSync(outputApk);
console.log('----------------------------------------------------');
console.log(`✔ SUCCESS! Signed APK created: ${outputApk}`);
console.log(`✔ Size: ${(stats.size / (1024 * 1024)).toFixed(2)} MB (${stats.size} bytes)`);
console.log('✔ Signatures embedded: JAR v1, APK Signature Scheme v2, APK Scheme v3');
console.log('====================================================');
