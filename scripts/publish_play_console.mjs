#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { google } from 'googleapis';

const PACKAGE_NAME = 'pk.karachi.runner';
const DEFAULT_AAB_PATH = path.resolve('android/app/build/outputs/bundle/release/app-release.aab');

// Possible service account key locations
const POSSIBLE_KEY_PATHS = [
  process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_KEY,
  path.resolve(process.env.HOME || '', '.karachi-runner-keys/play-service-account.json'),
  path.resolve(process.env.HOME || '', '.karachi-runner-keys/service-account.json'),
  path.resolve('play-service-account.json'),
  path.resolve('.play-service-account.json')
].filter(Boolean);

// Parse CLI arguments: --tracks=internal,alpha, --track=internal, --draft, --aab=/path/to/file
const args = process.argv.slice(2);
let tracks = ['internal', 'alpha'];
let isDraft = false;
let aabPath = DEFAULT_AAB_PATH;

args.forEach(arg => {
  if (arg.startsWith('--tracks=')) tracks = arg.split('=')[1].split(',').map(t => t.trim()).filter(Boolean);
  else if (arg.startsWith('--track=')) tracks = arg.split('=')[1].split(',').map(t => t.trim()).filter(Boolean);
  else if (arg === '--draft') isDraft = true;
  else if (arg.startsWith('--aab=')) aabPath = path.resolve(arg.split('=')[1]);
});

console.log('====================================================');
console.log('   KARACHI RUNNER - GOOGLE PLAY AUTO-PUBLISHER      ');
console.log('====================================================');
console.log(`📦 Package ID : ${PACKAGE_NAME}`);
console.log(`🎯 Target Tracks: ${tracks.join(', ')} (${isDraft ? 'Draft' : 'Rollout Completed'})`);
console.log(`📁 Bundle Path : ${aabPath}`);

// 1. Locate and validate Service Account JSON credentials
let authClient = null;
let keyFileFound = null;

for (const candidate of POSSIBLE_KEY_PATHS) {
  if (fs.existsSync(candidate)) {
    keyFileFound = candidate;
    break;
  }
}

if (!keyFileFound && process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON) {
  try {
    const raw = process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON;
    const jsonStr = raw.startsWith('{') ? raw : Buffer.from(raw, 'base64').toString('utf8');
    const credentials = JSON.parse(jsonStr);
    authClient = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/androidpublisher']
    });
    console.log('🔑 Authentication: Using GOOGLE_PLAY_SERVICE_ACCOUNT_JSON environment variable.');
  } catch (err) {
    console.error('❌ Failed to parse GOOGLE_PLAY_SERVICE_ACCOUNT_JSON:', err.message);
  }
} else if (keyFileFound) {
  console.log(`🔑 Authentication: Using Service Account key from:\n   ${keyFileFound}`);
  authClient = new google.auth.GoogleAuth({
    keyFile: keyFileFound,
    scopes: ['https://www.googleapis.com/auth/androidpublisher']
  });
}

if (!authClient) {
  console.log('\n⚠️ [SETUP REQUIRED] Service Account JSON Key Not Found!');
  console.log('----------------------------------------------------');
  console.log('To enable 100% automated command-line publishing, follow these one-time steps:');
  console.log('1. Go to Google Play Console: https://play.google.com/console');
  console.log('2. Click on "API access" in the left navigation (under Developer account).');
  console.log('3. Click "Choose a project to link" or link your Google Cloud project.');
  console.log('4. Click "Create new service account", and open the Google Cloud Console link.');
  console.log('5. In Google Cloud Console, click "Create Service Account", name it "play-publisher", and create it.');
  console.log('6. Go to the "Keys" tab for that service account, click "Add Key" -> "Create new key" -> JSON.');
  console.log('7. Save the downloaded JSON file to:');
  console.log(`   /Users/mohammadjhone/.karachi-runner-keys/play-service-account.json`);
  console.log('8. Go back to Google Play Console -> API access -> Service accounts:');
  console.log('   Click "Manage Play Console permissions" next to your new service account.');
  console.log('   Under "App permissions", select "pk.karachi.runner".');
  console.log('   Under "Releases", check: "Create and edit releases", "Roll out releases to testing tracks", etc.');
  console.log('9. Run: npm run publish:play\n');
  process.exit(1);
}

// 2. Validate AAB Bundle exists
if (!fs.existsSync(aabPath)) {
  console.error(`\n❌ Android App Bundle (.aab) not found at:\n   ${aabPath}`);
  console.error('Run "npm run build:android:aab" first to compile and sign the release bundle.\n');
  process.exit(1);
}

const fileSizeMb = (fs.statSync(aabPath).size / (1024 * 1024)).toFixed(2);
console.log(`📊 AAB File Size: ${fileSizeMb} MB`);

// 3. Connect to Android Publisher API v3
async function publish() {
  try {
    const play = google.androidpublisher({ version: 'v3', auth: authClient });

    console.log('\n🚀 [1/5] Starting Play Console Edit transaction...');
    const editRes = await play.edits.insert({
      packageName: PACKAGE_NAME
    });
    const editId = editRes.data.id;
    console.log(`✔ Edit Session Created: [${editId}]`);

    console.log(`🚀 [2/5] Uploading ${fileSizeMb} MB App Bundle to Play Console...`);
    const uploadRes = await play.edits.bundles.upload({
      packageName: PACKAGE_NAME,
      editId,
      media: {
        mimeType: 'application/octet-stream',
        body: fs.createReadStream(aabPath)
      }
    });

    const versionCode = uploadRes.data.versionCode;
    console.log(`✔ Upload complete! Version Code registered: ${versionCode}`);

    // Read package.json for version display name
    const pkg = JSON.parse(fs.readFileSync(path.resolve('package.json'), 'utf8'));
    const versionName = pkg.version || '2.2.0';

    console.log(`🚀 [3/5] Assigning Version Code ${versionCode} (${versionName}) to tracks: [${tracks.join(', ')}]...`);
    const releaseStatus = isDraft ? 'draft' : 'completed';
    const releaseNotes = [
      {
        language: 'en-US',
        text: 'Removed the police pursuer. Fixed raised roads hiding the runner at intersections, smoother turn entry and exit across all lanes, and camera continuity. Confirmed turns now stay queued when dodging. Missed and wrong turns still cost a heart, with clearer warnings and longer damage-cause messages.'
      }
    ];

    for (const t of tracks) {
      await play.edits.tracks.update({
        packageName: PACKAGE_NAME,
        editId,
        track: t,
        requestBody: {
          track: t,
          releases: [
            {
              name: `${versionName} (${versionCode})`,
              versionCodes: [versionCode.toString()],
              status: releaseStatus,
              releaseNotes
            }
          ]
        }
      });
      console.log(`✔ Release assigned to [${t}] track with status: ${releaseStatus}`);
    }

    console.log('🚀 [4/5] Validating Edit transaction with Google Play...');
    await play.edits.validate({
      packageName: PACKAGE_NAME,
      editId
    });
    console.log('✔ Play Console validation passed! Zero errors.');

    console.log('🚀 [5/5] Committing release to Google Play...');
    await play.edits.commit({
      packageName: PACKAGE_NAME,
      editId
    });

    console.log('====================================================');
    console.log('🎉 SUCCESSFULLY PUBLISHED TO GOOGLE PLAY CONSOLE!   ');
    console.log('====================================================');
    console.log(`App Name    : Karachi Runner`);
    console.log(`Package ID  : ${PACKAGE_NAME}`);
    console.log(`Track       : ${tracks.join(', ').toUpperCase()}`);
    console.log(`Status      : ${releaseStatus.toUpperCase()}`);
    console.log(`Console URL : https://play.google.com/console/u/0/developers/app/releases/overview?appId=${PACKAGE_NAME}`);
    console.log('====================================================\n');
  } catch (error) {
    console.error('\n❌ Google Play Publish Failed:');
    const errObj = error.response?.data?.error || error;
    if (error.response?.data?.error) {
      console.error(JSON.stringify(error.response.data.error, null, 2));
    } else {
      console.error(error.message || error);
    }

    const msg = String(errObj.message || '');
    if (msg.includes('already been used') || msg.includes('Version code')) {
      console.log('\n💡 [Version Code Already Live on Play Console]:');
      console.log('This Version Code has already been published to Google Play Console!');
      console.log('To automatically bump the version code and publish the next release:');
      console.log('👉 Run: npm run release:next\n');
    } else if (errObj.code === 403 || errObj.status === 'PERMISSION_DENIED') {
      console.log('\n💡 [Quick 1-Step Fix in Google Play Console]:');
      console.log('1. Open: https://play.google.com/console');
      console.log('2. Go to "Users and permissions" -> "Invite new users" (or "Setup" -> "API access")');
      console.log('3. Enter Service Account Email:');
      console.log('   👉 play-publisher@nimble-button-394.iam.gserviceaccount.com');
      console.log('4. Under App Permissions, add "Karachi Runner" (pk.karachi.runner)');
      console.log('5. Under Permissions, check "Releases" (Create & edit releases, Manage testing tracks)');
      console.log('6. Click "Invite user" / "Save changes", then re-run: npm run publish:play\n');
    }
    process.exit(1);
  }
}

publish();
