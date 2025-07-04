'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { POWER_UPS } from '@/types/powerups';
import type { PowerUpEffect } from '@/types/powerups';
import type { Team } from '@/types/quiz';

interface PowerUpNotificationProps {
  effects: PowerUpEffect[];
  teams: Team[];
  powerUpName: string;
  activatingTeamName: string;
  onClose: () => void;
}

export default function PowerUpNotification({
  effects,
  teams,
  powerUpName,
  activatingTeamName,
  onClose
}: PowerUpNotificationProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Allow fade out animation
    }, 4000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const getTeamName = (teamId: string) => {
    return teams.find(team => team.id === teamId)?.name || 'Unknown Team';
  };

  const formatEffectMessage = (effect: PowerUpEffect) => {
    const teamName = getTeamName(effect.sourceTeamId);
    const targetTeamName = effect.targetTeamId ? getTeamName(effect.targetTeamId) : null;

    if (effect.type === 'points' && effect.points !== undefined) {
      if (effect.points > 0) {
        return `${teamName} gained ${effect.points} points!`;
      } else if (effect.points < 0) {
        return `${teamName} lost ${Math.abs(effect.points)} points!`;
      }
    }

    if (effect.type === 'status' && effect.status) {
      if (effect.status.effect === 'no_points') {
        return `${teamName} cannot earn points this turn!`;
      }
    }

    if (targetTeamName && effect.points) {
      if (effect.points > 0) {
        return `${targetTeamName} received ${effect.points} points from ${teamName}!`;
      }
    }

    return `${teamName} was affected by the power-up!`;
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right-full duration-300">
      <Card className="w-80 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-white/20 text-white">
                Power-up Activated!
              </Badge>
              <button
                onClick={() => {
                  setIsVisible(false);
                  setTimeout(onClose, 300);
                }}
                className="text-white/80 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          <div className="space-y-2">
            <p className="font-semibold">
              {activatingTeamName} used {powerUpName}!
            </p>
            
            <div className="space-y-1">
              {effects.map((effect, index) => (
                <p key={index} className="text-sm text-white/90">
                  {formatEffectMessage(effect)}
                </p>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
