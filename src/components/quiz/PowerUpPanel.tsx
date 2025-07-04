'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Wand2, Rocket, Star, Coins, Gift, Ghost, UserMinus2, 
  Heart, Eraser, Bug, Swords, Bomb, Zap, Skull, 
  Magnet, ArrowUpDown, MousePointerClick, LifeBuoy
} from 'lucide-react';
import { useGame } from '@/contexts/GameContext';
import { POWER_UPS, PowerUpId } from '@/types/powerups';
import type { Team } from '@/types/quiz';

interface PowerUpPanelProps {
  team: Team;
  isCurrentTeam: boolean;
}

// Icon mapping for power-ups
const POWER_UP_ICONS: Record<PowerUpId, React.ComponentType<any>> = {
  fairy: Wand2,
  rocket: Rocket,
  star: Star,
  gold: Coins,
  gift: Gift,
  ghost: Ghost,
  thief: UserMinus2,
  banana: () => <span className="text-lg">🍌</span>,
  heart: Heart,
  eraser: Eraser,
  virus: Bug,
  shark: Swords,
  boom: Bomb,
  baam: Zap,
  crocodile: Skull,
  magnet: Magnet,
  seesaw: ArrowUpDown,
  trap: MousePointerClick,
  lifesaver: LifeBuoy,
};

export default function PowerUpPanel({ team, isCurrentTeam }: PowerUpPanelProps) {
  const { gameState } = useGame();

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Positive':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Negative':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Manipulative':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Find any power-up tiles revealed by this team
  const teamPowerUps = gameState?.tiles.filter(tile => 
    tile.type === 'powerup' && 
    tile.isRevealed && 
    tile.revealedByTeamId === team.id
  ) || [];

  return (
    <Card className={`${isCurrentTeam ? 'ring-2 ring-blue-500' : ''}`}>
      <CardContent className="space-y-2 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold">{team.name}</span>
          <Badge variant="secondary">{team.score} pts</Badge>
        </div>

        {/* Power-up History */}
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">
            Power-ups Revealed:
          </p>
          <div className="grid grid-cols-2 gap-1">
            {teamPowerUps.map((tile) => {
              if (tile.powerUpId) {
                const powerUp = POWER_UPS[tile.powerUpId];
                const IconComponent = POWER_UP_ICONS[tile.powerUpId];
                
                return (
                  <Badge
                    key={tile.id}
                    variant="outline"
                    className={`flex items-center gap-1 ${getCategoryColor(powerUp.category)}`}
                  >
                    <IconComponent className="h-3 w-3" />
                    <span className="text-xs truncate">{powerUp.name}</span>
                  </Badge>
                );
              }
              return null;
            })}
          </div>
          
          {teamPowerUps.length === 0 && (
            <p className="text-xs text-muted-foreground italic">No power-ups revealed yet</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
