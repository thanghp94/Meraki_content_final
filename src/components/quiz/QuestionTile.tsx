
'use client';

import type { Tile } from '@/types/quiz';
import { Button } from '@/components/ui/button';
import { CheckSquare, EyeOff, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuestionTileProps {
  tile: Tile;
  onClick: () => void;
}

export default function QuestionTile({ tile, onClick }: QuestionTileProps) {
  const { displayNumber, isRevealed, type, question } = tile;

  // Create gradient colors based on tile number for variety
  const getGradientStyle = (num: number) => {
    const gradients = [
      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)", 
      "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
      "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
      "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
      "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)",
      "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
      "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
      "linear-gradient(135deg, #fad0c4 0%, #ffd1ff 100%)",
      "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
    ];
    return gradients[num % gradients.length];
  };

  // Get hover gradient - brighter version of the original
  const getHoverGradientStyle = (num: number) => {
    const hoverGradients = [
      "linear-gradient(135deg, #7c8ef0 0%, #8a5bb8 100%)",
      "linear-gradient(135deg, #f5a9ff 0%, #f76b82 100%)", 
      "linear-gradient(135deg, #65c0ff 0%, #1affff 100%)",
      "linear-gradient(135deg, #59ff91 0%, #4effed 100%)",
      "linear-gradient(135deg, #ff86c0 0%, #ffeb56 100%)",
      "linear-gradient(135deg, #bef4f0 0%, #ffdbf9 100%)",
      "linear-gradient(135deg, #ffafb4 0%, #ffd8ff 100%)",
      "linear-gradient(135deg, #fff2d8 0%, #ffcbb5 100%)",
      "linear-gradient(135deg, #b798d7 0%, #ffc8f1 100%)",
      "linear-gradient(135deg, #ffdaca 0%, #ffd6ff 100%)",
      "linear-gradient(135deg, #fff2d8 0%, #ffcbb5 100%)",
      "linear-gradient(135deg, #7c8ef0 0%, #8a5bb8 100%)"
    ];
    return hoverGradients[num % hoverGradients.length];
  };

  const getRevealedGradient = () => {
    if (tile.type === 'powerup') {
      return "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)"; // Gold gradient for power-ups
    } else {
      if (tile.answeredCorrectly === true) {
        return "linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%)";
      } else if (tile.answeredCorrectly === false) {
        return "linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%)";
      } else {
        return "linear-gradient(135deg, #bdc3c7 0%, #2c3e50 100%)";
      }
    }
  };

  return (
    <div
      className={cn(
        "w-full h-full text-white font-bold flex flex-col items-center justify-center p-1 shadow-lg hover:shadow-2xl transition-all duration-300 rounded-xl border-0 cursor-pointer relative overflow-hidden group min-h-0",
        // Base styles for unrevealed tiles
        !isRevealed && "hover:scale-105 hover:shadow-2xl transform-gpu",
        // Styles for revealed tiles
        isRevealed && "opacity-90 cursor-not-allowed transform-none"
      )}
      style={{
        backgroundImage: isRevealed ? getRevealedGradient() : getGradientStyle(displayNumber),
        backgroundSize: '200% 200%',
        animation: !isRevealed ? 'gradient 8s ease infinite' : 'none'
      }}      
      onClick={isRevealed ? undefined : onClick}
      onMouseEnter={(e) => {
        if (!isRevealed) {
          e.currentTarget.style.backgroundImage = getHoverGradientStyle(displayNumber);
        }
      }}
      onMouseLeave={(e) => {
        if (!isRevealed) {
          e.currentTarget.style.backgroundImage = getGradientStyle(displayNumber);
        }
      }}      
      aria-label={isRevealed ? 
        tile.type === 'powerup' ? 
          `Power-up ${displayNumber} (revealed)` :
          `Question ${displayNumber} (revealed, ${tile.answeredCorrectly === true ? 'correct' : tile.answeredCorrectly === false ? 'incorrect' : 'unanswered'}) - ${tile.question?.points || 0} points` 
        : `Select tile ${displayNumber}`}
    >
      {/* Add a subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
      
      {/* Content */}
      {isRevealed ? (
        <div className="relative z-10 flex flex-col items-center">
          {tile.type === 'powerup' ? (
            <>
              <span className="text-4xl mb-2">⚡</span>
              <span 
                className="mt-2 font-normal text-white/90"
                style={{ 
                  fontSize: 'clamp(1.5rem, 4vmin, 4rem)',
                  lineHeight: '1.2'
                }}
              >
                Power-up!
              </span>
            </>
          ) : (
            <>
              {tile.answeredCorrectly === true && <CheckSquare className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 text-white" />}
              {tile.answeredCorrectly === false && <EyeOff className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 text-white" />}
              {tile.answeredCorrectly === null && <HelpCircle className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 text-white" />}
              <span 
                className="mt-2 font-normal text-white/90"
                style={{ 
                  fontSize: 'clamp(1.5rem, 4vmin, 4rem)',
                  lineHeight: '1.2'
                }}
              >
                {question?.points || 0} pts
              </span>
            </>
          )}
        </div>
      ) : (
        <div className="relative z-10 flex flex-col items-center">
          <span 
            className="drop-shadow-lg font-extrabold"
            style={{ 
              fontSize: 'clamp(4rem, 15vmin, 20rem)',
              lineHeight: '1'
            }}
          >
            {displayNumber}
          </span>
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      )}
    </div>
  );
}
