'use client';

import { Lock } from 'lucide-react';
import type { SnakeSkin } from '@/lib/game/skins';

interface SkinSelectorProps {
  skins: SnakeSkin[];
  selectedSkin: SnakeSkin;
  highScore: number;
  onSelect: (skin: SnakeSkin) => void;
  disabled?: boolean;
}

export function SkinSelector({
  skins,
  selectedSkin,
  highScore,
  onSelect,
  disabled,
}: SkinSelectorProps) {
  return (
    <div className="mb-4">
      <p className="text-game-cyan text-sm mb-2">Snake Skin</p>
      <div className="flex flex-wrap justify-center gap-2">
        {skins.map((skin) => {
          const isUnlocked = highScore >= skin.unlockScore;
          const isSelected = selectedSkin.id === skin.id;

          return (
            <button
              key={skin.id}
              onClick={() => isUnlocked && onSelect(skin)}
              disabled={disabled || !isUnlocked}
              className={`
                relative px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${isSelected
                  ? 'ring-2 ring-game-teal scale-105 shadow-lg'
                  : 'hover:scale-105'
                }
                ${isUnlocked
                  ? 'cursor-pointer'
                  : 'cursor-not-allowed opacity-50'
                }
              `}
              style={{
                background: isUnlocked
                  ? `linear-gradient(135deg, ${skin.headColor}, ${skin.bodyColor(3)})`
                  : '#393e46',
                color: isUnlocked ? '#232931' : '#888',
              }}
              title={
                isUnlocked
                  ? skin.name
                  : `Unlock at ${skin.unlockScore} points`
              }
            >
              {!isUnlocked && (
                <Lock className="w-3 h-3 absolute -top-1 -right-1 text-game-red" />
              )}
              {skin.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
