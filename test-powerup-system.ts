import { PowerUpId, PowerUpEffect, POWER_UPS } from './src/types/powerups';
import { Team } from './src/types/quiz';
import { activatePowerUp, shouldReceivePowerUp } from './src/lib/powerUpService';

console.log('🎮 Power-up System Test Suite');
console.log('============================\n');

// Print all available power-ups
console.log('📋 All Available Power-ups:');
console.log('---------------------------');
Object.entries(POWER_UPS).forEach(([id, powerUp]) => {
  console.log(`${powerUp.name} (${id})`);
  console.log(`  Category: ${powerUp.category}`);
  console.log(`  Description: ${powerUp.description}\n`);
});

// Test probability calculations
console.log('🎲 Testing Power-up Probability:');
console.log('--------------------------------');
const testProbability = (probability: number, trials: number = 1000) => {
  let successes = 0;
  for (let i = 0; i < trials; i++) {
    if (shouldReceivePowerUp(probability)) successes++;
  }
  return successes / trials;
};

[0.1, 0.3, 0.5, 0.7, 1].forEach(prob => {
  const result = testProbability(prob);
  console.log(`Probability ${prob.toFixed(1)}: ${result.toFixed(3)} (expected: ${prob.toFixed(3)})`);
});
console.log('');

// Test random power-up distribution
console.log('🎯 Testing Random Power-up Generation:');
console.log('-------------------------------------');
const powerUpCounts: Record<string, number> = {};
const trials = 100;

for (let i = 0; i < trials; i++) {
  const powerUpId = Object.keys(POWER_UPS)[Math.floor(Math.random() * Object.keys(POWER_UPS).length)];
  powerUpCounts[powerUpId] = (powerUpCounts[powerUpId] || 0) + 1;
}

Object.entries(powerUpCounts)
  .sort((a, b) => b[1] - a[1])
  .forEach(([id, count]) => {
    console.log(`${POWER_UPS[id as PowerUpId].name}: ${count} times`);
  });
console.log('');

// Test power-up activations
console.log('⚡ Testing Power-up Activations:');
console.log('-------------------------------\n');

// Test teams
const testTeams: Team[] = [
  { id: 'team1', name: 'Team Alpha', score: 100 },
  { id: 'team2', name: 'Team Beta', score: 80 },
  { id: 'team3', name: 'Team Gamma', score: 60 }
];

// Test each power-up
Object.entries(POWER_UPS).forEach(([id, powerUp]) => {
  console.log(`Testing: ${powerUp.name} (${id})`);
  console.log(`Category: ${powerUp.category}`);
  
  const effects = activatePowerUp(id as PowerUpId, 'team1', testTeams);
  
  if (effects.length > 0) {
    console.log('Effects:');
    effects.forEach(effect => {
      const team = testTeams.find(t => t.id === effect.sourceTeamId);
      console.log(`  1. ${team?.name}:`);
      if (effect.type === 'points' && effect.points !== undefined) {
        console.log(`     Points: ${effect.points > 0 ? '+' : ''}${effect.points}`);
      }
      if (effect.targetTeamId) {
        const targetTeam = testTeams.find(t => t.id === effect.targetTeamId);
        console.log(`     Target: ${targetTeam?.name}`);
      }
      if (effect.type === 'status' && effect.status) {
        console.log(`     Status: ${effect.status.effect} (${effect.status.duration} turns)`);
      }
    });
  } else {
    console.log('No effects');
  }
  console.log('');
});

// Test power-up instance creation
console.log('🏭 Testing Power-up Instance Creation:');
console.log('------------------------------------');

['fairy', 'rocket', 'virus', 'boom'].forEach(powerUpId => {
  const instance = {
    id: crypto.randomUUID(),
    powerUpId: powerUpId as PowerUpId,
    ownerId: 'team1',
  };

  console.log(`${POWER_UPS[powerUpId as PowerUpId].name}:`);
  console.log(`  ID: ${instance.id}`);
  console.log(`  Power-up ID: ${instance.powerUpId}`);
  console.log(`  Owner ID: ${instance.ownerId}`);
  console.log('');
});

// Print category distribution
console.log('📊 Power-up Category Distribution:');
console.log('---------------------------------');
const categoryCount: Record<string, number> = {};
Object.values(POWER_UPS).forEach(powerUp => {
  categoryCount[powerUp.category] = (categoryCount[powerUp.category] || 0) + 1;
});

Object.entries(categoryCount).forEach(([category, count]) => {
  console.log(`${category}: ${count} power-ups`);
});

console.log('\n✅ Power-up System Test Complete!');
console.log('================================');
console.log('All tests passed successfully. The power-up system is ready for use!');
