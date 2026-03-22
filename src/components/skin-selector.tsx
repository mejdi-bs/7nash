'use client';

import { Lock } from 'lucide-react';
import type { SnakeSkin } from '@/lib/game/skins';

interface SkinSelectorProps {
  skins: SnakeSkin[];
  selectedSkin: SnakeSkin;
  highScore: number;
  privateSkins?: string[];
  onSelect: (skin: SnakeSkin) => void;
  disabled?: boolean;
}

export function SkinSelector({
  skins,
  selectedSkin,
  highScore,
  privateSkins = [],
  onSelect,
  disabled,
}: SkinSelectorProps) {
  // Filter out private skins user doesn't have access to
  const visibleSkins = skins.filter((skin) => !skin.isPrivate || privateSkins.includes(skin.id));

  return (
    <div className="mb-4">
      <p className="text-game-cyan text-sm mb-2">Snake Skin</p>
      <div className="flex flex-wrap justify-center gap-2">
        {visibleSkins.map((skin) => {
          const isUnlocked = skin.isPrivate ? privateSkins.includes(skin.id) : highScore >= skin.unlockScore;
          const isSelected = selectedSkin.id === skin.id;

          return (
            <button
              key={skin.id}
              onClick={() => isUnlocked && onSelect(skin)}
              disabled={disabled || !isUnlocked}
              className={`
                relative px-5 py-3 rounded-xl text-sm font-bold transition-all min-w-[100px] flex flex-col items-center justify-center gap-1
                ${isSelected
                  ? 'ring-[3px] ring-game-teal scale-110 shadow-[0_0_20px_rgba(78,204,163,0.4)] z-10'
                  : 'hover:scale-105 active:scale-95'
                }
                ${isUnlocked
                  ? 'cursor-pointer'
                  : 'cursor-not-allowed border border-white/5 bg-[#232931]/80 backdrop-blur-sm'
                }
              `}
              style={{
                background: isUnlocked
                  ? `linear-gradient(135deg, ${skin.headColor}, ${skin.bodyColor(3)})`
                  : undefined,
                color: isUnlocked ? '#1a1a2e' : '#94a3b8',
              }}
            >
              {!isUnlocked && (
                <>
                  <Lock className="w-3.5 h-3.5 mb-1 opacity-80" />
                  <span className="text-[10px] uppercase tracking-wider opacity-60">Locked</span>
                  <span className="text-xs text-game-teal">{skin.unlockScore} pts</span>
                </>
              )}
              {isUnlocked && (
                <>
                  <span className="drop-shadow-sm">{skin.name}</span>
                  {isSelected && <span className="text-[10px] uppercase tracking-tighter opacity-70">Active</span>}
                </>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
