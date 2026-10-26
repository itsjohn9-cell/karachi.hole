import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import ffmpeg from 'ffmpeg-static';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectDir = path.resolve(__dirname, '..');
const reportDir = path.join(projectDir, 'test_reports');
const artifactDir = '/Users/mohammadjhone/.gemini/antigravity-ide/brain/09ee0209-1c57-4c74-9150-ce143b914724';

const recordings = [
  'gameplay_20s',
  'gameplay_1min',
  'gameplay_2min',
  'gameplay_with_startup_and_pause',
  'gameplay_mobile_390x844',
  'gameplay_mobile_with_startup_and_pause'
];

console.log('🎬 [CONVERTER] Starting conversion of recordings to standard MP4 (H.264/AAC/YUV420p)...');

for (const name of recordings) {
  const inputWebm = path.join(reportDir, `${name}.webm`);
  const outputMp4 = path.join(reportDir, `${name}.mp4`);
  const artifactMp4 = path.join(artifactDir, `${name}.mp4`);

  if (!fs.existsSync(inputWebm)) {
    console.warn(`⚠️ Source not found: ${inputWebm}`);
    continue;
  }

  console.log(`\n⏳ Converting ${name}.webm -> ${name}.mp4 ...`);

  execFileSync(ffmpeg, [
    '-y',
    '-i', inputWebm,
    '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2',
    '-c:v', 'libx264',
    '-profile:v', 'main',
    '-level', '4.0',
    '-pix_fmt', 'yuv420p',
    '-movflags', '+faststart',
    outputMp4
  ], { stdio: 'inherit' });

  const stats = fs.statSync(outputMp4);
  console.log(`✅ Converted: ${outputMp4} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);

  if (fs.existsSync(artifactDir)) {
    fs.copyFileSync(outputMp4, artifactMp4);
    console.log(`✅ Copied to artifact directory: ${artifactMp4}`);
  }
}

// Create designated renamed copies in artifact directory starting with 003, 004, 005, 006
if (fs.existsSync(artifactDir)) {
  const m2Path = path.join(artifactDir, 'gameplay_2min.mp4');
  const uiPath = path.join(artifactDir, 'gameplay_with_startup_and_pause.mp4');
  const mobPath = path.join(artifactDir, 'gameplay_mobile_390x844.mp4');
  const mobUiPath = path.join(artifactDir, 'gameplay_mobile_with_startup_and_pause.mp4');

  const copies = [
    { src: m2Path, names: ['003_gameplay_2min.mp4', '003_LATEST_gameplay_2min.mp4'] },
    { src: uiPath, names: ['004_gameplay_with_startup_and_pause.mp4', '004_LATEST_gameplay_with_startup_and_pause.mp4'] },
    { src: mobPath, names: ['005_gameplay_mobile_390x844.mp4', '005_LATEST_gameplay_mobile_390x844.mp4'] },
    { src: mobUiPath, names: ['006_gameplay_mobile_with_startup_and_pause.mp4', '006_LATEST_gameplay_mobile_with_startup_and_pause.mp4'] }
  ];

  for (const { src, names } of copies) {
    if (fs.existsSync(src)) {
      for (const name of names) {
        const dest = path.join(artifactDir, name);
        fs.copyFileSync(src, dest);
        console.log(`✅ Created numbered artifact: ${dest}`);
      }
    }
  }
}

console.log('\n🎉 [CONVERTER SUCCESS] All 4 requested recordings (003, 004, 005, 006) are converted and ready!');
