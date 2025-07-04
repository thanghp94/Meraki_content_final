export type PowerUpCategory = 'Positive' | 'Negative' | 'Manipulative';

export type PowerUpId = 
  // Positive power-ups
  | 'fairy'
  | 'rocket'
  | 'star'
  | 'gold'
  | 'gift'
  | 'ghost'
  // Negative power-ups
  | 'thief'
  | 'banana'
  | 'heart'
  | 'eraser'
  | 'virus'
  | 'shark'
  | 'boom'
  | 'baam'
  | 'crocodile'
  // Manipulative power-ups
  | 'magnet'
  | 'seesaw'
  | 'trap'
  | 'lifesaver';

export interface PowerUp {
  id: PowerUpId;
  name: string;
  category: PowerUpCategory;
  description: string;
  icon: string; // Icon name from lucide-react
  effect: {
    type: 'points' | 'rank' | 'status';
    minPoints?: number;
    maxPoints?: number;
    duration?: number; // Number of turns for temporary effects
  };
}

export interface PowerUpInstance {
  id: string; // Unique instance ID
  powerUpId: PowerUpId;
  ownerId: string; // Team ID that owns this power-up
  isActive: boolean;
  turnsRemaining?: number; // For temporary effects
}

export interface PowerUpEffect {
  type: 'points' | 'rank' | 'status';
  sourceTeamId: string;
  targetTeamId?: string;
  points?: number;
  rank?: 'first' | 'last';
  status?: {
    effect: 'no_points' | 'points_multiplier';
    duration: number;
    multiplier?: number;
  };
}

// Registry of all available power-ups
export const POWER_UPS: Record<PowerUpId, PowerUp> = {
  fairy: {
    id: 'fairy',
    name: 'Fairy',
    category: 'Positive',
    description: 'Steal points from another team.',
    icon: 'wand',
    effect: {
      type: 'points',
      minPoints: 5,
      maxPoints: 25
    }
  },
  rocket: {
    id: 'rocket',
    name: 'Rocket',
    category: 'Positive',
    description: 'Instantly jump to first place.',
    icon: 'rocket',
    effect: {
      type: 'rank'
    }
  },
  star: {
    id: 'star',
    name: 'Star',
    category: 'Positive',
    description: 'Double your current points.',
    icon: 'star',
    effect: {
      type: 'points'
    }
  },
  gold: {
    id: 'gold',
    name: 'Gold',
    category: 'Positive',
    description: 'Win fifty bonus points.',
    icon: 'coins',
    effect: {
      type: 'points',
      minPoints: 50,
      maxPoints: 50
    }
  },
  gift: {
    id: 'gift',
    name: 'Gift',
    category: 'Positive',
    description: 'Receive 5 to 25 bonus points.',
    icon: 'gift',
    effect: {
      type: 'points',
      minPoints: 5,
      maxPoints: 25
    }
  },
  ghost: {
    id: 'ghost',
    name: 'Ghost',
    category: 'Positive',
    description: 'Gives 5-25 points.',
    icon: 'ghost',
    effect: {
      type: 'points',
      minPoints: 5,
      maxPoints: 25
    }
  },
  thief: {
    id: 'thief',
    name: 'Thief',
    category: 'Negative',
    description: 'Hand over some of your points (5-25) to an opponent.',
    icon: 'user-minus-2',
    effect: {
      type: 'points',
      minPoints: 5,
      maxPoints: 25
    }
  },
  banana: {
    id: 'banana',
    name: 'Banana',
    category: 'Negative',
    description: 'Get pulled back to last place.',
    icon: 'banana',
    effect: {
      type: 'rank'
    }
  },
  heart: {
    id: 'heart',
    name: 'Heart',
    category: 'Negative',
    description: 'The other team receives free points (5-25).',
    icon: 'heart',
    effect: {
      type: 'points',
      minPoints: 5,
      maxPoints: 25
    }
  },
  eraser: {
    id: 'eraser',
    name: 'Eraser',
    category: 'Negative',
    description: 'Your score is reset to zero.',
    icon: 'eraser',
    effect: {
      type: 'points'
    }
  },
  virus: {
    id: 'virus',
    name: 'Virus',
    category: 'Negative',
    description: 'All scores are completely reset to zero.',
    icon: 'virus',
    effect: {
      type: 'points'
    }
  },
  shark: {
    id: 'shark',
    name: 'Shark',
    category: 'Negative',
    description: 'Another team loses points (5-25).',
    icon: 'swords',
    effect: {
      type: 'points',
      minPoints: 5,
      maxPoints: 25
    }
  },
  boom: {
    id: 'boom',
    name: 'Boom',
    category: 'Negative',
    description: 'Lose fifty points.',
    icon: 'bomb',
    effect: {
      type: 'points',
      minPoints: 50,
      maxPoints: 50
    }
  },
  baam: {
    id: 'baam',
    name: 'Baam',
    category: 'Negative',
    description: 'Lose 5-25 points.',
    icon: 'zap',
    effect: {
      type: 'points',
      minPoints: 5,
      maxPoints: 25
    }
  },
  crocodile: {
    id: 'crocodile',
    name: 'Crocodile',
    category: 'Negative',
    description: 'No points for you.',
    icon: 'skull',
    effect: {
      type: 'status',
      duration: 1
    }
  },
  magnet: {
    id: 'magnet',
    name: 'Magnet',
    category: 'Manipulative',
    description: 'Steal 5 to 25 points from an opponent.',
    icon: 'magnet',
    effect: {
      type: 'points',
      minPoints: 5,
      maxPoints: 25
    }
  },
  seesaw: {
    id: 'seesaw',
    name: 'Seesaw',
    category: 'Manipulative',
    description: 'Swap points with one of your opponents.',
    icon: 'switch',
    effect: {
      type: 'points'
    }
  },
  trap: {
    id: 'trap',
    name: 'Trap',
    category: 'Manipulative',
    description: 'No points, no question, no chance to win points for that turn.',
    icon: 'mouse-pointer-click',
    effect: {
      type: 'status',
      duration: 1
    }
  },
  lifesaver: {
    id: 'lifesaver',
    name: 'Lifesaver',
    category: 'Manipulative',
    description: 'Give 5 to 25 points to one of your competitors.',
    icon: 'life-buoy',
    effect: {
      type: 'points',
      minPoints: 5,
      maxPoints: 25
    }
  }
};
