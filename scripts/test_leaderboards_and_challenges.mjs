import test from 'node:test';
import assert from 'node:assert/strict';
import { LeaderboardService } from '../src/leaderboardService.js';

test('LeaderboardService: Gamer Tag management & sanitization', () => {
  const service = new LeaderboardService();
  
  // Sanitization: removes special characters, limits to 16 chars
  const tag1 = service.setGamerName('Karachi_Hero!@#');
  assert.equal(tag1, 'Karachi_Hero');
  assert.equal(service.getGamerName(), 'Karachi_Hero');

  // Enforces minimum length of 3 chars
  const tagShort = service.setGamerName('AB');
  assert.equal(tagShort, false);

  // Truncates strings longer than 16 characters
  const tagLong = service.setGamerName('SuperKarachiRunnerPlayer2026');
  assert.equal(tagLong.length, 16);
  assert.equal(tagLong, 'SuperKarachiRunn');
});

test('LeaderboardService: Multi-timeframe keys generation', () => {
  const service = new LeaderboardService();
  const date = new Date('2026-10-29T10:00:00Z');
  const keys = service.getTimeframeKeys(date);

  assert.equal(keys.day, '2026-10-29');
  assert.equal(keys.month, '2026-10');
  assert.equal(keys.year, '2026');
  assert.ok(keys.week.startsWith('2026-W'));
  assert.equal(keys.all_time, 'all_time');
});

test('LeaderboardService: Score submission, ranking & seeded rivals', async () => {
  const service = new LeaderboardService();
  service.setGamerName('TestPlayer');

  // Submit high score
  const result = await service.submitRunScore({
    score: 85000,
    distance: 14500,
    rupees: 3200,
    district: 'Soldier Bazar',
    pace: 'cruiser'
  });

  assert.ok(result);
  assert.equal(result.record.gamerName, 'TestPlayer');
  assert.equal(result.record.score, 85000);
  assert.equal(result.record.district, 'Soldier Bazar');

  // Verify daily leaderboard
  const dayLeaderboard = service.getLeaderboard('day');
  assert.ok(dayLeaderboard.length >= 10);
  assert.equal(dayLeaderboard[0].gamerName, 'TestPlayer'); // Highest score takes 1st place!
  assert.equal(dayLeaderboard[0].rank, 1);
  assert.equal(dayLeaderboard[0].isCurrentPlayer, true);

  // Verify rivals are present
  const rivalFound = dayLeaderboard.some(entry => entry.gamerName === 'Lyari_Speedster' || entry.gamerName === 'TariqRoad_Racer');
  assert.ok(rivalFound, 'Authentic Karachi rivals must be populated in the leaderboard');

  // Verify All-Time leaderboard
  const allTimeLeaderboard = service.getLeaderboard('all_time');
  assert.ok(allTimeLeaderboard.length >= 10);
  const playerInAllTime = allTimeLeaderboard.find(e => e.isCurrentPlayer);
  assert.ok(playerInAllTime, 'Player score must appear in all-time leaderboard');
});

test('LeaderboardService: Daily Challenges deterministic generation', () => {
  const service = new LeaderboardService();
  const date1 = new Date('2026-10-29');
  const daily1 = service.getDailyChallenges(date1);

  assert.equal(daily1.dateKey, '2026-10-29');
  assert.equal(daily1.challenges.length, 3);
  assert.equal(daily1.challenges[0].type, 'distance_single_run');
  assert.equal(daily1.challenges[1].type, 'collect_coins');
  assert.equal(daily1.challenges[2].type, 'surf_minibus');

  // Same date yields same targets
  const dailySame = service.getDailyChallenges(date1);
  assert.equal(dailySame.challenges[0].target, daily1.challenges[0].target);
  assert.equal(dailySame.challenges[1].target, daily1.challenges[1].target);
  assert.equal(dailySame.challenges[2].target, daily1.challenges[2].target);
});

test('LeaderboardService: Daily Challenge progress & reward claiming', () => {
  const fakeSave = {
    rupeesAdded: 0,
    addRupees(amount) {
      this.rupeesAdded += amount;
    }
  };
  const service = new LeaderboardService(fakeSave);
  const date = new Date('2026-10-29');
  const daily = service.getDailyChallenges(date);

  // Record progress
  service.recordChallengeProgress('collect_coins', daily.challenges[1].target);
  const updatedDaily = service.getDailyChallenges(date);
  assert.equal(updatedDaily.challenges[1].completed, true);

  // Claim reward
  const claimRes = service.claimChallengeReward(updatedDaily.challenges[1].id);
  assert.ok(claimRes.success);
  assert.equal(claimRes.rewardRupees, updatedDaily.challenges[1].rewardRupees);
  assert.equal(fakeSave.rupeesAdded, updatedDaily.challenges[1].rewardRupees);

  // Cannot claim twice
  const doubleClaim = service.claimChallengeReward(updatedDaily.challenges[1].id);
  assert.equal(doubleClaim.success, false);
});

test('LeaderboardService: Daily Challenge Leaderboard standings', () => {
  const service = new LeaderboardService();
  service.setGamerName('ChallengePro');

  const standings = service.getDailyChallengeLeaderboard();
  assert.ok(standings.length >= 6);
  assert.ok(standings[0].rank === 1);
  const playerStanding = standings.find(s => s.isCurrentPlayer);
  assert.ok(playerStanding, 'Player must appear in daily challenge standings');
});

test('LeaderboardService: Cloud sync configuration & Firebase URL compatibility', () => {
  const service = new LeaderboardService();
  
  // Default: local high availability
  const initialStatus = service.getCloudStatus();
  assert.equal(initialStatus.configured, false);
  assert.equal(initialStatus.type, 'Local Persistent Storage');

  // Set Firebase Realtime DB URL
  service.setCloudUrl('https://karachi-runner-default-rtdb.firebaseio.com/');
  const cloudStatus = service.getCloudStatus();
  assert.equal(cloudStatus.configured, true);
  assert.equal(cloudStatus.type, 'Firebase Realtime DB');
  assert.equal(cloudStatus.url, 'https://karachi-runner-default-rtdb.firebaseio.com');

  // Clear URL resets to local storage
  service.setCloudUrl('');
  assert.equal(service.getCloudStatus().configured, false);
});

test('LeaderboardService: Master Mode complete and reset controls', () => {
  const service = new LeaderboardService();
  const resetState = service.resetDailyChallenges();
  assert.equal(resetState.challenges.length, 3);
  assert.equal(resetState.challenges.every(c => !c.completed), true);

  const completedState = service.completeAllDailyChallenges();
  assert.equal(completedState.challenges.every(c => c.completed), true);
  assert.equal(completedState.challenges.every(c => c.current === c.target), true);

  const freshReset = service.resetDailyChallenges();
  assert.equal(freshReset.challenges.every(c => !c.completed), true);
});

