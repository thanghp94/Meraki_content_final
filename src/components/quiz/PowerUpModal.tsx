'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Wand2, Rocket, Star, Coins, Gift, Ghost, UserMinus2, 
  Heart, Eraser, Bug, Swords, Bomb, Zap, Skull, 
  Magnet, ArrowUpDown, MousePointerClick, LifeBuoy
} from 'lucide-react';
import { POWER_UPS, PowerUpId } from '@/types/powerups';

interface PowerUpModalProps {
  powerUpId: PowerUpId | null;
  isOpen: boolean;
  onClose: () => void;
  teamName: string;
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
  banana: () => <span className="text-4xl">🍌</span>,
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

export default function PowerUpModal({ powerUpId, isOpen, onClose, teamName }: PowerUpModalProps) {
  if (!powerUpId) return null;

  const powerUp = POWER_UPS[powerUpId];
  const IconComponent = POWER_UP_ICONS[powerUpId];

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

  const getBackgroundColor = (category: string) => {
    switch (category) {
      case 'Positive':
        return 'bg-gradient-to-br from-green-50 to-green-100';
      case 'Negative':
        return 'bg-gradient-to-br from-red-50 to-red-100';
      case 'Manipulative':
        return 'bg-gradient-to-br from-blue-50 to-blue-100';
      default:
        return 'bg-gradient-to-br from-gray-50 to-gray-100';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`max-w-lg ${getBackgroundColor(powerUp.category)}`}>
        <DialogHeader>
          <DialogTitle className="text-center text-3xl font-bold">
            Power-up Revealed!
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-8 text-center">
          {/* Team Name */}
          <p className="text-xl font-semibold text-muted-foreground">
            {teamName} found a power-up!
          </p>

          {/* Power-up Icon */}
          <div className="flex justify-center">
            <div className="w-32 h-32 rounded-full bg-white shadow-lg flex items-center justify-center">
              <IconComponent className="h-16 w-16 text-primary" />
            </div>
          </div>

          {/* Power-up Info */}
          <div className="space-y-3">
            <h3 className="text-3xl font-bold">{powerUp.name}</h3>
            <Badge 
              variant="outline" 
              className={`${getCategoryColor(powerUp.category)} text-base px-4 py-2`}
            >
              {powerUp.category}
            </Badge>
          </div>

          {/* Description */}
          <p className="text-xl text-muted-foreground px-6">
            {powerUp.description}
          </p>

          {/* Close Button */}
          <Button 
            onClick={onClose} 
            className="w-full text-lg py-3"
            variant="default"
          >
            Continue Game
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
