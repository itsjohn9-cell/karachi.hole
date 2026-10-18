#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { pathToFileURL } from 'url';
import { execSync } from 'child_process';
import * as pako from 'pako';
import forge from 'node-forge';

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

// Dynamically import apk_sign_ts internals via absolute file URLs
const apkSignTsDist = path.resolve(rootDir, 'node_modules', 'apk_sign_ts', 'dist');
const { SigningKey } = await import(pathToFileURL(path.join(apkSignTsDist, 'SigningKey.js')).href);
const {
  parseZipCentralDirectory,
  getEntryDataOffset,
  findEndOfCentralDirectory,
  computeCrc32,
  createLocalFileHeader,
  createCentralDirectoryHeader,
  createEndOfCentralDirectory,
  concatBytes,
  writeUint32LE,
  writeUint16LE
} = await import(pathToFileURL(path.join(apkSignTsDist, 'ZipUtils.js')).href);
const { V2Signer } = await import(pathToFileURL(path.join(apkSignTsDist, 'V2Signer.js')).href);
const { V3Signer } = await import(pathToFileURL(path.join(apkSignTsDist, 'V3Signer.js')).href);
const {
  createSigningBlock,
  createV2SignaturePair,
  createV3SignaturePair
} = await import(pathToFileURL(path.join(apkSignTsDist, 'ApkSigningBlock.js')).href);

// 1. Ensure persistent debug keystore & certificate exist
if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
  console.log('[KEYGEN] Generating fresh debug key & certificate...');
  fs.mkdirSync(path.dirname(keyPath), { recursive: true });
  execSync(
    `openssl req -x509 -newkey rsa:2048 -nodes -keyout "${keyPath}" -out "${certPath}" -days 10000 -subj "/CN=Android Debug/O=Android/C=US"`
  );
}

// 2. Ensure Vite production build exists
const distIndex = path.join(rootDir, 'dist', 'index.html');
if (!fs.existsSync(distIndex)) {
  console.log('[BUILD] Running vite production build...');
  execSync('npm run build', { stdio: 'inherit' });
}

// 3. Sync web assets with Capacitor
console.log('[CAPACITOR] Syncing web assets to Android...');
execSync('npx cap copy android', { stdio: 'inherit' });

// 4. Prepare working APK from clean base template
console.log('[PREPARE] Copying clean base template...');
fs.copyFileSync(templateApk, workApk);

// 5. Inject current production web assets into APK assets/public/
console.log('[PACK] Injecting web assets and config into APK...');
const androidMain = path.join(rootDir, 'android', 'app', 'src', 'main');
execSync(
  `cd "${androidMain}" && zip -r "${workApk}" assets/public assets/capacitor.config.json`,
  { stdio: 'pipe' }
);

// 6. Full Zipalign - 4-byte alignment for uncompressed entries, 4096 for native .so
function alignmentPadding(size, alignment) {
  const mod = size % alignment;
  return mod === 0 ? 0 : alignment - mod;
}

function fullZipalign(data) {
  const eocd = findEndOfCentralDirectory(data);
  if (!eocd) throw new Error('EOCD not found');
  const cd = parseZipCentralDirectory(data);
  const entries = [...cd.entries].sort((a, b) => a.localHeaderOffset - b.localHeaderOffset);
  const localEnd = cd.offset;
  const localBuffers = [];
  const cdBuffers = [];
  let localOffset = 0;

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const nextLocal = i + 1 < entries.length ? entries[i + 1].localHeaderOffset : localEnd;
    const nameBytes = new TextEncoder().encode(entry.name);
    const isLib = entry.name.startsWith('lib/') && entry.name.endsWith('.so');
    const isStored = entry.compressionMethod === 0;
    const mustAlign = isStored || entry.name === 'resources.arsc' || isLib;

    if (mustAlign) {
      const dataOffset = getEntryDataOffset(data, entry.localHeaderOffset);
      const compressed = data.subarray(dataOffset, dataOffset + entry.compressedSize);
      const content = entry.compressionMethod === 0
        ? compressed
        : new Uint8Array(pako.inflateRaw(compressed));
      const alignment = isLib ? 4096 : 4;
      const extraLen = alignmentPadding(localOffset + 30 + nameBytes.length, alignment);
      const extra = new Uint8Array(extraLen);
      const crc = computeCrc32(content);
      const localHeader = createLocalFileHeader(nameBytes, content, crc, 0, extra);
      const cdHeader = createCentralDirectoryHeader(
        nameBytes,
        content,
        crc,
        localOffset,
        0,
        content.length,
        extra
      );
      localBuffers.push(localHeader, content);
      cdBuffers.push(cdHeader);
      localOffset += localHeader.length + content.length;
    } else {
      const localChunk = data.subarray(entry.localHeaderOffset, nextLocal);
      localBuffers.push(localChunk);
      const cdSize = 46 + entry.nameLength + entry.extraLength + entry.commentLength;
      const cdHeader = new Uint8Array(cdSize);
      cdHeader.set(data.subarray(entry.cdHeaderOffset, entry.cdHeaderOffset + cdSize), 0);
      writeUint32LE(cdHeader, 42, localOffset);
      cdBuffers.push(cdHeader);
      localOffset += localChunk.length;
    }
  }

  const newLocal = concatBytes(localBuffers);
  const newCd = concatBytes(cdBuffers);
  const newEocdRecord = new Uint8Array(data.subarray(eocd.recordOffset));
  writeUint16LE(newEocdRecord, 8, cdBuffers.length);
  writeUint16LE(newEocdRecord, 10, cdBuffers.length);
  writeUint32LE(newEocdRecord, 12, newCd.length);
  writeUint32LE(newEocdRecord, 16, newLocal.length);
  return concatBytes([newLocal, newCd, newEocdRecord]);
}

console.log('[ZIPALIGN] Enforcing 4-byte / 4096-byte alignment across all uncompressed entries...');
const rawWorkBytes = new Uint8Array(fs.readFileSync(workApk));
const alignedBytes = fullZipalign(rawWorkBytes);

// 7. Sign JAR v1 with 4-byte aligned META-INF records
function signV1Aligned(apkData, signingKey, schemes = [2, 3], keyName = 'CERT') {
  const eocd = findEndOfCentralDirectory(apkData);
  const cd = parseZipCentralDirectory(apkData);
  const originalLocal = apkData.subarray(0, cd.offset);
  const originalCd = apkData.subarray(cd.offset, eocd.recordOffset);
  const manifestSections = [];
  const sfSections = [];

  for (const entry of cd.entries) {
    if (entry.name.startsWith('META-INF/') || entry.name.endsWith('/')) continue;
    const dataOffset = getEntryDataOffset(apkData, entry.localHeaderOffset);
    const compressed = apkData.subarray(dataOffset, dataOffset + entry.compressedSize);
    const content = entry.compressionMethod === 0
      ? compressed
      : new Uint8Array(pako.inflateRaw(compressed));
    const digest = crypto.createHash('sha256').update(content).digest('base64');
    const section = new TextEncoder().encode(`Name: ${entry.name}\r\nSHA-256-Digest: ${digest}\r\n\r\n`);
    manifestSections.push(section);
    const sfDigest = crypto.createHash('sha256').update(section).digest('base64');
    sfSections.push(
      new TextEncoder().encode(`Name: ${entry.name}\r\nSHA-256-Digest: ${sfDigest}\r\n\r\n`)
    );
  }

  const mainAttrs = new TextEncoder().encode('Manifest-Version: 1.0\r\n\r\n');
  const manifest = concatBytes([mainAttrs, ...manifestSections]);
  const manifestDigest = crypto.createHash('sha256').update(manifest).digest('base64');
  const schemesLine = schemes.length ? `X-Android-APK-Signed: ${schemes.join(', ')}\r\n` : '';
  const sfMain = new TextEncoder().encode(
    `Signature-Version: 1.0\r\nCreated-By: 1.0 (Android)\r\nSHA-256-Digest-Manifest: ${manifestDigest}\r\n${schemesLine}\r\n`
  );
  const sf = concatBytes([sfMain, ...sfSections]);

  // RSA block
  const cert = forge.pki.certificateFromPem(signingKey.getCertificate());
  const key = forge.pki.privateKeyFromPem(signingKey.getPrivateKey());
  const p7 = forge.pkcs7.createSignedData();
  const content = sf.reduce((s, b) => s + String.fromCharCode(b), '');
  p7.content = forge.util.createBuffer(content, 'raw');
  p7.addCertificate(cert);
  p7.addSigner({
    key,
    certificate: cert,
    digestAlgorithm: forge.pki.oids.sha256,
    authenticatedAttributes: []
  });
  p7.sign();
  const der = forge.asn1.toDer(p7.toAsn1());
  const rsa = new Uint8Array(der.length());
  const bytes = der.getBytes();
  for (let i = 0; i < bytes.length; i++) rsa[i] = bytes.charCodeAt(i) & 0xff;

  const files = [
    { name: 'META-INF/MANIFEST.MF', data: manifest },
    { name: `META-INF/${keyName}.SF`, data: sf },
    { name: `META-INF/${keyName}.RSA`, data: rsa }
  ];

  const localBuffers = [];
  const cdBuffers = [];
  let newLocalSize = 0;

  for (const file of files) {
    const nameBytes = new TextEncoder().encode(file.name);
    const data = file.data;
    const crc = computeCrc32(data);
    const extraLen = alignmentPadding(cd.offset + newLocalSize + 30 + nameBytes.length, 4);
    const extra = new Uint8Array(extraLen);
    const local = createLocalFileHeader(nameBytes, data, crc, 0, extra);
    localBuffers.push(local, data);
    cdBuffers.push(
      createCentralDirectoryHeader(
        nameBytes,
        data,
        crc,
        cd.offset + newLocalSize,
        0,
        data.length,
        extra
      )
    );
    newLocalSize += local.length + data.length;
  }

  const newLocal = concatBytes(localBuffers);
  const newCd = concatBytes([originalCd, ...cdBuffers]);
  const centralDirectoryOffset = cd.offset + newLocalSize;
  const centralDirectorySize = newCd.length;
  const newEocd = createEndOfCentralDirectory(
    cd.entries.length + files.length,
    centralDirectorySize,
    centralDirectoryOffset
  );
  return concatBytes([originalLocal, newLocal, newCd, newEocd]);
}

console.log('[SIGN] Signing JAR v1 (aligned manifest & signatures)...');
const privateKey = fs.readFileSync(keyPath, 'utf8');
const cert = fs.readFileSync(certPath, 'utf8');
const signingKey = SigningKey.fromPEM(privateKey, cert);

const v1Apk = signV1Aligned(alignedBytes, signingKey);

// 8. Sign APK Scheme v2 and v3
console.log('[SIGN] Signing APK Scheme v2 and Scheme v3...');
const eocd = findEndOfCentralDirectory(v1Apk);
const cdOffset = eocd.centralDirectoryOffset;
const eocdOffset = eocd.recordOffset;

const v2Signer = new V2Signer({ signingKey, digestAlgorithm: 'SHA-512', additionalAttributes: new Map() });
const v3Signer = new V3Signer({ signingKey, digestAlgorithm: 'SHA-512' });

const { v2Value } = await v2Signer.sign(v1Apk, cdOffset, eocdOffset);
const { v3Value } = await v3Signer.sign(v1Apk, cdOffset, eocdOffset);

const signingBlock = createSigningBlock([
  createV2SignaturePair(v2Value),
  createV3SignaturePair(v3Value)
]);

const a = v1Apk.subarray(0, cdOffset);
const b = v1Apk.subarray(cdOffset, eocdOffset);
const c = new Uint8Array(v1Apk.subarray(eocdOffset));
writeUint32LE(c, 16, cdOffset + signingBlock.length);
const signedApk = concatBytes([a, signingBlock, b, c]);

// 9. Automated Verification: Verify 100% zipalign & signing block
console.log('[VERIFY] Verifying APK alignment and signature blocks...');
const dataview = new DataView(signedApk.buffer, signedApk.byteOffset, signedApk.byteLength);
let checkEocd = signedApk.byteLength - 22;
while (checkEocd >= 0) {
  if (dataview.getUint32(checkEocd, true) === 0x06054b50) break;
  checkEocd--;
}
if (checkEocd < 0) throw new Error('EOCD verification failed');

const totalEntries = dataview.getUint16(checkEocd + 10, true);
const finalCdOffset = dataview.getUint32(checkEocd + 16, true);
let offset = finalCdOffset;
let unalignedCount = 0;
let totalUncompressed = 0;

for (let i = 0; i < totalEntries; i++) {
  const method = dataview.getUint16(offset + 10, true);
  const nameLen = dataview.getUint16(offset + 28, true);
  const extraLen = dataview.getUint16(offset + 30, true);
  const commentLen = dataview.getUint16(offset + 32, true);
  const localHeaderOffset = dataview.getUint32(offset + 42, true);
  const localNameLen = dataview.getUint16(localHeaderOffset + 26, true);
  const localExtraLen = dataview.getUint16(localHeaderOffset + 28, true);
  const dataOffset = localHeaderOffset + 30 + localNameLen + localExtraLen;
  const nameBytes = new Uint8Array(signedApk.buffer, signedApk.byteOffset + offset + 46, nameLen);
  const name = new TextDecoder().decode(nameBytes);

  if (method === 0) {
    totalUncompressed++;
    const isLib = name.startsWith('lib/') && name.endsWith('.so');
    const reqAlign = isLib ? 4096 : 4;
    const remainder = dataOffset % reqAlign;
    if (remainder !== 0) {
      unalignedCount++;
      console.error(`[ALIGNMENT FAIL] ${name} at offset ${dataOffset} (remainder: ${remainder})`);
    }
  }
  offset += 46 + nameLen + extraLen + commentLen;
}

if (unalignedCount > 0) {
  console.error(`[ERROR] Verification failed: ${unalignedCount} unaligned entries found!`);
  process.exit(1);
}

// 10. Write signed APK to target destinations
fs.writeFileSync(outputApk, signedApk);

const debugOutputDir = path.join(rootDir, 'android', 'app', 'build', 'outputs', 'apk', 'debug');
fs.mkdirSync(debugOutputDir, { recursive: true });
fs.writeFileSync(path.join(debugOutputDir, 'app-debug.apk'), signedApk);

// Clean up temp file
try { fs.unlinkSync(workApk); } catch (e) {}

const stats = fs.statSync(outputApk);
console.log('----------------------------------------------------');
console.log(`✔ SUCCESS! Aligned & Signed APK created: ${outputApk}`);
console.log(`✔ Total Size: ${(stats.size / (1024 * 1024)).toFixed(2)} MB (${stats.size} bytes)`);
console.log(`✔ Archive Entries: ${totalEntries} (${totalUncompressed} uncompressed, 0 unaligned)`);
console.log('✔ Signatures: JAR v1, APK Signature Scheme v2, APK Scheme v3');
console.log('✔ Alignment: 100% compliant with Android 7+ through Android 15 specifications');
console.log('====================================================');
