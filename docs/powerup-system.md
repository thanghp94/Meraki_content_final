# Power-up System Documentation

## Overview

The Bamboozle game now features a comprehensive power-up system with 24 unique power-ups that add strategic depth and excitement to gameplay. Power-ups are randomly awarded to teams after answering questions correctly, and can be activated strategically to gain advantages or hinder opponents.

## Power-up Categories

### Positive Power-ups (8 total)
These power-ups provide direct benefits to the activating team:

1. **Fairy** ⭐ - Grants 50-150 bonus points
2. **Rocket** 🚀 - Grants 100-200 bonus points  
3. **Star** ⭐ - Grants 75-125 bonus points
4. **Gold** 💰 - Grants 200-300 bonus points
5. **Gift** 🎁 - Grants 25-75 bonus points
6. **Ghost** 👻 - Grants 60-140 bonus points
7. **Heart** ❤️ - Grants 80-120 bonus points
8. **Lifesaver** 🛟 - Grants 90-110 bonus points

### Negative Power-ups (8 total)
These power-ups target opponents with harmful effects:

9. **Thief** 🥷 - Steals 50-100 points from the highest-scoring team
10. **Banana** 🍌 - Causes target team to lose 30-70 points
11. **Eraser** 🧽 - Removes 40-80 points from target team
12. **Virus** 🦠 - Infects target team, causing 60-120 point loss
13. **Shark** 🦈 - Attacks target team for 80-150 point loss
14. **Boom** 💥 - Explosive damage of 100-200 points to target
15. **Baam** ⚡ - Lightning strike causing 70-130 point loss
16. **Crocodile** 🐊 - Savage attack removing 90-160 points

### Manipulative Power-ups (8 total)
These power-ups have complex effects that manipulate game flow:

17. **Magnet** 🧲 - Redistributes points among all teams
18. **Seesaw** ⚖️ - Swaps scores between two teams
19. **Trap** 🪤 - Prevents target team from earning points next turn
20. **Fairy (Special)** 🧚 - Advanced fairy with enhanced effects
21. **Rocket (Special)** 🚀 - Advanced rocket with area effects
22. **Star (Special)** ⭐ - Advanced star with team-wide benefits
23. **Gold (Special)** 💰 - Advanced gold with multiplier effects
24. **Gift (Special)** 🎁 - Advanced gift with surprise mechanics

## How Power-ups Work

### Tile Assignment
- Power-ups are randomly assigned to tiles during game setup
- Teachers select which power-ups are enabled for the game
- Probability determines what percentage of tiles will be power-ups
- Default probability is 30% of tiles being power-ups

### Automatic Activation
- Power-ups are automatically activated when their tile is revealed
- No manual activation required - effects apply immediately
- Visual modal shows the power-up effect to all players
- Effects are applied to scores and game state instantly

### Strategic Considerations
- **Tile Selection**: Choose tiles strategically, knowing some may be power-ups
- **Risk vs Reward**: Power-ups can be positive, negative, or manipulative
- **Game Flow**: Power-ups add unpredictability to the game
- **Teacher Control**: Teachers can customize which power-ups appear

## User Interface

### Power-up Panel
- Located on the left side of the game screen
- Shows each team's available power-ups
- Displays active effects and status conditions
- Color-coded by category (Green=Positive, Red=Negative, Blue=Manipulative)

### Power-up Cards
- **Name and Icon**: Visual identification
- **Category Badge**: Shows power-up type
- **Tooltip**: Detailed description on hover
- **Activation Button**: Click to use (current team only)

### Notifications
- Pop-up notifications show power-up effects
- Displays point changes and status effects
- Auto-dismisses after 4 seconds
- Can be manually closed

## Game Setup Configuration

### Power-up Frequency Options
- **None (0%)**: Disables power-ups completely
- **Rare (10%)**: Minimal power-up appearances
- **Normal (30%)**: Balanced gameplay (default)
- **Common (50%)**: Frequent power-up opportunities
- **Frequent (70%)**: High-intensity power-up gameplay

### Recommendations
- **Casual Games**: Use "Rare" or "Normal" settings
- **Competitive Games**: Use "Normal" or "Common" settings
- **Party Games**: Use "Common" or "Frequent" settings
- **Educational Focus**: Use "None" or "Rare" settings

## Technical Implementation

### Core Components
- `src/types/powerups.ts` - Type definitions and power-up data
- `src/lib/powerUpService.ts` - Business logic and activation handlers
- `src/components/quiz/PowerUpPanel.tsx` - UI component for power-up display
- `src/components/quiz/PowerUpNotification.tsx` - Notification system
- `src/contexts/GameContext.tsx` - Game state management

### Data Flow
1. Correct answer triggers probability check
2. Random power-up generated if successful
3. Power-up added to team's inventory
4. Player activates power-up via UI
5. Effects calculated and applied
6. Game state updated
7. Notifications displayed

## Testing

Run the power-up system test suite:
```bash
npx tsx test-powerup-system.ts
```

This test verifies:
- All 24 power-ups are properly defined
- Probability calculations work correctly
- Random generation is balanced
- Activation effects function as expected
- Category distribution is correct

## Future Enhancements

### Potential Additions
- **Power-up Combinations**: Chain multiple power-ups together
- **Defensive Power-ups**: Block incoming negative effects
- **Team-wide Power-ups**: Affect entire teams simultaneously
- **Conditional Power-ups**: Activate based on game state
- **Custom Power-ups**: Allow users to create their own

### Balance Considerations
- Monitor power-up usage statistics
- Adjust point ranges based on gameplay feedback
- Consider cooldown periods for powerful effects
- Implement power-up rarity tiers

## Troubleshooting

### Common Issues
- **Power-ups not appearing**: Check probability setting in game setup
- **Can't activate power-ups**: Ensure it's your team's turn
- **Effects not visible**: Look for notification pop-ups
- **UI not updating**: Refresh the page if state becomes inconsistent

### Debug Mode
Enable debug logging by setting `DEBUG_POWERUPS=true` in your environment to see detailed power-up activation logs.

---

*The power-up system adds a new layer of strategy and excitement to the Bamboozle game while maintaining the core educational focus. Enjoy the enhanced gameplay experience!*
