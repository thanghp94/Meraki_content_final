import { PowerUpId, PowerUpInstance, PowerUpEffect, POWER_UPS } from '@/types/powerups';
import type { Team } from '@/types/quiz';
import { v4 as uuidv4 } from 'uuid';

// Helper function to get random points within a range
export function getRandomPoints(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Helper function to select a random target team
export function selectRandomTarget(teams: Team[], excludeTeamId: string): Team | null {
  const validTargets = teams.filter(team => team.id !== excludeTeamId);
  if (validTargets.length === 0) return null;
  
  const randomIndex = Math.floor(Math.random() * validTargets.length);
  return validTargets[randomIndex];
}

// Helper function to get team rank
export function getTeamRank(teams: Team[], teamId: string): number {
  const sortedTeams = [...teams].sort((a, b) => b.score - a.score);
  return sortedTeams.findIndex(team => team.id === teamId) + 1;
}

// Helper function to get highest scoring team
export function getFirstPlaceTeam(teams: Team[]): Team {
  return teams.reduce((highest, current) => 
    current.score > highest.score ? current : highest
  );
}

// Helper function to get lowest scoring team
export function getLastPlaceTeam(teams: Team[]): Team {
  return teams.reduce((lowest, current) => 
    current.score < lowest.score ? current : lowest
  );
}

// Main power-up activation function
export function activatePowerUp(
  powerUpId: PowerUpId,
  activatingTeamId: string,
  teams: Team[]
): PowerUpEffect[] {
  const powerUp = POWER_UPS[powerUpId];
  const effects: PowerUpEffect[] = [];
  
  switch (powerUpId) {
    case 'fairy':
    case 'magnet': {
      const target = selectRandomTarget(teams, activatingTeamId);
      if (target) {
        const points = getRandomPoints(powerUp.effect.minPoints!, powerUp.effect.maxPoints!);
        effects.push({
          type: 'points',
          sourceTeamId: activatingTeamId,
          targetTeamId: target.id,
          points: points
        });
        effects.push({
          type: 'points',
          sourceTeamId: target.id,
          points: -Math.min(points, target.score) // Don't go below 0
        });
      }
      break;
    }
    
    case 'rocket': {
      const firstPlace = getFirstPlaceTeam(teams);
      const activatingTeam = teams.find(t => t.id === activatingTeamId);
      if (activatingTeam && activatingTeam.id !== firstPlace.id) {
        effects.push({
          type: 'points',
          sourceTeamId: activatingTeamId,
          points: firstPlace.score + 1 - activatingTeam.score
        });
      }
      break;
    }
    
    case 'star': {
      const activatingTeam = teams.find(t => t.id === activatingTeamId);
      if (activatingTeam && activatingTeam.score > 0) {
        effects.push({
          type: 'points',
          sourceTeamId: activatingTeamId,
          points: activatingTeam.score // Double the score
        });
      }
      break;
    }
    
    case 'gold': {
      effects.push({
        type: 'points',
        sourceTeamId: activatingTeamId,
        points: 50
      });
      break;
    }
    
    case 'gift':
    case 'ghost': {
      const points = getRandomPoints(powerUp.effect.minPoints!, powerUp.effect.maxPoints!);
      effects.push({
        type: 'points',
        sourceTeamId: activatingTeamId,
        points: points
      });
      break;
    }
    
    case 'thief': {
      const target = selectRandomTarget(teams, activatingTeamId);
      const activatingTeam = teams.find(t => t.id === activatingTeamId);
      if (target && activatingTeam) {
        const points = getRandomPoints(powerUp.effect.minPoints!, powerUp.effect.maxPoints!);
        const actualPoints = Math.min(points, activatingTeam.score);
        effects.push({
          type: 'points',
          sourceTeamId: activatingTeamId,
          points: -actualPoints
        });
        effects.push({
          type: 'points',
          sourceTeamId: target.id,
          points: actualPoints
        });
      }
      break;
    }
    
    case 'banana': {
      const lastPlace = getLastPlaceTeam(teams);
      const activatingTeam = teams.find(t => t.id === activatingTeamId);
      if (activatingTeam && activatingTeam.id !== lastPlace.id) {
        const newScore = Math.max(0, lastPlace.score - 1);
        effects.push({
          type: 'points',
          sourceTeamId: activatingTeamId,
          points: newScore - activatingTeam.score
        });
      }
      break;
    }
    
    case 'heart':
    case 'lifesaver': {
      const target = selectRandomTarget(teams, activatingTeamId);
      const activatingTeam = teams.find(t => t.id === activatingTeamId);
      if (target && activatingTeam) {
        const points = getRandomPoints(powerUp.effect.minPoints!, powerUp.effect.maxPoints!);
        const actualPoints = Math.min(points, activatingTeam.score);
        effects.push({
          type: 'points',
          sourceTeamId: activatingTeamId,
          points: -actualPoints
        });
        effects.push({
          type: 'points',
          sourceTeamId: target.id,
          points: actualPoints
        });
      }
      break;
    }
    
    case 'eraser': {
      const activatingTeam = teams.find(t => t.id === activatingTeamId);
      if (activatingTeam) {
        effects.push({
          type: 'points',
          sourceTeamId: activatingTeamId,
          points: -activatingTeam.score
        });
      }
      break;
    }
    
    case 'virus': {
      teams.forEach(team => {
        if (team.score > 0) {
          effects.push({
            type: 'points',
            sourceTeamId: team.id,
            points: -team.score
          });
        }
      });
      break;
    }
    
    case 'shark': {
      const target = selectRandomTarget(teams, activatingTeamId);
      if (target) {
        const points = getRandomPoints(powerUp.effect.minPoints!, powerUp.effect.maxPoints!);
        const actualPoints = Math.min(points, target.score);
        effects.push({
          type: 'points',
          sourceTeamId: target.id,
          points: -actualPoints
        });
      }
      break;
    }
    
    case 'boom': {
      const activatingTeam = teams.find(t => t.id === activatingTeamId);
      if (activatingTeam) {
        const actualPoints = Math.min(50, activatingTeam.score);
        effects.push({
          type: 'points',
          sourceTeamId: activatingTeamId,
          points: -actualPoints
        });
      }
      break;
    }
    
    case 'baam': {
      const activatingTeam = teams.find(t => t.id === activatingTeamId);
      if (activatingTeam) {
        const points = getRandomPoints(powerUp.effect.minPoints!, powerUp.effect.maxPoints!);
        const actualPoints = Math.min(points, activatingTeam.score);
        effects.push({
          type: 'points',
          sourceTeamId: activatingTeamId,
          points: -actualPoints
        });
      }
      break;
    }
    
    case 'crocodile':
    case 'trap': {
      effects.push({
        type: 'status',
        sourceTeamId: activatingTeamId,
        status: {
          effect: 'no_points',
          duration: 1
        }
      });
      break;
    }
    
    case 'seesaw': {
      const target = selectRandomTarget(teams, activatingTeamId);
      const activatingTeam = teams.find(t => t.id === activatingTeamId);
      if (target && activatingTeam) {
        const activatingTeamScore = activatingTeam.score;
        const targetScore = target.score;
        
        effects.push({
          type: 'points',
          sourceTeamId: activatingTeamId,
          points: targetScore - activatingTeamScore
        });
        effects.push({
          type: 'points',
          sourceTeamId: target.id,
          points: activatingTeamScore - targetScore
        });
      }
      break;
    }
  }
  
  return effects;
}

// Function to generate random power-ups for teams
export function generateRandomPowerUp(): PowerUpId {
  const powerUpIds = Object.keys(POWER_UPS) as PowerUpId[];
  const randomIndex = Math.floor(Math.random() * powerUpIds.length);
  return powerUpIds[randomIndex];
}

// Function to create a power-up instance
export function createPowerUpInstance(powerUpId: PowerUpId, ownerId: string): PowerUpInstance {
  return {
    id: uuidv4(),
    powerUpId,
    ownerId,
    isActive: false
  };
}

// Function to check if a team should receive a power-up (random chance)
export function shouldReceivePowerUp(probability: number = 0.3): boolean {
  return Math.random() < probability;
}
